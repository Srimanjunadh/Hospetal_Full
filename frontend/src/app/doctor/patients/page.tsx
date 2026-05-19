"use client";
import { useState, useEffect } from "react";
import { Users, Search, Filter, Download, Activity, Plus, MessageSquare, Circle, ExternalLink, User } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";
import { apiService } from "@/services/api";
import Link from "next/link";

export default function DoctorPatientsPage() {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDateTime(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) + " • " + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionUser, setSessionUser] = useState("");

  const fetchPatients = async () => {
    setIsLoading(true);
    try {
      const session = JSON.parse(localStorage.getItem("medclues_session") || "null");
      if (session && session.doctor_id) {
        setSessionUser(session.name);
        const data = await apiService.getAssignedPatients(session.doctor_id);
        setPatients(data.map((p: any) => ({
          id: p.username || `P-${p.id}`,
          name: p.name.toUpperCase(),
          age: "N/A",
          condition: "STABLE MONITORING",
          lastVisit: "TODAY",
          status: "ACTIVE",
          risk: "STABLE"
        })));
      } else {
        setPatients([]);
      }
    } catch (error) {
      showToast("Clinical Database Link Failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchPatients();
  }, []);

  if (!mounted) return null;

  const getStatusStyles = (status: string) => {
    switch(status) {
      case 'CRITICAL': return { border: '#dc2626', bg: 'rgba(220, 38, 38, 0.05)', text: '#dc2626', badgeBg: '#dc2626', badgeText: '#fff' };
      case 'MODERATE': return { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.05)', text: '#d97706', badgeBg: '#f59e0b', badgeText: '#fff' };
      case 'STABLE': return { border: '#10b981', bg: 'rgba(16, 185, 129, 0.05)', text: '#059669', badgeBg: '#10b981', badgeText: '#fff' };
      default: return { border: '#000', bg: 'transparent', text: '#000', badgeBg: '#f4f4f5', badgeText: '#000' };
    }
  };

  return (
    <DashboardLayout role="doctor" userName={sessionUser}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>PATIENT REGISTRY</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>STATION ID: MED-ALPHA-09 • {currentDateTime.toUpperCase()}</p>
        </div>
        <button className="btn-black" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexDirection: 'row', whiteSpace: 'nowrap' }}><Plus size={18} /> <span>REGISTER PATIENT
        </span></button>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
            <input 
              type="text" 
              placeholder="SEARCH CLINICAL DATABASE BY NAME, ID, OR CONDITION" 
              style={{ width: '100%', padding: '15px 16px 15px 50px', background: '#f4f4f5', border: 'none', fontWeight: '700', fontSize: '0.8rem' }}
            />
          </div>
          <button className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexDirection: 'row', whiteSpace: 'nowrap' }}><Filter size={18} /> <span>TRIAGE
          </span></button>
        </div>

        <div className="table-responsive" style={{ border: '2px solid #29ABE2' }}>
          <table className="data-table">
            <thead>
              <tr style={{ background: '#29ABE2', color: '#fff' }}>
                <th style={{ padding: '12px 20px', fontSize: '0.65rem' }}>S.NO</th>
                <th style={{ padding: '12px 20px' }}>PATIENT IDENTITY</th>
                <th style={{ padding: '12px 20px' }}>SYSTEM ID</th>
                <th style={{ padding: '12px 20px' }}>CLINICAL CONDITION</th>
                <th style={{ padding: '12px 20px' }}>LAST VISIT</th>
                <th style={{ padding: '12px 20px' }}>PRIORITY</th>
                <th style={{ padding: '12px 20px' }}>STATUS</th>
                <th style={{ padding: '12px 20px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((pt, i) => {
                const styles = getStatusStyles(pt.status);
                return (
                  <tr key={i} style={{ 
                    background: styles.bg,
                    borderLeft: `6px solid ${styles.border}`
                  }}>
                    <td style={{ padding: '10px 20px', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                    <td style={{ padding: '10px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <div style={{ width: '32px', height: '32px', background: styles.badgeBg, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.7rem' }}>{pt.name.charAt(0)}</div>
                         <Link href={`/doctor/patients/${pt.id}`} style={{ textDecoration: 'none', color: '#000' }}>
                            <span style={{ fontWeight: '900', fontSize: '0.85rem', borderBottom: '1px solid transparent' }} onMouseOver={(e) => e.currentTarget.style.borderBottomColor = '#000'} onMouseOut={(e) => e.currentTarget.style.borderBottomColor = 'transparent'}>{pt.name}</span>
                         </Link>
                      </div>
                    </td>
                    <td style={{ padding: '10px 20px', fontWeight: 900, fontSize: '0.8rem', opacity: 0.5 }}>{pt.id}</td>
                    <td style={{ padding: '10px 20px', fontWeight: 800, fontSize: '0.8rem' }}>{pt.condition}</td>
                    <td style={{ padding: '10px 20px', fontWeight: 900, fontSize: '0.85rem' }}>{pt.lastVisit}</td>
                    <td style={{ padding: '10px 20px' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 900, color: styles.text }}>{pt.risk}</span>
                    </td>
                    <td style={{ padding: '10px 20px' }}>
                      <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '4px 10px', 
                        background: styles.badgeBg,
                        color: styles.badgeText,
                        fontSize: '0.6rem',
                        fontWeight: 900
                      }}>
                        <Circle size={6} fill="currentColor" />
                        {pt.status}
                      </div>
                    </td>
                    <td style={{ padding: '10px 20px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <Link href={`/doctor/patients/${pt.id}`} style={{ color: '#000' }} title="View Detailed Profile">
                          <ExternalLink size={16} />
                        </Link>
                        <button 
                          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#000' }}
                          onClick={() => showToast(`Establishing encrypted link to ${pt.name}...`, "info")}
                          title="Message Patient"
                        >
                          <MessageSquare size={16} />
                        </button>
                        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => showToast(`Synchronizing EHR: ${pt.id}`, "success")} title="Access Health Records"><Activity size={16} /></button>
                        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => showToast(`Exporting Clinical Data: ${pt.name}`, "info")} title="Download Records"><Download size={16} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
