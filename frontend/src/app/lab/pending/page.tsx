"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FlaskConical, Upload, Clock, Search } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";
import { apiService } from "@/services/api";

export default function LabPendingPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [tests, setTests] = useState<any[]>([]);
  const [session, setSession] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setMounted(true);
    const s = JSON.parse(localStorage.getItem("medclues_session") || "null");
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

  const filteredTests = tests.filter(t => 
    t.patient?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.test_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.test_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <DashboardLayout role="lab" userName={session?.name || "Lab Tech"}>
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>PENDING DIAGNOSTIC QUEUE</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>ACTIVE REQUISITIONS AWAITING TRANSMISSION</p>
        </div>
        <div style={{ position: 'relative', width: '350px' }}>
          <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
          <input 
            type="text" 
            placeholder="SEARCH QUEUE..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '12px 15px 12px 45px', border: '3px solid #000', fontWeight: 800, fontSize: '0.8rem' }}
          />
        </div>
      </div>

      <div className="card" style={{ padding: '0', border: '4px solid #000' }}>
        <div style={{ maxHeight: '600px', overflowY: 'auto' }} className="custom-scrollbar">
          <table className="data-table" style={{ border: 'none', width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f4f4f5', borderBottom: '4px solid #000', textAlign: 'left' }}>
                <th style={{ padding: '15px 25px', fontSize: '0.65rem', letterSpacing: '1px', width: '80px' }}>S.NO</th>
                <th style={{ padding: '15px 25px', fontSize: '0.65rem', letterSpacing: '1px' }}>REFERENCE</th>
                <th style={{ padding: '15px 25px', fontSize: '0.65rem', letterSpacing: '1px' }}>PATIENT</th>
                <th style={{ padding: '15px 25px', fontSize: '0.65rem', letterSpacing: '1px' }}>DIAGNOSTIC TYPE</th>
                <th style={{ padding: '15px 25px', fontSize: '0.65rem', letterSpacing: '1px' }}>ORDERING PHYSICIAN</th>
                <th style={{ padding: '15px 25px', fontSize: '0.65rem', letterSpacing: '1px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredTests.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '5rem', fontWeight: 800, opacity: 0.2 }}>QUEUE EMPTY</td></tr>
              ) : filteredTests.map((t, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f4f4f5' }}>
                  <td style={{ padding: '20px 25px', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                  <td style={{ padding: '20px 25px', fontWeight: 900, fontSize: '0.85rem' }}>#{t.test_id}</td>
                  <td style={{ padding: '20px 25px', fontWeight: 800 }}>{t.patient?.name.toUpperCase()}</td>
                  <td style={{ padding: '20px 25px' }}>
                    <span style={{ padding: '6px 12px', background: '#000', color: '#fff', fontSize: '0.6rem', fontWeight: 900, borderRadius: '2px' }}>{t.test_name.toUpperCase()}</span>
                  </td>
                  <td style={{ padding: '20px 25px', fontSize: '0.75rem', fontWeight: 700, opacity: 0.6 }}>DR. {t.doctor?.user?.name.toUpperCase()}</td>
                  <td style={{ padding: '20px 25px', textAlign: 'right' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: '#10b981', color: '#fff', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer', transition: '0.2s' }}>
                      <Upload size={14} /> UPLOAD RESULTS
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
    </DashboardLayout>
  );
}
