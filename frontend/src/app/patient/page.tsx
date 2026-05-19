"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, Clock, FileText, Pill, ShieldCheck, TrendingUp, Zap, Plus, Search, User, Key, MessageSquare, Hospital, Globe, LayoutDashboard, LogOut, Package, ShieldAlert, X, Shield, Star, Smartphone, Laptop, Database, Bell, UserCheck, Heart, Calendar } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";
import { apiService } from "@/services/api";

export default function PatientDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [sessionName, setSessionName] = useState("John Doe");
  const [activeMetrics, setActiveMetrics] = useState({
    hr: 0,
    glucose: 0,
    nurse: "NOT ASSIGNED",
    doctor: "NOT ASSIGNED",
    lastSync: "NEVER"
  });
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [expenditure, setExpenditure] = useState({ total: 0, history: [] });
  const [testResults, setTestResults] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    const session = JSON.parse(localStorage.getItem("medclues_session") || "null");
    if (session && session.role === "patient") {
      setSessionName(session.name);
      fetchPatientHubData(session);
    }
  }, []);
  
  const fetchPatientHubData = async (session: any) => {
    try {
      // Vitals
      const vitals = await apiService.getLatestVitals(session.username);
      if (vitals) {
        setActiveMetrics(prev => ({
          ...prev,
          hr: vitals.heart_rate || 0,
          glucose: vitals.glucose || 0,
          lastSync: vitals.created_at ? new Date(vitals.created_at).toLocaleTimeString() : "NEVER",
        }));
      }

      setActiveMetrics(prev => ({
        ...prev,
        doctor: session.doctor || "NOT ASSIGNED",
        nurse: session.nurse || "NOT ASSIGNED"
      }));
      
      // Prescriptions
      const presData = await apiService.getPrescriptions(session.username);
      if (Array.isArray(presData)) {
        setPrescriptions(presData.flatMap(p => 
          (p.medicines || []).map((m: any) => ({
            name: m.name || "UNKNOWN MEDICINE",
            dosage: m.dosage || "N/A",
            instructions: m.instructions || "TAKE AS DIRECTED",
            status: "ACTIVE"
          }))
        ));
      }
      
      // Appointments
      const appts = await apiService.getPatientAppointments(session.id);
      setAppointments(Array.isArray(appts) ? appts : []);

      // Expenditure
      const billing = await apiService.getPatientExpenditure(session.id);
      setExpenditure(billing);

      // Lab Tests
      const tests = await apiService.getPatientTests(session.id);
      setTestResults(Array.isArray(tests) ? tests : []);
    } catch (error) {
      console.error("Hub sync failed:", error);
    }
  };

  if (!mounted) return null;

  return (
    <DashboardLayout role="patient" userName={sessionName}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>PATIENT HEALTH REPOSITORY</h1>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px' }}>
          SECURE CLINICAL ARCHIVE • READ-ONLY ACCESS
        </p>
      </div>

      {/* Real-time Notifications */}
      <AnimatePresence>
        {appointments.filter(a => a.status === 'scheduled').map((a, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{ 
              backgroundColor: '#10b981', 
              color: '#fff', 
              padding: '1.5rem 2rem', 
              borderRadius: '1px', 
              marginBottom: '2rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '2px solid #29ABE2'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <Bell size={20} fill="#fff" />
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 900, letterSpacing: '1px' }}>APPOINTMENT FINALIZED</h4>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.9 }}>Your consultation for "{a.reason}" has been scheduled for {new Date(a.scheduled_at).toLocaleString()}</p>
              </div>
            </div>
            <button 
              onClick={() => router.push("/patient/appointments")}
              style={{ backgroundColor: '#000', color: '#fff', border: 'none', padding: '8px 15px', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer' }}
            >
              VIEW DETAILS
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Financial Overview Banner */}
      <div style={{ backgroundColor: '#fef3c7', border: '2px solid #d97706', padding: '1.5rem 2.5rem', marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h4 style={{ fontSize: '0.7rem', fontWeight: 900, color: '#d97706', letterSpacing: '1px' }}>TOTAL CUMULATIVE EXPENDITURE</h4>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: '#000' }}>₹{expenditure.total?.toLocaleString()}</h2>
        </div>
        <button onClick={() => router.push("/patient/billing")} style={{ backgroundColor: '#000', color: '#fff', border: 'none', padding: '10px 20px', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer' }}>
          VIEW BILLING STATEMENTS
        </button>
      </div>

      {/* Vital Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        <div className="card">
          <p className="card-title">HEART RATE</p>
          <h2 className="card-value">{activeMetrics.hr} <span style={{ fontSize: '1rem' }}>BPM</span></h2>
          <p style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.5 }}>SYNCHRONIZED: {activeMetrics.lastSync}</p>
        </div>
        <div className="card">
          <p className="card-title">GLUCOSE LEVEL</p>
          <h2 className="card-value">{activeMetrics.glucose} <span style={{ fontSize: '1rem' }}>mg/dL</span></h2>
          <p style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.5 }}>SYNCHRONIZED: {activeMetrics.lastSync}</p>
        </div>
        <div className="card" style={{ background: '#29ABE2', color: '#fff' }}>
          <p className="card-title" style={{ color: 'rgba(255,255,255,0.6)' }}>ASSIGNED CLINICIAN</p>
          <h2 className="card-value" style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>DR. {activeMetrics.doctor.toUpperCase()}</h2>
          <p style={{ fontSize: '0.6rem', fontWeight: 800, opacity: 0.5 }}>PRIMARY CARE NODE</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', marginBottom: '3rem' }}>
        
        {/* ACTIVE PRESCRIPTION REGISTRY */}
        <div className="card" style={{ padding: '0', border: '2px solid #29ABE2' }}>
          <div style={{ padding: '1.2rem 2rem', background: '#29ABE2', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h3 style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '1px' }}>ACTIVE PRESCRIPTION REGISTRY</h3>
             <Pill size={16} />
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="custom-scrollbar">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead>
                 <tr style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f4f4f5', borderBottom: '2px solid #29ABE2', textAlign: 'left' }}>
                   <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>S.NO</th>
                   <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>MEDICATION</th>
                   <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>DOSAGE</th>
                   <th style={{ padding: '15px 20px', fontSize: '0.65rem', textAlign: 'right' }}>STATUS</th>
                 </tr>
               </thead>
               <tbody>
                 {prescriptions.length === 0 ? (
                   <tr><td colSpan={4} style={{ textAlign: 'center', padding: '3rem', fontWeight: 800, opacity: 0.3 }}>EMPTY REGISTRY</td></tr>
                 ) : prescriptions.map((p, i) => (
                   <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                     <td style={{ padding: '15px 20px', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                     <td style={{ padding: '15px 20px', fontWeight: 900 }}>{p.name.toUpperCase()}</td>
                     <td style={{ padding: '15px 20px', fontWeight: 800 }}>{p.dosage}</td>
                     <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                        <span className="badge" style={{ fontSize: '0.55rem', background: '#f4f4f5', border: '1px solid #000' }}>{p.status}</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        </div>

        {/* CONSULTATION REQUEST STATUS */}
        <div className="card" style={{ padding: '0', border: '2px solid #29ABE2' }}>
          <div style={{ padding: '1.2rem 2rem', background: '#10b981', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h3 style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '1px' }}>CONSULTATION REQUEST STATUS</h3>
             <Calendar size={16} />
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="custom-scrollbar">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead>
                 <tr style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f4f4f5', borderBottom: '2px solid #29ABE2', textAlign: 'left' }}>
                   <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>S.NO</th>
                   <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>CONSULTATION</th>
                   <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>SCHEDULE</th>
                   <th style={{ padding: '15px 20px', fontSize: '0.65rem', textAlign: 'right' }}>STATUS</th>
                 </tr>
               </thead>
               <tbody>
                 {appointments.length === 0 ? (
                   <tr><td colSpan={4} style={{ textAlign: 'center', padding: '3rem', fontWeight: 800, opacity: 0.3 }}>NO ACTIVE REQUESTS</td></tr>
                 ) : appointments.map((a, i) => (
                   <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                     <td style={{ padding: '15px 20px', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                     <td style={{ padding: '15px 20px', fontWeight: 900 }}>{a.reason?.toUpperCase()}</td>
                     <td style={{ padding: '15px 20px', fontWeight: 800 }}>{new Date(a.scheduled_at).toLocaleDateString()}</td>
                     <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                        <span className="badge" style={{ fontSize: '0.55rem', background: a.status === 'scheduled' ? '#10b981' : '#f4f4f5', color: a.status === 'scheduled' ? '#fff' : '#000', border: '1px solid #000' }}>{a.status.toUpperCase()}</span>
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        </div>

        {/* ELECTRONIC HEALTH RECORDS (EHR) */}
        <div className="card" style={{ padding: '0', border: '2px solid #29ABE2' }}>
          <div style={{ padding: '1.2rem 2rem', background: '#3b82f6', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h3 style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '1px' }}>ELECTRONIC HEALTH RECORDS</h3>
             <Database size={16} />
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="custom-scrollbar">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead>
                 <tr style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f4f4f5', borderBottom: '2px solid #29ABE2', textAlign: 'left' }}>
                   <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>S.NO</th>
                   <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>DIAGNOSTIC REPORT</th>
                   <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>DATE</th>
                   <th style={{ padding: '15px 20px', fontSize: '0.65rem', textAlign: 'right' }}>ACTION</th>
                 </tr>
               </thead>
               <tbody>
                 {testResults.length === 0 ? (
                   <tr><td colSpan={4} style={{ textAlign: 'center', padding: '3rem', fontWeight: 800, opacity: 0.3 }}>NO EHR DATA FOUND</td></tr>
                 ) : testResults.map((t, i) => (
                   <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                     <td style={{ padding: '15px 20px', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                     <td style={{ padding: '15px 20px', fontWeight: 900 }}>{t.test_name.toUpperCase()}</td>
                     <td style={{ padding: '15px 20px', fontWeight: 800 }}>{new Date(t.created_at).toLocaleDateString()}</td>
                     <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                        {t.status === 'pending' ? <Clock size={16} style={{ opacity: 0.3 }} /> : (
                          <button onClick={() => window.open(`http://localhost:8000/${t.file_path}`, '_blank')} style={{ background: '#29ABE2', color: '#fff', border: 'none', padding: '6px 12px', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer' }}>PDF</button>
                        )}
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        </div>

        {/* PRESCRIPTION INVENTORY */}
        <div className="card" style={{ padding: '0', border: '2px solid #29ABE2' }}>
          <div style={{ padding: '1.2rem 2rem', background: '#f59e0b', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h3 style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '1px' }}>PRESCRIPTION INVENTORY</h3>
             <Package size={16} />
          </div>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }} className="custom-scrollbar">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead>
                 <tr style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f4f4f5', borderBottom: '4px solid #29ABE2', textAlign: 'left' }}>
                   <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>S.NO</th>
                   <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>STOCK ITEM</th>
                   <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>REMAINING</th>
                   <th style={{ padding: '15px 20px', fontSize: '0.65rem', textAlign: 'right' }}>REFILL</th>
                 </tr>
               </thead>
               <tbody>
                 {prescriptions.length === 0 ? (
                   <tr><td colSpan={4} style={{ textAlign: 'center', padding: '3rem', fontWeight: 800, opacity: 0.3 }}>EMPTY INVENTORY</td></tr>
                 ) : prescriptions.map((p, i) => (
                   <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                     <td style={{ padding: '15px 20px', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                     <td style={{ padding: '15px 20px', fontWeight: 900 }}>{p.name.toUpperCase()}</td>
                     <td style={{ padding: '15px 20px', fontWeight: 800 }}>7 DAYS LEFT</td>
                     <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                        <button className="badge" style={{ background: '#f4f4f5', border: '1px solid #000', fontSize: '0.55rem', fontWeight: 900, cursor: 'pointer' }}>REQUEST</button>
                     </td>
                   </tr>
                 ))}
               </tbody>
            </table>
          </div>
        </div>

      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; border-radius: 0; }
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </DashboardLayout>
  );
}
