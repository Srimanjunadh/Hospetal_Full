"use client";
import { useEffect, useState } from "react";
import { Shield, Globe, Users, Hospital, TrendingUp, ShieldCheck, Zap, Activity, Plus, AlertCircle, Server, Terminal, BarChart3, LineChart, Lock, Unlock, Database, Cpu, Eye, EyeOff } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";
import { useRouter } from "next/navigation";
import { apiService } from "@/services/api";

export default function SuperAdminDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  
  const [globalStats, setGlobalStats] = useState<any>({
    total_hospitals: 0,
    total_doctors: 0,
    total_staff: 0,
    total_patients: 0,
    total_revenue: 0
  });

  const [networkNodes, setNetworkNodes] = useState<any[]>([]);
  const [showRegModal, setShowRegModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [regData, setRegData] = useState({
    name: "",
    location: "",
    node_code: "",
    admin_name: "",
    admin_username: "",
    admin_password: ""
  });

  const fetchGlobalData = async () => {
    try {
      const [stats, nodes] = await Promise.all([
        apiService.getGlobalStats(),
        apiService.getHospitals()
      ]);
      setGlobalStats(stats);
      setNetworkNodes(nodes);
    } catch (e) {
      console.error("Global Sync Failed:", e);
    }
  };
  
  useEffect(() => {
    setMounted(true);
    const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
    if (session && session.role === "super_admin") {
      fetchGlobalData();
    }

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + " • " + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRegisterHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiService.registerHospital(regData);
      showToast(`HOSPITAL ${regData.name.toUpperCase()} PROVISIONED`, "success");
      setShowRegModal(false);
      setRegData({ name: "", location: "", node_code: "", admin_name: "", admin_username: "", admin_password: "" });
      fetchGlobalData();
    } catch (error) {
      showToast("Provisioning Failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <DashboardLayout role="super_admin" userName="Master Admin">
      {/* Root Command Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>GLOBAL COMMAND CENTER</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>ROOT TERMINAL • SESSION ENCRYPTED • {currentDateTime.toUpperCase()}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn-black" 
            style={{ background: isLocked ? '#dc2626' : '#000', transition: '0.3s' }}
            onClick={() => {
              setIsLocked(!isLocked);
              showToast(isLocked ? "Network Unlocked" : "GLOBAL LOCKDOWN INITIATED", isLocked ? "success" : "error");
            }}
          >
            {isLocked ? <Lock size={18} /> : <Unlock size={18} />} 
            {isLocked ? "RELEASE NETWORK" : "LOCK NETWORK"}
          </button>
          <button className="btn-outline" style={{ background: '#dc2626', color: '#fff', border: 'none' }}>
            <AlertCircle size={18} /> EMERGENCY BROADCAST
          </button>
        </div>
      </div>

      {/* Real-time Vital Monitors */}
      <div className="grid-stack" style={{ marginBottom: '3rem' }}>
        <div className="card" style={{ background: '#000', color: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
             <p className="card-title" style={{ color: 'rgba(255,255,255,0.5)' }}>GLOBAL HOSPITALS</p>
             <Hospital size={16} />
          </div>
          <h2 className="card-value">{globalStats.total_hospitals}</h2>
        </div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
             <p className="card-title">TOTAL PATIENTS</p>
             <Users size={16} />
          </div>
          <h2 className="card-value">{globalStats.total_patients}</h2>
        </div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
             <p className="card-title">GLOBAL REVENUE</p>
             <TrendingUp size={16} />
          </div>
          <h2 className="card-value">${(globalStats.total_revenue / 1000).toFixed(1)}K</h2>
        </div>
      </div>

      {/* Master Analytics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem', marginBottom: '3rem' }}>
        <div className="card" style={{ padding: '2rem' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h3 style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '2px' }}>NETWORK REVENUE PULSE (12M)</h3>
              <BarChart3 size={18} />
           </div>
           <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              {[40, 60, 45, 90, 65, 80, 55, 95, 75, 85, 50, 100].map((h, i) => (
                <div key={i} style={{ flex: 1, background: i === 11 ? '#000' : '#f4f4f5', height: `${h}%`, border: '1px solid #000', position: 'relative' }}></div>
              ))}
           </div>
        </div>

        <div className="card" style={{ padding: '2rem', background: '#000', color: '#fff' }}>
           <h3 style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '2px', marginBottom: '2rem' }}>FACILITY PERFORMANCE MATRIX</h3>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {networkNodes.slice(0, 4).map((node, i) => (
                <div key={i}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.7rem', fontWeight: 900 }}>
                      <span>{node.name}</span>
                      <span>{node.patient_count} PATIENTS</span>
                   </div>
                   <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)' }}>
                      <div style={{ width: '60%', height: '100%', background: '#fff' }}></div>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {/* Hospital Node Registry */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
           <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px' }}>NETWORK NODE REGISTRY • SUBSCRIPTION MONITORING</h3>
           <button className="btn-black" onClick={() => setShowRegModal(true)}>
              <Plus size={16} /> PROVISION NODE
           </button>
        </div>

        <div className="table-responsive" style={{ border: '2px solid #000' }}>
          <table className="data-table">
            <thead>
              <tr style={{ background: '#000', color: '#fff' }}>
                <th style={{ padding: '12px 20px', fontSize: '0.65rem' }}>S.NO</th>
                <th style={{ padding: '12px 20px' }}>FACILITY IDENTITY</th>
                <th style={{ padding: '12px 20px' }}>LOCATION</th>
                <th style={{ padding: '12px 20px' }}>STAFF (D/N)</th>
                <th style={{ padding: '12px 20px' }}>SUBSCRIPTION</th>
                <th style={{ padding: '12px 20px' }}>STATUS</th>
                <th style={{ padding: '12px 20px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {networkNodes.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', opacity: 0.5, fontWeight: 900 }}>NO NODES DETECTED IN GLOBAL NETWORK</td>
                </tr>
              ) : (
                networkNodes.map((node: any, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px 20px', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                    <td style={{ padding: '15px 20px', fontWeight: 900 }}>{node.name} (ID: {node.node_code})</td>
                    <td style={{ padding: '15px 20px', fontWeight: 700 }}>{node.location}</td>
                    <td style={{ padding: '15px 20px', fontWeight: 700 }}>{node.doctor_count} / {node.staff_count}</td>
                    <td style={{ padding: '15px 20px' }}>
                       <span style={{ 
                         padding: '4px 8px', 
                         fontSize: '0.6rem', 
                         fontWeight: 900, 
                         background: node.subscription_status === 'ACTIVE' ? '#10b981' : '#dc2626',
                         color: '#fff'
                       }}>{node.subscription_status}</span>
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                         <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></div>
                         <span style={{ fontSize: '0.65rem', fontWeight: 900 }}>ONLINE</span>
                       </div>
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                       <button className="btn-outline" style={{ padding: '5px 10px', fontSize: '0.6rem' }}>MANAGE</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Modal */}
      {showRegModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '500px', padding: '3rem', background: '#fff' }}>
             <h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: '2rem' }}>PROVISION NEW NODE</h2>
             <form onSubmit={handleRegisterHospital} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <input type="text" required placeholder="HOSPITAL NAME" value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} style={{ padding: '12px', background: '#f4f4f5', border: 'none', fontWeight: 800 }} />
                  <input type="text" required placeholder="LOCATION" value={regData.location} onChange={e => setRegData({...regData, location: e.target.value})} style={{ padding: '12px', background: '#f4f4f5', border: 'none', fontWeight: 800 }} />
                </div>
                <input type="text" required placeholder="UNIQUE NODE CODE (4 DIGITS)" value={regData.node_code} onChange={e => setRegData({...regData, node_code: e.target.value})} style={{ padding: '12px', background: '#f4f4f5', border: 'none', fontWeight: 800 }} />
                
                <div style={{ borderTop: '2px solid #000', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
                   <p style={{ fontSize: '0.65rem', fontWeight: 900, marginBottom: '1rem' }}>ADMINISTRATIVE CREDENTIALS</p>
                   <input type="text" required placeholder="ADMIN FULL NAME" value={regData.admin_name} onChange={e => setRegData({...regData, admin_name: e.target.value})} style={{ width: '100%', marginBottom: '1rem', padding: '12px', background: '#f4f4f5', border: 'none', fontWeight: 800 }} />
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <input type="text" required placeholder="ADMIN USERNAME" value={regData.admin_username} onChange={e => setRegData({...regData, admin_username: e.target.value})} style={{ padding: '12px', background: '#f4f4f5', border: 'none', fontWeight: 800 }} />
                      <div style={{ position: 'relative' }}>
                        <input 
                          type={showRegPassword ? "text" : "password"} 
                          required 
                          placeholder="ADMIN PASSWORD" 
                          value={regData.admin_password} 
                          onChange={e => setRegData({...regData, admin_password: e.target.value})} 
                          style={{ width: '100%', padding: '12px 40px 12px 12px', background: '#f4f4f5', border: 'none', fontWeight: 800 }} 
                        />
                        <button 
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.5 }}
                        >
                           {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                   </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-black" style={{ padding: '18px', marginTop: '1rem' }}>
                   {isSubmitting ? "PROVISIONING..." : "ACTIVATE NODE"}
                </button>
                <button type="button" className="btn-outline" onClick={() => setShowRegModal(false)}>CANCEL</button>
             </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
