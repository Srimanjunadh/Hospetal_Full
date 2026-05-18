"use client";
import { useEffect, useState } from "react";
import { Activity, Clipboard, Clock, CheckCircle2, AlertTriangle, Play, Check, Plus, Trash2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";

import { apiService } from "@/services/api";

export default function OTSchedulePage() {
  const { showToast } = useToast();
  const [surgeries, setSurgeries] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [selectedSurgery, setSelectedSurgery] = useState<any>(null);

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSurgery, setNewSurgery] = useState({
    procedure_name: '',
    doctor_id: '',
    patient_id: '',
    ot_room_number: 'OT-101',
    scheduled_at: new Date().toISOString().slice(0, 16),
    notes: ''
  });

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
      if (session?.hospital_id) {
        const data = await apiService.getSurgicalSchedules(session.hospital_id);
        setSurgeries(Array.isArray(data) ? data : []);

        const docs = await apiService.getDoctors(session.hospital_id);
        setDoctors(Array.isArray(docs) ? docs : []);

        const pats = await apiService.getPatients(session.hospital_id);
        setPatients(Array.isArray(pats) ? pats : []);
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

  const handleAddSurgery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSurgery.procedure_name || !newSurgery.doctor_id || !newSurgery.patient_id) {
      showToast("Please fill all required fields", "error");
      return;
    }

    try {
      const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
      const payload = {
        hospital_id: session?.hospital_id || 1,
        patient_id: Number(newSurgery.patient_id),
        doctor_id: Number(newSurgery.doctor_id),
        ot_room_number: newSurgery.ot_room_number,
        procedure_name: newSurgery.procedure_name,
        scheduled_at: new Date(newSurgery.scheduled_at).toISOString(),
        notes: newSurgery.notes
      };

      await apiService.scheduleSurgery(payload);
      showToast("Surgery scheduled & notification sent to Doctor", "success");
      setIsAddModalOpen(false);
      // Reset form
      setNewSurgery({
        procedure_name: '',
        doctor_id: '',
        patient_id: '',
        ot_room_number: 'OT-101',
        scheduled_at: new Date().toISOString().slice(0, 16),
        notes: ''
      });
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Failed to schedule surgery", "error");
    }
  };

  const handleDeleteSurgery = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this surgical schedule?")) return;
    try {
      await apiService.deleteSurgery(id);
      showToast("Surgery schedule deleted successfully", "success");
      if (selectedSurgery?.id === id) setSelectedSurgery(null);
      fetchData();
    } catch (err: any) {
      showToast(err.message || "Failed to delete surgery", "error");
    }
  };

  if (!mounted) return null;

  return (
    <DashboardLayout role="hospital_admin" userName="Admin Manju">
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>SURGICAL CENTER COMMAND</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>OPERATING THEATER (OT) QUEUE & READINESS CHECKLISTS</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="btn-black" 
          style={{ height: '45px', padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <Plus size={18} /> ADD SURGERY
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '3rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {/* OT Queue */}
          <div className="card" style={{ padding: '0' }}>
            <div style={{ padding: '1.5rem 2rem', background: '#000', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px' }}>TODAY'S SURGICAL QUEUE</h3>
              <Clock size={18} />
            </div>
            <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="custom-scrollbar">
              {!Array.isArray(surgeries) || surgeries.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.3, fontWeight: 900 }}>NO SURGERIES SCHEDULED</div>
              ) : (
                surgeries.map((s, i) => (
                  <div key={i} style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #eee', display: 'flex', gap: '20px', alignItems: 'center', cursor: 'pointer', background: selectedSurgery?.id === s.id ? '#f4f4f5' : '#fff' }} onClick={() => setSelectedSurgery(s)}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</span>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontWeight: 900, fontSize: '0.9rem' }}>{s.procedure_name.toUpperCase()}</p>
                        <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)' }}>OT ROOM {s.ot_room_number} • {new Date(s.scheduled_at).toLocaleTimeString()}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 900, padding: '4px 8px', border: '1px solid #000' }}>{s.status}</span>
                        <Activity size={16} />
                        <button 
                          onClick={(e) => handleDeleteSurgery(s.id, e)}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                          title="Delete Surgery"
                        >
                          <Trash2 size={18} />
                        </button>
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
            <div className="card" style={{ border: '4px solid #000' }}>
              <h3 style={{ fontWeight: 900, fontSize: '0.9rem', marginBottom: '0.5rem' }}>WHO SAFETY CHECKLIST</h3>
              <p style={{ fontSize: '0.6rem', fontWeight: 800, color: '#666', marginBottom: '2rem' }}>PROCEDURE: {selectedSurgery.procedure_name.toUpperCase()}</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {Object.keys(selectedSurgery.checklist_status).map((item) => (
                  <div key={item} 
                    onClick={() => toggleChecklist(selectedSurgery.id, item)}
                    style={{ 
                      padding: '12px', 
                      border: '2px solid #000', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: selectedSurgery.checklist_status[item] ? '#10b981' : '#fff',
                      color: selectedSurgery.checklist_status[item] ? '#fff' : '#000'
                    }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>{item.toUpperCase()}</span>
                    {selectedSurgery.checklist_status[item] ? <Check size={16} /> : <div style={{ width: '16px', height: '16px', border: '2px solid #000' }} />}
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

      {/* Add Surgery Modal */}
      {isAddModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', background: '#fff', border: '4px solid #000', padding: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900 }}>SCHEDULE NEW SURGERY</h2>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', fontWeight: 900 }}>✕</button>
            </div>

            <form onSubmit={handleAddSurgery} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>TYPE OF OPERATION / PROCEDURE *</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. APPENDECTOMY, CABG, KNEE REPLACEMENT"
                  value={newSurgery.procedure_name}
                  onChange={e => setNewSurgery({...newSurgery, procedure_name: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', border: '2px solid #000', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>ASSIGN DOCTOR *</label>
                  <select 
                    required
                    value={newSurgery.doctor_id} 
                    onChange={e => setNewSurgery({...newSurgery, doctor_id: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', border: '2px solid #000', fontWeight: 700, background: '#fff' }}
                  >
                    <option value="">-- Select Doctor --</option>
                    {doctors.map(d => (
                      <option key={d.id} value={d.id}>Dr. {d.user?.name || d.specialization || `Doctor #${d.id}`}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>SELECT PATIENT / CLIENT *</label>
                  <select 
                    required
                    value={newSurgery.patient_id} 
                    onChange={e => setNewSurgery({...newSurgery, patient_id: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', border: '2px solid #000', fontWeight: 700, background: '#fff' }}
                  >
                    <option value="">-- Select Patient --</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name || p.username || `Patient #${p.id}`}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>OPERATING THEATER (OT) ROOM *</label>
                  <select 
                    value={newSurgery.ot_room_number} 
                    onChange={e => setNewSurgery({...newSurgery, ot_room_number: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', border: '2px solid #000', fontWeight: 700, background: '#fff' }}
                  >
                    <option value="OT-101">OT ROOM 101 (CARDIAC / MAJOR)</option>
                    <option value="OT-102">OT ROOM 102 (ORTHO / GENERAL)</option>
                    <option value="OT-204">OT ROOM 204 (NEURO / SPECIAL)</option>
                    <option value="OT-305">OT ROOM 305 (EMERGENCY)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>DATE & TIME *</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={newSurgery.scheduled_at}
                    onChange={e => setNewSurgery({...newSurgery, scheduled_at: e.target.value})}
                    style={{ width: '100%', padding: '0.8rem', border: '2px solid #000', fontWeight: 700 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '0.5rem' }}>SURGICAL NOTES / SPECIAL INSTRUCTIONS</label>
                <textarea 
                  placeholder="Enter any pre-op notes or equipment requirements..."
                  value={newSurgery.notes}
                  onChange={e => setNewSurgery({...newSurgery, notes: e.target.value})}
                  style={{ width: '100%', padding: '0.8rem', border: '2px solid #000', fontWeight: 700, minHeight: '80px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ padding: '0.8rem 2rem', border: '2px solid #000', background: '#fff', fontWeight: 900, cursor: 'pointer' }}>
                  CANCEL
                </button>
                <button type="submit" className="btn-black" style={{ padding: '0.8rem 2.5rem', fontWeight: 900 }}>
                  CONFIRM & NOTIFY DOCTOR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
