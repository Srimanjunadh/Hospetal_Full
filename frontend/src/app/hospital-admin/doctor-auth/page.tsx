"use client";
import { useState, useEffect } from "react";
import { Key, User, ShieldCheck, Plus, Search, Filter, Activity, Lock, Mail, Star, Phone, Home, RefreshCcw, Eye, EyeOff } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";
import { apiService } from "@/services/api";

export default function DoctorAuthPage() {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    specialization: "", 
    phone: "", 
    roomNumber: "", 
    docId: "", 
    password: "" 
  });
  const [doctorAuths, setDoctorAuths] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  
  useEffect(() => {
    setMounted(true);
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setIsLoading(true);
    try {
      const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
      const hId = session?.hospital_id;
      
      const data = await apiService.getDoctors(hId);
      if (Array.isArray(data)) {
        const formatted = data.map(d => ({
          id: d.user?.username || `DOC-${d.id}`,
          name: d.user?.name?.toUpperCase(),
          specialty: d.specialization?.toUpperCase(),
          room: d.room_number || "N/A",
          password: d.user?.cleartext_password || "••••••••",
          status: "ACTIVE"
        }));
        setDoctorAuths(formatted);
      }
    } catch (error) {
      showToast("Failed to fetch clinical registry", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.docId || !formData.password) return;
    
    setIsSubmitting(true);
    try {
      const session = JSON.parse(localStorage.getItem("medichain_session") || "{}");
      const data = await apiService.registerDoctor({
        username: formData.docId.startsWith("DOC") ? formData.docId.toUpperCase() : `DOC-${formData.docId.toUpperCase()}`,
        password: formData.password,
        name: formData.name,
        specialization: formData.specialization,
        phone: formData.phone,
        room_number: formData.roomNumber,
        node_code: session.node_code || session.hospital_node_code || ""
      });

      if (data.access_token) {
        showToast(`CREDENTIALS FOR ${formData.name} ACTIVATED`, "success");
        setFormData({ name: "", specialization: "", phone: "", roomNumber: "", docId: "", password: "" });
        fetchDoctors();
      } else {
        showToast(data.detail || "Forge Failed", "error");
      }
    } catch (error) {
      showToast("Network Error", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <DashboardLayout role="hospital_admin" userName="Hospital Admin">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>DOCTOR AUTH FORGE</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>FACILITY ACCESS MANAGEMENT • CLINICAL CREDENTIALING</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem', marginBottom: '4rem' }}>
        
        {/* Creation Form */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '2.5rem', borderBottom: '2px solid #000', paddingBottom: '10px' }}>FORGE NEW CREDENTIALS</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>DOCTOR FULL NAME</label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="E.G. DR. ALICE REED" 
                  style={{ width: '100%', padding: '15px 15px 15px 45px', background: '#f4f4f5', border: 'none', fontWeight: 800, outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>CLINICAL SPECIALTY</label>
                <div style={{ position: 'relative' }}>
                  <Star style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
                  <input 
                    type="text" 
                    value={formData.specialization}
                    onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                    placeholder="NEUROSURGERY" 
                    style={{ width: '100%', padding: '15px 15px 15px 45px', background: '#f4f4f5', border: 'none', fontWeight: 800, outline: 'none' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>MOBILE NUMBER</label>
                <div style={{ position: 'relative' }}>
                  <Phone style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
                  <input 
                    type="text" 
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="+91 XXXXX XXXXX" 
                    style={{ width: '100%', padding: '15px 15px 15px 45px', background: '#f4f4f5', border: 'none', fontWeight: 800, outline: 'none' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>WARD / ROOM NO.</label>
                <div style={{ position: 'relative' }}>
                  <Home style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
                  <input 
                    type="text" 
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
                    placeholder="E.G. WARD-B1" 
                    style={{ width: '100%', padding: '15px 15px 15px 45px', background: '#f4f4f5', border: 'none', fontWeight: 800, outline: 'none' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>DOC-ID (FOR LOGIN)</label>
                <input 
                  type="text" 
                  required
                  value={formData.docId}
                  onChange={(e) => setFormData({...formData, docId: e.target.value})}
                  placeholder="DOC-001" 
                  style={{ width: '100%', padding: '15px', background: '#f4f4f5', border: 'none', fontWeight: 800, outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>INITIAL ACCESS PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••" 
                    style={{ width: '100%', padding: '15px 45px 15px 15px', background: '#f4f4f5', border: 'none', fontWeight: 800, outline: 'none' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.5 }}
                  >
                     {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-black" style={{ padding: '18px', marginTop: '1rem', gap: '10px', opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? <RefreshCcw className="animate-spin" size={18} /> : <Key size={18} />} 
              {isSubmitting ? "FORGING ACCESS..." : "GENERATE CLINICAL CREDENTIALS"}
            </button>
          </form>
        </div>

        {/* Credential Registry */}
        <div className="card" style={{ padding: '0' }}>
           <div style={{ padding: '1.5rem 2.5rem', borderBottom: '2px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px' }}>CLINICAL ACCESS REGISTRY</h3>
              <button onClick={fetchDoctors} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
              </button>
           </div>
           <div style={{ maxHeight: '500px', overflowY: 'auto' }} className="custom-scrollbar">
             <table className="data-table" style={{ border: 'none' }}>
               <thead>
                 <tr style={{ position: 'sticky', top: 0, background: '#f9fafb', zIndex: 10 }}>
                   <th style={{ padding: '12px 25px', fontSize: '0.65rem' }}>S.NO</th>
                   <th style={{ padding: '12px 25px' }}>DOC-IDENTITY</th>
                   <th style={{ padding: '12px 25px' }}>SPECIALTY</th>
                   <th style={{ padding: '12px 25px' }}>ROOM</th>
                   <th style={{ padding: '12px 25px' }}>PASSWORD</th>
                   <th style={{ padding: '12px 25px' }}>STATUS</th>
                 </tr>
               </thead>
               <tbody>
                 {isLoading ? (
                   <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', fontWeight: 800 }}>FETCHING CLINICAL NODES...</td></tr>
                 ) : doctorAuths.length === 0 ? (
                   <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', fontWeight: 800 }}>NO REGISTERED CLINICIANS</td></tr>
                 ) : doctorAuths.map((auth, i) => (
                   <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                     <td style={{ padding: '15px 25px', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                     <td style={{ padding: '15px 25px' }}>
                        <p style={{ fontWeight: 900, fontSize: '0.8rem' }}>{auth.name}</p>
                        <p style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.5 }}>{auth.id}</p>
                     </td>
                     <td style={{ padding: '15px 25px', fontWeight: 900, fontSize: '0.75rem' }}>{auth.specialty}</td>
                     <td style={{ padding: '15px 25px', fontWeight: 800, fontSize: '0.75rem', opacity: 0.7 }}>{auth.room}</td>
                     <td style={{ padding: '15px 25px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <code style={{ fontSize: '0.75rem', fontWeight: 900, background: '#f4f4f5', padding: '4px 8px', color: '#000', minWidth: '80px', textAlign: 'center' }}>
                             {revealedIds.includes(auth.id) ? auth.password : "••••••••"}
                          </code>
                          <button 
                            onClick={() => toggleReveal(auth.id)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.5, display: 'flex', alignItems: 'center' }}
                          >
                            {revealedIds.includes(auth.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                     </td>
                     <td style={{ padding: '15px 25px' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 900, color: auth.status === 'ACTIVE' ? '#10b981' : '#f59e0b' }}>{auth.status}</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           <style jsx global>{`
             .custom-scrollbar::-webkit-scrollbar { width: 6px; }
             .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
             .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; border-radius: 10px; }
           `}</style>
        </div>

      </div>
    </DashboardLayout>
  );
}

