"use client"; // Final Sync
import { useState, useEffect } from "react";
import { Activity, Users, Clock, MessageSquare, Hospital, Shield, LayoutDashboard, LogOut, Package, ShieldAlert, X, ShieldCheck, Plus, Key, Pill, Clipboard, Edit3, Bed, FlaskConical, CreditCard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function Sidebar({ role, isOpen, setIsOpen }: { role: string, isOpen: boolean, setIsOpen: (val: boolean) => void }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const menuItems: any = {
    patient: [
      { name: "DASHBOARD", icon: <LayoutDashboard size={18} />, path: "/patient" },
      { name: "APPOINTMENTS", icon: <Clock size={18} />, path: "/patient/appointments" },
      { name: "RECORDS", icon: <Shield size={18} />, path: "/patient/records" },
      { name: "PHARMACY", icon: <Package size={18} />, path: "/patient/pharmacy" },
      { name: "BILLING", icon: <CreditCard size={18} />, path: "/patient/billing" },
    ],
    doctor: [
      { name: "OVERVIEW", icon: <LayoutDashboard size={18} />, path: "/doctor" },
      { name: "PATIENTS", icon: <Users size={18} />, path: "/doctor/patients" },
      { name: "SURGICAL OT", icon: <Activity size={18} />, path: "/doctor/ot-schedule" },
      { name: "SCHEDULE", icon: <Clock size={18} />, path: "/doctor/schedule" },
      { name: "CONSULT", icon: <MessageSquare size={18} />, path: "/doctor/consultations" },
      { name: "SETTINGS", icon: <Edit3 size={18} />, path: "/doctor/settings" },
    ],
    hospital_admin: [
      { name: "PMS STATUS", icon: <Hospital size={18} />, path: "/hospital-admin" },
      { name: "STAFFING", icon: <Users size={18} />, path: "/hospital-admin/staff" },
      { name: "ADMISSIONS", icon: <Bed size={18} />, path: "/hospital-admin/admissions" },
      { name: "BLOOD BANK", icon: <Activity size={18} />, path: "/hospital-admin/blood-bank" },
      { name: "SURGICAL OT", icon: <Clipboard size={18} />, path: "/hospital-admin/ot-schedule" },
      { name: "INVENTORY", icon: <Package size={18} />, path: "/hospital-admin/inventory" },
      { name: "FACILITY CTRL", icon: <ShieldCheck size={18} />, path: "/hospital-admin/facility" },
      { name: "PATIENTS", icon: <Users size={18} />, path: "/hospital-admin/patients" },
      { name: "DOCTOR AUTH", icon: <Key size={18} />, path: "/hospital-admin/doctor-auth" },
      { name: "PATIENT AUTH", icon: <Users size={18} />, path: "/hospital-admin/patient-auth" },
      { name: "PHARMACY", icon: <Pill size={18} />, path: "/hospital-admin/pharmacy" },
    ],
    nurse: [
      { name: "COMMAND", icon: <LayoutDashboard size={18} />, path: "/nurse" },
      { name: "PATIENTS", icon: <Users size={18} />, path: "/nurse-select-patient" },
      { name: "REQUISITIONS", icon: <Clipboard size={18} />, path: "/nurse/requisitions" },
    ],
    lab: [
      { name: "DIAGNOSTICS", icon: <FlaskConical size={18} />, path: "/lab" },
      { name: "PENDING", icon: <Clock size={18} />, path: "/lab/pending" },
    ],
    super_admin: [
      { name: "GLOBAL HUB", icon: <Shield size={18} />, path: "/super-admin" },
      { name: "HOSPITALS", icon: <Hospital size={18} />, path: "/super-admin/hospitals" },
      { name: "PERSONNEL", icon: <Users size={18} />, path: "/super-admin/staff" },
      { name: "INVENTORY", icon: <Package size={18} />, path: "/super-admin/inventory" },
      { name: "INCIDENT HUB", icon: <ShieldAlert size={18} />, path: "/super-admin/incidents" },
      { name: "PROVISIONING", icon: <Plus size={18} />, path: "/super-admin/onboarding" },
    ]
  };

  const items = menuItems[role] || [];

  const sidebarContent = (
    <aside className="sidebar-element" style={{ width: '280px', background: '#ffffff', color: '#111', height: '100vh', display: 'flex', flexDirection: 'column', padding: '2.5rem 1.5rem', borderRight: '1px solid #e4e4e7', boxShadow: '2px 0 8px rgba(0,0,0,0.06)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.25rem', fontWeight: 900, whiteSpace: 'nowrap' }}>
          <Activity size={28} style={{ flexShrink: 0, color: '#29ABE2' }} />
          <span>MEDCLUES+</span>
        </div>
        <button className="mobile-only" onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#111', cursor: 'pointer' }}>
          <X size={24} />
        </button>
      </div>
      
      <nav style={{ flex: 1, overflowY: "auto", paddingRight: "4px" }} className="sidebar-nav">
        <p style={{ fontSize: '0.65rem', fontWeight: '900', color: '#94a3b8', letterSpacing: '2px', marginBottom: '1.5rem', paddingLeft: '1rem' }}>TERMINAL NAVIGATION</p>
        {items.map((item: any) => (
          <Link 
            key={item.path} 
            href={item.path} 
            onClick={() => setIsOpen(false)}
            className={`nav-item ${pathname === item.path ? 'active' : ''}`}
            style={{ marginBottom: '8px' }}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.7rem', color: '#94a3b8', fontWeight: '700' }}>
          <ShieldAlert size={14} /> SECURE NODE v1.0.4
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="desktop-only" style={{ position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100 }}>
        {sidebarContent}
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 400 }}
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 500 }}
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style jsx>{`
        @media (max-width: 1024px) {
          .desktop-only { display: none !important; }
        }
        @media (min-width: 1025px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
    </>
  );
}
