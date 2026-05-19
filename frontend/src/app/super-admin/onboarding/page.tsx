"use client";
import { useState, useEffect } from "react";
import { Plus, Hospital, MapPin, ShieldCheck, Key, Server, Activity, CheckCircle, ArrowRight, Zap, Database, Mail, RefreshCcw, User, Phone } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";
import { motion } from "framer-motion";
import { apiService } from "@/services/api";

export default function ProvisioningPage() {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [formData, setFormData] = useState({ name: "", adminId: "", password: "", phone: "", location: "", nodeCode: "", specialization: "Multi-Specialty" });
  const [activeRegistry, setActiveRegistry] = useState<any[]>([]);
  const [isLoadingRegistry, setIsLoadingRegistry] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setIsLoadingRegistry(true);
    try {
      const data = await apiService.getAdmins();
      if (Array.isArray(data)) {
        setActiveRegistry(data);
      }
    } catch (error) {
      showToast("Failed to fetch node registry", "error");
    } finally {
      setIsLoadingRegistry(false);
    }
  };

  const generateUniqueCode = () => {
    let newCode = "";
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 100) {
      newCode = Math.floor(1000 + Math.random() * 9000).toString();
      // Check if this code exists in activeRegistry (if activeRegistry has node_codes)
      const exists = activeRegistry.some(node => node.node_code === newCode);
      if (!exists) isUnique = true;
      attempts++;
    }

    setFormData({ ...formData, nodeCode: newCode });
    showToast(`Unique Node ID Generated: ${newCode}`, "success");
  };

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.adminId || !formData.password || !formData.nodeCode) {
      if (!formData.nodeCode) showToast("Please generate a Node ID first", "error");
      return;
    }
    
    setIsDeploying(true);
    try {
      const data = await apiService.register({
        name: formData.name,
        username: formData.adminId,
        password: formData.password,
        phone: formData.phone,
        role: "hospital_admin",
        node_code: formData.nodeCode,
        location: formData.location,
        specialization: formData.specialization
      });

      if (data.access_token) {
        showToast(`NODE ${formData.name.toUpperCase()} PROVISIONED SUCCESSFULLY`, "success");
        setFormData({ name: "", adminId: "", password: "", phone: "", location: "", nodeCode: "", specialization: "Multi-Specialty" });
        fetchAdmins();
      } else {
        showToast(data.detail || "Deployment Failed", "error");
      }
    } catch (error) {
      showToast("Network Protocol Error", "error");
    } finally {
      setIsDeploying(false);
    }
  };

  if (!mounted) return null;

  return (
    <DashboardLayout role="super_admin" userName="Master Admin">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>FACILITY PROVISIONING</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>ROOT NODE DEPLOYMENT • GLOBAL NETWORK EXPANSION</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
           <div style={{ padding: '8px 15px', background: '#f4f4f5', border: '1px solid #000', fontSize: '0.7rem', fontWeight: 900 }}>
              NETWORK NODES: {activeRegistry.length}/50
           </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '4rem' }}>
        
        {/* Onboarding Form */}
        <div className="card" style={{ padding: '3rem' }}>
          <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '3rem', borderBottom: '2px solid #29ABE2', paddingBottom: '10px' }}>FACILITY IDENTITY & ACCESS</h3>
          
          <form onSubmit={handleProvision} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>FACILITY NAME</label>
              <div style={{ position: 'relative' }}>
                <Hospital style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="E.G. METRO CORE HOSPITAL" 
                  style={{ width: '100%', padding: '15px 15px 15px 45px', background: '#f4f4f5', border: 'none', fontWeight: 800, outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>FACILITY LOCATION (CITY/STATE)</label>
              <div style={{ position: 'relative' }}>
                <MapPin style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
                <input 
                  type="text" 
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="E.G. NEW YORK, NY" 
                  style={{ width: '100%', padding: '15px 15px 15px 45px', background: '#f4f4f5', border: 'none', fontWeight: 800, outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>FACILITY SPECIALIZATION</label>
              <div style={{ position: 'relative' }}>
                <ShieldCheck style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
                <select 
                  required
                  title="Facility Specialization"
                  value={formData.specialization}
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                  style={{ width: '100%', padding: '15px 15px 15px 45px', background: '#f4f4f5', border: 'none', fontWeight: 800, outline: 'none', appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="Multi-Specialty">Multi-Specialty</option>
                  <option value="General Hospital">General Hospital</option>
                  <option value="Super Specialty">Super Specialty</option>
                  <option value="Teaching Hospital">Teaching Hospital</option>
                  <option value="Children&apos;s Hospital">Children&apos;s Hospital</option>
                  <option value="Women&apos;s Hospital">Women&apos;s Hospital</option>
                  <option value="Heart Center">Heart Center</option>
                  <option value="Eye Care Center">Eye Care Center</option>
                  <option value="ENT Center">ENT Center</option>
                </select>
                <div style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                  <Plus size={14} />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>SECURE NODE IDENTITY (4-DIGIT)</label>
                <div style={{ position: 'relative' }}>
                  <Zap style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
                  <input 
                    type="text" 
                    readOnly
                    value={formData.nodeCode}
                    placeholder="CLICK GENERATE --->" 
                    style={{ width: '100%', padding: '15px 15px 15px 45px', background: '#f4f4f5', border: '1px solid #000', fontWeight: 900, outline: 'none', letterSpacing: '4px' }}
                  />
                </div>
              </div>
              <button 
                type="button"
                onClick={generateUniqueCode}
                className="btn-outline" 
                style={{ height: '50px', padding: '0 20px', fontSize: '0.6rem', background: '#fff', color: '#000', border: '2px solid #29ABE2' }}
              >
                GENERATE UNIQUE CODE
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>ADMIN NETWORK ID (FOR LOGIN)</label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
                <input 
                  type="text" 
                  required
                  value={formData.adminId}
                  onChange={(e) => setFormData({...formData, adminId: e.target.value})}
                  placeholder="E.G. ADMIN_METRO_01" 
                  style={{ width: '100%', padding: '15px 15px 15px 45px', background: '#f4f4f5', border: 'none', fontWeight: 800, outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>ADMIN MOBILE NUMBER</label>
              <div style={{ position: 'relative' }}>
                <Phone style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
                <input 
                  type="tel" 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="E.G. +91 98765 43210" 
                  style={{ width: '100%', padding: '15px 15px 15px 45px', background: '#f4f4f5', border: 'none', fontWeight: 800, outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>ACCESS PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <Key style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
                <input 
                  type="password" 
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••" 
                  style={{ width: '100%', padding: '15px 15px 15px 45px', background: '#f4f4f5', border: 'none', fontWeight: 800, outline: 'none' }}
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isDeploying}
              className="btn-black" 
              style={{ padding: '20px', marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '12px', opacity: isDeploying ? 0.7 : 1 }}
            >
              {isDeploying ? (
                <>
                  <Activity className="animate-spin" size={20} />
                  DEPLOYING NODE...
                </>
              ) : (
                <>
                  <Zap size={20} />
                  PROVISION FACILITY NODE
                </>
              )}
            </button>
          </form>
        </div>

        {/* Deployment Metrics & Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card" style={{ background: '#29ABE2', color: '#fff' }}>
             <h3 style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '2px', marginBottom: '2rem' }}>DEPLOYMENT STATUS</h3>
             {isDeploying ? (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                     <Database className="animate-pulse" size={18} /> <span>INITIALIZING DB NODE...</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                     <Server className="animate-bounce" size={18} /> <span>CONFIGURING PMS INTERFACE...</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)' }}>
                     <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: '100%' }}
                       transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                       style={{ height: '100%', background: '#fff' }}
                     />
                  </div>
               </div>
             ) : (
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', opacity: 0.5 }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700 }}>AWAITING NEXT FACILITY ONBOARDING REQUEST...</p>
               </div>
             )}
          </div>

          <div className="card">
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '2px' }}>LIVE IDENTITY REGISTRY</h3>
                <button onClick={fetchAdmins} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  <RefreshCcw size={16} className={isLoadingRegistry ? "animate-spin" : ""} />
                </button>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto' }}>
                {isLoadingRegistry ? (
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.5, textAlign: 'center', padding: '2rem' }}>SYNCHRONIZING WITH ROOT DB...</p>
                ) : activeRegistry.length > 0 ? activeRegistry.map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f4f4f5', borderLeft: '4px solid #000' }}>
                     <div>
                        <p style={{ fontWeight: 900, fontSize: '0.8rem' }}>{(p.name || p.username || 'UNKNOWN').toUpperCase()}</p>
                        <p style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.5 }}>
                           CONTACT: <span style={{ color: '#000' }}>{p.phone || p.email || 'N/A'}</span>
                        </p>
                     </div>
                     <span style={{ fontSize: '0.6rem', fontWeight: 900, color: '#10b981' }}>ACTIVE NODE</span>
                  </div>
                )) : (
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.5, textAlign: 'center', padding: '2rem' }}>NO IDENTITIES ANCHORED YET</p>
                )}
             </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

