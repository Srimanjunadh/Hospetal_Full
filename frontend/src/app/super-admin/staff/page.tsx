"use client";
import { useState, useEffect } from "react";
import { Users, UserPlus, Search, Filter, ShieldCheck, Activity, Key, SwitchCamera, Trash2, Globe, Hospital, Star } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";

export default function GlobalStaffPage() {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [globalStaff, setGlobalStaff] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    // Fetch logic here
    setGlobalStaff([]);
  }, []);

  if (!mounted) return null;

  return (
    <DashboardLayout role="super_admin" userName="Master Admin">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>GLOBAL PERSONNEL HUB</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>ROOT DIRECTORY • CROSS-FACILITY WORKFORCE MANAGEMENT</p>
        </div>
        <button className="btn-black">
          <UserPlus size={18} /> REGISTER GLOBAL STAFF
        </button>
      </div>

      <div className="grid-stack" style={{ marginBottom: '3rem' }}>
        <div className="card">
          <p className="card-title">GLOBAL FORCE</p>
          <h2 className="card-value">{globalStaff.length}</h2>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: '1rem', color: globalStaff.length > 0 ? '#10b981' : '#666' }}>
            {globalStaff.length > 0 ? `+${globalStaff.length} ACTIVE NODES` : 'NO REGISTERED PERSONNEL'}
          </p>
        </div>
        <div className="card">
          <p className="card-title">NETWORK UTILIZATION</p>
          <h2 className="card-value">0.0%</h2>
          <div style={{ height: '8px', background: '#f4f4f5', marginTop: '1rem', border: '1px solid #000' }}>
             <div style={{ width: '0%', height: '100%', background: '#000' }}></div>
          </div>
        </div>
        <div className="card">
          <p className="card-title">SECURITY CLEARANCE</p>
          <h2 className="card-value">ROOT</h2>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: '1rem', color: '#dc2626' }}>MAXIMUM AUTHORITY ACTIVE</p>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
            <input 
              type="text" 
              placeholder="SEARCH ACROSS ALL FACILITIES BY IDENTITY, ROLE, OR NODE ID" 
              style={{ width: '100%', padding: '15px 16px 15px 50px', background: '#f4f4f5', border: 'none', fontWeight: '700', fontSize: '0.8rem' }}
            />
          </div>
          <button className="btn-outline">
            <Filter size={18} /> NODE FILTER
          </button>
        </div>

        <div className="table-responsive" style={{ border: '2px solid #000' }}>
          <table className="data-table">
            <thead>
              <tr style={{ background: '#000', color: '#fff' }}>
                <th style={{ padding: '12px 20px', fontSize: '0.65rem' }}>S.NO</th>
                <th style={{ padding: '12px 20px' }}>IDENTITY</th>
                <th style={{ padding: '12px 20px' }}>FACILITY</th>
                <th style={{ padding: '12px 20px' }}>SYSTEM ROLE</th>
                <th style={{ padding: '12px 20px' }}>RANK</th>
                <th style={{ padding: '12px 20px' }}>STATUS</th>
                <th style={{ padding: '12px 20px' }}>ROOT ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {globalStaff.map((p, i) => (
                <tr key={i} style={{ 
                  borderBottom: '1px solid #eee',
                  background: p.status === 'SUSPENDED' ? 'rgba(220, 38, 38, 0.05)' : 'transparent',
                  borderLeft: p.status === 'SUSPENDED' ? '6px solid #dc2626' : 'none'
                }}>
                  <td style={{ padding: '15px 20px', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <div style={{ width: '32px', height: '32px', background: p.status === 'SUSPENDED' ? '#dc2626' : '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.7rem' }}>{p.name.charAt(0)}</div>
                       <div>
                         <p style={{ fontWeight: '900', fontSize: '0.85rem' }}>{p.name}</p>
                         <p style={{ fontSize: '0.65rem', color: '#999', fontWeight: 700 }}>{p.id}</p>
                       </div>
                    </div>
                  </td>
                  <td style={{ padding: '15px 20px', fontWeight: 900, fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Hospital size={14} /> {p.facility}
                    </div>
                  </td>
                  <td style={{ padding: '15px 20px', fontWeight: 800, fontSize: '0.75rem' }}>{p.role}</td>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 900, fontSize: '0.8rem' }}>
                      <Star size={12} fill="#000" /> {p.rating}
                    </div>
                  </td>
                  <td style={{ padding: '15px 20px' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 900, color: p.status === 'ACTIVE' ? '#10b981' : p.status === 'SUSPENDED' ? '#dc2626' : '#999' }}>{p.status}</span>
                  </td>
                  <td style={{ padding: '15px 20px' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => showToast(`Resetting Credentials for ${p.id}`, "info")} title="Reset Token"><Key size={16} /></button>
                      <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => showToast(`Initiating Node Transfer for ${p.name}`, "info")} title="Transfer Node"><SwitchCamera size={16} /></button>
                      <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#dc2626' }} onClick={() => showToast(`GLOBAL ACCESS REVOKED: ${p.id}`, "error")} title="Revoke Access"><Trash2 size={16} /></button>
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
