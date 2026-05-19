"use client";
import { useState, useEffect } from "react";
import { User, Mail, Phone, Lock, Save, Shield } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";

export default function DoctorSettingsPage() {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [sessionUser, setSessionUser] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: ""
  });

  useEffect(() => {
    setMounted(true);
    const session = JSON.parse(localStorage.getItem("medclues_session") || "null");
    if (session) {
      setSessionUser(session.name);
      setFormData(prev => ({ ...prev, name: session.name }));
    }
  }, []);

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("Profile Update Request Sent for Approval", "success");
  };

  if (!mounted) return null;

  return (
    <DashboardLayout role="doctor" userName={sessionUser}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>IDENTITY SETTINGS</h1>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>MANAGE CLINICAL CREDENTIALS & PROFILE DATA</p>
      </div>

      <div className="card" style={{ maxWidth: '800px', padding: '3rem' }}>
        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>FULL LEGAL NAME</label>
              <div style={{ position: 'relative' }}>
                <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} size={16} />
                <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '12px 12px 12px 35px', background: '#f4f4f5', border: 'none', fontWeight: 800 }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>EMAIL ADDRESS</label>
              <div style={{ position: 'relative' }}>
                <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} size={16} />
                <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '12px 12px 12px 35px', background: '#f4f4f5', border: 'none', fontWeight: 800 }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>CONTACT PHONE</label>
              <div style={{ position: 'relative' }}>
                <Phone style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} size={16} />
                <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '12px 12px 12px 35px', background: '#f4f4f5', border: 'none', fontWeight: 800 }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
               <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>SECURITY LEVEL</label>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: '#29ABE2', color: '#fff', fontWeight: 900, fontSize: '0.7rem' }}>
                 <Shield size={14} color="#10b981" /> CLINICAL ACCESS LEVEL 4
               </div>
            </div>
          </div>

          <hr style={{ opacity: 0.1 }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>CURRENT PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} size={16} />
                <input type="password" value={formData.currentPassword} onChange={e => setFormData({...formData, currentPassword: e.target.value})} style={{ width: '100%', padding: '12px 12px 12px 35px', background: '#f4f4f5', border: 'none', fontWeight: 800 }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5 }}>NEW SECURE PASSWORD</label>
              <div style={{ position: 'relative' }}>
                <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} size={16} />
                <input type="password" value={formData.newPassword} onChange={e => setFormData({...formData, newPassword: e.target.value})} style={{ width: '100%', padding: '12px 12px 12px 35px', background: '#f4f4f5', border: 'none', fontWeight: 800 }} />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-black" style={{ padding: '15px', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <Save size={18} /> COMMIT IDENTITY CHANGES
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
