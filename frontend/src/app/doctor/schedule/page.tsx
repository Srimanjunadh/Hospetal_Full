"use client";
import { useState, useEffect } from "react";
import { Clock, Calendar, CheckCircle, AlertCircle, RefreshCcw, ShieldCheck, Activity } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";
import { apiService } from "@/services/api";

export default function DoctorSchedulePage() {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState("");

  useEffect(() => {
    setMounted(true);
    const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
    if (session) {
      setSessionUser(session.name);
      if (session.doctor_id) {
        fetchSchedule(session.doctor_id);
      }
    }
  }, []);

  const fetchSchedule = async (doctorId: number) => {
    setIsLoading(true);
    try {
      const data = await apiService.getDoctorSchedule(doctorId);
      if (Array.isArray(data)) {
        setSchedules(data.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()));
      }
    } catch (error) {
      showToast("Failed to sync clinical schedule", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <DashboardLayout role="doctor" userName={sessionUser}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>CLINICAL SCHEDULE</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>ROOT OPERATIONS LOG • ASSIGNED BY FACILITY ADMIN</p>
        </div>
        <button 
          onClick={() => {
            const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
            if (session?.doctor_id) fetchSchedule(session.doctor_id);
          }}
          style={{ background: 'transparent', border: '2px solid #000', padding: '10px 15px', fontWeight: 900, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} /> REFRESH FEED
        </button>
      </div>

      <div className="grid-stack" style={{ marginBottom: '3rem' }}>
        <div className="card" style={{ background: '#000', color: '#fff' }}>
           <p className="card-title" style={{ color: 'rgba(255,255,255,0.5)' }}>NEXT OPERATION</p>
           <h2 className="card-value">
             {schedules.find(s => s.status === 'pending') ? schedules.find(s => s.status === 'pending').task_name : "NONE"}
           </h2>
           <p style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: '1rem', color: '#10b981' }}>SYSTEM READY</p>
        </div>
        <div className="card">
           <p className="card-title">TOTAL TASKS TODAY</p>
           <h2 className="card-value">{schedules.length < 10 ? `0${schedules.length}` : schedules.length}</h2>
           <p style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: '1rem' }}>ACROSS ALL WARDS</p>
        </div>
        <div className="card">
           <p className="card-title">PENDING ACTIONS</p>
           <h2 className="card-value" style={{ color: schedules.filter(s => s.status === 'pending').length > 0 ? '#dc2626' : '#000' }}>
             {schedules.filter(s => s.status === 'pending').length < 10 ? `0${schedules.filter(s => s.status === 'pending').length}` : schedules.filter(s => s.status === 'pending').length}
           </h2>
           <p style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: '1rem' }}>REQUIRES ATTENTION</p>
        </div>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '1.5rem 2.5rem', borderBottom: '2px solid #000', background: '#f4f4f5', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck size={20} />
          <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px' }}>ASSIGNED OPERATIONS & TASKS</h3>
        </div>
        <div style={{ maxHeight: '600px', overflowY: 'auto' }} className="custom-scrollbar">
          {isLoading ? (
            <div style={{ padding: '4rem', textAlign: 'center', fontWeight: 900, opacity: 0.3 }}>SYNCHRONIZING WITH FACILITY HUB...</div>
          ) : schedules.length === 0 ? (
            <div style={{ padding: '4rem', textAlign: 'center', fontWeight: 900, opacity: 0.3 }}>NO OPERATIONS ASSIGNED BY ADMIN</div>
          ) : (
            schedules.map((s, i) => (
              <div key={i} style={{ padding: '2rem 2.5rem', borderBottom: i < schedules.length - 1 ? '1px solid #eee' : 'none', display: 'flex', gap: '20px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.3, width: '30px' }}>{(i + 1).toString().padStart(2, '0')}</span>
                <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <div style={{ padding: '12px', background: s.status === 'pending' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(16, 185, 129, 0.1)', border: '1px solid #000' }}>
                      {s.status === 'pending' ? <Clock size={20} color="#dc2626" /> : <CheckCircle size={20} color="#10b981" />}
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '4px' }}>{s.task_name}</h4>
                      <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#666' }}>
                        {new Date(s.start_time).toLocaleString()} — {new Date(s.end_time).toLocaleTimeString()}
                      </p>
                      {s.notes && <p style={{ fontSize: '0.7rem', fontWeight: 800, marginTop: '8px', color: '#000', opacity: 0.5 }}>NOTES: {s.notes.toUpperCase()}</p>}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                     <span style={{ 
                       padding: '6px 12px', 
                       fontSize: '0.65rem', 
                       fontWeight: 900, 
                       background: s.status === 'pending' ? '#dc2626' : '#10b981', 
                       color: '#fff' 
                     }}>
                       {s.status.toUpperCase()}
                     </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; border-radius: 10px; }
        `}</style>
      </div>
    </DashboardLayout>
  );
}
