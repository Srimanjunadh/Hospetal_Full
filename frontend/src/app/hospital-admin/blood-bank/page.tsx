"use client";
import { useEffect, useState } from "react";
import { Activity, Droplets, ArrowRight, Plus, Search, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";

import { apiService } from "@/services/api";

export default function BloodBankPage() {
  const { showToast } = useToast();
  const [stock, setStock] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [newRequest, setNewRequest] = useState({
    blood_group: "O+",
    units_required: 1,
    urgency: "NORMAL"
  });

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
      if (session?.hospital_id) {
        const stockData = await apiService.getBloodStock(session.hospital_id);
        setStock(Array.isArray(stockData) ? stockData : []);
        
        const reqData = await apiService.getBloodRequests(session.hospital_id);
        setRequests(Array.isArray(reqData) ? reqData : []);
      }
    } catch (e) {
      console.error("Failed to fetch blood bank data", e);
      setStock([]);
      setRequests([]);
    }
  };

  if (!mounted) return null;

  return (
    <DashboardLayout role="hospital_admin" userName="Admin Manju">
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>BLOOD INVENTORY & LOGISTICS</h1>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>REAL-TIME COMPATIBILITY & STOCK MONITORING</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '3rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {/* Stock Grid */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
              <Droplets size={20} color="#dc2626" />
              <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px' }}>CURRENT RESERVES</h3>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
              {Array.isArray(stock) && stock.length > 0 ? stock.map((item) => (
                <div key={item.blood_group} style={{ border: '2px solid #000', padding: '1.5rem', textAlign: 'center', background: (item.units_available || 0) < 5 ? '#fef2f2' : '#fff' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#dc2626' }}>{item.blood_group}</p>
                  <p style={{ fontSize: '0.8rem', fontWeight: 800 }}>{item.units_available || 0} UNITS</p>
                  <div style={{ height: '4px', background: '#eee', marginTop: '10px' }}>
                    <div style={{ height: '100%', background: '#dc2626', width: `${Math.min(100, (item.units_available || 0) * 10)}%` }}></div>
                  </div>
                </div>
              )) : (
                <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '2rem', opacity: 0.5, fontWeight: 800 }}>INITIALIZING INVENTORY NODE...</div>
              )}
            </div>
          </div>

          {/* Request History */}
          <div className="card" style={{ padding: '0' }}>
            <div style={{ padding: '1.5rem 2rem', background: '#000', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px' }}>PENDING REQUISITIONS</h3>
              <Activity size={18} />
            </div>
            <div style={{ maxHeight: '350px', overflowY: 'auto' }} className="custom-scrollbar">
              {!Array.isArray(requests) || requests.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', opacity: 0.3, fontWeight: 900 }}>NO ACTIVE REQUESTS</div>
              ) : (
                requests.map((req, i) => (
                  <div key={i} style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #eee', display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</span>
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontWeight: 900, fontSize: '0.9rem' }}>TYPE: {req.blood_group} • {req.units_required} UNITS</p>
                        <p style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-secondary)' }}>STATUS: {req.status} • URGENCY: {req.urgency}</p>
                      </div>
                      <button className="btn-black" style={{ fontSize: '0.6rem' }}>APPROVE & RELEASE</button>
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
          <div className="card" style={{ background: '#dc2626', color: '#fff' }}>
            <h3 style={{ fontWeight: 900, fontSize: '0.9rem', marginBottom: '1rem' }}>COMPATIBILITY MATRIX</h3>
            <p style={{ fontSize: '0.7rem', opacity: 0.8, lineHeight: '1.4' }}>
              O- is the Universal Donor.<br/>
              AB+ is the Universal Recipient.
            </p>
            <div style={{ marginTop: '1.5rem', fontSize: '0.6rem', fontWeight: 900, borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '1rem' }}>
              AUTO-MATCHING ENABLED
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontWeight: 900, fontSize: '0.8rem', marginBottom: '1.5rem' }}>EMERGENCY BROADCAST</h3>
            <p style={{ fontSize: '0.7rem', fontWeight: 700, marginBottom: '1rem' }}>ALERT ALL CONNECTED DONORS FOR RARE BLOOD GROUPS.</p>
            <button className="btn-black" style={{ width: '100%', background: '#000' }}>SIGNAL DONOR NETWORK</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
