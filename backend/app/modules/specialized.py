from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_db
from app.models.models import BloodBank, BloodRequest, SurgicalSchedule, PatientRiskScore, User, Doctor
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()

# --- Schemas ---
class BloodStockBase(BaseModel):
    blood_group: str
    units_available: float

class BloodRequestCreate(BaseModel):
    hospital_id: int
    patient_id: int
    doctor_id: int
    blood_group: str
    units_required: float
    urgency: str

class SurgicalScheduleCreate(BaseModel):
    hospital_id: int
    patient_id: int
    doctor_id: int
    ot_room_number: str
    procedure_name: str
    scheduled_at: datetime
    notes: Optional[str] = None

# --- Blood Bank Endpoints ---

@router.get("/blood-stock/{hospital_id}")
async def get_blood_stock(hospital_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(BloodBank).filter(BloodBank.hospital_id == hospital_id))
    stock = result.scalars().all()
    if not stock:
        # Initialize default stock if empty
        groups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
        for g in groups:
            db.add(BloodBank(hospital_id=hospital_id, blood_group=g, units_available=10.0))
        await db.commit()
        result = await db.execute(select(BloodBank).filter(BloodBank.hospital_id == hospital_id))
        stock = result.scalars().all()
    return stock

@router.post("/blood-request")
async def create_blood_request(req: BloodRequestCreate, db: AsyncSession = Depends(get_db)):
    new_req = BloodRequest(**req.dict())
    db.add(new_req)
    await db.commit()
    await db.refresh(new_req)
    return new_req

@router.get("/blood-requests/{hospital_id}")
async def get_blood_requests(hospital_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(BloodRequest)
        .filter(BloodRequest.hospital_id == hospital_id)
        .order_by(BloodRequest.created_at.desc())
    )
    return result.scalars().all()

# --- Surgical Schedule (OT) Endpoints ---

@router.post("/surgical-schedule")
async def schedule_surgery(data: SurgicalScheduleCreate, db: AsyncSession = Depends(get_db)):
    new_surgery = SurgicalSchedule(**data.dict())
    new_surgery.checklist_status = {
        "Patient Identity Confirmed": False,
        "Site Marked": False,
        "Anesthesia Safety Check": False,
        "Pulse Oximeter On": False,
        "Known Allergy Checked": False
    }
    db.add(new_surgery)
    await db.commit()
    await db.refresh(new_surgery)
    return new_surgery

@router.get("/surgical-schedules/{hospital_id}")
async def get_surgeries(hospital_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SurgicalSchedule).filter(SurgicalSchedule.hospital_id == hospital_id))
    return result.scalars().all()

@router.patch("/surgical-schedule/{id}/checklist")
async def update_checklist(id: int, checklist: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(SurgicalSchedule).filter(SurgicalSchedule.id == id))
    surgery = result.scalar_one_or_none()
    if not surgery:
        raise HTTPException(status_code=404, detail="Surgery not found")
    surgery.checklist_status = checklist
    await db.commit()
    return surgery

# --- Patient Risk Score (AI-Ready) ---

@router.get("/patient/{patient_id}/risk-score")
async def get_risk_score(patient_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PatientRiskScore)
        .filter(PatientRiskScore.patient_id == patient_id)
        .order_by(PatientRiskScore.calculated_at.desc())
    )
    score = result.scalars().first()
    if not score:
        import random
        val = round(random.uniform(1.0, 9.0), 1)
        level = "LOW"
        if val > 7: level = "CRITICAL"
        elif val > 5: level = "HIGH"
        elif val > 3: level = "MODERATE"
        
        score = PatientRiskScore(
            patient_id=patient_id,
            score_value=val,
            risk_level=level,
            indicators={"age_factor": 1.2, "vital_stability": "variable"}
        )
        db.add(score)
        await db.commit()
        await db.refresh(score)
    return score
@router.get("/hospital/{hospital_id}/risk-scores")
async def get_hospital_risk_scores(hospital_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PatientRiskScore, User.name, User.username)
        .join(User, PatientRiskScore.patient_id == User.id)
        .filter(User.hospital_id == hospital_id)
        .order_by(PatientRiskScore.score_value.desc())
    )
    rows = result.all()
    return [
        {
            "id": r.PatientRiskScore.id,
            "patient_id": r.PatientRiskScore.patient_id,
            "patient_name": r.name,
            "patient_username": r.username,
            "score_value": r.PatientRiskScore.score_value,
            "risk_level": r.PatientRiskScore.risk_level,
            "indicators": r.PatientRiskScore.indicators,
            "calculated_at": r.PatientRiskScore.calculated_at
        } for r in rows
    ]
