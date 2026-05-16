"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Clock, User, MessageSquare, ChevronLeft, Send, CheckCircle, Activity, Shield } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";
import { apiService } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";

export default function PatientAppointmentsPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [session, setSession] = useState<any>(null);

  const [formData, setFormData] = useState({
    doctor_id: "",
    preferred_time: "",
    reason: "",
    type: "offline"
  });

  const fetchClinicalData = async () => {
    try {
      const dData = await apiService.getDoctors();
      setDoctors(Array.isArray(dData) ? dData : []);
      
      const s = JSON.parse(localStorage.getItem("medichain_session") || "null");
      if (s && s.id) {
        const aData = await apiService.getPatientAppointments(s.id);
        setAppointments(Array.isArray(aData) ? aData : []);
      }
    } catch (e) {
      console.error("Clinical data sync failed:", e);
    }
  };

  useEffect(() => {
    setMounted(true);
    const s = JSON.parse(localStorage.getItem("medichain_session") || "null");
    setSession(s);
    fetchClinicalData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Safety Check for Session Identity
    const s = JSON.parse(localStorage.getItem("medichain_session") || "null");
    if (!s || !s.id) {
      showToast("Identity Token Expired. Please Logout and Login again.", "error");
      return;
    }

    if (!formData.doctor_id || !formData.preferred_time) {
      showToast("Please complete all required fields", "info");
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.createAppointment({
        patient_id: s.id,
        doctor_id: parseInt(formData.doctor_id),
        hospital_id: s.hospital_id || 1,
        preferred_time: formData.preferred_time,
        reason: formData.reason,
        type: formData.type,
        status: "pending"
      });
      showToast("APPOINTMENT REQUEST TRANSMITTED", "success");
      setTimeout(() => router.push("/patient"), 2000);
    } catch (error: any) {
      showToast(error.message || "Transmission Error", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <DashboardLayout role="patient" userName={session?.name || "Patient"}>
      <div style={{ marginBottom: '3rem' }}>
        <button onClick={() => router.back()} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900, fontSize: '0.7rem', opacity: 0.5, marginBottom: '1rem' }}>
          <ChevronLeft size={16} /> BACK TO HUB
        </button>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>SCHEDULE CLINICAL VISIT</h1>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>SECURE APPOINTMENT ORCHESTRATION NODE</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem', marginBottom: '4rem' }}>
        <div className="card" style={{ padding: '3rem' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>SELECT SPECIALIST / DOCTOR</label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
                <select 
                  required
                  value={formData.doctor_id}
                  onChange={e => setFormData({...formData, doctor_id: e.target.value})}
                  style={{ width: '100%', padding: '15px 15px 15px 45px', background: '#f4f4f5', border: '2px solid transparent', fontWeight: 800, outline: 'none', cursor: 'pointer' }}
                >
                  <option value="">SELECT CLINICIAN</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.user?.name?.toUpperCase()} — {d.specialization?.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>PREFERRED DATE & TIME</label>
                <div style={{ position: 'relative' }}>
                  <Calendar style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
                  <input 
                    type="datetime-local" 
                    required
                    value={formData.preferred_time}
                    onChange={e => setFormData({...formData, preferred_time: e.target.value})}
                    style={{ width: '100%', padding: '15px 15px 15px 45px', background: '#f4f4f5', border: 'none', fontWeight: 800, outline: 'none' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>VISIT TYPE</label>
                <div style={{ display: 'flex', gap: '8px', background: '#f4f4f5', padding: '4px' }}>
                  {["offline", "online"].map(t => (
                    <button 
                      key={t}
                      type="button"
                      onClick={() => setFormData({...formData, type: t})}
                      style={{ 
                        flex: 1, 
                        padding: '10px', 
                        fontSize: '0.6rem', 
                        fontWeight: 900, 
                        border: 'none', 
                        background: formData.type === t ? '#000' : 'transparent',
                        color: formData.type === t ? '#fff' : '#000',
                        cursor: 'pointer'
                      }}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>REASON FOR CLINICAL CONSULTATION</label>
              <div style={{ position: 'relative' }}>
                <MessageSquare style={{ position: 'absolute', left: '15px', top: '15px' }} size={18} />
                <textarea 
                  required
                  placeholder="DESCRIBE YOUR SYMPTOMS OR REASON FOR VISIT..."
                  value={formData.reason}
                  onChange={e => setFormData({...formData, reason: e.target.value})}
                  style={{ width: '100%', padding: '15px 15px 15px 45px', background: '#f4f4f5', border: 'none', fontWeight: 800, outline: 'none', minHeight: '120px', resize: 'none' }}
                />
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-black" style={{ padding: '20px', gap: '12px', marginTop: '1rem' }}>
              {isSubmitting ? <Clock className="animate-spin" /> : <Send size={18} />}
              {isSubmitting ? "TRANSMITTING REQUEST..." : "SUBMIT APPOINTMENT REQUEST"}
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ background: '#000', color: '#fff', padding: '2.5rem' }}>
             <Shield size={24} style={{ marginBottom: '1.5rem' }} />
             <h3 style={{ fontWeight: 900, fontSize: '0.9rem', marginBottom: '1rem' }}>SECURE CLINICAL ROUTING</h3>
             <p style={{ fontSize: '0.75rem', lineHeight: '1.6', opacity: 0.7, fontWeight: 700 }}>
               Your request will be transmitted directly to the selected clinician's dashboard. The doctor will review your clinical history and confirm a specific time window for your consultation.
             </p>
          </div>

          <div className="card" style={{ padding: '2.5rem' }}>
             <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '1.5rem', borderBottom: '2px solid #000', paddingBottom: '8px' }}>SCHEDULING PROTOCOLS</h3>
             <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  "Request status updates in real-time.",
                  "Clinician may adjust time based on availability.",
                  "Digital consults require stable network node.",
                  "Emergency cases should use the SOS terminal."
                ].map((text, i) => (
                  <li key={i} style={{ display: 'flex', gap: '10px', fontSize: '0.7rem', fontWeight: 800 }}>
                    <CheckCircle size={14} color="#10b981" /> {text.toUpperCase()}
                  </li>
                ))}
              </ul>
          </div>
        </div>
      </div>

      {/* Appointment Status Registry (Moved from Dashboard) */}
      <div className="card" style={{ padding: '0', border: '2px solid #000' }}>
        <div style={{ padding: '1.5rem 2.5rem', background: '#3b82f6', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Calendar size={18} />
              <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px' }}>CONSULTATION REQUEST STATUS</h3>
           </div>
           <span style={{ fontSize: '0.6rem', fontWeight: 900 }}>REAL-TIME TRACKING</span>
        </div>
        <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="custom-scrollbar">
          <table className="data-table" style={{ border: 'none', width: '100%', borderCollapse: 'collapse' }}>
             <thead>
               <tr style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f4f4f5', borderBottom: '2px solid #000', textAlign: 'left' }}>
                 <th style={{ padding: '15px 25px', fontSize: '0.65rem', letterSpacing: '1px' }}>S.NO</th>
                 <th style={{ padding: '15px 25px', fontSize: '0.65rem', letterSpacing: '1px' }}>VISIT REASON</th>
                 <th style={{ padding: '15px 25px', fontSize: '0.65rem', letterSpacing: '1px' }}>PREFERRED TIME</th>
                 <th style={{ padding: '15px 25px', fontSize: '0.65rem', letterSpacing: '1px' }}>FINALIZED SCHEDULE</th>
                 <th style={{ padding: '15px 25px', fontSize: '0.65rem', letterSpacing: '1px', textAlign: 'right' }}>STATUS</th>
               </tr>
             </thead>
             <tbody>
               {appointments.length === 0 ? (
                 <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', fontWeight: 800, opacity: 0.3 }}>NO ACTIVE REQUESTS</td></tr>
               ) : appointments.map((a, i) => (
                 <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                   <td style={{ padding: '20px 25px', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                   <td style={{ padding: '20px 25px', fontWeight: 900, fontSize: '0.8rem' }}>{a.reason?.toUpperCase()}</td>
                   <td style={{ padding: '20px 25px', fontWeight: 700, fontSize: '0.75rem', opacity: 0.6 }}>{a.preferred_time}</td>
                   <td style={{ padding: '20px 25px', fontWeight: 900, fontSize: '0.8rem' }}>
                      {a.scheduled_at ? new Date(a.scheduled_at).toLocaleString() : "TBD BY DOCTOR"}
                   </td>
                   <td style={{ padding: '20px 25px', textAlign: 'right' }}>
                      <span className="badge" style={{ 
                        fontSize: '0.55rem', 
                        background: a.status === 'scheduled' ? '#10b981' : '#f59e0b',
                        color: '#fff',
                        border: 'none'
                      }}>
                        {a.status?.toUpperCase()}
                      </span>
                   </td>
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; border-radius: 0; }
        `}</style>
      </div>
    </DashboardLayout>
  );
}
