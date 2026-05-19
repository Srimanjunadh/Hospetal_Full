"use client"; // Re-sync
import { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  ShieldCheck, 
  Plus, 
  RefreshCcw, 
  Edit3, 
  Calendar, 
  X, 
  User, 
  Mail, 
  Phone, 
  Lock,
  Briefcase,
  Eye,
  EyeOff,
  Clock,
  CheckCircle,
  Save,
  Trash2
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";
import { apiService } from "@/services/api";

export default function StaffManagementPage() {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [clinicians, setClinicians] = useState<any[]>([]);
  const [support, setSupport] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [revealedPasswords, setRevealedPasswords] = useState<string[]>([]);
  
  // Modals
  const [showRegModal, setShowRegModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSchedModal, setShowSchedModal] = useState(false);
  
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);
  
  const [regType, setRegType] = useState<"doctor" | "nurse" | "lab" | "support">("doctor");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Data States
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [regData, setRegData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    room_number: ""
  });
  
  const [editData, setEditData] = useState({
    name: "",
    username: "",
    password: "",
    assigned_nurse_id: ""
  });

  const [schedData, setSchedData] = useState({
    task_name: "",
    start_time: "",
    end_time: "",
    notes: ""
  });

  const togglePassword = (id: string) => {
    setRevealedPasswords(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const fetchPersonnel = async () => {
    setIsLoading(true);
    try {
      const session = JSON.parse(localStorage.getItem("medclues_session") || "null");
      const hId = session?.hospital_id;
      const data = await apiService.getUsers(undefined, hId);
      if (Array.isArray(data)) {
        const clns = data.filter((u: any) => u.role === 'hospital_admin' || u.role === 'doctor');
        const nurses = data.filter((u: any) => u.role === 'nurse');
        const supportNodes = data.filter((u: any) => u.role === 'support' || u.role === 'lab');
        const patients = data.filter((u: any) => u.role === 'patient');
        
        const mappedClinicians = clns.map((u: any) => {
          const assignedPts = patients.filter((p: any) => p.assigned_doctor_id === u.id);
          return {
            dbId: u.id,
            id: u.username || `ST-${u.id}`,
            name: (u.name || "UNNAMED").toUpperCase(),
            role: (u.role || "UNKNOWN").replace('_', ' ').toUpperCase(),
            dept: u.role === 'doctor' ? "CLINICAL" : "ADMINISTRATION",
            status: "ACTIVE",
            password: u.cleartext_password || "••••••••",
            assignedPatients: assignedPts.map(p => ({ name: p.name.toUpperCase() }))
          };
        });

        const mappedSupport = [
          ...nurses.map((u: any) => {
            // Find patients assigned to this nurse
            const assignedPts = patients.filter((p: any) => p.assigned_nurse_id === u.id);
            return {
              dbId: u.id,
              id: u.username || `ST-${u.id}`,
              name: (u.name || "UNNAMED").toUpperCase(),
              role: "NURSE",
              dept: "NURSING",
              status: "ACTIVE",
              password: u.cleartext_password || "••••••••",
              assignedPatients: assignedPts.length > 0 
                ? assignedPts.map(p => ({
                    name: p.name.toUpperCase(),
                    doctor: p.assigned_doctor?.user?.name?.toUpperCase() || "NO DOCTOR"
                  }))
                : []
            };
          }),
          ...supportNodes.map((u: any) => ({
            dbId: u.id,
            id: u.username || `ST-${u.id}`,
            name: (u.name || "UNNAMED").toUpperCase(),
            role: u.role.toUpperCase(),
            dept: "SUPPORT",
            status: "ACTIVE",
            password: u.cleartext_password || "••••••••",
            assignedPatients: []
          }))
        ];

        setClinicians(mappedClinicians);
        setSupport(mappedSupport);
      }
    } catch (error) {
      showToast("Personnel Registry Sync Failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchPersonnel();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const session = JSON.parse(localStorage.getItem("medclues_session") || "null");
      const node_code = session?.node_code;

      let response;
      if (regType === "doctor") {
        const payload = {
          name: regData.name,
          username: regData.username,
          password: regData.password,
          specialization: regData.specialization,
          phone: regData.phone,
          room_number: regData.room_number,
          node_code: node_code
        };
        response = await apiService.registerDoctor(payload);
      } else {
        const payload = {
          name: regData.name,
          username: regData.username,
          password: regData.password,
          role: regType,
          phone: regData.phone,
          node_code: node_code
        };
        response = await apiService.register(payload);
      }

      if (response.access_token) {
        showToast(`${regType.toUpperCase()} REGISTERED`, "success");
        setShowRegModal(false);
        setRegData({
          name: "",
          username: "",
          email: "",
          password: "",
          phone: "",
          specialization: "",
          room_number: ""
        });
        fetchPersonnel();
      }
    } catch (error) {
      showToast("Registration Failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setIsSubmitting(true);
    try {
      await apiService.updateUser(selectedStaff.dbId, {
        name: editData.name,
        username: editData.username,
        password: editData.password || undefined
      });
      showToast("STAFF PROFILE UPDATED", "success");
      setShowEditModal(false);
      fetchPersonnel();
    } catch (error) {
      showToast("Update Failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;
    setIsSubmitting(true);
    try {
      if (selectedStaff.role === "DOCTOR") {
        const doctors = await apiService.getDoctors();
        const docRecord = doctors.find((d: any) => d.user.id === selectedStaff.dbId);
        await apiService.createDoctorSchedule({
          doctor_id: docRecord.id,
          ...schedData,
          status: "pending"
        });
      } else {
        await apiService.createStaffSchedule({
          staff_id: selectedStaff.dbId,
          ...schedData,
          status: "pending"
        });
      }
      showToast("WORK ASSIGNMENT SYNCHRONIZED", "success");
      setShowSchedModal(false);
      setSchedData({ task_name: "", start_time: "", end_time: "", notes: "" });
    } catch (error) {
      showToast("Scheduling Failed", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <DashboardLayout role="hospital_admin" userName="Admin Manju">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>PERSONNEL COMMAND</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>FACILITY WORKFORCE MANAGEMENT HUB</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn-black" 
            onClick={() => { setRegType("doctor"); setShowRegModal(true); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              flexDirection: 'row',
              whiteSpace: 'nowrap'
            }}
          >
            <Plus size={18} /> <span>REGISTER CLINICIAN</span>
          </button>
          <button 
            className="btn-outline" 
            onClick={() => { setRegType("nurse"); setShowRegModal(true); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              flexDirection: 'row',
              whiteSpace: 'nowrap'
            }}
          >
            <UserPlus size={18} /> <span>REGISTER NURSE</span>
          </button>
          <button 
            className="btn-outline" 
            onClick={() => { setRegType("lab"); setShowRegModal(true); }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              flexDirection: 'row',
              whiteSpace: 'nowrap'
            }}
          >
            <Plus size={18} /> <span>REGISTER LAB STAFF</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
        
        {/* Clinicians Table */}
        <div className="card" style={{ padding: '0', border: '2px solid #29ABE2' }}>
          <div style={{ padding: '1.25rem 2rem', background: '#29ABE2', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <ShieldCheck size={20} />
              <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px' }}>CLINICAL COMMAND</h3>
            </div>
            <button onClick={fetchPersonnel} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}>
              <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="custom-scrollbar">
            <table className="data-table" style={{ border: 'none' }}>
              <thead>
                <tr style={{ position: 'sticky', top: 0, background: '#f9fafb', zIndex: 10 }}>
                  <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>S.NO</th>
                  <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>IDENTITY</th>
                  <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>SYSTEM ID</th>
                  <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>PASSWORD</th>
                  <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>ASSIGNED PATIENTS</th>
                  <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>ROLE</th>
                  <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>STATUS</th>
                  <th style={{ padding: '15px 20px', fontSize: '0.65rem', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {clinicians.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '3rem', opacity: 0.3, fontWeight: 900 }}>NO CLINICIANS DETECTED</td></tr>
                ) : clinicians.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 20px', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                    <td style={{ padding: '12px 20px', fontWeight: 900 }}>{p.name}</td>
                    <td style={{ padding: '12px 20px', opacity: 0.5, fontSize: '0.75rem', fontWeight: 800 }}>{p.id}</td>
                    <td style={{ padding: '12px 20px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <code style={{ fontSize: '0.75rem', background: '#f4f4f5', padding: '4px 8px', fontWeight: 800 }}>
                            {revealedPasswords.includes(p.id) ? p.password : "••••••••"}
                          </code>
                          <button onClick={() => togglePassword(p.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                            {revealedPasswords.includes(p.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      {p.role === "DOCTOR" && p.assignedPatients && p.assignedPatients.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {p.assignedPatients.map((apt: any, idx: number) => (
                            <div key={idx} style={{ fontSize: '0.65rem', fontWeight: 800 }}>
                              {apt.name}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.3 }}>N/A</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ background: '#f4f4f5', padding: '4px 8px', fontSize: '0.6rem', fontWeight: 900 }}>{p.role}</span>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                         <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></div>
                         <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#10b981' }}>{p.status}</span>
                       </div>
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        {p.role === "DOCTOR" && (
                          <button 
                            className="btn-black" 
                            style={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              flexDirection: 'row',
                              whiteSpace: 'nowrap',
                              padding: '6px 10px', 
                              fontSize: '0.6rem' 
                            }} 
                            onClick={() => { setSelectedStaff(p); setShowSchedModal(true); }}
                          >
                            <Calendar size={14} /> <span>SHIFT</span>
                          </button>
                        )}
                        <button disabled style={{ opacity: 0.3, background: 'transparent', border: 'none' }}><Edit3 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '0.75rem', background: '#f9fafb', borderTop: '1px solid #eee', textAlign: 'center' }}>
             <p style={{ fontSize: '0.55rem', fontWeight: 800, opacity: 0.4 }}>SCROLL FOR COMPLETE CLINICAL ROSTER</p>
          </div>
        </div>

        {/* Support Table */}
        <div className="card" style={{ padding: '0', border: '2px solid #29ABE2' }}>
          <div style={{ padding: '1.25rem 2rem', background: '#29ABE2', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Users size={20} />
              <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px' }}>SUPPORT & NURSING FORCE</h3>
            </div>
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="custom-scrollbar">
            <table className="data-table" style={{ border: 'none' }}>
              <thead>
                <tr style={{ position: 'sticky', top: 0, background: '#f9fafb', zIndex: 10 }}>
                  <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>S.NO</th>
                  <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>IDENTITY</th>
                  <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>SYSTEM ID</th>
                  <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>PASSWORD</th>
                  <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>ASSIGNED UNITS</th>
                  <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>ROLE</th>
                  <th style={{ padding: '15px 20px', fontSize: '0.65rem', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {support.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem', opacity: 0.3, fontWeight: 900 }}>NO SUPPORT STAFF DETECTED</td></tr>
                ) : support.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px 20px', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                    <td style={{ padding: '12px 20px', fontWeight: 900 }}>{p.name}</td>
                    <td style={{ padding: '12px 20px', opacity: 0.5, fontSize: '0.75rem', fontWeight: 800 }}>{p.id}</td>
                    <td style={{ padding: '12px 20px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <code style={{ fontSize: '0.75rem', background: '#f4f4f5', padding: '4px 8px', fontWeight: 800 }}>
                            {revealedPasswords.includes(p.id) ? p.password : "••••••••"}
                          </code>
                          <button onClick={() => togglePassword(p.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                            {revealedPasswords.includes(p.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      {p.assignedPatients && p.assignedPatients.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {p.assignedPatients.map((apt: any, idx: number) => (
                            <div key={idx} style={{ fontSize: '0.65rem', fontWeight: 800 }}>
                              <span style={{ color: '#000' }}>{apt.name}</span>
                              <span style={{ color: 'var(--text-secondary)', marginLeft: '6px', fontSize: '0.6rem' }}>(DR. {apt.doctor})</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.3 }}>N/A</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <span style={{ background: '#f4f4f5', padding: '4px 8px', fontSize: '0.6rem', fontWeight: 900 }}>{p.role}</span>
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button 
                          className="btn-black" 
                          style={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            flexDirection: 'row',
                            whiteSpace: 'nowrap',
                            padding: '6px 10px', 
                            fontSize: '0.6rem'
                          }} 
                          onClick={() => { 
                            setSelectedStaff(p); 
                            setEditData({ name: p.name, username: p.id, password: "", assigned_nurse_id: "" });
                            setShowEditModal(true); 
                          }}
                        >
                          <Edit3 size={14} /> <span>EDIT</span>
                        </button>
                        <button 
                          className="btn-outline" 
                          style={{ 
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            flexDirection: 'row',
                            whiteSpace: 'nowrap',
                            padding: '6px 10px', 
                            fontSize: '0.6rem' 
                          }} 
                          onClick={() => { setSelectedStaff(p); setShowSchedModal(true); }}
                        >
                          <Calendar size={14} /> <span>WORK</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '0.75rem', background: '#f9fafb', borderTop: '1px solid #eee', textAlign: 'center' }}>
             <p style={{ fontSize: '0.55rem', fontWeight: 800, opacity: 0.4 }}>SCROLL FOR COMPLETE SUPPORT FORCE</p>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '400px', padding: '3rem', background: '#fff' }}>
             <h2 style={{ fontWeight: 900, fontSize: '1.25rem', marginBottom: '2rem' }}>EDIT STAFF IDENTITY</h2>
             <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                   <label style={{ fontSize: '0.6rem', fontWeight: 900 }}>LEGAL NAME</label>
                   <input type="text" value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} style={{ width: '100%', padding: '12px', background: '#f4f4f5', border: 'none', fontWeight: 800 }} />
                </div>
                <div>
                   <label style={{ fontSize: '0.6rem', fontWeight: 900 }}>SYSTEM ID (USERNAME)</label>
                   <input type="text" value={editData.username} onChange={e => setEditData({...editData, username: e.target.value})} style={{ width: '100%', padding: '12px', background: '#f4f4f5', border: 'none', fontWeight: 800 }} />
                </div>
                <div style={{ position: 'relative' }}>
                   <label style={{ fontSize: '0.6rem', fontWeight: 900 }}>NEW PASSWORD (OPTIONAL)</label>
                   <input 
                    type={showEditPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    value={editData.password} 
                    onChange={e => setEditData({...editData, password: e.target.value})} 
                    style={{ width: '100%', padding: '12px 40px 12px 12px', background: '#f4f4f5', border: 'none', fontWeight: 800 }} 
                   />
                   <button 
                      type="button"
                      onClick={() => setShowEditPassword(!showEditPassword)}
                      style={{ position: 'absolute', right: '12px', bottom: '10px', background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.5 }}
                    >
                       {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                   <button type="submit" className="btn-black" style={{ flex: 1 }}>SAVE CHANGES</button>
                   <button type="button" className="btn-outline" onClick={() => setShowEditModal(false)}>CANCEL</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Scheduling Modal */}
      {showSchedModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '500px', padding: '2.5rem', background: '#fff' }}>
             <h2 style={{ fontWeight: 900, fontSize: '1.25rem', marginBottom: '2rem' }}>ASSIGN WORK: {selectedStaff?.name}</h2>
             <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                   <label style={{ fontSize: '0.6rem', fontWeight: 900 }}>TASK NAME</label>
                   <input type="text" required value={schedData.task_name} onChange={e => setSchedData({...schedData, task_name: e.target.value})} placeholder="E.G. WARD ROUNDS" style={{ width: '100%', padding: '12px', background: '#f4f4f5', border: 'none', fontWeight: 800, boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                   <div style={{ minWidth: 0 }}>
                      <label style={{ fontSize: '0.6rem', fontWeight: 900 }}>START</label>
                      <input 
                        type="datetime-local" 
                        required 
                        value={schedData.start_time} 
                        onChange={e => setSchedData({...schedData, start_time: e.target.value})} 
                        style={{ width: '100%', padding: '12px 8px', background: '#f4f4f5', border: 'none', fontWeight: 800, fontSize: '0.75rem', boxSizing: 'border-box' }} 
                      />
                   </div>
                   <div style={{ minWidth: 0 }}>
                      <label style={{ fontSize: '0.6rem', fontWeight: 900 }}>END</label>
                      <input 
                        type="datetime-local" 
                        required 
                        value={schedData.end_time} 
                        onChange={e => setSchedData({...schedData, end_time: e.target.value})} 
                        style={{ width: '100%', padding: '12px 8px', background: '#f4f4f5', border: 'none', fontWeight: 800, fontSize: '0.75rem', boxSizing: 'border-box' }} 
                      />
                   </div>
                </div>
                <button type="submit" className="btn-black" style={{ marginTop: '1rem' }}>FINALIZE ASSIGNMENT</button>
                <button type="button" className="btn-outline" onClick={() => setShowSchedModal(false)}>CANCEL</button>
             </form>
          </div>
        </div>
      )}

      {/* Registration Modal Placeholder */}
      {showRegModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card" style={{ width: '500px', padding: '3rem', background: '#fff' }}>
             <h2 style={{ fontWeight: 900, fontSize: '1.5rem', marginBottom: '2rem' }}>REGISTER {regType.toUpperCase()}</h2>
             <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.6rem', fontWeight: 900 }}>LEGAL NAME</label>
                  <input type="text" required value={regData.name} onChange={e => setRegData({...regData, name: e.target.value})} style={{ width: '100%', padding: '12px', background: '#f4f4f5', border: 'none', fontWeight: 800 }} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.6rem', fontWeight: 900 }}>USER ID</label>
                    <input type="text" required value={regData.username} onChange={e => setRegData({...regData, username: e.target.value})} style={{ width: '100%', padding: '12px', background: '#f4f4f5', border: 'none', fontWeight: 800 }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'relative' }}>
                    <label style={{ fontSize: '0.6rem', fontWeight: 900 }}>PASSWORD</label>
                    <input 
                      type={showRegPassword ? "text" : "password"} 
                      required 
                      value={regData.password} 
                      onChange={e => setRegData({...regData, password: e.target.value})} 
                      style={{ width: '100%', padding: '12px 40px 12px 12px', background: '#f4f4f5', border: 'none', fontWeight: 800 }} 
                    />
                    <button 
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        style={{ position: 'absolute', right: '12px', bottom: '10px', background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.5 }}
                      >
                         {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                  </div>
                </div>

                {regType === 'doctor' && (
                  <>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.6rem', fontWeight: 900 }}>SPECIALIZATION</label>
                      <input type="text" required value={regData.specialization} onChange={e => setRegData({...regData, specialization: e.target.value})} placeholder="E.G. CARDIOLOGY" style={{ width: '100%', padding: '12px', background: '#f4f4f5', border: 'none', fontWeight: 800 }} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.6rem', fontWeight: 900 }}>CONTACT NO.</label>
                        <input type="text" required value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} style={{ width: '100%', padding: '12px', background: '#f4f4f5', border: 'none', fontWeight: 800 }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.6rem', fontWeight: 900 }}>ROOM NO.</label>
                        <input type="text" required value={regData.room_number} onChange={e => setRegData({...regData, room_number: e.target.value})} style={{ width: '100%', padding: '12px', background: '#f4f4f5', border: 'none', fontWeight: 800 }} />
                      </div>
                    </div>
                  </>
                )}

                {regType !== 'doctor' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '0.6rem', fontWeight: 900 }}>CONTACT NO.</label>
                    <input type="text" required value={regData.phone} onChange={e => setRegData({...regData, phone: e.target.value})} style={{ width: '100%', padding: '12px', background: '#f4f4f5', border: 'none', fontWeight: 800 }} />
                  </div>
                )}

                <button type="submit" disabled={isSubmitting} className="btn-black" style={{ marginTop: '1rem', padding: '18px' }}>
                   {isSubmitting ? "PROCESSING..." : "ACTIVATE ACCESS"}
                </button>
                <button type="button" className="btn-outline" onClick={() => setShowRegModal(false)}>CANCEL</button>
             </form>
          </div>
        </div>
      )}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #000;
          border-radius: 10px;
        }
      `}</style>
    </DashboardLayout>
  );
}
