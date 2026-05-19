"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Users, ChevronRight, Activity, Search, ShieldCheck, FileText, X, Clock, Heart } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { apiService } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";

export default function NurseSelectPatientPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoadingReport, setIsLoadingReport] = useState(false);
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [beds, setBeds] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    const s = JSON.parse(localStorage.getItem("medclues_session") || "null");
    if (s && s.role === "nurse") {
      setSession(s);
      if (s.hospital_id) fetchPatients(s.hospital_id);
    }
  }, [router, mounted]);

  const fetchPatients = async (hId: number) => {
    try {
      const [pData, aData, bData] = await Promise.all([
        apiService.getUsers('patient', hId),
        apiService.getAdmissions(),
        apiService.getBeds(hId)
      ]);
      setPatients(Array.isArray(pData) ? pData : []);
      setAdmissions(Array.isArray(aData) ? aData : []);
      setBeds(Array.isArray(bData) ? bData : []);
    } catch (e) {
      console.error("Clinical sync failed:", e);
    }
  };

  const fetchPatientReport = async (patient: any) => {
    setIsLoadingReport(true);
    setSelectedReport(patient);
    try {
      const [vitals, risk] = await Promise.all([
        apiService.getLatestVitals(patient.username),
        apiService.getPatientRiskScore(patient.id)
      ]);
      setReportData({ vitals, risk });
    } catch (e) {
      console.error("Report fetch failed:", e);
      setReportData({ vitals: null, risk: null });
    } finally {
      setIsLoadingReport(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <DashboardLayout role="nurse" userName={session?.name || "Nurse"}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-1px' }}>PATIENT SELECTION TERMINAL</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>SELECT AN ACTIVE ASSIGNMENT TO INITIATE CLINICAL MONITORING</p>
        </div>

        <div style={{ position: 'relative', marginBottom: '3rem' }}>
          <Search size={24} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
          <input 
            type="text" 
            placeholder="SEARCH BY NAME OR ENROLLMENT ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '2rem 2rem 2rem 4rem', 
              fontSize: '1.25rem', 
              fontWeight: 800, 
              border: '4px solid #29ABE2',
              background: '#fff',
              boxShadow: '10px 10px 0 #000'
            }} 
          />
        </div>

        <div style={{ maxHeight: '70vh', overflowY: 'auto', border: '4px solid #29ABE2' }} className="custom-scrollbar">
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead>
              <tr style={{ background: '#f4f4f5', borderBottom: '4px solid #29ABE2', textAlign: 'left', position: 'sticky', top: 0, zIndex: 10 }}>
                <th style={{ padding: '1.5rem', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '1px', width: '80px' }}>S.NO</th>
                <th style={{ padding: '1.5rem', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '1px' }}>PATIENT IDENTITY</th>
                <th style={{ padding: '1.5rem', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '1px' }}>ADMIT DATE</th>
                <th style={{ padding: '1.5rem', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '1px' }}>PRIMARY DOCTOR</th>
                <th style={{ padding: '1.5rem', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '1px' }}>ROOM/BED</th>
                <th style={{ padding: '1.5rem', fontSize: '0.7rem', fontWeight: 900, letterSpacing: '1px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '5rem', textAlign: 'center' }}>
                    <Users size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.2 }} />
                    <h3 style={{ fontWeight: 900, opacity: 0.3 }}>NO MATCHING CLINICAL ASSIGNMENTS FOUND</h3>
                  </td>
                </tr>
              ) : filteredPatients.map((p, i) => {
                const admission = admissions.find(a => a.patient_id === p.id);
                const bed = beds.find(b => b.patient_id === p.id);
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '1.5rem', fontWeight: 900, fontSize: '0.8rem', opacity: 0.3 }}>
                      {(i + 1).toString().padStart(2, '0')}
                    </td>
                    <td style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '32px', height: '32px', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 900 }}>
                          {p.name.charAt(0)}
                        </div>
                        <div>
                          <h4 
                            onClick={() => fetchPatientReport(p)}
                            style={{ fontWeight: 900, fontSize: '0.9rem', textDecoration: 'underline', cursor: 'pointer' }}
                          >
                            {p.name.toUpperCase()}
                          </h4>
                          <p style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.5 }}>{p.username}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem', fontSize: '0.8rem', fontWeight: 800 }}>
                      {admission ? new Date(admission.admitted_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '---'}
                    </td>
                    <td style={{ padding: '1.5rem', fontSize: '0.8rem', fontWeight: 800 }}>
                      {admission?.doctor?.name ? `DR. ${admission.doctor.name.toUpperCase()}` : 'NOT ASSIGNED'}
                    </td>
                    <td style={{ padding: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.65rem', fontWeight: 900, background: bed ? '#000' : '#f4f4f5', color: bed ? '#fff' : '#000', padding: '6px 12px', border: '1px solid #000', width: 'fit-content' }}>
                        <ShieldCheck size={12} /> {bed ? `ROOM ${bed.room_number} / B${bed.bed_number}` : 'AWAITING ROOM'}
                      </div>
                    </td>
                    <td style={{ padding: '1.5rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => router.push(`/nurse?patient=${p.username}`)}
                        style={{ background: '#000', color: '#fff', border: 'none', padding: '8px 16px', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer' }}
                      >
                        UPDATE VITALS
                      </button>
                      <button 
                        onClick={() => fetchPatientReport(p)}
                        style={{ background: '#f4f4f5', border: '1px solid #000', padding: '8px 16px', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer' }}
                      >
                        VIEW REPORT
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Patient Report Modal (Read Only) */}
      <AnimatePresence>
        {selectedReport && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              style={{ width: '600px', background: '#fff', border: '8px solid #000', position: 'relative', padding: '3rem', maxHeight: '90vh', overflowY: 'auto' }}
              className="custom-scrollbar"
            >
              <button onClick={() => setSelectedReport(null)} style={{ position: 'absolute', top: '2rem', right: '2rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>

              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '0.5rem' }}>{selectedReport.name.toUpperCase()}</h2>
                <p style={{ fontWeight: 800, opacity: 0.4 }}>ID: {selectedReport.username} • CLINICAL STATUS REPORT</p>
              </div>

              {isLoadingReport ? (
                <div style={{ padding: '4rem', textAlign: 'center', fontWeight: 900 }}>TRANSMITTING DATA...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                   {/* Vitals Summary */}
                   <div style={{ border: '2px solid #29ABE2', padding: '1.5rem' }}>
                     <h4 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '1.5rem', borderBottom: '2px solid #29ABE2', paddingBottom: '0.5rem' }}>LATEST VITALS</h4>
                     {reportData?.vitals ? (
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                          <div><p style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.5 }}>BLOOD PRESSURE</p><p style={{ fontWeight: 900 }}>{reportData.vitals.blood_pressure}</p></div>
                          <div><p style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.5 }}>HEART RATE</p><p style={{ fontWeight: 900 }}>{reportData.vitals.heart_rate} BPM</p></div>
                          <div><p style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.5 }}>SPO2 LEVEL</p><p style={{ fontWeight: 900 }}>{reportData.vitals.spo2}%</p></div>
                          <div><p style={{ fontSize: '0.6rem', fontWeight: 900, opacity: 0.5 }}>TEMPERATURE</p><p style={{ fontWeight: 900 }}>{reportData.vitals.temperature}°C</p></div>
                       </div>
                     ) : (
                       <p style={{ textAlign: 'center', opacity: 0.3, fontWeight: 900 }}>NO VITALS DATA ON RECORD</p>
                     )}
                   </div>

                   {/* AI Risk Score */}
                   <div style={{ background: '#000', color: '#fff', padding: '1.5rem' }}>
                      <h4 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '1rem' }}>AI RISK ANALYSIS</h4>
                      {reportData?.risk ? (
                        <div>
                           <p style={{ fontSize: '1.5rem', fontWeight: 900, color: reportData.risk.risk_level === 'CRITICAL' ? '#ef4444' : '#10b981' }}>{reportData.risk.risk_level} RISK</p>
                           <p style={{ fontSize: '0.7rem', fontWeight: 800, opacity: 0.6 }}>SCORE: {reportData.risk.score_value}/10</p>
                        </div>
                      ) : (
                        <p style={{ opacity: 0.4, fontSize: '0.7rem', fontWeight: 800 }}>ANALYSIS ENGINE PENDING SYNC...</p>
                      )}
                   </div>

                   {/* Observations */}
                   <div style={{ border: '2px solid #29ABE2', padding: '1.5rem' }}>
                     <h4 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px', marginBottom: '1rem' }}>NURSING OBSERVATIONS</h4>
                     <p style={{ fontSize: '0.8rem', fontWeight: 700, lineHeight: '1.6' }}>
                       {reportData?.vitals?.nursing_notes || "NO RECENT CLINICAL OBSERVATIONS RECORDED IN SYSTEM."}
                     </p>
                    </div>

                    <div style={{ background: '#f4f4f5', padding: '1rem', textAlign: 'center', fontSize: '0.6rem', fontWeight: 900 }}>
                      SYSTEM NOTICE: READ-ONLY ACCESS GRANTED. MODIFICATION RESTRICTED.
                    </div>
                 </div>
               )}
             </motion.div>
           </div>
         )}
       </AnimatePresence>
       
       <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; border-radius: 0; }
       `}</style>
    </DashboardLayout>
  );
}
