"use client";
import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  ArrowRightLeft, 
  RefreshCcw, 
  ShoppingCart, 
  Hospital, 
  Zap,
  TrendingUp,
  AlertTriangle,
  FileText,
  Clock
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";

export default function InventoryPage() {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  
  const globalInventory = [
    { id: "INV-8821", name: "AMOXICILLIN 500MG", facility: "METRO CORE", stock: 1240, status: "OPTIMAL" },
    { id: "INV-4402", name: "SURGICAL GLOVES (L)", facility: "SUBURBAN WING", stock: 150, status: "LOW STOCK" },
    { id: "INV-9012", name: "VENTILATOR FILTERS", facility: "RESEARCH HUB", stock: 12, status: "CRITICAL" },
    { id: "INV-3311", name: "PARACETAMOL IV", facility: "METRO CORE", stock: 0, status: "OUT OF STOCK" },
    { id: "INV-1155", name: "SYRINGES (5ML)", facility: "TRAUMA UNIT", stock: 5000, status: "OPTIMAL" },
    { id: "INV-6677", name: "MRI CONTRAST AGENT", facility: "RESEARCH HUB", stock: 45, status: "LOW STOCK" },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getStatusRowStyle = (status: string) => {
    switch (status) {
      case 'OPTIMAL': return { borderLeft: '6px solid #10b981' };
      case 'LOW STOCK': return { borderLeft: '6px solid #f59e0b' };
      case 'CRITICAL': 
      case 'OUT OF STOCK': return { borderLeft: '6px solid #dc2626' };
      default: return {};
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPTIMAL': return '#10b981';
      case 'LOW STOCK': return '#f59e0b';
      case 'CRITICAL':
      case 'OUT OF STOCK': return '#dc2626';
      default: return '#000';
    }
  };

  return (
    <DashboardLayout role="super_admin" userName="Master Admin">
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>GLOBAL STOCK CTRL</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '1px' }}>ROOT LOGISTICS • NETWORK SUPPLY CHAIN MONITOR</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <ArrowRightLeft size={18} /> REALLOCATE
          </button>
          <button className="btn-black" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart size={18} /> BULK PROCUREMENT
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-stack" style={{ marginBottom: '3rem' }}>
        <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
          <p className="card-title">GLOBAL ASSET VALUE</p>
          <h2 className="card-value">$1.82M</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1rem', color: '#10b981' }}>
            <TrendingUp size={14} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>+4.2% NETWORK GROWTH</span>
          </div>
        </div>
        
        <div className="card" style={{ borderLeft: '4px solid #dc2626' }}>
          <p className="card-title">SHORTAGE NODES</p>
          <h2 className="card-value" style={{ color: '#dc2626' }}>06</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1rem', color: '#dc2626' }}>
            <AlertTriangle size={14} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>ACROSS 4 FACILITIES</span>
          </div>
        </div>

        <div className="card">
          <p className="card-title">EXPIRY SENTINEL</p>
          <h2 className="card-value">24</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1rem', opacity: 0.6 }}>
            <Clock size={14} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>ITEMS EXPIRE &lt; 30D</span>
          </div>
        </div>
      </div>

      {/* Main Inventory Control */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} size={18} />
            <input 
              type="text" 
              placeholder="SEARCH ACROSS ALL FACILITY INVENTORIES BY ASSET NAME, NODE ID, OR CATEGORY" 
              style={{ width: '100%', padding: '15px 16px 15px 50px', background: '#f4f4f5', border: 'none', fontWeight: '700', fontSize: '0.8rem', outline: 'none' }}
            />
          </div>
          <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
            <Filter size={18} /> <span>FILTER</span>
          </button>
          <button className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={18} /> EXPORT
          </button>
        </div>

        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>ASSET IDENTITY</th>
                <th>FACILITY NODE</th>
                <th>STOCK LEVEL</th>
                <th>STATUS</th>
                <th>ROOT ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {globalInventory.map((item, i) => (
                <tr key={item.id} style={getStatusRowStyle(item.status)}>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <div style={{ 
                         width: '36px', 
                         height: '36px', 
                         background: '#000', 
                         color: '#fff', 
                         display: 'flex', 
                         alignItems: 'center', 
                         justifyContent: 'center', 
                         fontWeight: 900, 
                         fontSize: '0.75rem' 
                       }}>
                         {item.name.charAt(0)}
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column' }}>
                         <span style={{ fontWeight: '900', fontSize: '0.85rem' }}>{item.name}</span>
                         <span style={{ fontSize: '0.65rem', fontWeight: 700, opacity: 0.5 }}>{item.id}</span>
                       </div>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem', fontWeight: 900, fontSize: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Hospital size={14} /> {item.facility}
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem', fontWeight: 900 }}>
                    {item.stock.toLocaleString()}
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(item.status) }}></div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 900, color: getStatusColor(item.status) }}>
                        {item.status}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button 
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }} 
                        onClick={() => showToast(`Initiating Bulk Reorder for ${item.name}`, "info")}
                        title="Bulk Procurement"
                      >
                        <ShoppingCart size={18} />
                      </button>
                      <button 
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                        onClick={() => showToast(`Triggering Quick Restock for ${item.name}`, "success")}
                        title="Quick Restock"
                      >
                        <Zap size={18} />
                      </button>
                      <button 
                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                        onClick={() => showToast(`Refreshing sync for ${item.id}`, "info")}
                        title="Sync Data"
                      >
                        <RefreshCcw size={18} />
                      </button>
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
