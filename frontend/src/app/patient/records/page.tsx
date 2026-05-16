"use client";
import { useState, useEffect } from "react";
import { FileText, Download, Eye, Search, Shield, Activity, FileCheck, Lock } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";

export default function MedicalRecordsPage() {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [records, setRecords] = useState<any[]>([]);
  const [userName, setUserName] = useState("Patient");

  useEffect(() => {
    setMounted(true);
    const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
    if (session?.id) {
      setUserName(session.name || "Patient");
      fetchRecords(session.id);
    } else {
      showToast("No active session found", "error");
    }
  }, []);

  const fetchRecords = async (patientId: number) => {
    try {
      const { apiService } = await import("@/services/api");
      const data = await apiService.getPatientHistory(patientId);
      console.log("Fetched records:", data);
      setRecords(data);
      if (data.length === 0) {
        showToast("No records found in clinical repository", "info");
      } else {
        showToast(`Synchronized ${data.length} records`, "success");
      }
    } catch (e) {
      showToast("Clinical repository sync error", "error");
    }
  };

  if (!mounted) return null;

  return (
    <DashboardLayout role="patient" userName={userName}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>ELECTRONIC HEALTH RECORDS</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>SECURE CLINICAL REPOSITORY • AES-256 ENCRYPTED</p>
        </div>
        <button className="btn-black" onClick={() => showToast("Preparing full encrypted archive...", "info")}>
          <Download size={20} /> REQUEST COMPLETE EXPORT
        </button>
      </div>

      <div className="card" style={{ marginTop: '3rem', padding: '0', border: '4px solid #000' }}>
        <div style={{ padding: '2rem 2.5rem', borderBottom: '2px solid #000' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
            <input 
              type="text" 
              placeholder="FILTER BY RECORD TYPE, DATE, OR PROVIDER" 
              style={{ width: '100%', padding: '15px 16px 15px 50px', background: '#f4f4f5', border: 'none', fontWeight: '700', fontSize: '0.8rem' }}
            />
          </div>
        </div>

        <div style={{ maxHeight: '600px', overflowY: 'auto' }} className="custom-scrollbar">
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f4f4f5', borderBottom: '4px solid #000', textAlign: 'left' }}>
                <th style={{ padding: '15px 25px', fontSize: '0.65rem', letterSpacing: '1px' }}>S.NO</th>
                <th style={{ padding: '15px 25px', fontSize: '0.65rem', letterSpacing: '1px' }}>RECORD IDENTITY</th>
                <th style={{ padding: '15px 25px', fontSize: '0.65rem', letterSpacing: '1px' }}>RECORD ID</th>
                <th style={{ padding: '15px 25px', fontSize: '0.65rem', letterSpacing: '1px' }}>CATEGORY</th>
                <th style={{ padding: '15px 25px', fontSize: '0.65rem', letterSpacing: '1px' }}>ISSUING PROVIDER</th>
                <th style={{ padding: '15px 25px', fontSize: '0.65rem', letterSpacing: '1px' }}>DATE</th>
                <th style={{ padding: '15px 25px', fontSize: '0.65rem', letterSpacing: '1px' }}>SIZE</th>
                <th style={{ padding: '15px 25px', fontSize: '0.65rem', letterSpacing: '1px' }}>STATUS</th>
                <th style={{ padding: '15px 25px', fontSize: '0.65rem', letterSpacing: '1px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={9} style={{ textAlign: 'center', padding: '5rem', fontWeight: 800, opacity: 0.2 }}>NO RECORDS IN REPOSITORY</td></tr>
              ) : records.map((rec, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '20px 25px', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                  <td style={{ padding: '20px 25px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ padding: '8px', background: '#000', color: '#fff' }}>
                        <FileCheck size={18} />
                      </div>
                      <span style={{ fontWeight: '900', fontSize: '0.9rem' }}>{rec.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '20px 25px', fontWeight: 900, color: '#000', fontSize: '0.8rem', opacity: 0.5 }}>{rec.id}</td>
                  <td style={{ padding: '20px 25px', fontWeight: 800, fontSize: '0.75rem' }}>{rec.type}</td>
                  <td style={{ padding: '20px 25px', fontWeight: 700, color: '#666' }}>{rec.provider}</td>
                  <td style={{ padding: '20px 25px', fontWeight: 800 }}>{rec.date}</td>
                  <td style={{ padding: '20px 25px', fontWeight: 700, opacity: 0.5 }}>{rec.size}</td>
                  <td style={{ padding: '20px 25px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 800, fontSize: '0.7rem' }}>
                       <Lock size={12} /> SECURE
                     </div>
                  </td>
                  <td style={{ padding: '20px 25px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                      <button style={{ background: 'transparent', border: 'none', color: '#000', cursor: 'pointer' }} onClick={() => showToast(`Opening ${rec.id}...`, "info")}><Eye size={18} /></button>
                      <button style={{ background: 'transparent', border: 'none', color: '#000', cursor: 'pointer' }} onClick={() => showToast(`Downloading archive...`, "success")}><Download size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; border-radius: 0; }
        `}</style>
      </div>
    </DashboardLayout>
  );
}
