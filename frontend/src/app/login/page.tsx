"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Activity, Shield, Key, ArrowRight, User, Lock, Mail, Heart, Stethoscope, Building2, Zap, Fingerprint, Command, ChevronLeft, Globe } from "lucide-react";
import { useToast } from "@/components/ToastProvider";
import { apiService } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";

type Role = "super_admin" | "hospital_admin" | "doctor" | "nurse" | "lab" | "patient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ height: '100vh', background: '#fff' }} />}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  
  // Initialize role from query param if available
  const initialRole = (searchParams.get("role") as Role) || "hospital_admin";
  const [role, setRole] = useState<Role>(initialRole);
  const [formData, setFormData] = useState({ identifier: "", password: "", nodeId: "", nurseId: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getTheme = () => {
    switch (role) {
      case "super_admin":
        return { 
          label: "Enterprise Root", 
          icon: <Zap size={18} />,
          badge: "SECURE NODE • 01"
        };
      case "doctor":
        return { 
          label: "Clinical Terminal", 
          icon: <Stethoscope size={18} />,
          badge: "CLINICAL ACCESS"
        };
      case "nurse":
        return { 
          label: "Nursing Terminal", 
          icon: <Activity size={18} />,
          badge: "PATIENT CARE"
        };
      case "lab":
        return { 
          label: "Laboratory Hub", 
          icon: <Fingerprint size={18} />,
          badge: "DIAGNOSTIC NODE"
        };
      case "patient":
        return { 
          label: "Health Portal", 
          icon: <Heart size={18} />,
          badge: "USER IDENTITY"
        };
      default:
        return { 
          label: "Facility Admin", 
          icon: <Building2 size={18} />,
          badge: "FACILITY MGMT"
        };
    }
  };

  const theme = getTheme();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const data = await apiService.login({
        username: formData.identifier,
        password: formData.password,
        role: role, // Explicitly send the selected role
        node_code: formData.nodeId,
        nurse_id: formData.nurseId
      });

      if (data.access_token) {
        const sessionData = {
          token: data.access_token,
          id: data.user.id,
          name: data.user.name,
          username: data.user.username,
          role: data.user.role, // This will be the requested role for master
          hospital_id: data.user.hospital_id,
          node_code: formData.nodeId,
          doctor_id: data.user.doctor_id,
          doctor: data.user.doctor,
          nurse: data.user.nurse
        };
        localStorage.setItem("medclues_session", JSON.stringify(sessionData));
        localStorage.setItem(`medclues_session_${data.user.role}`, JSON.stringify(sessionData));
        showToast(`Authorized: ${data.user.name}`, "success");

        setTimeout(() => {
          if (data.user.role === "super_admin") router.push("/super-admin");
          else if (data.user.role === "hospital_admin") router.push("/hospital-admin");
          else if (data.user.role === "doctor") router.push("/doctor");
          else if (data.user.role === "nurse") router.push("/nurse");
          else if (data.user.role === "lab") router.push("/lab");
          else router.push("/patient");
        }, 500);
      } else {
        showToast(data.detail || "Access Denied", "error");
      }
    } catch (error) {
      showToast("Network Failure", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return (
    <div style={{ height: '100vh', background: '#fff' }} />
  );

  return (
    <div 
      style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        background: '#ffffff',
        fontFamily: '"Inter", sans-serif',
        color: '#000'
      }}
    >
      
      {/* System Navigation Hub */}
      <div style={{ 
        position: 'fixed',
        top: '2rem',
        left: '2rem',
        zIndex: 100
      }}>
        <Link href="/" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          textDecoration: 'none', 
          color: '#29ABE2', 
          fontSize: '0.7rem', 
          fontWeight: 900,
          background: '#fff',
          padding: '10px 18px',
          border: '2px solid #29ABE2',
          borderRadius: '4px',
          transition: 'all 0.2s ease'
        }}>
          <ChevronLeft size={16} /> ECOSYSTEM HUB
        </Link>
      </div>

      {/* Role Selection Terminal */}
      <div style={{ 
        marginBottom: '3rem',
        textAlign: 'center'
      }}>
        <p style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '3px', color: '#666', marginBottom: '1.5rem' }}>SELECT ACCESS TERMINAL</p>
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          background: '#f9fafb', 
          padding: '6px',
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
        }}>
          {(["super_admin", "hospital_admin", "doctor", "nurse", "lab", "patient"] as Role[]).map((r) => (
            <button 
              key={r}
              onClick={() => setRole(r)}
              style={{ 
                padding: '10px 16px', 
                fontSize: '0.65rem', 
                fontWeight: 800, 
                border: 'none', 
                cursor: 'pointer',
                borderRadius: '8px',
                background: role === r ? '#29ABE2' : 'transparent',
                color: role === r ? '#fff' : '#6b7280',
                transition: '0.3s all cubic-bezier(0.4, 0, 0.2, 1)',
                letterSpacing: '0.5px'
              }}
            >
              {r.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <motion.div 
        key={role}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ 
          width: '360px', 
          background: '#fff', 
          padding: '3rem 2.5rem', 
          border: '2px solid #29ABE2', 
          position: 'relative',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div style={{ textAlign: 'left', marginBottom: '2.5rem' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
             <Command size={18} style={{ color: '#29ABE2' }} />
             <span style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '2px', color: '#29ABE2' }}>{theme.badge}</span>
           </div>
           <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: '0.4rem', color: '#000' }}>{theme.label}</h1>
           <p style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 500 }}>Sign in to MediClues+</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          {role !== 'super_admin' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.55rem', fontWeight: 800, color: '#000', letterSpacing: '1px' }}>FACILITY NODE ID (4-DIGIT)</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  required
                  maxLength={4}
                  value={formData.nodeId}
                  onChange={(e) => setFormData({...formData, nodeId: e.target.value.replace(/\D/g, '')})}
                  placeholder="0000" 
                  style={{ 
                    width: '100%', padding: '12px 0', background: 'transparent', border: 'none', borderBottom: '1px solid #e5e7eb',
                    fontWeight: 900, outline: 'none', color: '#000', fontSize: '1rem', letterSpacing: '8px', transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderBottomColor = '#29ABE2'}
                  onBlur={(e) => e.currentTarget.style.borderBottomColor = '#e5e7eb'}
                />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.55rem', fontWeight: 800, color: '#000', letterSpacing: '1px' }}>ID IDENTIFIER</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                required
                value={formData.identifier}
                onChange={(e) => setFormData({...formData, identifier: e.target.value})}
                placeholder={role === 'patient' ? "Patient Identity" : "Network ID"} 
                style={{ 
                  width: '100%', 
                  padding: '12px 0', 
                  background: 'transparent', 
                  border: 'none', 
                  borderBottom: '1px solid #e5e7eb',
                  fontWeight: 600, 
                  outline: 'none',
                  color: '#000',
                  fontSize: '0.9rem',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.currentTarget.style.borderBottomColor = '#29ABE2'}
                onBlur={(e) => e.currentTarget.style.borderBottomColor = '#e5e7eb'}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.55rem', fontWeight: 800, color: '#000', letterSpacing: '1px' }}>SECURITY TOKEN</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••" 
                style={{ 
                  width: '100%', 
                  padding: '12px 0', 
                  background: 'transparent', 
                  border: 'none', 
                  borderBottom: '1px solid #e5e7eb',
                  fontWeight: 600, 
                  outline: 'none',
                  color: '#000',
                  fontSize: '0.9rem',
                  transition: 'border-color 0.3s ease'
                }}
                onFocus={(e) => e.currentTarget.style.borderBottomColor = '#29ABE2'}
                onBlur={(e) => e.currentTarget.style.borderBottomColor = '#e5e7eb'}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            style={{ 
              padding: '14px', 
              marginTop: '0.5rem', 
              display: 'flex', 
              alignItems: 'center',
              justifyContent: 'center', 
              gap: '10px',
              background: '#29ABE2',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 700,
              fontSize: '0.8rem',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {isLoading ? "AUTHORIZING..." : "SIGN IN"}
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ marginTop: '3rem', textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '0.5rem', fontWeight: 800, letterSpacing: '1px', opacity: 0.3 }}>
            © 2026 MEDCLUES+ ERP • GLOBAL HEALTH NETWORK
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
             <Link href="/pms" style={{ fontSize: '0.55rem', fontWeight: 900, color: '#29ABE2', textDecoration: 'none', borderBottom: '2px solid #29ABE2' }}>GO TO PMS PORTAL</Link>
          </div>
        </div>
      </motion.div>


      {/* Global CSS for Inter */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      `}</style>
    </div>
  );
}





