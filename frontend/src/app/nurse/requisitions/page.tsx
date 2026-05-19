"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clipboard, Clock, CheckCircle2, Package, Search, Filter } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiService } from "@/services/api";

export default function NurseRequisitionsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    const s = JSON.parse(localStorage.getItem("medclues_session") || "null");
    if (s && s.role === "nurse") {
      setSession(s);
      fetchRequisitions(s.hospital_id, s.id);
    }
  }, [router, mounted]);

  const fetchRequisitions = async (hospitalId: number, nurseId: number) => {
    try {
      setLoading(true);
      const data = await apiService.getPharmacyNurseRequests(hospitalId);
      // Filter for this specific nurse
      const filtered = Array.isArray(data) ? data.filter((r: any) => r.nurse_id === nurseId) : [];
      setRequisitions(filtered);
    } catch (e) {
      console.error("Failed to fetch requisitions", e);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <DashboardLayout role="nurse" userName={session?.name || "Nurse"}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>REQUISITION TRACKING</h1>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>MONITOR ACTIVE MEDICINE & RESOURCE REQUESTS</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '3rem' }}>
        <div>
          <div className="card" style={{ padding: '0' }}>
            <div style={{ padding: '1.5rem 2rem', background: '#000', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px' }}>ACTIVE REQUISITIONS</h3>
               <Package size={18} />
            </div>
            
            <div style={{ maxHeight: '600px', overflowY: 'auto' }} className="custom-scrollbar">
              {loading ? (
                <div style={{ padding: '4rem', textAlign: 'center', fontWeight: 900, opacity: 0.3 }}>SYNCHRONIZING WITH PHARMACY...</div>
              ) : requisitions.length === 0 ? (
                <div style={{ padding: '5rem', textAlign: 'center' }}>
                  <Clipboard size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.1 }} />
                  <p style={{ fontWeight: 900, opacity: 0.3 }}>NO ACTIVE REQUISITIONS FOUND</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  {requisitions.map((req, i) => (
                    <div key={i} style={{ padding: '2rem', borderBottom: '1px solid #eee', display: 'flex', gap: '20px', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 900, opacity: 0.3, width: '40px' }}>{(i + 1).toString().padStart(2, '0')}</span>
                      <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                            <h4 style={{ fontWeight: 900, fontSize: '1.1rem' }}>PATIENT: {req.patient_name.toUpperCase()}</h4>
                            <span style={{ fontSize: '0.6rem', fontWeight: 900, padding: '4px 8px', border: '1px solid #000' }}>#{req.id}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {req.medicines.map((m: any, idx: number) => (
                              <span key={idx} style={{ fontSize: '0.65rem', fontWeight: 800, background: '#f4f4f5', padding: '4px 8px' }}>
                                {m.name || m.medicine} ({m.quantity || m.amount})
                              </span>
                            ))}
                          </div>
                          <p style={{ fontSize: '0.6rem', fontWeight: 700, color: '#999', marginTop: '1rem' }}>
                            INITIATED: {new Date(req.created_at).toLocaleString()}
                          </p>
                        </div>
                        
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: req.status === 'pending' ? '#f59e0b' : '#10b981', marginBottom: '1rem', justifyContent: 'flex-end' }}>
                            {req.status === 'pending' ? <Clock size={16} /> : <CheckCircle2 size={16} />}
                            <span style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '1px' }}>{req.status.toUpperCase()}</span>
                          </div>
                          <button className="btn-outline" style={{ fontSize: '0.6rem', padding: '8px 12px' }}>VIEW DETAILS</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
          <div className="card" style={{ border: '4px solid #000' }}>
            <h3 style={{ fontWeight: 900, fontSize: '0.9rem', marginBottom: '1.5rem' }}>LOGISTICS OVERVIEW</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: '#f4f4f5', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, fontSize: '0.7rem' }}>PENDING DISPATCH</span>
                <span style={{ fontWeight: 900 }}>{requisitions.filter(r => r.status === 'pending').length}</span>
              </div>
              <div style={{ padding: '1rem', background: '#f4f4f5', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 800, fontSize: '0.7rem' }}>COMPLETED TODAY</span>
                <span style={{ fontWeight: 900 }}>0</span>
              </div>
            </div>
            <button className="btn-black" style={{ width: '100%', marginTop: '2rem' }} onClick={() => router.push('/nurse')}>NEW REQUISITION</button>
          </div>

          <div className="card" style={{ background: '#000', color: '#fff' }}>
            <h4 style={{ fontWeight: 900, fontSize: '0.7rem', marginBottom: '1rem', letterSpacing: '1px' }}>SYSTEM NOTICE</h4>
            <p style={{ fontSize: '0.65rem', lineHeight: '1.6', opacity: 0.6 }}>
              All requisitions are audited for compliance. Ensure patient record synchronization before submitting new resource requests.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
