"use client";
import { useState, useEffect } from "react";
import { Users, User, ShieldCheck, Plus, Search, Filter, Activity, Lock, Phone, CreditCard, RefreshCcw, Tag, Eye, EyeOff } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";
import { apiService } from "@/services/api";

export default function PatientAuthPage() {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    phone: "", 
    password: "", 
    customId: "", 
    assignedDoctor: "", 
    assignedNurse: "",
    age: "",
    location: "",
    weight: ""
  });
  const [patientAuths, setPatientAuths] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [nurses, setNurses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const toggleReveal = (id: string) => {
    setRevealedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  
  useEffect(() => {
    setMounted(true);
    fetchPatients();
    fetchClinicians();
  }, []);

  const fetchClinicians = async () => {
    try {
      const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
      const hId = session?.hospital_id;
      const [docs, users] = await Promise.all([
        apiService.getDoctors(hId),
        apiService.getUsers(undefined, hId)
      ]);
      setDoctors(Array.isArray(docs) ? docs : []);
      setNurses(Array.isArray(users) ? users.filter((u: any) => u.role === 'nurse') : []);
    } catch (error) {
      console.error("Staff fetch failed:", error);
      showToast("Identity Synchronization Interrupted", "error");
    }
  };

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
      const hId = session?.hospital_id;
      const data = await apiService.getPatients(hId);
      if (Array.isArray(data)) {
        const formatted = data.map(p => ({
          id: p.username || `OP-${p.id}`,
          name: p.name.toUpperCase(),
          phone: p.phone || "N/A",
          password: p.cleartext_password || "••••••••",
          doctor: p.assigned_doctor?.user?.name || "UNASSIGNED",
          status: "ACTIVE"
        }));
        setPatientAuths(formatted);
      }
    } catch (error) {
      showToast("Failed to fetch patient registry", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const generateOpId = () => {
    const nextNum = patientAuths.length + 1;
    return `OP-${new Date().getFullYear()}-${nextNum.toString().padStart(3, '0')}`;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.password) return;
    
    const assignedId = formData.customId || generateOpId();
    
    setIsSubmitting(true);
    try {
      const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
      const node_code = session?.node_code;

      const data = await apiService.register({
        username: assignedId,
        name: formData.name,
        password: formData.password,
        role: "patient",
        phone: formData.phone,
        age: parseInt(formData.age) || undefined,
        location: formData.location,
        weight: parseFloat(formData.weight) || undefined,
        assigned_doctor_id: formData.assignedDoctor ? parseInt(formData.assignedDoctor) : undefined,
        assigned_nurse_id: formData.assignedNurse ? parseInt(formData.assignedNurse) : undefined,
        node_code: node_code
      });

      if (data.access_token) {
        showToast(`OP IDENTITY ${assignedId} ASSIGNED TO ${formData.name}`, "success");
        setFormData({ 
          name: "", phone: "", password: "", customId: "", 
          assignedDoctor: "", assignedNurse: "",
          age: "", location: "", weight: ""
        });
        fetchPatients();
      } else {
        showToast(data.detail || "Registration Failed", "error");
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
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>OP REGISTRATION HUB</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>FACILITY ACCESS MANAGEMENT • PATIENT ONBOARDING</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '3rem', marginBottom: '4rem' }}>
        
        {/* Creation Form */}
        <div className="card" style={{ padding: '2.5rem' }}>
          <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '2.5rem', borderBottom: '2px solid #000', paddingBottom: '10px' }}>REGISTER NEW OUTPATIENT (OP)</h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>PATIENT FULL NAME</label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="E.G. JOHN DOE" 
                  style={{ width: '100%', padding: '15px 15px 15px 45px', background: '#f4f4f5', border: 'none', fontWeight: 800, outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>AGE</label>
                <input 
                  type="number" 
                  required
                  value={formData.age}
                  onChange={(e) => setFormData({...formData, age: e.target.value})}
                  placeholder="25" 
                  style={{ width: '100%', padding: '15px', background: '#f4f4f5', border: 'none', fontWeight: 800, outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>WEIGHT (KG)</label>
                <input 
                  type="number" 
                  required
                  value={formData.weight}
                  onChange={(e) => setFormData({...formData, weight: e.target.value})}
                  placeholder="70" 
                  style={{ width: '100%', padding: '15px', background: '#f4f4f5', border: 'none', fontWeight: 800, outline: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>LOCATION</label>
                <input 
                  type="text" 
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="NEW YORK" 
                  style={{ width: '100%', padding: '15px', background: '#f4f4f5', border: 'none', fontWeight: 800, outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>CONTACT NUMBER</label>
              <div style={{ position: 'relative' }}>
                <Phone style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
                <input 
                  type="text" 
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+91 XXXXX XXXXX" 
                  style={{ width: '100%', padding: '15px 15px 15px 45px', background: '#f4f4f5', border: 'none', fontWeight: 800, outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>ASSIGNED DOCTOR</label>
              <select 
                value={formData.assignedDoctor}
                onChange={(e) => setFormData({...formData, assignedDoctor: e.target.value})}
                style={{ width: '100%', padding: '15px 16px', background: '#f4f4f5', border: 'none', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', outline: 'none' }}
              >
                <option value="">SELECT CLINICIAN</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.user?.name?.toUpperCase()} ({d.specialization?.toUpperCase()})</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>ASSIGNED NURSE</label>
              <select 
                value={formData.assignedNurse}
                onChange={(e) => setFormData({...formData, assignedNurse: e.target.value})}
                style={{ width: '100%', padding: '15px 16px', background: '#f4f4f5', border: 'none', fontWeight: '800', fontSize: '0.8rem', cursor: 'pointer', outline: 'none' }}
              >
                <option value="">SELECT NURSE</option>
                {nurses.map(n => (
                  <option key={n.id} value={n.id}>{n.name?.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
               <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>ASSIGN OP ID (AUTO-GEN IF EMPTY)</label>
                <div style={{ position: 'relative' }}>
                  <Tag style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
                  <input 
                    type="text" 
                    value={formData.customId}
                    onChange={(e) => setFormData({...formData, customId: e.target.value})}
                    placeholder={generateOpId()} 
                    style={{ width: '100%', padding: '15px 15px 15px 45px', background: '#f4f4f5', border: 'none', fontWeight: 800, outline: 'none' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>LOGIN PASSWORD</label>
                <div style={{ position: 'relative' }}>
                  <Lock style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••" 
                    style={{ width: '100%', padding: '15px 45px 15px 45px', background: '#f4f4f5', border: 'none', fontWeight: 800, outline: 'none' }}
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
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-black" style={{ padding: '18px', marginTop: '1rem', gap: '10px', opacity: isSubmitting ? 0.7 : 1 }}>
              {isSubmitting ? <RefreshCcw className="animate-spin" size={18} /> : <Plus size={18} />} 
              {isSubmitting ? "ASSIGNING..." : "GENERATE OP CREDENTIALS"}
            </button>
          </form>
        </div>

        {/* Access Registry */}
        <div className="card" style={{ padding: '0' }}>
           <div style={{ padding: '1.5rem 2.5rem', borderBottom: '2px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px' }}>OP IDENTITY REGISTRY</h3>
              <button onClick={fetchPatients} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
              </button>
           </div>
           <div style={{ maxHeight: '500px', overflowY: 'auto' }} className="custom-scrollbar">
             <table className="data-table" style={{ border: 'none' }}>
               <thead>
                 <tr style={{ position: 'sticky', top: 0, background: '#f9fafb', zIndex: 10 }}>
                   <th style={{ padding: '12px 25px', fontSize: '0.65rem' }}>S.NO</th>
                   <th style={{ padding: '12px 25px' }}>OP-IDENTITY</th>
                   <th style={{ padding: '12px 25px' }}>PHONE</th>
                   <th style={{ padding: '12px 25px' }}>PASSWORD</th>
                   <th style={{ padding: '12px 25px' }}>STATUS</th>
                 </tr>
               </thead>
               <tbody>
                 {isLoading ? (
                   <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', fontWeight: 800 }}>SYNCHRONIZING REGISTRY...</td></tr>
                 ) : patientAuths.length === 0 ? (
                   <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', fontWeight: 800 }}>NO REGISTERED PATIENTS</td></tr>
                 ) : patientAuths.map((auth, i) => (
                   <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                     <td style={{ padding: '15px 25px', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                     <td style={{ padding: '15px 25px' }}>
                        <p style={{ fontWeight: 900, fontSize: '0.8rem' }}>{auth.name}</p>
                        <p style={{ fontSize: '0.65rem', fontWeight: 800, opacity: 0.5 }}>{auth.id}</p>
                     </td>
                     <td style={{ padding: '15px 25px', fontWeight: 900, fontSize: '0.75rem', opacity: 0.5 }}>{auth.phone}</td>
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


