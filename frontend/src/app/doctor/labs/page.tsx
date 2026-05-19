"use client";
import { useState, useEffect } from "react";
import { FlaskConical, Search, Filter, Download, ExternalLink, CheckCircle, Clock, AlertCircle, RefreshCcw, Plus } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";

export default function DoctorLabsPage() {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [labResults, setLabResults] = useState<any[]>([]);

  useEffect(() => {
    // Initial lab feed load
    setLabResults([]);
  }, []);

  if (!mounted) return null;

  return (
    <DashboardLayout role="doctor" userName="Dr. Sarah Smith">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>LABORATORY WORKSTATION</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>STATION ID: MED-ALPHA-09 • DIAGNOSTIC TELEMETRY HUB</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-outline" onClick={() => showToast("Synchronizing with Lab Node...", "info")}>
            <RefreshCcw size={18} /> SYNC FEED
          </button>
          <button className="btn-black" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexDirection: 'row', whiteSpace: 'nowrap' }}><Plus size={18} /> <span>ORDER NEW TEST
          </span></button>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
            <input 
              type="text" 
              placeholder="SEARCH DIAGNOSTIC DATABASE BY PATIENT, ID, OR TEST TYPE" 
              style={{ width: '100%', padding: '15px 16px 15px 50px', background: '#f4f4f5', border: 'none', fontWeight: '700', fontSize: '0.8rem' }}
            />
          </div>
          <button className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexDirection: 'row', whiteSpace: 'nowrap' }}><Filter size={18} /> <span>STATUS
          </span></button>
        </div>

        <div className="table-responsive" style={{ border: '2px solid #29ABE2' }}>
          <table className="data-table">
            <thead>
              <tr style={{ background: '#29ABE2', color: '#fff' }}>
                <th style={{ padding: '12px 20px' }}>TEST IDENTITY</th>
                <th style={{ padding: '12px 20px' }}>PATIENT</th>
                <th style={{ padding: '12px 20px' }}>DIAGNOSTIC TEST</th>
                <th style={{ padding: '12px 20px' }}>TIMESTAMP</th>
                <th style={{ padding: '12px 20px' }}>STATUS</th>
                <th style={{ padding: '12px 20px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {labResults.map((lab, i) => (
                <tr key={i} style={{ 
                  borderBottom: '1px solid #eee',
                  background: lab.status === 'CRITICAL' ? 'rgba(220, 38, 38, 0.05)' : 'transparent',
                  borderLeft: lab.status === 'CRITICAL' ? '6px solid #dc2626' : 'none'
                }}>
                  <td style={{ padding: '15px 20px', fontWeight: 900 }}>{lab.id}</td>
                  <td style={{ padding: '15px 20px', fontWeight: 900, fontSize: '0.85rem' }}>{lab.patient}</td>
                  <td style={{ padding: '15px 20px', fontWeight: 800, fontSize: '0.75rem' }}>{lab.test}</td>
                  <td style={{ padding: '15px 20px', fontWeight: 700, fontSize: '0.75rem', opacity: 0.5 }}>{lab.date}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {lab.status === 'CRITICAL' ? <AlertCircle size={14} color="#dc2626" /> : lab.status === 'COMPLETED' ? <CheckCircle size={14} color="#10b981" /> : <Clock size={14} color="#999" />}
                      <span style={{ fontSize: '0.65rem', fontWeight: 900, color: lab.status === 'CRITICAL' ? '#dc2626' : lab.status === 'COMPLETED' ? '#10b981' : '#999' }}>{lab.status}</span>
                    </div>
                  </td>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => showToast(`Accessing Diagnostic Feed: ${lab.id}`, "info")} title="View Results"><ExternalLink size={16} /></button>
                      <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => showToast(`Downloading Laboratory Report: ${lab.patient}`, "success")} title="Download Report"><Download size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
