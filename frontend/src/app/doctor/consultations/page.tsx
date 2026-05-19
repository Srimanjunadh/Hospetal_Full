"use client";
import { useState, useEffect } from "react";
import { Video, Mic, MessageSquare, Plus, FileText, Activity, Pill, FlaskConical, Send, X, ShieldCheck, Heart, User } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";

export default function DoctorConsultationsPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState("NOTES");

  const [currentPatient, setCurrentPatient] = useState<any>({
    name: "NO ACTIVE SESSION",
    id: "N/A",
    age: 0,
    vitals: { hr: "-- BPM", bp: "--/--", temp: "-- F" },
    history: []
  });

  useEffect(() => {
    // Session initialization logic here
    setCurrentPatient({
      name: "NO ACTIVE SESSION",
      id: "N/A",
      age: 0,
      vitals: { hr: "-- BPM", bp: "--/--", temp: "-- F" },
      history: []
    });
  }, []);

  return (
    <DashboardLayout role="doctor" userName="Dr. Sarah Smith">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>CONSULTATION TERMINAL</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>STATION ID: MED-ALPHA-09 • ACTIVE SESSION: {currentPatient.id}</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn-outline" 
            onClick={() => showToast("Reviewing History...", "info")}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              flexDirection: 'row',
              whiteSpace: 'nowrap'
            }}
          >
             <FileText size={18} /> <span>FULL EHR</span>
          </button>
          <button className="btn-black" style={{ background: '#dc2626' }} onClick={() => showToast("Session Terminated.", "success")}>
             TERMINATE SESSION
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', minHeight: '800px' }} className="grid-split">
        {/* Main Consultation Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Video Feed Placeholder */}
          <div className="card" style={{ height: '450px', background: '#29ABE2', color: '#fff', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}>
             <div style={{ textAlign: 'center' }}>
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2rem' }}>
                   <User size={64} style={{ opacity: 0.4 }} />
                </div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '2px' }}>{currentPatient.name}</h2>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.5 }}>ENCRYPTED FEED ACTIVE</p>
             </div>
             
             <div style={{ position: 'absolute', bottom: '30px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '1.5rem', background: 'rgba(255,255,255,0.1)', padding: '15px 30px', borderRadius: '50px', backdropFilter: 'blur(10px)' }}>
                <button style={{ background: '#fff', border: 'none', color: '#000', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Video size={20} /></button>
                <button style={{ background: '#fff', border: 'none', color: '#000', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Mic size={20} /></button>
                <button style={{ background: '#fff', border: 'none', color: '#000', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><MessageSquare size={20} /></button>
                <button style={{ background: '#dc2626', border: 'none', color: '#fff', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={20} /></button>
             </div>
          </div>

          {/* Clinical Workstation (Tabs) */}
          <div className="card" style={{ minHeight: '400px', display: 'flex', flexDirection: 'column', padding: '0' }}>
             <div style={{ display: 'flex', borderBottom: '2px solid #29ABE2' }}>
                {['NOTES', 'PRESCRIPTION', 'LAB ORDERS'].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{ 
                      flex: 1, 
                      padding: '15px', 
                      background: activeTab === tab ? '#000' : 'transparent', 
                      color: activeTab === tab ? '#fff' : '#000', 
                      border: 'none', 
                      fontWeight: 900, 
                      fontSize: '0.75rem', 
                      cursor: 'pointer',
                      letterSpacing: '1px'
                    }}
                  >
                    {tab}
                  </button>
                ))}
             </div>
             <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                {activeTab === 'NOTES' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <textarea 
                      placeholder="ENTER CLINICAL OBSERVATIONS AND DIAGNOSIS..." 
                      style={{ width: '100%', height: '250px', border: 'none', outline: 'none', fontStyle: 'italic', fontSize: '1rem', color: '#333', lineHeight: '1.6' }}
                    ></textarea>
                    <button className="btn-black" style={{ width: '100%', padding: '15px' }} onClick={() => showToast("Clinical Notes Archived Successfully", "success")}>
                      SAVE SESSION NOTES
                    </button>
                  </div>
                )}
                {activeTab === 'PRESCRIPTION' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                     <div style={{ display: 'flex', gap: '1rem' }}>
                        <input type="text" placeholder="MEDICINE NAME" style={{ flex: 2, padding: '15px', border: '2px solid #29ABE2', fontWeight: 900 }} />
                        <input type="text" placeholder="DOSAGE" style={{ flex: 1, padding: '15px', border: '2px solid #29ABE2', fontWeight: 900 }} />
                        <button className="btn-black" onClick={() => showToast("Prescription Added", "success")}><Plus size={24} /></button>
                     </div>
                     <div style={{ padding: '1.5rem', background: '#f4f4f5', borderLeft: '4px solid #000' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 900 }}>NO ACTIVE PRESCRIPTIONS ADDED TO CURRENT SESSION.</p>
                     </div>
                     <button className="btn-outline" style={{ width: '100%', padding: '15px', border: '2px solid #29ABE2' }} onClick={() => showToast("Final Prescription Generated & Sent to Pharmacy", "success")}>
                        GENERATE FINAL RX
                     </button>
                  </div>
                )}
                {activeTab === 'LAB ORDERS' && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                     {['BLOOD TEST', 'MRI SCAN', 'X-RAY', 'URINALYSIS', 'ECG', 'BIOPSY', 'COVID-19', 'LIVER PANEL'].map(lab => (
                       <button key={lab} className="btn-outline" style={{ fontSize: '0.7rem', fontWeight: 900, padding: '15px' }} onClick={() => showToast(`${lab} Ordered`, "info")}>
                          {lab}
                       </button>
                     ))}
                  </div>
                )}
             </div>
          </div>
        </div>

        {/* Clinical Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                <Activity size={20} />
                <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px' }}>LIVE VITALS</h3>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                   <span style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.5 }}>HEART RATE</span>
                   <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#10b981' }}>{currentPatient.vitals.hr}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                   <span style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.5 }}>BLOOD PRESSURE</span>
                   <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>{currentPatient.vitals.bp}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.5 }}>BODY TEMP</span>
                   <span style={{ fontSize: '1.25rem', fontWeight: 900 }}>{currentPatient.vitals.temp}</span>
                </div>
             </div>
          </div>

          <div className="card" style={{ background: '#29ABE2', color: '#fff' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem' }}>
                <ShieldCheck size={20} />
                <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px' }}>CLINICAL HISTORY</h3>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '10px' }}>
                {currentPatient.history.map((h: any, i: number) => (
                  <div key={i} style={{ padding: '10px', borderLeft: '2px solid #fff', background: 'rgba(255,255,255,0.05)', marginBottom: '8px' }}>
                     <p style={{ fontSize: '0.75rem', fontWeight: 900 }}>{h}</p>
                     <p style={{ fontSize: '0.65rem', opacity: 0.5, fontWeight: 700 }}>STATION: MED-ALPHA</p>
                  </div>
                ))}
             </div>
          </div>

          <button className="btn-black" style={{ width: '100%', padding: '20px' }} onClick={() => showToast("Accessing File System...", "info")}>
             ATTACH CLINICAL FILE
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
