"use client";
import { useEffect, useState } from "react";
import { Users, Search, Filter, Bed, Activity, User, ShieldCheck, Heart, MapPin, Calendar, Clock, X, Edit } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";
import { motion } from "framer-motion";

export default function PatientRegistryPage() {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [doctorsList, setDoctorsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [hospitalId, setHospitalId] = useState<number | null>(null);

  // Reschedule modal states
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  const [newDoctorId, setNewDoctorId] = useState<number | "">("");
  const [newDate, setNewDate] = useState("");

  useEffect(() => {
    setMounted(true);
    const session = JSON.parse(localStorage.getItem("medclues_session") || "null");
    if (session?.hospital_id) {
      setHospitalId(session.hospital_id);
      fetchPatientRegistry(session.hospital_id);
      fetchDoctors(session.hospital_id);
    }
  }, []);

  const fetchDoctors = async (hId: number) => {
    try {
      const { apiService } = await import("@/services/api");
      const docs = await apiService.getDoctors(hId);
      setDoctorsList(docs || []);
    } catch (e) {
      console.error("Failed to load doctors", e);
    }
  };

  const fetchPatientRegistry = async (hId: number) => {
    setLoading(true);
    try {
      const { apiService } = await import("@/services/api");
      
      // Fetch patients, admissions, and appointments in parallel
      const [patientData, admissionData, appointmentData] = await Promise.all([
        apiService.getPatients(hId),
        apiService.getAdmissions(), // This might need hospital_id filtering if API supports it
        apiService.getHospitalAppointments(hId)
      ]);

      // Map admissions to patients for room info
      const roomMapping = new Map();
      admissionData.forEach((adm: any) => {
        if (adm.status === "admitted" && adm.room_number) {
          roomMapping.set(adm.patient_id, adm.room_number);
        }
      });

      const mappedPatients = patientData.map((p: any) => ({
        ...p,
        room: roomMapping.get(p.id) || "OUTPATIENT",
        status: roomMapping.has(p.id) ? "IN-PATIENT" : "OUT-PATIENT",
        doctorName: p.assigned_doctor?.user?.name || "NOT ASSIGNED",
        nurseName: p.assigned_nurse?.name || "NOT ASSIGNED"
      }));

      setPatients(mappedPatients);
      setAppointments(appointmentData || []);
    } catch (error) {
      showToast("Identity sync failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAppt = async (apptId: number) => {
    try {
      const { apiService } = await import("@/services/api");
      await apiService.approveAppointment(apptId);
      showToast("Appointment approved and sent to clinician", "success");
      if (hospitalId) fetchPatientRegistry(hospitalId);
    } catch (e) {
      showToast("Approval failed", "error");
    }
  };

  const handleSaveReschedule = async () => {
    if (!selectedAppt) return;
    try {
      const { apiService } = await import("@/services/api");
      await apiService.patchAppointment(selectedAppt.id, {
        doctor_id: newDoctorId || undefined,
        scheduled_at: newDate ? new Date(newDate).toISOString() : undefined
      });
      showToast("Clinician assignment & scheduled time synchronized", "success");
      setIsRescheduleModalOpen(false);
      if (hospitalId) fetchPatientRegistry(hospitalId);
    } catch (e) {
      showToast("Rescheduling failed", "error");
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.room.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <DashboardLayout role="hospital_admin" userName="Admin Manju">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>PATIENT PORTAL OPERATIONS</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>FACILITY AUDIT • INCOMING ONLINE APPLICATIONS & PATIENT REGISTRY</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button 
             className="btn-outline" 
             onClick={() => hospitalId && fetchPatientRegistry(hospitalId)}
             style={{
               display: 'inline-flex',
               alignItems: 'center',
               gap: '8px',
               flexDirection: 'row',
               whiteSpace: 'nowrap'
             }}
           >
             <Activity size={18} /> <span>REFRESH SYSTEMS</span>
           </button>
        </div>
      </div>

      {/* Online Applications Section */}
      <div className="card" style={{ padding: '2rem', marginBottom: '3rem', border: '2px solid #29ABE2' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>ONLINE APPLICATIONS</h2>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.75rem' }}>INCOMING APPOINTMENTS FROM PMS PORTAL</p>
          </div>
          <div style={{ padding: '8px 16px', background: '#29ABE2', color: '#fff', fontSize: '0.65rem', fontWeight: 900 }}>
            PENDING: {appointments.filter(a => a.status === 'pending').length}
          </div>
        </div>

        <div className="table-responsive" style={{ border: '2px solid #000' }}>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="custom-scrollbar">
            <table className="data-table" style={{ border: 'none' }}>
              <thead>
                <tr style={{ background: '#29ABE2', color: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
                  <th style={{ padding: '12px 20px', fontSize: '0.65rem' }}>S.NO</th>
                  <th style={{ padding: '12px 20px' }}>PATIENT NAME</th>
                  <th style={{ padding: '12px 20px' }}>PROBLEM / REASON</th>
                  <th style={{ padding: '12px 20px' }}>DOCTOR NAME</th>
                  <th style={{ padding: '12px 20px' }}>STATUS</th>
                  <th style={{ padding: '12px 20px' }}>DATE & TIME</th>
                  <th style={{ padding: '12px 20px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', fontWeight: 900 }}>SYNCHRONIZING APPOINTMENTS FEED...</td>
                  </tr>
                ) : appointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', fontWeight: 900 }}>NO ONLINE APPLICATIONS IN QUEUE</td>
                  </tr>
                ) : appointments.map((appt, i) => {
                  let statusBg = 'rgba(59, 130, 246, 0.1)';
                  let statusColor = '#3b82f6';
                  let statusText = appt.status.toUpperCase();
                  if (appt.status === 'pending') {
                    statusBg = 'rgba(245, 158, 11, 0.1)';
                    statusColor = '#d97706';
                    statusText = 'PENDING APPROVAL';
                  } else if (appt.status === 'admin_approved' || appt.status === 'approved') {
                    statusBg = 'rgba(16, 185, 129, 0.1)';
                    statusColor = '#059669';
                    statusText = 'APPROVED';
                  }

                  return (
                    <tr key={appt.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '15px 20px', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '30px', height: '30px', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.75rem' }}>
                            {appt.patient_name ? appt.patient_name.charAt(0).toUpperCase() : 'P'}
                          </div>
                          <div>
                            <p style={{ fontWeight: '900', fontSize: '0.8rem' }}>{appt.patient_name ? appt.patient_name.toUpperCase() : 'UNKNOWN PATIENT'}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '15px 20px', fontWeight: 800, fontSize: '0.75rem' }}>
                        {appt.reason ? appt.reason.toUpperCase() : 'GENERAL CONSULTATION'}
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%' }}></div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 900 }}>DR. {appt.doctor_name ? appt.doctor_name.toUpperCase() : 'NOT ASSIGNED'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          fontSize: '0.6rem', 
                          fontWeight: 900, 
                          background: statusBg,
                          color: statusColor,
                          border: `1px solid ${statusColor}`
                        }}>{statusText}</span>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                            <Calendar size={12} /> {appt.scheduled_at ? new Date(appt.scheduled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'NOT SET'}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', fontWeight: 700, opacity: 0.5 }}>
                            <Clock size={12} /> {appt.scheduled_at ? new Date(appt.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : appt.preferred_time || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {appt.status === 'pending' && (
                            <button 
                              onClick={() => handleApproveAppt(appt.id)}
                              style={{ background: '#29ABE2', color: '#fff', border: 'none', padding: '6px 12px', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer' }}
                            >
                              APPROVE
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              setSelectedAppt(appt);
                              setNewDoctorId(appt.doctor_id || "");
                              setNewDate(appt.scheduled_at ? new Date(appt.scheduled_at).toISOString().slice(0, 16) : "");
                              setIsRescheduleModalOpen(true);
                            }}
                            className="btn-outline" 
                            style={{ padding: '6px 12px', fontSize: '0.65rem', fontWeight: 900 }}
                          >
                            <Edit size={12} style={{ marginRight: '6px' }} /> CHANGE DOCTOR/DATE
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Patient Registry Section */}
      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>PATIENT REGISTRY</h2>
            <p style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.75rem' }}>GLOBAL FACILITY PATIENT AUDIT</p>
          </div>
          <div style={{ padding: '8px 16px', background: '#f4f4f5', border: '1px solid #000', fontSize: '0.65rem', fontWeight: 900 }}>
            TOTAL REGISTERED: {patients.length}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
            <input 
              type="text" 
              placeholder="SEARCH PATIENTS BY NAME, ID, OR ROOM" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '15px 16px 15px 50px', background: '#f4f4f5', border: 'none', fontWeight: '700', fontSize: '0.8rem' }}
            />
          </div>
        </div>

        <div className="table-responsive" style={{ border: '2px solid #000' }}>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }} className="custom-scrollbar">
            <table className="data-table" style={{ border: 'none' }}>
              <thead>
                <tr style={{ background: '#29ABE2', color: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
                  <th style={{ padding: '12px 20px', fontSize: '0.65rem' }}>S.NO</th>
                  <th style={{ padding: '12px 20px' }}>PATIENT IDENTITY</th>
                  <th style={{ padding: '12px 20px' }}>LOCATION / AGE</th>
                  <th style={{ padding: '12px 20px' }}>CARE TEAM</th>
                  <th style={{ padding: '12px 20px' }}>FACILITY STATUS</th>
                  <th style={{ padding: '12px 20px' }}>ROOM/BED</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', fontWeight: 900 }}>SYNCHRONIZING SECURE NODE DATA...</td>
                  </tr>
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', fontWeight: 900 }}>NO PATIENT RECORDS FOUND</td>
                  </tr>
                ) : filteredPatients.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px 20px', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <div style={{ width: '35px', height: '35px', background: '#f4f4f5', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, border: '1px solid #000' }}>
                           <User size={18} />
                         </div>
                         <div>
                           <p style={{ fontWeight: '900', fontSize: '0.85rem' }}>{p.name.toUpperCase()}</p>
                           <p style={{ fontSize: '0.65rem', color: '#999', fontWeight: 700 }}>ID: {p.username}</p>
                         </div>
                      </div>
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                            <MapPin size={12} /> {p.location || "N/A"}
                         </div>
                         <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.5 }}>AGE: {p.age || "N/A"}</div>
                      </div>
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%' }}></div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>DR. {p.doctorName.split(' ').pop().toUpperCase()}</span>
                         </div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>NRS. {p.nurseName.split(' ').pop().toUpperCase()}</span>
                         </div>
                      </div>
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        fontSize: '0.6rem', 
                        fontWeight: 900, 
                        background: p.status === 'IN-PATIENT' ? '#000' : '#f4f4f5',
                        color: p.status === 'IN-PATIENT' ? '#fff' : '#000',
                        border: '1px solid #000'
                      }}>{p.status}</span>
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900, color: p.room === 'OUTPATIENT' ? '#999' : '#000' }}>
                         <Bed size={16} />
                         <span style={{ fontSize: '0.85rem' }}>{p.room}</span>
                      </div>
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

      {/* Reschedule & Clinician Assignment Modal */}
      {isRescheduleModalOpen && selectedAppt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#fff', width: '450px', padding: '2.5rem', border: '4px solid #000' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                 <h3 style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '1px' }}>CHANGE CLINICIAN & DATE</h3>
                 <X size={20} onClick={() => setIsRescheduleModalOpen(false)} style={{ cursor: 'pointer' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 <div>
                    <label style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.5, marginBottom: '8px', display: 'block', letterSpacing: '1px' }}>ASSIGN CLINICIAN</label>
                    <select 
                      value={newDoctorId} 
                      onChange={e => setNewDoctorId(e.target.value ? Number(e.target.value) : "")} 
                      style={{ width: '100%', padding: '12px', border: '2px solid #000', fontWeight: 800, fontSize: '0.8rem', outline: 'none' }}
                    >
                      <option value="">CURRENT: {selectedAppt.doctor_name?.toUpperCase()}</option>
                      {doctorsList.map((doc: any) => (
                        <option key={doc.id} value={doc.id}>DR. {doc.user?.name?.toUpperCase() || doc.specialization?.toUpperCase()}</option>
                      ))}
                    </select>
                 </div>
                 
                 <div>
                    <label style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.5, marginBottom: '8px', display: 'block', letterSpacing: '1px' }}>NEW DATE & TIME</label>
                    <input 
                      type="datetime-local" 
                      value={newDate} 
                      onChange={e => setNewDate(e.target.value)} 
                      style={{ width: '100%', padding: '12px', border: '2px solid #000', fontWeight: 800, fontSize: '0.8rem', outline: 'none' }} 
                    />
                 </div>

                 <button 
                   onClick={handleSaveReschedule} 
                   style={{ width: '100%', background: '#29ABE2', color: '#fff', border: 'none', padding: '15px', fontWeight: 900, cursor: 'pointer', fontSize: '0.8rem', letterSpacing: '1px', marginTop: '1rem' }}
                 >
                   SAVE CHANGES & SYNC
                 </button>
              </div>
           </motion.div>
        </div>
      )}
      
      <div style={{ textAlign: 'center', opacity: 0.3, marginTop: '2rem' }}>
         <p style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '2px' }}>MEDCLUES+ SECURE OPERATIONS PROTOCOL • GLOBAL HUB</p>
      </div>
    </DashboardLayout>
  );
}
