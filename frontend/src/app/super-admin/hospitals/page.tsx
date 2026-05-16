"use client";
import { useState, useEffect } from "react";
import { Hospital, Plus, Search, Filter, MoreVertical, ShieldCheck, Activity, BarChart3, Settings, Trash2, Globe, Server, Users, X, TrendingUp, Zap, Bed, Pause, Power, Lock, Clock, Calendar, Download, Eye, EyeOff } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { apiService } from "@/services/api";

export default function GlobalHospitalsPage() {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState("MONTH");
  const [searchQuery, setSearchQuery] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const data = await apiService.getHospitals(); 
      setHospitals(data.map((h: any) => ({
        ...h,
        displayId: h.node_code || `NODE-${h.id}`,
        displayName: h.name.toUpperCase(),
        revenueDisplay: `$${(h.total_revenue || 0).toLocaleString()}`,
        status: h.subscription_status === "ACTIVE" ? "OPTIMAL" : "SUSPENDED",
        staff_count: h.staff_count || 0,
        growth: [65, 78, 82, 75, 90, 88, 95] // Mock trend data
      })));
    } catch (error) {
      showToast("Failed to sync global registry", "error");
    }
  };

  const filteredHospitals = hospitals.filter(h => 
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    h.displayId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <DashboardLayout role="super_admin" userName="Master Admin">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>GLOBAL HOSPITAL REGISTRY</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>ROOT MANAGEMENT • INTERACTIVE FACILITY AUDIT</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ display: 'flex', background: '#f4f4f5', padding: '4px', border: '1px solid #000' }}>
            {["WEEK", "MONTH", "YEAR"].map(range => (
              <button 
                key={range}
                onClick={() => setTimeRange(range)}
                style={{ 
                  padding: '8px 16px', 
                  fontSize: '0.6rem', 
                  fontWeight: 900, 
                  border: 'none', 
                  background: timeRange === range ? '#000' : 'transparent',
                  color: timeRange === range ? '#fff' : '#000',
                  cursor: 'pointer'
                }}
              >
                {range}
              </button>
            ))}
          </div>
          <Link href="/super-admin/onboarding" className="btn-black">
            <Plus size={18} /> PROVISION NEW FACILITY
          </Link>
        </div>
      </div>

      {/* Global Metrics Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        {[
          { label: "TOTAL NODES", value: hospitals.length, icon: <Globe size={18} />, trend: "+2" },
          { label: "ACTIVE PATIENTS", value: hospitals.reduce((acc, h) => acc + (h.patient_count || 0), 0), icon: <Users size={18} />, trend: "+12%" },
          { label: "TOTAL NETWORK STAFF", value: hospitals.reduce((acc, h) => acc + (h.staff_count || 0), 0), icon: <Activity size={18} />, trend: "+16" },
          { label: "NETWORK REVENUE", value: `$${hospitals.reduce((acc, h) => acc + (h.total_revenue || 0), 0).toLocaleString()}`, icon: <TrendingUp size={18} />, trend: "+8.4%" },
        ].map((stat, i) => (
          <div key={i} className="card" style={{ padding: '1.5rem', border: '2px solid #000' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ background: '#000', color: '#fff', padding: '8px' }}>{stat.icon}</div>
              <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#10b981' }}>{stat.trend}</span>
            </div>
            <p style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.5 }}>{stat.label}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 900 }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
            <input 
              type="text" 
              placeholder="SEARCH GLOBAL REGISTRY BY NAME, NODE ID, OR LOCATION" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '15px 16px 15px 50px', background: '#f4f4f5', border: 'none', fontWeight: '700', fontSize: '0.8rem' }}
            />
          </div>
          <button className="btn-outline">
            <Filter size={18} /> NETWORK FILTER
          </button>
        </div>

        <div className="table-responsive" style={{ border: '2px solid #000' }}>
          <table className="data-table">
            <thead>
              <tr style={{ background: '#000', color: '#fff' }}>
                <th style={{ padding: '12px 20px' }}>S.NO</th>
                <th style={{ padding: '12px 20px' }}>FACILITY IDENTITY</th>
                <th style={{ padding: '12px 20px' }}>NODE ID</th>
                <th style={{ padding: '12px 20px' }}>DOCS / STAFF / PATS</th>
                <th style={{ padding: '12px 20px' }}>REVENUE</th>
                <th style={{ padding: '12px 20px' }}>STATUS</th>
                <th style={{ padding: '12px 20px' }}>ACTIVITY TREND</th>
              </tr>
            </thead>
            <tbody>
              {filteredHospitals.map((h, i) => (
                <tr key={i} 
                  onClick={() => setSelectedHospital(h)}
                  style={{ borderBottom: '1px solid #eee', cursor: 'pointer', transition: 'background 0.2s' }}
                  className="hover-row"
                >
                  <td style={{ padding: '15px 20px', fontWeight: 900, fontSize: '0.8rem', opacity: 0.5 }}>{i + 1}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <div style={{ width: '35px', height: '35px', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900 }}><Hospital size={18} /></div>
                       <div>
                         <p style={{ fontWeight: '900', fontSize: '0.85rem' }}>{h.displayName}</p>
                         <p style={{ fontSize: '0.65rem', color: '#999', fontWeight: 700 }}>{h.location}</p>
                       </div>
                    </div>
                  </td>
                  <td style={{ padding: '15px 20px', fontWeight: 900, fontSize: '0.8rem', opacity: 0.5 }}>{h.displayId}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ display: 'flex', gap: '15px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Physicians">
                          <Activity size={12} color="#3b82f6" /> 
                          <span style={{ fontWeight: 900, fontSize: '0.75rem' }}>{h.doctor_count}</span>
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Nurses/Support">
                          <ShieldCheck size={12} color="#10b981" /> 
                          <span style={{ fontWeight: 900, fontSize: '0.75rem' }}>{h.staff_count}</span>
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} title="Patients">
                          <Users size={12} color="#6366f1" /> 
                          <span style={{ fontWeight: 900, fontSize: '0.75rem' }}>{h.patient_count}</span>
                       </div>
                    </div>
                  </td>
                  <td style={{ padding: '15px 20px', fontWeight: 900 }}>{h.revenueDisplay}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <span style={{ fontSize: '0.6rem', fontWeight: 900, color: h.status === 'SUSPENDED' ? '#dc2626' : '#10b981' }}>{h.status}</span>
                  </td>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '20px' }}>
                      {h.growth.map((val: number, idx: number) => (
                        <div key={idx} style={{ width: '4px', height: `${val}%`, background: '#000', opacity: idx === h.growth.length - 1 ? 1 : 0.2 }} />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hospital Detail Drill-Down Overlay */}
      <AnimatePresence>
        {selectedHospital && (
          <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end' }}>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedHospital(null)}
              style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ width: '600px', background: '#fff', height: '100%', position: 'relative', boxShadow: '-10px 0 50px rgba(0,0,0,0.1)', padding: '3rem', overflowY: 'auto' }}
            >
              <button 
                onClick={() => setSelectedHospital(null)}
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'transparent', border: 'none', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>

              <div style={{ marginBottom: '3rem' }}>
                 <p style={{ fontSize: '0.7rem', fontWeight: 900, opacity: 0.4, letterSpacing: '2px' }}>FACILITY DRILL-DOWN</p>
                 <h2 style={{ fontSize: '2rem', fontWeight: 900, marginTop: '8px' }}>{selectedHospital.displayName}</h2>
                 <p style={{ fontWeight: 700, color: '#999' }}>{selectedHospital.displayId} • {selectedHospital.location}</p>
              </div>

              {/* Management Controls */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '3rem' }}>
                <button onClick={() => showToast("Updating Administrative Access...", "info")} className="btn-outline" style={{ flexDirection: 'column', gap: '8px', padding: '1.5rem', height: 'auto' }}>
                  <Lock size={20} /> <span style={{ fontSize: '0.65rem', fontWeight: 900 }}>RESET AUTH</span>
                </button>
                <button onClick={() => showToast("Node Suspended Successfully", "success")} className="btn-outline" style={{ flexDirection: 'column', gap: '8px', padding: '1.5rem', height: 'auto', borderColor: '#f59e0b', color: '#f59e0b' }}>
                  <Pause size={20} /> <span style={{ fontSize: '0.65rem', fontWeight: 900 }}>PAUSE NODE</span>
                </button>
                <button onClick={() => showToast("Node Decommissioning Initiated", "error")} className="btn-outline" style={{ flexDirection: 'column', gap: '8px', padding: '1.5rem', height: 'auto', borderColor: '#dc2626', color: '#dc2626' }}>
                  <Power size={20} /> <span style={{ fontSize: '0.65rem', fontWeight: 900 }}>TERMINATE</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '3rem' }}>
                 <div className="card" style={{ padding: '1.5rem', background: '#000', color: '#fff' }}>
                    <p style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.5 }}>TOTAL REVENUE ({timeRange})</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 900 }}>{selectedHospital.revenueDisplay}</p>
                 </div>
                 <div className="card" style={{ padding: '1.5rem' }}>
                    <p style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.5 }}>REGISTERED PATIENTS</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 900 }}>{selectedHospital.patient_count}</p>
                 </div>
              </div>

              {/* Growth Visualization */}
              <div style={{ marginBottom: '3rem' }}>
                 <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '1.5rem', borderBottom: '2px solid #000', paddingBottom: '8px' }}>GROWTH ANALYTICS</h3>
                 <div style={{ height: '150px', display: 'flex', alignItems: 'flex-end', gap: '10px', padding: '20px', background: '#f4f4f5', border: '1px solid #000' }}>
                    {[40, 60, 45, 80, 55, 90, 75, 85, 65, 95].map((h, i) => (
                      <div key={i} style={{ flex: 1, height: `${h}%`, background: '#000', position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.5rem', fontWeight: 900 }}>{h}%</div>
                      </div>
                    ))}
                 </div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.6rem', fontWeight: 900, opacity: 0.4 }}>
                    <span>START {timeRange}</span>
                    <span>END {timeRange}</span>
                 </div>
              </div>

              <div style={{ marginBottom: '3rem' }}>
                 <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '1.5rem', borderBottom: '2px solid #000', paddingBottom: '8px' }}>ADMINISTRATIVE IDENTITY</h3>
                 <div style={{ background: '#f4f4f5', padding: '1.5rem', border: '1px solid #000' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                       <span style={{ fontSize: '0.65rem', fontWeight: 900 }}>ADMIN NAME</span>
                       <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{selectedHospital.admin?.name || "N/A"}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                       <span style={{ fontSize: '0.65rem', fontWeight: 900 }}>LOGIN ID</span>
                       <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{selectedHospital.admin?.username || "N/A"}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <span style={{ fontSize: '0.65rem', fontWeight: 900 }}>PASSPHRASE</span>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#dc2626' }}>
                             {showPassword ? (selectedHospital.admin?.cleartext_password || "N/A") : "••••••••"}
                          </span>
                          <button 
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                          >
                             {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                       </div>
                    </div>
                 </div>
              </div>

              <button className="btn-black" style={{ width: '100%', gap: '12px' }} onClick={() => showToast(`Generating System Export for ${selectedHospital.id}`, "info")}>
                 <Download size={18} /> EXPORT COMPLIANCE REPORT
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
