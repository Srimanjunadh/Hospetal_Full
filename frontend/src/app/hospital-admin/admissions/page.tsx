"use client";
import { useState, useEffect } from "react";
import { Bed, Plus, CheckCircle, RefreshCcw, User, Activity, MapPin, Clock } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";
import { apiService } from "@/services/api";

export default function AdmissionsManagementPage() {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [activeAdmissions, setActiveAdmissions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hospitalId, setHospitalId] = useState<number | null>(null);
  const [beds, setBeds] = useState<any[]>([]);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [roomNumber, setRoomNumber] = useState("");

  useEffect(() => {
    setMounted(true);
    const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
    if (session && session.hospital_id) {
      setHospitalId(session.hospital_id);
      fetchData(session.hospital_id);
    }
  }, []);

  const fetchData = async (hId: number) => {
    setIsLoading(true);
    try {
      const [pending, active, allBeds] = await Promise.all([
        apiService.getPendingAdmissions(hId),
        apiService.getAdmissions(),
        apiService.getBeds(hId)
      ]);
      setPendingRequests(Array.isArray(pending) ? pending : []);
      setActiveAdmissions(Array.isArray(active) ? active.filter((a: any) => a.hospital_id === hId && a.status === 'admitted') : []);
      setBeds(Array.isArray(allBeds) ? allBeds.filter((b: any) => b.status === 'available') : []);
    } catch (error) {
      showToast("Failed to sync admission data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !roomNumber) return;

    try {
      await apiService.finalizeAdmission({
        admission_id: selectedRequest.id,
        room_number: roomNumber
      });
      showToast(`PATIENT ${selectedRequest.patient?.name} ASSIGNED TO ROOM ${roomNumber}`, "success");
      setShowAssignModal(false);
      setRoomNumber("");
      if (hospitalId) fetchData(hospitalId);
    } catch (error) {
      showToast("Finalization failed", "error");
    }
  };

  if (!mounted) return null;

  return (
    <DashboardLayout role="hospital_admin" userName="Admin Manju">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>ADMISSION CONTROL</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>WARD MANAGEMENT & ROOM ASSIGNMENT HUB</p>
        </div>
        <button onClick={() => hospitalId && fetchData(hospitalId)} className="btn-outline">
           <RefreshCcw size={18} className={isLoading ? "animate-spin" : ""} /> REFRESH
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        
        {/* Pending Requests */}
        <div className="card" style={{ padding: '0', border: '2px solid #000' }}>
           <div style={{ padding: '1.5rem 2.5rem', background: '#000', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px' }}>PENDING ADMISSION REQUESTS</h3>
              <Clock size={18} />
           </div>
           <div style={{ maxHeight: '450px', overflowY: 'auto' }} className="custom-scrollbar">
             {pendingRequests.length === 0 ? (
               <div style={{ padding: '4rem', textAlign: 'center', fontWeight: 900, opacity: 0.3 }}>NO PENDING REQUESTS</div>
             ) : pendingRequests.map((req, i) => (
               <div key={i} style={{ padding: '2rem 2.5rem', borderBottom: '1px solid #eee', display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</span>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                       <h4 style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '4px' }}>{req.patient?.name?.toUpperCase()}</h4>
                       <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                          <p style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.5 }}>REQUESTED BY: DR. {req.doctor?.user?.name?.toUpperCase()}</p>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.65rem', fontWeight: 900, color: '#3b82f6' }}>
                             <Clock size={12} /> {req.admitted_at ? new Date(req.admitted_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }) : 'JUST NOW'}
                          </div>
                       </div>
                       <p style={{ fontSize: '0.7rem', fontWeight: 700, marginTop: '8px', padding: '4px 8px', background: '#f4f4f5', display: 'inline-block' }}>REASON: {req.reason}</p>
                    </div>
                    <button className="btn-black" onClick={() => { setSelectedRequest(req); setShowAssignModal(true); }}>
                       ASSIGN ROOM & ADMIT
                    </button>
                  </div>
               </div>
             ))}
           </div>
        </div>

        {/* Active Admissions */}
        <div className="card" style={{ padding: '0', border: '2px solid #000' }}>
           <div style={{ padding: '1.5rem 2.5rem', borderBottom: '2px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px' }}>ACTIVE WARD OCCUPANCY</h3>
              <Bed size={18} />
           </div>
           <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="custom-scrollbar">
             <table className="data-table" style={{ border: 'none' }}>
               <thead>
                 <tr style={{ position: 'sticky', top: 0, background: '#f9fafb', zIndex: 10 }}>
                   <th style={{ padding: '12px 25px', fontSize: '0.65rem' }}>S.NO</th>
                   <th style={{ padding: '12px 25px' }}>ROOM</th>
                   <th style={{ padding: '12px 25px' }}>PATIENT</th>
                   <th style={{ padding: '12px 25px' }}>DOCTOR</th>
                   <th style={{ padding: '12px 25px' }}>ADMITTED AT</th>
                   <th style={{ padding: '12px 25px' }}>STATUS</th>
                 </tr>
               </thead>
               <tbody>
                 {activeAdmissions.length === 0 ? (
                   <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', fontWeight: 900, opacity: 0.3 }}>WARD IS CURRENTLY EMPTY</td></tr>
                 ) : activeAdmissions.map((adm, i) => (
                   <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                     <td style={{ padding: '15px 25px', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                     <td style={{ padding: '15px 25px', fontWeight: 900 }}>{adm.room_number || "TBD"}</td>
                     <td style={{ padding: '15px 25px', fontWeight: 900 }}>{adm.patient?.name?.toUpperCase()}</td>
                     <td style={{ padding: '15px 25px', fontWeight: 700 }}>DR. {adm.doctor?.user?.name?.toUpperCase()}</td>
                     <td style={{ padding: '15px 25px', opacity: 0.5, fontWeight: 800, fontSize: '0.75rem' }}>{new Date(adm.admitted_at).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</td>
                     <td style={{ padding: '15px 25px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#10b981' }}>ADMITTED</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; border-radius: 10px; }
        `}</style>

      </div>

      {/* Assign Room Modal */}
      {showAssignModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '400px', padding: '3rem', background: '#fff' }}>
             <h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: '1rem' }}>ASSIGN ROOM</h2>
             <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b7280', marginBottom: '2rem' }}>Finalizing admission for {selectedRequest?.patient?.name}</p>
             <form onSubmit={handleFinalize} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                   <label style={{ fontSize: '0.65rem', fontWeight: 900 }}>AVAILABLE ROOMS & WARDS (SELECT SECTION)</label>
                   <select 
                     required 
                     value={roomNumber} 
                     onChange={e => setRoomNumber(e.target.value)} 
                     style={{ width: '100%', padding: '15px', background: '#f4f4f5', border: 'none', fontWeight: 800, outline: 'none', appearance: 'none', cursor: 'pointer' }}
                   >
                     <option value="">-- SELECT AVAILABLE ROOM --</option>
                     {/* Grouping beds by department */}
                     {Object.entries(
                       beds.reduce((acc: any, bed) => {
                         const dept = bed.dept || 'GENERAL';
                         if (!acc[dept]) acc[dept] = [];
                         acc[dept].push(bed);
                         return acc;
                       }, {})
                     ).map(([dept, deptBeds]: [string, any]) => (
                       <optgroup key={dept} label={dept.toUpperCase() + " SECTION"}>
                         {deptBeds.map((bed: any) => (
                           <option key={bed.id} value={bed.room_number}>
                             ROOM {bed.room_number} - BED {bed.bed_number}
                           </option>
                         ))}
                       </optgroup>
                     ))}
                   </select>
                </div>
                <button type="submit" className="btn-black" style={{ padding: '18px' }}>FINALIZE ADMISSION</button>
                <button type="button" className="btn-outline" onClick={() => setShowAssignModal(false)}>CANCEL</button>
             </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
