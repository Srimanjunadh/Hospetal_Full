"use client";
import { useEffect, useState } from "react";
import { Activity, Users, Hospital, TrendingUp, AlertTriangle, ShieldCheck, Zap, ArrowRight, BarChart3, Plus, Bed, Clock } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";

export default function HospitalAdminDashboard() {
  const { showToast } = useToast();
  const [hospitalCode, setHospitalCode] = useState("METRO-CORE-01");
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = require("next/navigation").useRouter();
  
  useEffect(() => {
    setMounted(true);
    const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
    if (session && (session.role === "hospital_admin" || session.role === "super_admin")) {
      setHospitalCode(session.username?.toUpperCase() || "");
      fetchAdmissionsAndAlerts(session.id);
    }

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + " • " + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [rooms, setRooms] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [bedLoad, setBedLoad] = useState(0);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [appointmentQueue, setAppointmentQueue] = useState<any[]>([]);
  const [roomMap, setRoomMap] = useState(new Map());
  const [activeFloor, setActiveFloor] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedPendingAdmission, setSelectedPendingAdmission] = useState("");
  const [isAddingBed, setIsAddingBed] = useState(false);
  const [riskScores, setRiskScores] = useState<any[]>([]);
  const [newBedData, setNewBedData] = useState({
    room_number: "",
    bed_number: "",
    floor: 1
  });

  const fetchAdmissionsAndAlerts = async (userId: number) => {
    try {
      const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
      const { apiService } = await import("@/services/api");
      const data = await apiService.getAdmissions();
      setAdmissions(data);
      if (data.length > 0) setBedLoad(Math.min(100, data.length * 10));

      const activeAdmissions = data.filter((a: any) => a.status === "admitted" && a.room_number);
      const rMap = new Map(activeAdmissions.map((a: any) => [a.room_number, a]));
      setRoomMap(rMap);

      if (userId) {
        const alertData = await apiService.getSystemAlerts(userId);
        setAlerts(alertData.map((a: any) => ({ msg: a.message, priority: a.type === "emergency" ? "CRITICAL" : "HIGH", id: a.id })));
      }

      if (session?.hospital_id) {
        const dbBeds = await apiService.getBeds(session.hospital_id);
        const mappedBeds = dbBeds.map((b: any) => {
           const id = `${b.room_number}-${b.bed_number}`;
           const type = b.floor === "1" ? "GENERAL WARD" : b.floor === "2" ? "ICU" : "VIP SUITE";
           const admission = rMap.get(id);
           if (admission) {
              return { id, type, status: "OCCUPIED", pt: admission.patient?.name?.toUpperCase(), dbId: b.id, floor: parseInt(b.floor) };
           }
           return { id, type, status: "AVAILABLE", pt: "READY", dbId: b.id, floor: parseInt(b.floor) };
        });
        setRooms(mappedBeds);
        console.log("Rooms Mapped:", mappedBeds.length);

        const appts = await apiService.getHospitalAppointments(session.hospital_id);
        setAppointmentQueue(appts.filter((a: any) => a.status === "pending"));
        console.log("Pending Appts:", appts.length);

        const risks = await apiService.getHospitalRiskScores(session.hospital_id);
        setRiskScores(risks.slice(0, 5));
      } else {
        console.warn("No Hospital ID found in session");
      }
    } catch (e: any) { 
      console.error("Data sync failed:", e.message); 
      showToast("Real-time sync error: " + e.message, "error");
    }
  };

  const [filteredRooms, setFilteredRooms] = useState<any[]>([]);

  useEffect(() => {
    const filtered = rooms.filter(r => r.floor === activeFloor || (!r.floor && activeFloor === 1));
    setFilteredRooms(filtered.length > 0 ? filtered : rooms.slice(0, 8)); // Fallback to show something if filter fails
    console.log("Filtered Rooms:", filtered.length, "for Floor", activeFloor);
  }, [activeFloor, rooms]);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
    const userId = session?.id || 0;
    
    fetchAdmissionsAndAlerts(userId);
    
    const interval = setInterval(() => {
      fetchAdmissionsAndAlerts(userId);
    }, 10000); // Refresh every 10 seconds
    
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  const handleRoomClick = (room: any) => {
    if (room.status === "OCCUPIED") {
      showToast(`Audit: Bed ${room.id} is occupied by ${room.pt}`, "info");
      return;
    }
    setSelectedRoom(room.id);
  };

  const handleAddBed = async () => {
    try {
      const { apiService } = await import("@/services/api");
      const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
      await apiService.addBed({
        ...newBedData,
        hospital_id: session.hospital_id
      });
      showToast(`New Bed ${newBedData.room_number}-${newBedData.bed_number} Registered`, "success");
      setIsAddingBed(false);
      setNewBedData({ room_number: "", bed_number: "", floor: activeFloor });
      fetchAdmissionsAndAlerts(session.id);
    } catch (e) { showToast("Bed registration failed", "error"); }
  };

  const handleFinalizeAdmission = async () => {
    try {
      const { apiService } = await import("@/services/api");
      await apiService.finalizeAdmission({
        admission_id: selectedPendingAdmission,
        room_number: selectedRoom
      });
      showToast(`Bed ${selectedRoom} Allotted Successfully`, "success");
      setSelectedRoom(null);
      setSelectedPendingAdmission("");
      
      const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
      if (session && (session.role === "hospital_admin" || session.role === "super_admin")) {
      fetchAdmissionsAndAlerts(session.id);
    } else {
      if (mounted) router.push("/login");
    }
    } catch (e) {
      showToast("Allotment failed", "error");
    }
  };

  const handleApproveAppointment = async (apptId: number) => {
    try {
      const { apiService } = await import("@/services/api");
      await apiService.approveAppointment(apptId);
      showToast("Appointment Approved & Synced to Doctor", "success");
      const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
      fetchAdmissionsAndAlerts(session?.id);
    } catch (e) { showToast("Approval failed", "error"); }
  };


  return (
    <DashboardLayout role="hospital_admin" userName="Admin Manju">
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>PMS COMMAND CENTER</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>FACILITY ID: {hospitalCode} • {currentDateTime.toUpperCase()}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-black" onClick={() => showToast("Initializing New Admission Sequence", "info")}>
            <Plus size={18} /> NEW ADMISSION
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '3rem' }} className="grid-split">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          
          {/* Main Content Area - Appointment Queue */}
          <div className="card" style={{ padding: '0', border: '2px solid #000', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '1.5rem 2rem', background: '#000', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <TrendingUp size={20} />
                  <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px' }}>LIVE APPOINTMENT QUEUE</h3>
               </div>
               <span style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.6 }}>{appointmentQueue.length} PENDING REQUESTS</span>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', maxHeight: '500px' }} className="custom-scrollbar">
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '2px solid #000' }}>
                    <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>S.NO</th>
                    <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>PATIENT IDENTITY</th>
                    <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>CLINICAL EXPERT</th>
                    <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>SCHEDULED TIME</th>
                    <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px' }}>REASON / NOTES</th>
                    <th style={{ padding: '1.25rem 1.5rem', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {appointmentQueue.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '4rem', textAlign: 'center', opacity: 0.3, fontWeight: 900, fontSize: '0.8rem' }}>
                        SYSTEM STANDBY: NO PENDING APPOINTMENTS IN QUEUE
                      </td>
                    </tr>
                  ) : appointmentQueue.map((appt, idx) => (
                    <tr key={appt.id} style={{ borderBottom: '1px solid #eee', transition: '0.2s background' }} className="table-row-hover">
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.75rem', fontWeight: 900 }}>{(idx + 1).toString().padStart(2, '0')}</td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                         <p style={{ fontWeight: 900, fontSize: '0.85rem' }}>{appt.patient_name?.toUpperCase()}</p>
                         <p style={{ fontSize: '0.6rem', fontWeight: 700, opacity: 0.4 }}>ID: {appt.patient_id || 'N/A'}</p>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, fontSize: '0.8rem' }}>DR. {appt.doctor_name?.toUpperCase()}</td>
                      <td style={{ padding: '1.25rem 1.5rem' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                           <Clock size={14} /> {appt.preferred_time}
                         </div>
                      </td>
                      <td style={{ padding: '1.25rem 1.5rem', fontSize: '0.7rem', fontWeight: 700, opacity: 0.6, maxWidth: '200px' }}>{appt.reason || 'GENERAL CONSULTATION'}</td>
                      <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                        <button 
                          onClick={() => handleApproveAppointment(appt.id)}
                          style={{ 
                            background: '#000', 
                            color: '#fff', 
                            border: 'none', 
                            padding: '8px 16px', 
                            fontSize: '0.6rem', 
                            fontWeight: 900, 
                            cursor: 'pointer', 
                            borderRadius: '4px',
                            transition: '0.2s all'
                          }}
                          className="btn-approve"
                        >
                          APPROVE
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '1rem 2rem', background: '#f9fafb', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'center' }}>
               <p style={{ fontSize: '0.55rem', fontWeight: 800, opacity: 0.4, letterSpacing: '1px' }}>SCROLL FOR MORE APPOINTMENTS • AUTO-SYNC ACTIVE</p>
            </div>
          </div>

          {/* Room Availability Grid */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bed size={20} />
                <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px' }}>WARD CAPACITY MONITOR</h3>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', background: '#dc2626' }}></div>
                  <span style={{ fontSize: '0.6rem', fontWeight: 900 }}>OCCUPIED</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '10px', height: '10px', background: '#10b981' }}></div>
                  <span style={{ fontSize: '0.6rem', fontWeight: 900 }}>AVAILABLE</span>
                </div>
              </div>
            </div>

            {/* Floor Selector */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '1rem' }}>
              {[
                { level: 1, name: "FL 1 - GENERAL" },
                { level: 2, name: "FL 2 - ICU" },
                { level: 3, name: "FL 3 - VIP" }
              ].map(f => (
                <button 
                  key={f.level}
                  onClick={() => setActiveFloor(f.level)}
                  style={{
                    padding: '8px 16px',
                    background: activeFloor === f.level ? '#000' : 'transparent',
                    color: activeFloor === f.level ? '#fff' : '#000',
                    border: activeFloor === f.level ? '2px solid #000' : '2px solid transparent',
                    fontWeight: 900,
                    fontSize: '0.7rem',
                    cursor: 'pointer',
                    borderRadius: '20px',
                    transition: '0.2s'
                  }}
                >
                  {f.name}
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
              {filteredRooms.map((room) => (
                <div key={room.dbId} 
                  onClick={() => handleRoomClick(room)}
                  style={{ 
                    border: '2px solid #000',
                    padding: '1rem',
                    background: room.status === 'OCCUPIED' ? '#dc2626' : '#10b981',
                    color: '#fff',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: '0.2s'
                  }}>
                  <p style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.8 }}>{room.type}</p>
                  <p style={{ fontSize: '1.25rem', fontWeight: 900, margin: '4px 0' }}>{room.id}</p>
                  <p style={{ fontSize: '0.6rem', fontWeight: 900 }}>{room.pt}</p>
                </div>
              ))}
              <div style={{ border: '2px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', cursor: 'pointer' }} onClick={() => { setIsAddingBed(true); setNewBedData({...newBedData, floor: activeFloor}); }}>
                <Plus size={20} color="#ccc" />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <p className="card-title">FACILITY BED LOAD</p>
            <h2 className="card-value">{bedLoad}%</h2>
            <div style={{ height: '8px', background: '#f4f4f5', marginTop: '1.5rem', border: '1px solid #000' }}>
               <div style={{ width: `${bedLoad}%`, height: '100%', background: '#000' }}></div>
            </div>
          </div>

          <div className="card" style={{ padding: '0' }}>
            <div style={{ padding: '1.25rem 1.5rem', background: '#000', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h3 style={{ fontWeight: 900, fontSize: '0.7rem', letterSpacing: '1px' }}>RECENT ADMISSIONS</h3>
               <Bed size={14} />
            </div>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {admissions.filter(a => a.status === 'admitted').length === 0 ? (
                <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.3, fontWeight: 900, fontSize: '0.6rem' }}>NO ACTIVE ADMISSIONS</div>
              ) : admissions.filter(a => a.status === 'admitted').slice(0, 5).map((adm: any, idx: number) => (
                <div key={adm.id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.3 }}>{(idx + 1).toString().padStart(2, '0')}</span>
                    <div>
                      <p style={{ fontWeight: 900, fontSize: '0.75rem' }}>{adm.patient?.name?.toUpperCase()}</p>
                      <p style={{ fontSize: '0.55rem', fontWeight: 700, opacity: 0.5 }}>BED {adm.room_number}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <p className="card-title">FACILITY BED LOAD</p>
            <h2 className="card-value">{bedLoad}%</h2>
            <div style={{ height: '8px', background: '#f4f4f5', marginTop: '1.5rem', border: '1px solid #000' }}>
               <div style={{ width: `${bedLoad}%`, height: '100%', background: '#000' }}></div>
            </div>
          </div>

          <div className="card" style={{ background: '#000', color: '#fff' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
               <TrendingUp size={20} />
               <h3 style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '1px' }}>REVENUE FLOW</h3>
             </div>
             <div style={{ height: '80px', display: 'flex', alignItems: 'flex-end', gap: '4px', opacity: 0.3 }}>
                {[30, 80, 45, 90, 60, 40, 85, 70].map((h, i) => <div key={i} style={{ flex: 1, background: '#fff', height: `${h}%` }}></div>)}
             </div>
             <p style={{ fontSize: '0.6rem', fontWeight: 900, textAlign: 'center', marginTop: '10px', opacity: 0.5 }}>SYNCHRONIZING FINANCIAL NODE...</p>
          </div>

          <div className="card">
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
               <AlertTriangle size={20} />
               <h3 style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '1px' }}>CRITICAL ALERTS</h3>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {alerts.length === 0 ? (
                   <p style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.3 }}>NO ACTIVE SYSTEM ALERTS</p>
                ) : alerts.map((alert: any) => (
                  <div key={alert.id} style={{ borderLeft: '4px solid #dc2626', padding: '10px 15px', background: '#fef2f2', cursor: 'pointer' }}>
                     <p style={{ fontWeight: 900, fontSize: '0.75rem' }}>{alert.msg}</p>
                     <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#dc2626' }}>{alert.priority}</p>
                  </div>
                ))}
             </div>
           </div>

          <div className="card" style={{ background: '#000', color: '#fff', border: '2px solid #3b82f6' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
               <Zap size={20} color="#3b82f6" />
               <h3 style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '1px' }}>AI RISK MONITOR</h3>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {riskScores.length === 0 ? (
                   <p style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.3 }}>CALCULATING RISK VECTORS...</p>
                ) : riskScores.map((risk: any, i) => (
                  <div key={i} style={{ border: '1px solid rgba(255,255,255,0.1)', padding: '12px', background: risk.risk_level === 'CRITICAL' ? 'rgba(220, 38, 38, 0.2)' : 'transparent' }}>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 900, fontSize: '0.75rem' }}>{risk.patient_name?.toUpperCase() || "PATIENT"}</span>
                        <span style={{ 
                           fontSize: '0.6rem', 
                           fontWeight: 900, 
                           color: risk.risk_level === 'CRITICAL' ? '#fca5a5' : risk.risk_level === 'HIGH' ? '#fcd34d' : '#fff'
                        }}>{risk.risk_level}</span>
                     </div>
                     <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${risk.score_value * 10}%`, height: '100%', background: risk.risk_level === 'CRITICAL' ? '#dc2626' : '#3b82f6' }}></div>
                     </div>
                  </div>
                ))}
             </div>
             <p style={{ fontSize: '0.55rem', fontWeight: 700, opacity: 0.4, marginTop: '1rem', textAlign: 'center' }}>
                REAL-TIME PREDICTIVE ANALYTICS • AES-256 SYNC
             </p>
           </div>
        </div>
      </div>

      {/* Allot Room Modal */}
      {selectedRoom && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} onClick={() => setSelectedRoom(null)} />
          <div style={{ width: '500px', background: '#fff', position: 'relative', border: '4px solid #000', padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>ALLOT BED {selectedRoom}</h2>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '2.5rem' }}>SELECT A PENDING ADMISSION REQUEST TO ASSIGN TO THIS BED.</p>

            <div style={{ marginBottom: '2.5rem' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 900, display: 'block', marginBottom: '10px', letterSpacing: '1px' }}>PENDING ADMISSION QUEUE</label>
              <select 
                value={selectedPendingAdmission} 
                onChange={(e) => setSelectedPendingAdmission(e.target.value)}
                style={{ width: '100%', padding: '14px', border: '2px solid #000', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', outline: 'none' }}
              >
                <option value="">-- SELECT PENDING REQUEST --</option>
                {admissions.filter(a => a.status === 'requested').map(a => (
                  <option key={a.id} value={a.id}>
                    {a.patient?.name?.toUpperCase()} (Requested by Dr. {a.doctor?.user?.name?.toUpperCase()})
                  </option>
                ))}
              </select>
              {admissions.filter(a => a.status === 'requested').length === 0 && (
                <p style={{ fontSize: '0.65rem', color: '#dc2626', fontWeight: 800, marginTop: '10px' }}>NO PENDING ADMISSIONS IN QUEUE.</p>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setSelectedRoom(null)}
                style={{ flex: 1, padding: '14px', background: '#fff', color: '#000', border: '2px solid #000', fontWeight: 900, cursor: 'pointer' }}
              >
                CANCEL
              </button>
              <button 
                onClick={handleFinalizeAdmission}
                disabled={!selectedPendingAdmission}
                style={{ flex: 2, padding: '14px', background: selectedPendingAdmission ? '#000' : '#e5e7eb', color: selectedPendingAdmission ? '#fff' : '#9ca3af', border: '2px solid ' + (selectedPendingAdmission ? '#000' : '#e5e7eb'), fontWeight: 900, cursor: selectedPendingAdmission ? 'pointer' : 'not-allowed' }}
              >
                CONFIRM ALLOTMENT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Bed Modal */}
      {isAddingBed && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} onClick={() => setIsAddingBed(false)} />
          <div style={{ width: '450px', background: '#fff', position: 'relative', border: '4px solid #000', padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2rem' }}>REGISTER NEW BED</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div>
                  <label style={{ fontSize: '0.65rem', fontWeight: 900, display: 'block', marginBottom: '8px' }}>TARGET FLOOR</label>
                  <select 
                    value={newBedData.floor} 
                    onChange={(e) => setNewBedData({...newBedData, floor: parseInt(e.target.value)})}
                    style={{ width: '100%', padding: '12px', border: '2px solid #000', fontWeight: 800 }}
                  >
                    <option value={1}>FL 1 - GENERAL WARD</option>
                    <option value={2}>FL 2 - ICU</option>
                    <option value={3}>FL 3 - VIP SUITE</option>
                  </select>
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                     <label style={{ fontSize: '0.65rem', fontWeight: 900, display: 'block', marginBottom: '8px' }}>ROOM NUMBER</label>
                     <input 
                       type="text" 
                       placeholder="e.g. 105"
                       value={newBedData.room_number} 
                       onChange={(e) => setNewBedData({...newBedData, room_number: e.target.value})}
                       style={{ width: '100%', padding: '12px', border: '2px solid #000', fontWeight: 900 }}
                     />
                  </div>
                  <div>
                     <label style={{ fontSize: '0.65rem', fontWeight: 900, display: 'block', marginBottom: '8px' }}>BED IDENTIFIER</label>
                     <input 
                       type="text" 
                       placeholder="e.g. A"
                       value={newBedData.bed_number} 
                       onChange={(e) => setNewBedData({...newBedData, bed_number: e.target.value})}
                       style={{ width: '100%', padding: '12px', border: '2px solid #000', fontWeight: 900 }}
                     />
                  </div>
               </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
              <button onClick={() => setIsAddingBed(false)} style={{ flex: 1, padding: '14px', border: '2px solid #000', background: '#fff', fontWeight: 900, cursor: 'pointer' }}>CANCEL</button>
              <button onClick={handleAddBed} style={{ flex: 1, padding: '14px', background: '#000', color: '#fff', border: 'none', fontWeight: 900, cursor: 'pointer' }}>ADD TO INVENTORY</button>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #000;
          border-radius: 10px;
        }
        .table-row-hover:hover {
          background: #f9fafb !important;
        }
        .btn-approve:hover {
          background: #10b981 !important;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
        }
      `}</style>
    </DashboardLayout>
  );
}
