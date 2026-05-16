from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.models.models import Ambulance
from sqlalchemy.future import select
from app.services.ambulance_service import ambulance_service

router = APIRouter()

@router.get("/")
async def get_ambulances(hospital_id: int = None, db: AsyncSession = Depends(get_db)):
    query = select(Ambulance)
    if hospital_id:
        query = query.filter(Ambulance.hospital_id == hospital_id)
    result = await db.execute(query)
    return result.scalars().all()

@router.patch("/{ambulance_id}/status")
async def update_ambulance_status(ambulance_id: int, data: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Ambulance).filter(Ambulance.id == ambulance_id))
    amb = result.scalars().first()
    if amb:
        amb.status = data.get("status", amb.status)
        await db.commit()
        return {"status": "updated"}
    return {"error": "Not found"}

@router.get("/track/{driver_id}")
async def track_ambulance(driver_id: int):
    return await ambulance_service.get_live_location(driver_id)

@router.post("/dispatch")
async def dispatch_ambulance(pickup_lat: float, pickup_lng: float):
    return await ambulance_service.find_nearest_ambulance(pickup_lat, pickup_lng)
