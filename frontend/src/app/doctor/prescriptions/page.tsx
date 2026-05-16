"use client";
import { useState, useEffect } from "react";
import { Pill, Search, Filter, Download, Plus, CheckCircle, Clock, AlertCircle, RefreshCcw, FileText, Send } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";

export default function DoctorPrescriptionsPage() {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  useEffect(() => {
    // Initial RX feed load
    setPrescriptions([]);
  }, []);

  if (!mounted) return null;

  return (
    <DashboardLayout role="doctor" userName="Dr. Sarah Smith">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>PHARMACY HUB</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>STATION ID: MED-ALPHA-09 • CLINICAL PRESCRIPTION MANAGEMENT</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-outline" onClick={() => showToast("Syncing with Pharmacy Node...", "info")}>
            <RefreshCcw size={18} /> SYNC PHARMACY
          </button>
          <button className="btn-black">
            <Plus size={18} /> NEW PRESCRIPTION
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
            <input 
              type="text" 
              placeholder="SEARCH RX REGISTRY BY PATIENT, ID, OR MEDICATION" 
              style={{ width: '100%', padding: '15px 16px 15px 50px', background: '#f4f4f5', border: 'none', fontWeight: '700', fontSize: '0.8rem' }}
            />
          </div>
          <button className="btn-outline">
            <Filter size={18} /> STATUS
          </button>
        </div>

        <div className="table-responsive" style={{ border: '2px solid #000' }}>
          <table className="data-table">
            <thead>
              <tr style={{ background: '#000', color: '#fff' }}>
                <th style={{ padding: '12px 20px' }}>RX IDENTITY</th>
                <th style={{ padding: '12px 20px' }}>PATIENT</th>
                <th style={{ padding: '12px 20px' }}>MEDICATION & DOSAGE</th>
                <th style={{ padding: '12px 20px' }}>DURATION</th>
                <th style={{ padding: '12px 20px' }}>STATUS</th>
                <th style={{ padding: '12px 20px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((rx, i) => (
                <tr key={i} style={{ 
                  borderBottom: '1px solid #eee',
                  background: rx.status === 'PENDING AUTH' ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                  borderLeft: rx.status === 'PENDING AUTH' ? '6px solid #000' : 'none'
                }}>
                  <td style={{ padding: '15px 20px', fontWeight: 900 }}>{rx.id}</td>
                  <td style={{ padding: '15px 20px', fontWeight: 900, fontSize: '0.85rem' }}>{rx.patient}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <p style={{ fontWeight: 800, fontSize: '0.75rem' }}>{rx.medication}</p>
                    <p style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.5 }}>DOSAGE: {rx.dosage}</p>
                  </td>
                  <td style={{ padding: '15px 20px', fontWeight: 700, fontSize: '0.75rem' }}>{rx.duration}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {rx.status === 'AUTHORIZED' ? <CheckCircle size={14} color="#10b981" /> : <Clock size={14} color="#000" />}
                      <span style={{ fontSize: '0.65rem', fontWeight: 900, color: rx.status === 'AUTHORIZED' ? '#10b981' : '#000' }}>{rx.status}</span>
                    </div>
                  </td>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      {rx.status === 'PENDING AUTH' ? (
                        <button style={{ background: '#000', color: '#fff', border: 'none', padding: '6px 12px', fontSize: '0.65rem', fontWeight: 900, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => showToast(`Authorizing Prescription: ${rx.id}`, "success")}>
                          <Send size={14} /> AUTHORIZE
                        </button>
                      ) : (
                        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => showToast(`Downloading Digital RX: ${rx.id}`, "info")}><Download size={16} /></button>
                      )}
                      <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => showToast(`Opening Prescription History: ${rx.patient}`, "info")}><FileText size={16} /></button>
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
