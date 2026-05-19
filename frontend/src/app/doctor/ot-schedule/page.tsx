"use client";
import { useEffect, useState } from "react";
import { Activity, Clipboard, Clock, Play, Check } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";

import { apiService } from "@/services/api";

export default function DoctorOTSchedulePage() {
  const { showToast } = useToast();
  const [surgeries, setSurgeries] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedSurgery, setSelectedSurgery] = useState<any>(null);
  const [sessionUser, setSessionUser] = useState("Dr. Sarah Smith");

  useEffect(() => {
    setMounted(true);
    const session = JSON.parse(localStorage.getItem("medclues_session") || "null");
    if (session) {
      setSessionUser(session.name);
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const session = JSON.parse(localStorage.getItem("medclues_session") || "null");
      if (session?.hospital_id) {
        const data = await apiService.getSurgicalSchedules(session.hospital_id);
        setSurgeries(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Failed to fetch OT data", e);
      setSurgeries([]);
    }
  };

  const toggleChecklist = async (surgeryId: number, item: string) => {
    const surgery = surgeries.find(s => s.id === surgeryId);
    const newChecklist = { ...surgery.checklist_status, [item]: !surgery.checklist_status[item] };
    
    try {
      await apiService.updateSurgicalChecklist(surgeryId, newChecklist);
      showToast("Checklist Updated", "success");
      fetchData();
    } catch (e) {
      showToast("Update failed", "error");
    }
  };

  if (!mounted) return null;

  return (
    <DashboardLayout role="doctor" userName={sessionUser}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>SURGICAL CENTER COMMAND</h1>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>OPERATING THEATER (OT) QUEUE & READINESS CHECKLISTS</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '3rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {/* OT Queue */}
          <div className="card" style={{ padding: '0' }}>
            <div style={{ padding: '1.5rem 2rem', background: '#29ABE2', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px' }}>TODAY'S SURGICAL QUEUE</h3>
              <Clock size={18} />
            </div>
            <div style={{ maxHeight: '600px', overflowY: 'auto' }} className="custom-scrollbar">
              {!Array.isArray(surgeries) || surgeries.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.3, fontWeight: 900 }}>NO SURGERIES SCHEDULED</div>
              ) : (
                surgeries.map((s, i) => (
                  <div key={i} style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #eee', display: 'flex', gap: '20px', alignItems: 'center', cursor: 'pointer', background: selectedSurgery?.id === s.id ? '#f4f4f5' : '#fff' }} onClick={() => setSelectedSurgery(s)}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.3, width: '30px' }}>{(i + 1).toString().padStart(2, '0')}</span>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontWeight: 900, fontSize: '0.9rem' }}>{s.procedure_name.toUpperCase()}</p>
                        <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)' }}>OT ROOM {s.ot_room_number} • {new Date(s.scheduled_at).toLocaleTimeString()}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 900, padding: '4px 8px', border: '1px solid #000' }}>{s.status}</span>
                        <Activity size={16} />
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
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* WHO Checklist */}
          {selectedSurgery ? (
            <div className="card" style={{ border: '4px solid #29ABE2' }}>
              <h3 style={{ fontWeight: 900, fontSize: '0.9rem', marginBottom: '0.5rem' }}>WHO SAFETY CHECKLIST</h3>
              <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#666', marginBottom: '2rem' }}>PROCEDURE: {selectedSurgery.procedure_name.toUpperCase()}</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.keys(selectedSurgery.checklist_status).map((item) => (
                  <div key={item} 
                    onClick={() => toggleChecklist(selectedSurgery.id, item)}
                    style={{ 
                      padding: '12px', 
                      border: '2px solid #29ABE2', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: selectedSurgery.checklist_status[item] ? '#10b981' : '#fff',
                      color: selectedSurgery.checklist_status[item] ? '#fff' : '#000'
                    }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>{item.toUpperCase()}</span>
                    {selectedSurgery.checklist_status[item] ? <Check size={16} /> : <div style={{ width: '16px', height: '16px', border: '2px solid #29ABE2' }} />}
                  </div>
                ))}
              </div>

              <button className="btn-black" style={{ width: '100%', marginTop: '2rem', height: '50px' }}>
                <Play size={16} style={{ marginRight: '10px' }} /> COMMENCE SURGERY
              </button>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem', opacity: 0.3 }}>
              <Clipboard size={48} style={{ margin: '0 auto 1rem' }} />
              <p style={{ fontWeight: 900, fontSize: '0.8rem' }}>SELECT A PROCEDURE TO VIEW READINESS</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
