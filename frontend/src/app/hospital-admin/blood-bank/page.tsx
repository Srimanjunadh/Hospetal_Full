"use client";
import { useEffect, useState } from "react";
import { Activity, Droplets, ArrowRight, Plus, Search, AlertCircle, Edit2, X, PlusCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";
import { motion } from "framer-motion";

import { apiService } from "@/services/api";

export default function BloodBankPage() {
  const { showToast } = useToast();
  const [stock, setStock] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [hospitalId, setHospitalId] = useState<number | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"edit" | "add">("edit"); // edit total or add batch
  const [selectedGroup, setSelectedGroup] = useState("A+");
  const [unitsInput, setUnitsInput] = useState<number>(0);

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const session = JSON.parse(localStorage.getItem("medclues_session") || "null");
      if (session?.hospital_id) {
        setHospitalId(session.hospital_id);
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

  const handleOpenEdit = (item: any) => {
    setModalMode("edit");
    setSelectedGroup(item.blood_group);
    setUnitsInput(item.units_available || 0);
    setIsModalOpen(true);
  };

  const handleOpenAddBatch = () => {
    setModalMode("add");
    setSelectedGroup("A+");
    setUnitsInput(5); // Default batch size
    setIsModalOpen(true);
  };

  const handleSaveStock = async () => {
    if (!hospitalId) return;
    try {
      let finalUnits = unitsInput;
      
      if (modalMode === "add") {
        // Find existing units and add
        const existing = stock.find(s => s.blood_group === selectedGroup);
        const currentUnits = existing ? existing.units_available : 0;
        finalUnits = currentUnits + unitsInput;
      }

      await apiService.updateBloodStock(hospitalId, {
        blood_group: selectedGroup,
        units: finalUnits
      });

      showToast(
        modalMode === "add"
          ? `Successfully registered donation batch of +${unitsInput} Units for ${selectedGroup}`
          : `Successfully updated ${selectedGroup} reserves to ${finalUnits} Units`,
        "success"
      );
      
      setIsModalOpen(false);
      fetchData();
    } catch (e) {
      showToast("Failed to update blood stock", "error");
    }
  };

  if (!mounted) return null;

  return (
    <DashboardLayout role="hospital_admin" userName="Admin Manju">
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>BLOOD INVENTORY & LOGISTICS</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>REAL-TIME COMPATIBILITY & STOCK MONITORING</p>
        </div>
        <button className="btn-black" onClick={handleOpenAddBatch} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PlusCircle size={18} /> REGISTER BATCH DONATION
        </button>
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
                <div key={item.blood_group} style={{ border: '2px solid var(--bg-side)', padding: '1.5rem', textAlign: 'center', background: (item.units_available || 0) < 5 ? '#fef2f2' : '#fff', position: 'relative' }}>
                  <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#dc2626' }}>{item.blood_group}</p>
                  <p style={{ fontSize: '0.8rem', fontWeight: 800 }}>{item.units_available || 0} UNITS</p>
                  <div style={{ height: '4px', background: '#eee', marginTop: '10px', marginBottom: '15px' }}>
                    <div style={{ height: '100%', background: '#dc2626', width: `${Math.min(100, (item.units_available || 0) * 10)}%` }}></div>
                  </div>
                  <button 
                    onClick={() => handleOpenEdit(item)}
                    style={{ background: 'var(--bg-side)', color: '#fff', border: 'none', padding: '4px 8px', fontSize: '0.6rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px', margin: '0 auto', cursor: 'pointer' }}
                  >
                    <Edit2 size={10} /> EDIT STOCK
                  </button>
                </div>
              )) : (
                <div style={{ gridColumn: 'span 4', textAlign: 'center', padding: '2rem', opacity: 0.5, fontWeight: 800 }}>INITIALIZING INVENTORY NODE...</div>
              )}
            </div>
          </div>

          {/* Request History */}
          <div className="card" style={{ padding: '0' }}>
            <div style={{ padding: '1.5rem 2rem', background: 'var(--bg-side)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            <button className="btn-black" style={{ width: '100%', background: 'var(--bg-side)' }}>SIGNAL DONOR NETWORK</button>
          </div>
        </div>
      </div>

      {/* Manage Blood Stock Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
           <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#fff', width: '400px', padding: '2.5rem', border: '4px solid var(--bg-side)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
                 <h3 style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '1px' }}>
                   {modalMode === "add" ? "REGISTER DONATION BATCH" : "EDIT RESERVES STOCK"}
                 </h3>
                 <X size={20} onClick={() => setIsModalOpen(false)} style={{ cursor: 'pointer' }} />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 <div>
                    <label style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.5, marginBottom: '8px', display: 'block', letterSpacing: '1px' }}>BLOOD GROUP</label>
                    {modalMode === "add" ? (
                      <select 
                        value={selectedGroup} 
                        onChange={e => setSelectedGroup(e.target.value)} 
                        style={{ width: '100%', padding: '12px', border: '2px solid var(--bg-side)', fontWeight: 800, fontSize: '0.8rem', outline: 'none' }}
                      >
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    ) : (
                      <div style={{ padding: '12px', border: '2px solid var(--bg-side)', fontWeight: 900, fontSize: '1.2rem', color: '#dc2626', background: '#f4f4f5', textAlign: 'center' }}>
                        {selectedGroup}
                      </div>
                    )}
                 </div>
                 
                 <div>
                    <label style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.5, marginBottom: '8px', display: 'block', letterSpacing: '1px' }}>
                      {modalMode === "add" ? "BATCH SIZE (UNITS TO ADD)" : "TOTAL AVAILABLE UNITS"}
                    </label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input 
                        type="number" 
                        value={unitsInput} 
                        onChange={e => setUnitsInput(Math.max(0, Number(e.target.value)))} 
                        style={{ flex: 1, padding: '12px', border: '2px solid var(--bg-side)', fontWeight: 800, fontSize: '1rem', outline: 'none' }} 
                      />
                    </div>
                    
                    {/* Quick Adjuster Chips */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
                      {[1, 5, 10].map(val => (
                        <button
                          key={val}
                          onClick={() => setUnitsInput(prev => prev + val)}
                          style={{ padding: '4px 8px', border: '1px solid var(--bg-side)', background: '#f4f4f5', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer' }}
                        >
                          +{val} Units
                        </button>
                      ))}
                      {modalMode === "edit" && [1, 5].map(val => (
                        <button
                          key={`sub-${val}`}
                          onClick={() => setUnitsInput(prev => Math.max(0, prev - val))}
                          style={{ padding: '4px 8px', border: '1px solid var(--bg-side)', background: '#f4f4f5', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer' }}
                        >
                          -{val} Units
                        </button>
                      ))}
                    </div>
                 </div>

                 <button 
                   onClick={handleSaveStock} 
                   style={{ width: '100%', background: '#dc2626', color: '#fff', border: 'none', padding: '15px', fontWeight: 900, cursor: 'pointer', fontSize: '0.8rem', letterSpacing: '1px', marginTop: '1rem' }}
                 >
                   {modalMode === "add" ? "ADD BATCH TO STOCK" : "CONFIRM TOTAL RESERVES"}
                 </button>
              </div>
           </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
