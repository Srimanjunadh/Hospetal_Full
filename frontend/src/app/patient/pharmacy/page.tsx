"use client";
import { useState, useEffect } from "react";
import { Pill, Search, ShoppingCart, Clock, Circle, ArrowRight } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function PharmacyPage() {
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [sessionUser, setSessionUser] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const session = JSON.parse(localStorage.getItem("medclues_session") || "null");
    if (session?.username) {
      setSessionUser(session.name);
      fetchPrescriptions(session.username);
    }
  }, []);

  const fetchPrescriptions = async (username: string) => {
    try {
      const { apiService } = await import("@/services/api");
      const data = await apiService.getPrescriptions(username);
      if (Array.isArray(data)) {
        // Flatten the medicines from prescriptions
        const meds = [];
        for (const p of data) {
          if (Array.isArray(p.medicines)) {
            for (const m of p.medicines) {
              meds.push({
                name: m.medicine || m.name || "UNKNOWN",
                dosage: m.dosage || m.power || "N/A",
                refilled: new Date(p.created_at || Date.now()).toLocaleDateString(),
                remaining: m.amount || m.quantity || 12, // fallback count
                status: "IN STOCK"
              });
            }
          }
        }
        setPrescriptions(meds);
      }
    } catch (e) {
      console.error("Failed to fetch prescriptions", e);
    }
  };

  if (!mounted) return null;

  return (
    <DashboardLayout role="patient" userName={sessionUser}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>E-PHARMACY</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>SECURE DISPENSARY • LINE-WISE REGISTRY</p>
        </div>
        <button 
          className="btn-black"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            flexDirection: 'row',
            whiteSpace: 'nowrap'
          }}
        >
          <ShoppingCart size={18} /> <span>CART (0)</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem', marginTop: '3rem' }}>
        <div>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ fontWeight: 900, marginBottom: '2rem', fontSize: '0.8rem', letterSpacing: '2px' }}>PRESCRIPTION INVENTORY</h3>
            
            <div style={{ border: '2px solid #000', maxHeight: '400px', overflowY: 'auto' }} className="custom-scrollbar">
              {/* Table Header */}
              <div style={{ display: 'flex', background: '#000', color: '#fff', padding: '12px 20px', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '1px', position: 'sticky', top: 0, zIndex: 10 }}>
                <div style={{ width: '60px' }}>S.NO</div>
                <div style={{ flex: 2 }}>MEDICATION IDENTITY</div>
                <div style={{ flex: 1 }}>LAST REFILL</div>
                <div style={{ flex: 1 }}>UNITS</div>
                <div style={{ flex: 1, textAlign: 'right' }}>AVAILABILITY</div>
              </div>

              {/* Line-wise Items */}
              {prescriptions.length === 0 ? (
                <div style={{ padding: '4rem', textAlign: 'center', fontWeight: 900, opacity: 0.2 }}>INVENTORY EMPTY</div>
              ) : prescriptions.map((med, i) => (
                <div key={i} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  padding: '15px 20px', 
                  borderBottom: '1px solid #eee',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ width: '60px', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</div>
                  <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Pill size={16} />
                    <span style={{ fontWeight: 900 }}>{med.name.toUpperCase()}</span>
                    <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{med.dosage}</span>
                  </div>
                  <div style={{ flex: 1, fontWeight: 700, fontSize: '0.75rem', opacity: 0.6 }}>{med.refilled}</div>
                  <div style={{ flex: 1, fontWeight: 900 }}>{med.remaining} U</div>
                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '6px', 
                      padding: '4px 10px', 
                      background: med.status === 'IN STOCK' ? '#ecfdf5' : med.status === 'CRITICAL' ? '#fef2f2' : '#fff7ed',
                      color: med.status === 'IN STOCK' ? '#059669' : med.status === 'CRITICAL' ? '#dc2626' : '#c2410c',
                      border: '1px solid currentColor',
                      fontSize: '0.6rem',
                      fontWeight: 900
                    }}>
                      <Circle size={6} fill="currentColor" />
                      {med.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <style jsx global>{`
              .custom-scrollbar::-webkit-scrollbar { width: 6px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; border-radius: 0; }
            `}</style>
          </div>

          <div className="card" style={{ marginTop: '2.5rem' }}>
            <h3 style={{ fontWeight: 900, marginBottom: '2rem', fontSize: '0.8rem', letterSpacing: '2px' }}>OTC SUPPLY CATALOG</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {['VITAMIN C', 'PARACETAMOL', 'OMEGA-3', 'INSULIN SYRINGE', 'GAUZE PADS', 'ANTISEPTIC'].map((item) => (
                <div key={item} style={{ padding: '15px', border: '1px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <span style={{ fontWeight: 900, fontSize: '0.75rem' }}>{item}</span>
                   <button className="btn-black" style={{ padding: '4px 8px', fontSize: '0.6rem' }}>ADD</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <h3 style={{ fontWeight: 900, marginBottom: '2rem', fontSize: '0.8rem', letterSpacing: '2px' }}>ORDER ARCHIVE</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
                 <Clock size={16} style={{ marginTop: '2px' }} />
                 <div>
                   <p style={{ fontSize: '0.8rem', fontWeight: 900 }}>REF-ORD-{9020 + i}</p>
                   <p style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.4 }}>DELIVERED • APR {20 - i}</p>
                 </div>
              </div>
            ))}
          </div>
          <button className="btn-outline" style={{ width: '100%', marginTop: '2.5rem', fontSize: '0.7rem' }}>
             LOAD FULL HISTORY
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
