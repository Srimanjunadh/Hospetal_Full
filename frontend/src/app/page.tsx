"use client";
import { motion } from "framer-motion";
import { Activity, Shield, Users, Hospital, ChevronRight, Zap, Globe, Lock, Fingerprint } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: '#ffffff', color: '#000000', fontFamily: 'Inter, sans-serif' }}>
      {/* Top Utility Bar */}
      <div style={{ background: '#000', color: '#fff', padding: '10px 2rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 900, letterSpacing: '2px' }}>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <span>NETWORK: STABLE</span>
          <span>NODES: 12 ACTIVE</span>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <span>UPTIME: 99.99%</span>
          <span>SECURE PROTOCOL: AES-256</span>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ padding: '2rem 3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #000' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.5rem', fontWeight: 900, whiteSpace: 'nowrap' }}>
          <Activity size={32} style={{ flexShrink: 0, color: '#29ABE2' }} />
          <span>MEDCLUES+</span>
        </div>
        <div style={{ display: 'flex', gap: '3rem', alignItems: 'center' }}>
          <Link href="/pms" style={{ color: '#000', textDecoration: 'none', fontWeight: 800, fontSize: '0.8rem' }}>PMS PORTAL</Link>
          <Link href="/login" style={{ color: '#000', textDecoration: 'none', fontWeight: 800, fontSize: '0.8rem' }}>AUTHENTICATE</Link>
          <Link href="/register" style={{ background: '#000', color: '#fff', padding: '12px 24px', textDecoration: 'none', fontWeight: 800, fontSize: '0.8rem' }}>INITIALIZE NODE</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '8rem 3rem', maxWidth: '1200px' }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 style={{ fontSize: '6rem', fontWeight: 900, lineHeight: 0.9, letterSpacing: '-4px', marginBottom: '3rem' }}>
            THE OPERATING <br /> SYSTEM FOR <br /> MODERN HEALTH.
          </h1>
          <p style={{ fontSize: '1.5rem', color: '#666', maxWidth: '700px', lineHeight: 1.4, marginBottom: '4rem' }}>
            A unified enterprise resource ecosystem bridging patients, doctors, and hospitals with real-time intelligence.
          </p>
          <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
             <Link href="/login" style={{ background: '#000', color: '#fff', padding: '20px 40px', textDecoration: 'none', fontWeight: 900, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
               ENTER THE HUB <ChevronRight size={24} />
             </Link>
             <Link href="/pms" style={{ background: '#fff', color: '#000', padding: '20px 40px', border: '2px solid #000', textDecoration: 'none', fontWeight: 900, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
               LOGIN TO PMS PORTAL <ChevronRight size={24} />
             </Link>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '20px', border: '2px solid #000', fontWeight: 800, fontSize: '0.8rem' }}>
               <Zap size={20} /> V3.2.0 STABLE
             </div>
          </div>
        </motion.div>
      </section>

      <section style={{ padding: '4rem 3rem', borderTop: '2px solid #000' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '0' }}>
          {[
            { title: "PATIENT PORTAL", icon: <Users size={32} />, path: "/login?role=patient", desc: "Access clinical records & book visits" },
            { title: "DOCTOR TERMINAL", icon: <Activity size={32} />, path: "/login?role=doctor", desc: "Manage patients & schedule" },
            { title: "NURSE TERMINAL", icon: <Activity size={32} />, path: "/login?role=nurse", desc: "Patient monitoring & vitals" },
            { title: "LABORATORY HUB", icon: <Fingerprint size={32} />, path: "/login?role=lab", desc: "Diagnostic reports & testing" },
            { title: "HOSPITAL ERP", icon: <Hospital size={32} />, path: "/login?role=hospital_admin", desc: "Facility management & billing" },
            { title: "PMS ECOSYSTEM", icon: <Globe size={32} />, path: "/pms", desc: "Integrated PMS/Clinic management" },
          ].map((node, i) => (
            <Link key={i} href={node.path} style={{ textDecoration: 'none', color: 'inherit' }}>
              <motion.div
                whileHover={{ background: '#29ABE2', color: '#fff', borderColor: '#29ABE2' }}
                style={{ 
                  padding: '3rem', 
                  borderRight: (i + 1) % 3 !== 0 ? '2px solid #000' : 'none', 
                  borderBottom: i < 3 ? '2px solid #000' : 'none',
                  height: '100%', 
                  transition: 'all 0.2s ease' 
                }}
              >
                <div style={{ marginBottom: '2rem' }}>{node.icon}</div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '1rem' }}>{node.title}</h3>
                <p style={{ fontSize: '0.85rem', opacity: 0.6, lineHeight: 1.5 }}>{node.desc}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>

      {/* Infrastructure Footer */}
      <footer style={{ padding: '6rem 3rem', background: '#000', color: '#fff' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr', gap: '4rem' }}>
          <div>
             <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '2rem' }}>MEDCLUES+ <br /> ENTERPRISE</h2>
             <p style={{ opacity: 0.4, fontSize: '0.8rem', maxWidth: '300px' }}>
               A secure, decentralized healthcare infrastructure built for the next generation of medical excellence.
             </p>
          </div>
          <div>
             <h4 style={{ fontSize: '0.7rem', letterSpacing: '2px', opacity: 0.4, marginBottom: '1.5rem' }}>SYSTEM NODES</h4>
             <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', fontWeight: 700 }}>
                <li>PRIMARY NODE: LONDON</li>
                <li>SECONDARY NODE: SINGAPORE</li>
                <li>EMERGENCY NODE: NEW YORK</li>
             </ul>
          </div>
          <div style={{ textAlign: 'right' }}>
             <h4 style={{ fontSize: '0.7rem', letterSpacing: '2px', opacity: 0.4, marginBottom: '1.5rem' }}>SECURITY</h4>
             <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Lock size={20} /> <Globe size={20} />
             </div>
             <p style={{ marginTop: '2rem', fontSize: '0.7rem', opacity: 0.4 }}>© 2026 MEDCLUES INC.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
