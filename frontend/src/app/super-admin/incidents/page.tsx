"use client";
import { useState, useEffect } from "react";
import { Search, Filter, Plus, Hospital, BarChart3, RefreshCcw } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";

export default function IncidentHubPage() {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [incidents, setIncidents] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    // Initial feed load
    setIncidents([]);
  }, []);

  if (!mounted) return null;

  const getPriorityStyle = (p: string) => {
    switch(p) {
      case 'CRITICAL': return { color: '#dc2626', bg: '#fef2f2', border: '1px solid #dc2626' };
      case 'SECURITY': return { color: '#000', bg: '#f4f4f5', border: '2px solid #000' };
      case 'FACILITY': return { color: '#f59e0b', bg: '#fff7ed', border: '1px solid #f59e0b' };
      default: return { color: '#999', bg: '#f4f4f5', border: '1px solid #eee' };
    }
  };

  return (
    <DashboardLayout role="super_admin" userName="Master Admin">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>GLOBAL INCIDENT HUB</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>ROOT RESOLUTION TERMINAL • NETWORK-WIDE ADMINISTRATIVE ISSUES</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-outline" onClick={() => showToast("Auditing Incident Archives...", "info")}>
             <RefreshCcw size={18} /> REFRESH FEED
          </button>
          <button className="btn-black">
            <Plus size={18} /> LOG MANUAL INCIDENT
          </button>
        </div>
      </div>

      <div className="grid-stack" style={{ marginBottom: '3rem' }}>
        <div className="card" style={{ borderLeft: incidents.filter(i => i.priority === 'CRITICAL').length > 0 ? '4px solid #dc2626' : '1px solid #000' }}>
          <p className="card-title" style={{ color: incidents.filter(i => i.priority === 'CRITICAL').length > 0 ? '#dc2626' : '#000' }}>OPEN CRITICAL TICKETS</p>
          <h2 className="card-value" style={{ color: incidents.filter(i => i.priority === 'CRITICAL').length > 0 ? '#dc2626' : '#000' }}>
            {incidents.filter(i => i.priority === 'CRITICAL').length < 10 ? `0${incidents.filter(i => i.priority === 'CRITICAL').length}` : incidents.filter(i => i.priority === 'CRITICAL').length}
          </h2>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: '1rem' }}>
            {incidents.filter(i => i.priority === 'CRITICAL').length > 0 ? 'IMMEDIATE ACTION REQ.' : 'ALL SYSTEMS STABLE'}
          </p>
        </div>
        <div className="card">
          <p className="card-title">AVG RESOLUTION TIME</p>
          <h2 className="card-value">0.0H</h2>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: '1rem', color: '#10b981' }}>SYSTEM OPTIMIZED</p>
        </div>
        <div className="card" style={{ background: '#000', color: '#fff' }}>
          <p className="card-title" style={{ color: 'rgba(255,255,255,0.5)' }}>MOST ACTIVE NODE</p>
          <h2 className="card-value">NONE</h2>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: '1rem', color: '#10b981' }}>STABLE NETWORK OPS</p>
        </div>
      </div>

      {/* Incident Analytics Graph */}
      <div className="card" style={{ padding: '2rem', marginBottom: '3rem' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <h3 style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '2px' }}>NETWORK INCIDENT TREND (24H)</h3>
            <BarChart3 size={18} />
         </div>
         <div style={{ height: '100px', display: 'flex', alignItems: 'flex-end', gap: '6px' }}>
            {[10, 20, 5, 40, 60, 30, 80, 45, 90, 25, 10, 15, 35, 70, 50, 40, 20, 65, 85, 45, 30, 60, 95, 40].map((h, i) => (
              <div key={i} style={{ flex: 1, background: h > 70 ? '#dc2626' : '#000', height: `${h}%`, opacity: (i / 24) + 0.3 }}></div>
            ))}
         </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
            <input 
              type="text" 
              placeholder="FILTER INCIDENTS BY NODE ID, ADMIN NAME, OR PRIORITY" 
              style={{ width: '100%', padding: '15px 16px 15px 50px', background: '#f4f4f5', border: 'none', fontWeight: '700', fontSize: '0.8rem' }}
            />
          </div>
          <button className="btn-outline">
            <Filter size={18} /> PRIORITY
          </button>
        </div>

        <div className="table-responsive" style={{ border: '2px solid #000' }}>
          <table className="data-table">
            <thead>
              <tr style={{ background: '#000', color: '#fff' }}>
                <th style={{ padding: '12px 20px' }}>INCIDENT IDENTITY</th>
                <th style={{ padding: '12px 20px' }}>SOURCE NODE</th>
                <th style={{ padding: '12px 20px' }}>RAISED BY</th>
                <th style={{ padding: '12px 20px' }}>ISSUE DESCRIPTION</th>
                <th style={{ padding: '12px 20px' }}>PRIORITY</th>
                <th style={{ padding: '12px 20px' }}>STATUS</th>
                <th style={{ padding: '12px 20px' }}>RESOLVE</th>
              </tr>
            </thead>
            <tbody>
              {incidents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', opacity: 0.5, fontWeight: 900 }}>NO OPEN INCIDENTS DETECTED</td>
                </tr>
              ) : (
                incidents.map((inc, i) => {
                  const pStyles = getPriorityStyle(inc.priority);
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '15px 20px', fontWeight: 900 }}>{inc.id}</td>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900, fontSize: '0.75rem' }}>
                          <Hospital size={14} /> {inc.facility}
                        </div>
                      </td>
                      <td style={{ padding: '15px 20px', fontWeight: 800, fontSize: '0.75rem', opacity: 0.5 }}>{inc.admin}</td>
                      <td style={{ padding: '15px 20px', fontWeight: 900, fontSize: '0.8rem' }}>{inc.issue}</td>
                      <td style={{ padding: '15px 20px' }}>
                        <span style={{ 
                          padding: '4px 8px', 
                          fontSize: '0.6rem', 
                          fontWeight: 900, 
                          ...pStyles
                        }}>
                          {inc.priority}
                        </span>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '6px', height: '6px', background: inc.status === 'RESOLVED' ? '#10b981' : '#000', borderRadius: '50%' }}></div>
                          <span style={{ fontSize: '0.65rem', fontWeight: 900 }}>{inc.status}</span>
                        </div>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <button 
                          className="btn-black" 
                          style={{ padding: '6px 10px', fontSize: '0.65rem' }}
                          onClick={() => showToast(`Executing Global Fix for ${inc.id}`, "success")}
                        >
                          RESOLVE
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
