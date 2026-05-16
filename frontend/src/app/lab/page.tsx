"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, Upload, FileText, CheckCircle, Clock, Search, ExternalLink, Shield } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";
import { apiService } from "@/services/api";
import { motion } from "framer-motion";

export default function LabDashboard() {
  const router = useRouter();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [tests, setTests] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const s = JSON.parse(localStorage.getItem("medichain_session") || "null");
    if (s && s.role === "lab") {
      setSession(s);
      fetchTests();
    }
  }, []);

  const fetchTests = async () => {
    try {
      const data = await apiService.getPendingTests();
      setTests(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Test sync failed:", e);
    }
  };

  const handleFileUpload = async (testId: string, file: File) => {
    try {
      await apiService.uploadTestResult(testId, file);
      showToast("DIAGNOSTIC RESULT TRANSMITTED", "success");
      fetchTests();
    } catch (e) {
      showToast("Upload Failed", "error");
    }
  };

  if (!mounted) return null;

  return (
    <DashboardLayout role="lab" userName={session?.name || "Lab Tech"}>
      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>LABORATORY DIAGNOSTIC HUB</h1>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>SECURE PATHOLOGY & SCANNING NODE</p>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div style={{ padding: '1.5rem 2.5rem', background: '#000', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FlaskConical size={20} />
              <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px' }}>PENDING DIAGNOSTIC REQUESTS</h3>
           </div>
           <span style={{ fontSize: '0.6rem', fontWeight: 900 }}>PRIORITY: HIGH</span>
        </div>
        <div style={{ maxHeight: '600px', overflowY: 'auto', border: '4px solid #000' }} className="custom-scrollbar">
          <table className="data-table" style={{ border: 'none', width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f4f4f5', borderBottom: '4px solid #000' }}>
                <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>S.NO</th>
                <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>TEST REFERENCE</th>
                <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>PATIENT NAME</th>
                <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>TEST TYPE</th>
                <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>ORDERED BY</th>
                <th style={{ padding: '15px 20px', fontSize: '0.65rem' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {tests.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', fontWeight: 800, opacity: 0.3 }}>NO PENDING TESTS IN QUEUE</td></tr>
              ) : tests.map((t, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '15px 20px', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                  <td style={{ padding: '15px 20px', fontWeight: 900, fontSize: '0.85rem' }}>{t.test_id}</td>
                  <td style={{ padding: '15px 20px', fontWeight: 800 }}>{t.patient?.name.toUpperCase()}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <span className="badge" style={{ background: '#f4f4f5', border: '1px solid #000' }}>{t.test_name.toUpperCase()}</span>
                  </td>
                  <td style={{ padding: '15px 20px', fontSize: '0.75rem', fontWeight: 700, opacity: 0.6 }}>DR. {t.doctor?.user?.name.toUpperCase()}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 15px', background: '#000', color: '#fff', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer' }}>
                      <Upload size={14} /> UPLOAD PDF
                      <input 
                        type="file" 
                        accept="application/pdf" 
                        style={{ display: 'none' }} 
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(t.test_id, e.target.files[0])}
                      />
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 8px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; border-radius: 0; }
        `}</style>
      </div>

      <div style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="card" style={{ background: '#f4f4f5' }}>
           <h4 style={{ fontWeight: 900, fontSize: '0.75rem', marginBottom: '1rem' }}>UPLOAD PROTOCOL</h4>
           <p style={{ fontSize: '0.7rem', lineHeight: '1.6', fontWeight: 700, opacity: 0.7 }}>
             All diagnostic reports must be uploaded in PDF format. Results are automatically encrypted and transmitted to the referring physician's dashboard.
           </p>
        </div>
        <div className="card" style={{ background: '#f4f4f5' }}>
           <h4 style={{ fontWeight: 900, fontSize: '0.75rem', marginBottom: '1rem' }}>SECURITY CLEARANCE</h4>
           <p style={{ fontSize: '0.7rem', lineHeight: '1.6', fontWeight: 700, opacity: 0.7 }}>
             Laboratory nodes are audited in real-time. Ensure patient identity matches the reference ID before finalizing result transmission.
           </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
