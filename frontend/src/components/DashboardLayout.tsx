"use client";
import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { Search, Bell, LogOut, Calendar, Package, X, Clock, Menu, Palette } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children, role, userName: initialUserName }: { children: React.ReactNode, role: string, userName: string }) {
  const [mounted, setMounted] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState(initialUserName);
  const [theme, setTheme] = useState<"black" | "teal">("teal");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("medclues_theme") as "black" | "teal" || "teal";
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "black" ? "teal" : "black";
    setTheme(newTheme);
    localStorage.setItem("medclues_theme", newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  // Immediate Session Sync: Before any rendering or effects, ensure the active session
  // matches the current portal role. This prevents multi-tab role conflicts.
  if (typeof window !== "undefined") {
    const roleSession = localStorage.getItem(`medclues_session_${role}`);
    if (roleSession) {
      localStorage.setItem("medclues_session", roleSession);
    }
  }

  useEffect(() => {
    const checkAuth = () => {
      const roleKey = `medclues_session_${role}`;
      const session = JSON.parse(localStorage.getItem(roleKey) || localStorage.getItem("medclues_session") || "null");
      
      if (session) {
        // Only redirect if the session we found absolutely doesn't match the role
        if (session.role !== role) {
          window.location.href = "/login";
          return;
        }
        
        // Sync back to generic key for legacy component support
        localStorage.setItem("medclues_session", JSON.stringify(session));
        localStorage.setItem(roleKey, JSON.stringify(session));

        setSessionUser(session.name || session.id || initialUserName);
        setSessionCode(session.username || session.id || "");
        setMounted(true);
      } else {
        window.location.href = "/login";
      }
    };

    checkAuth();
  }, [role, initialUserName]);

  const [sessionCode, setSessionCode] = useState("");

  if (!mounted) return null;

  const notifications = [
    { id: 1, type: 'APPOINTMENT', text: "UPCOMING: DR. SARAH SMITH AT 10:30 AM", time: "15m left", icon: <Calendar size={14} /> },
    { id: 2, type: 'PHARMACY', text: "ORDER #REF-9021-3 PROCESSED", time: "1h ago", icon: <Package size={14} /> },
  ];

  return (
    <div className="app-container" style={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }} suppressHydrationWarning>
      <Sidebar role={role} isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />
      
      <div className="main-wrapper" style={{ flex: 1, marginLeft: 'var(--sidebar-width)', transition: 'margin 0.3s ease' }}>
        <header className="main-header" style={{ position: 'sticky', top: 0, zIndex: 100, background: '#fff', borderBottom: '2px solid var(--bg-side)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem', height: '70px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              className="mobile-only" 
              onClick={() => setIsMobileMenuOpen(true)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }}
            >
              <Menu size={22} />
            </button>
            <div className="desktop-only" style={{ position: 'relative', width: '300px' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} size={16} />
              <input type="text" placeholder="GLOBAL SEARCH" style={{ width: '100%', padding: '10px 12px 10px 40px', background: '#f4f4f5', border: 'none', fontWeight: '700', fontSize: '0.75rem' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button 
              onClick={toggleTheme} 
              title={`Switch Theme (Current: ${theme === "black" ? "Midnight Black" : "Sky Blue"})`}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', color: 'var(--bg-side)' }}
            >
              <Palette size={20} />
            </button>

            <button onClick={() => setShowNotifications(true)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', position: 'relative', padding: '8px' }}>
              <Bell size={20} />
              <div style={{ position: 'absolute', top: '6px', right: '6px', width: '8px', height: '8px', background: '#10b981', border: '1.5px solid #fff', borderRadius: '50%' }}></div>
            </button>

            <div className="desktop-only" style={{ textAlign: 'right', paddingRight: '1rem', borderRight: '2px solid var(--bg-side)' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: '900' }}>{sessionUser.toUpperCase()}</p>
              <p style={{ fontSize: '0.6rem', fontWeight: '700', color: '#666' }}>{role.replace('_', ' ').toUpperCase()} {sessionCode && `• ${sessionCode.toUpperCase()}`}</p>
            </div>
            
            <Link href="/logout" style={{ display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none', color: 'var(--bg-side)', fontWeight: '900', fontSize: '0.7rem', border: '2px solid var(--bg-side)', padding: '8px 12px' }}>
              <span className="desktop-only">TERMINATE</span> <LogOut size={16} />
            </Link>
          </div>
        </header>

        <main className="main-content" style={{ padding: '1.5rem' }}>
          {children}
        </main>
      </div>

      {/* Notification Side Panel */}
      <AnimatePresence>
        {showNotifications && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNotifications(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 200 }} />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '350px', maxWidth: '85vw', background: '#fff', zIndex: 300, borderLeft: '4px solid var(--bg-side)', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '1.5rem', borderBottom: '2px solid var(--bg-side)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-side)', color: '#fff' }}>
                <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px' }}>ALERTS</h3>
                <button onClick={() => setShowNotifications(false)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                {notifications.map((n) => (
                  <div key={n.id} style={{ padding: '1rem', borderBottom: '1px solid #eee', display: 'flex', gap: '0.75rem' }}>
                    <div style={{ padding: '8px', background: '#f4f4f5', border: '1px solid var(--bg-side)', height: 'fit-content' }}>{n.icon}</div>
                    <div>
                      <p style={{ fontWeight: 900, fontSize: '0.75rem', marginBottom: '2px' }}>{n.text}</p>
                      <p style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.4 }}>{n.time.toUpperCase()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx global>{`
        :root { --sidebar-width: 280px; }
        @media (max-width: 1024px) {
          :root { --sidebar-width: 0px; }
          .desktop-only { display: none !important; }
          .main-wrapper { margin-left: 0 !important; }
        }
        @media (min-width: 1025px) { .mobile-only { display: none !important; } }
      `}</style>
    </div>
  );
}
