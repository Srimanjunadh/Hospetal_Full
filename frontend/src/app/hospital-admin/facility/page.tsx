"use client";
import { useState, useEffect } from "react";
import { Hospital, Truck, Bed, Zap, Wind, Plus, MoreVertical, Search, Filter, ShieldCheck, Activity, MapPin, RefreshCcw } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";

export default function FacilityControlPage() {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [ambulances, setAmbulances] = useState<any[]>([]);
  const [roomControl, setRoomControl] = useState<any[]>([]);
  const [utilityStatus, setUtilityStatus] = useState({
    power: "OPTIMAL",
    oxygen: "OPTIMAL",
    hvac: "SERVICE REQ."
  });
  const [showAddAmbulance, setShowAddAmbulance] = useState(false);
  const [newAmbulance, setNewAmbulance] = useState({
    vehicle_number: "",
    driver_name: "",
    driver_phone: "",
    vehicle_size: "MEDIUM",
    status: "READY",
    location: "BASE 1 - MAIN WING"
  });

  useEffect(() => {
    setMounted(true);
    const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
    if (session?.hospital_id) {
      fetchFacilityData(session.hospital_id);
      const interval = setInterval(() => fetchFacilityData(session.hospital_id), 10000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchFacilityData = async (hospitalId: number) => {
    try {
      const { apiService } = await import("@/services/api");
      const ambData = await apiService.getAmbulances(hospitalId);
      setAmbulances(ambData.map((a: any) => ({
        dbId: a.id,
        id: a.vehicle_number,
        crew: a.driver_name,
        phone: a.driver_phone || "N/A",
        size: a.vehicle_size || "MEDIUM",
        location: a.location,
        status: a.status.toUpperCase()
      })));

      const bedData = await apiService.getBeds(hospitalId);
      setRoomControl(bedData.map((b: any) => ({
        dbId: b.id,
        id: `${b.room_number}-${b.bed_number}`,
        dept: b.dept || "GENERAL",
        o2: b.o2_lvl || (Math.floor(Math.random() * 5) + 94) + "%",
        status: b.status.toUpperCase()
      })));

      // Simulate slight fluctuations in utility health
      setUtilityStatus({
        power: Math.random() > 0.95 ? "FLUCTUATING" : "OPTIMAL",
        oxygen: Math.random() > 0.9 ? "STABLE" : "OPTIMAL",
        hvac: utilityStatus.hvac
      });
    } catch (e) {
      showToast("Facility sync error", "error");
    }
  };

  const handleDispatch = async (amb: any) => {
    try {
      const { apiService } = await import("@/services/api");
      await apiService.updateAmbulanceStatus(amb.dbId, "ENGAGED");
      showToast(`Dispatching ${amb.id} to Emergency Node`, "success");
      const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
      fetchFacilityData(session.hospital_id);
    } catch (e) { showToast("Dispatch failed", "error"); }
  };

  const handleService = async (room: any) => {
    try {
      const { apiService } = await import("@/services/api");
      await apiService.updateBedStatus(room.dbId, "maintenance");
      showToast(`Room ${room.id} marked for maintenance`, "info");
      const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
      fetchFacilityData(session.hospital_id);
    } catch (e) { showToast("Service update failed", "error"); }
  };

  const handleAddAmbulanceSubmit = async () => {
    if (!newAmbulance.vehicle_number || !newAmbulance.driver_name || !newAmbulance.driver_phone) {
      showToast("Please enter Vehicle Number, Crew Name, and Mobile Number", "error");
      return;
    }
    try {
      const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
      if (!session?.hospital_id) {
        showToast("Session expired. Please login again.", "error");
        return;
      }
      const { apiService } = await import("@/services/api");
      await apiService.addAmbulance({
        hospital_id: session.hospital_id,
        vehicle_number: newAmbulance.vehicle_number,
        driver_name: newAmbulance.driver_name,
        driver_phone: newAmbulance.driver_phone,
        vehicle_size: newAmbulance.vehicle_size,
        status: newAmbulance.status,
        location: newAmbulance.location || "BASE 1"
      });
      showToast("Ambulance unit successfully deployed", "success");
      setShowAddAmbulance(false);
      setNewAmbulance({
        vehicle_number: "",
        driver_name: "",
        driver_phone: "",
        vehicle_size: "MEDIUM",
        status: "READY",
        location: "BASE 1 - MAIN WING"
      });
      fetchFacilityData(session.hospital_id);
    } catch (e: any) {
      showToast(e.message || "Failed to add ambulance", "error");
    }
  };

  if (!mounted) return null;

  return (
    <DashboardLayout role="hospital_admin" userName="Admin Manju">
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>FACILITY CONTROL TERMINAL</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>INFRASTRUCTURE MONITORING • AMBULANCE DISPATCH</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-black" onClick={() => setShowAddAmbulance(true)}>
            <Plus size={18} /> ADD AMBULANCE
          </button>
          <button className="btn-black" onClick={() => showToast("Deploying Global Emergency Fleet", "success")}>
            <Truck size={18} /> DISPATCH EMERGENCY
          </button>
        </div>
      </div>

      {showAddAmbulance && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '500px', background: '#fff', color: '#000', border: '3px solid #000', padding: '2.5rem', boxShadow: '10px 10px 0px #000' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid #000', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Truck size={24} />
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '1px' }}>ADD AMBULANCE UNIT</h2>
              </div>
              <button style={{ background: 'transparent', border: 'none', fontSize: '1.5rem', fontWeight: 900, cursor: 'pointer' }} onClick={() => setShowAddAmbulance(false)}>×</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '1px' }}>VEHICLE REGISTRATION NUMBER *</label>
                <input 
                  type="text" 
                  placeholder="e.g. KA-04-EM-2026" 
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #000', fontSize: '0.9rem', fontWeight: 700, outline: 'none' }}
                  value={newAmbulance.vehicle_number}
                  onChange={(e) => setNewAmbulance({...newAmbulance, vehicle_number: e.target.value})}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '1px' }}>ASSIGNED CREW / EMT LEAD *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Ramesh Kumar (EMT-P)" 
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #000', fontSize: '0.9rem', fontWeight: 700, outline: 'none' }}
                  value={newAmbulance.driver_name}
                  onChange={(e) => setNewAmbulance({...newAmbulance, driver_name: e.target.value})}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '1px' }}>CREW MOBILE NUMBER *</label>
                <input 
                  type="text" 
                  placeholder="e.g. +91 98765 43210" 
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #000', fontSize: '0.9rem', fontWeight: 700, outline: 'none' }}
                  value={newAmbulance.driver_phone}
                  onChange={(e) => setNewAmbulance({...newAmbulance, driver_phone: e.target.value})}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '1px' }}>VEHICLE SIZE</label>
                <select 
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #000', fontSize: '0.9rem', fontWeight: 700, outline: 'none', background: '#fff' }}
                  value={newAmbulance.vehicle_size}
                  onChange={(e) => setNewAmbulance({...newAmbulance, vehicle_size: e.target.value})}
                >
                  <option value="SMALL">SMALL (BASIC LIFE SUPPORT)</option>
                  <option value="MEDIUM">MEDIUM (ADVANCED LIFE SUPPORT)</option>
                  <option value="LARGE">LARGE (MOBILE ICU / SPECIALIZED)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '1px' }}>OPERATIONAL STATUS</label>
                <select 
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #000', fontSize: '0.9rem', fontWeight: 700, outline: 'none', background: '#fff' }}
                  value={newAmbulance.status}
                  onChange={(e) => setNewAmbulance({...newAmbulance, status: e.target.value})}
                >
                  <option value="READY">READY (STANDBY)</option>
                  <option value="ENGAGED">ENGAGED (DISPATCHED)</option>
                  <option value="MAINTENANCE">MAINTENANCE (SERVICE REQ.)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '1px' }}>STATION / BASE LOCATION</label>
                <input 
                  type="text" 
                  placeholder="e.g. BASE 1 - MAIN WING" 
                  style={{ width: '100%', padding: '12px 16px', border: '2px solid #000', fontSize: '0.9rem', fontWeight: 700, outline: 'none' }}
                  value={newAmbulance.location}
                  onChange={(e) => setNewAmbulance({...newAmbulance, location: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  style={{ flex: 1, padding: '12px', background: 'transparent', border: '2px solid #000', fontWeight: 900, cursor: 'pointer' }}
                  onClick={() => setShowAddAmbulance(false)}
                >
                  CANCEL
                </button>
                <button 
                  className="btn-black"
                  style={{ flex: 1, padding: '12px', fontWeight: 900, textAlign: 'center', justifyContent: 'center' }}
                  onClick={handleAddAmbulanceSubmit}
                >
                  DEPLOY UNIT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem', marginTop: '3rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          
          {/* Ambulance Fleet Monitor */}
          <div className="card" style={{ padding: '0' }}>
            <div style={{ padding: '1.5rem 2rem', background: '#000', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Truck size={20} />
                <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px' }}>AMBULANCE FLEET REGISTRY</h3>
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>GPS SYNC ACTIVE</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', height: '400px', overflowY: 'auto' }} className="custom-scrollbar">
              {ambulances.map((amb, i) => (
                <div key={i} style={{ padding: '1.25rem 2rem', borderBottom: '1px solid #eee', display: 'flex', gap: '20px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</span>
                  <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                      <div style={{ padding: '10px', background: '#f4f4f5', border: '1px solid #000' }}>
                        <Truck size={18} />
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <p style={{ fontWeight: 900, fontSize: '0.9rem' }}>{amb.id}</p>
                          <span className="badge" style={{ fontSize: '0.55rem', background: '#e4e4e7', color: '#000' }}>{amb.size}</span>
                        </div>
                        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#666' }}>{amb.crew} • <span style={{ color: '#999' }}>{amb.phone}</span></p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                      <div style={{ textAlign: 'right' }}>
                         <p style={{ fontSize: '0.75rem', fontWeight: 900 }}><MapPin size={12} style={{ marginRight: '4px' }} /> {amb.location}</p>
                      </div>
                      <button 
                        className="btn-black" 
                        style={{ padding: '6px 12px', fontSize: '0.6rem' }}
                        onClick={() => handleDispatch(amb)}
                        disabled={amb.status !== 'READY'}
                      >
                        {amb.status === 'READY' ? 'DISPATCH' : 'ENGAGED'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Room Control Terminal */}
          <div className="card" style={{ padding: '0', border: '2px solid #000' }}>
            <div style={{ padding: '1.5rem 2rem', background: '#000', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px' }}>ROOM INVENTORY DATABASE</h3>
               <Bed size={18} />
            </div>
            <div style={{ height: '400px', overflowY: 'auto' }} className="custom-scrollbar">
              <table className="data-table" style={{ border: 'none' }}>
                <thead>
                  <tr style={{ position: 'sticky', top: 0, background: '#f9fafb', zIndex: 10 }}>
                    <th style={{ padding: '12px 20px', fontSize: '0.65rem' }}>S.NO</th>
                    <th style={{ padding: '12px 20px', fontSize: '0.65rem' }}>ROOM ID</th>
                    <th style={{ padding: '12px 20px', fontSize: '0.65rem' }}>DEPT</th>
                    <th style={{ padding: '12px 20px', fontSize: '0.65rem' }}>O2 LVL</th>
                    <th style={{ padding: '12px 20px', fontSize: '0.65rem' }}>STATUS</th>
                    <th style={{ padding: '12px 20px', fontSize: '0.65rem' }}>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {roomControl.map((room, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px 20px', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                      <td style={{ padding: '12px 20px', fontWeight: 900 }}>{room.id}</td>
                      <td style={{ padding: '12px 20px', fontWeight: 800, opacity: 0.5 }}>{room.dept}</td>
                      <td style={{ padding: '12px 20px', fontWeight: 800 }}>{room.o2}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span className="badge" style={{ fontSize: '0.6rem' }}>{room.status}</span>
                      </td>
                      <td style={{ padding: '12px 20px' }}>
                         <button 
                          style={{ background: 'transparent', border: '1px solid #000', padding: '4px 8px', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer' }}
                          onClick={() => handleService(room)}
                         >
                            SERVICE
                         </button>
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

        {/* Infrastructure Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
             <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '2rem' }}>UTILITY HEARTBEAT</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ padding: '1.5rem', background: '#f4f4f5', borderLeft: '4px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <Zap size={20} />
                     <span style={{ fontWeight: 900, fontSize: '0.8rem' }}>POWER GRID</span>
                   </div>
                   <button 
                    style={{ background: 'transparent', border: 'none', color: utilityStatus.power === 'OPTIMAL' ? '#10b981' : '#f59e0b', fontWeight: 900, fontSize: '0.7rem', cursor: 'pointer' }}
                    onClick={() => showToast(`Power Grid Audit: ${utilityStatus.power}`, "info")}
                   >
                     {utilityStatus.power}
                   </button>
                </div>
                <div style={{ padding: '1.5rem', background: '#f4f4f5', borderLeft: '4px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <Wind size={20} />
                     <span style={{ fontWeight: 900, fontSize: '0.8rem' }}>OXYGEN NODE</span>
                   </div>
                   <button 
                    style={{ background: 'transparent', border: 'none', color: utilityStatus.oxygen === 'OPTIMAL' ? '#10b981' : '#3b82f6', fontWeight: 900, fontSize: '0.7rem', cursor: 'pointer' }}
                    onClick={() => showToast(`Oxygen Node Audit: ${utilityStatus.oxygen}`, "info")}
                   >
                     {utilityStatus.oxygen}
                   </button>
                </div>
                <div style={{ padding: '1.5rem', background: '#f4f4f5', borderLeft: '4px solid #dc2626', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                     <Activity size={20} />
                     <span style={{ fontWeight: 900, fontSize: '0.8rem' }}>HVAC SYSTEM</span>
                   </div>
                   <button 
                    style={{ background: 'transparent', border: 'none', color: '#dc2626', fontWeight: 900, fontSize: '0.7rem', cursor: 'pointer' }}
                    onClick={() => showToast("HVAC Service Team Status: " + utilityStatus.hvac, "error")}
                   >
                     {utilityStatus.hvac}
                   </button>
                </div>
             </div>
          </div>

          <div className="card" style={{ background: '#000', color: '#fff' }}>
             <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '1.5rem' }}>FACILITY NOTES</h3>
             <textarea 
               placeholder="ENTER ADMINISTRATIVE FACILITY OBSERVATIONS..." 
               style={{ width: '100%', height: '150px', background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '1rem', fontSize: '0.8rem', outline: 'none' }}
             ></textarea>
             <button className="btn-black" style={{ background: '#fff', color: '#000', width: '100%', marginTop: '1.5rem' }} onClick={() => showToast("Facility Log Synchronized", "success")}>SAVE LOG</button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
