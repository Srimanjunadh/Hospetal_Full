"use client";
import { useState, useEffect } from "react";
import { Package, Search, Filter, Plus, ArrowUpRight, AlertTriangle, Archive, RefreshCcw, Download, Trash2, Edit3, ShoppingCart } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";
import { apiService } from "@/services/api";

export default function InventoryPage() {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
      const hId = session?.hospital_id;
      if (!hId) return;

      const data = await apiService.getHospitalInventory(hId);
      if (Array.isArray(data)) {
        // Map backend model to UI format
        const formatted = data.map(item => ({
          id: `INV-${item.id}`,
          name: item.name.toUpperCase(),
          category: (item.category || "UNSPECIFIED").toUpperCase(),
          stock: item.quantity,
          minStock: item.min_threshold,
          expiry: item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : "N/A",
          status: item.quantity <= 0 ? "OUT OF STOCK" : item.quantity <= item.min_threshold ? "LOW STOCK" : "IN STOCK"
        }));
        setInventoryItems(formatted);
      }
    } catch (error) {
      showToast("Failed to fetch inventory data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  const getStatusRowStyle = (status: string) => {
    if (status === 'IN STOCK') return { background: 'rgba(16, 185, 129, 0.05)', borderLeft: '6px solid #10b981' };
    if (status === 'LOW STOCK') return { background: 'rgba(245, 158, 11, 0.05)', borderLeft: '6px solid #f59e0b' };
    if (status === 'OUT OF STOCK') return { background: 'rgba(220, 38, 38, 0.05)', borderLeft: '6px solid #dc2626' };
    return { background: 'transparent', borderLeft: 'none' };
  };

  return (
    <DashboardLayout role="hospital_admin" userName="Admin Manju">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>LOGISTICS COMMAND</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>FACILITY ID: METRO-CORE-01 • GLOBAL SUPPLY REGISTRY</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-outline" onClick={() => showToast("Downloading Manifest...", "info")}>
             <Download size={18} /> EXPORT MANIFEST
          </button>
          <button className="btn-black">
            <Plus size={18} /> ADD NEW ASSET
          </button>
        </div>
      </div>

      <div className="grid-stack" style={{ marginBottom: '3rem' }}>
        <div className="card">
          <p className="card-title">TOTAL ASSET VALUE</p>
          <h2 className="card-value">$284.5K</h2>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: '1rem', color: '#10b981' }}>+2.4% VS PREV. MONTH</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid #dc2626' }}>
          <p className="card-title">CRITICAL DEPLETIONS</p>
          <h2 className="card-value" style={{ color: '#dc2626' }}>
            {inventoryItems.filter(i => i.status === 'LOW STOCK' || i.status === 'OUT OF STOCK').length}
          </h2>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: '1rem', color: '#dc2626' }}>REORDER REQUIRED IMMEDIATELY</p>
        </div>
        <div className="card">
          <p className="card-title">SUPPLY CHAIN NODES</p>
          <h2 className="card-value">12</h2>
          <p style={{ fontSize: '0.75rem', fontWeight: 800, marginTop: '1rem', color: '#000' }}>ACTIVE VENDORS</p>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
            <input 
              type="text" 
              placeholder="SEARCH ASSETS BY IDENTITY, CATEGORY, OR VENDOR" 
              style={{ width: '100%', padding: '15px 16px 15px 50px', background: '#f4f4f5', border: 'none', fontWeight: '700', fontSize: '0.8rem' }}
            />
          </div>
          <button className="btn-outline" onClick={fetchInventory}>
            <RefreshCcw size={18} className={isLoading ? "animate-spin" : ""} /> REFRESH
          </button>
        </div>

        <div className="table-responsive" style={{ border: '2px solid #000' }}>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }} className="custom-scrollbar">
            <table className="data-table" style={{ border: 'none' }}>
              <thead>
                <tr style={{ background: '#000', color: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
                  <th style={{ padding: '12px 20px', fontSize: '0.65rem' }}>S.NO</th>
                  <th style={{ padding: '12px 20px' }}>ASSET IDENTITY</th>
                  <th style={{ padding: '12px 20px' }}>SYSTEM ID</th>
                  <th style={{ padding: '12px 20px' }}>CATEGORY</th>
                  <th style={{ padding: '12px 20px' }}>STOCK LVL</th>
                  <th style={{ padding: '12px 20px' }}>EXPIRY</th>
                  <th style={{ padding: '12px 20px' }}>STATUS</th>
                  <th style={{ padding: '12px 20px' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', fontWeight: 800 }}>SYNCHRONIZING WITH GLOBAL REGISTRY...</td></tr>
                ) : inventoryItems.length === 0 ? (
                  <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', fontWeight: 800 }}>NO ASSETS FOUND IN LOCAL NODE</td></tr>
                ) : inventoryItems.map((item, i) => (
                  <tr key={i} style={getStatusRowStyle(item.status)}>
                    <td style={{ padding: '12px 20px', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <div style={{ width: '32px', height: '32px', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.7rem' }}>{item.name.charAt(0)}</div>
                         <span style={{ fontWeight: '900', fontSize: '0.85rem' }}>{item.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px', fontWeight: 900, fontSize: '0.8rem', opacity: 0.5 }}>{item.id}</td>
                    <td style={{ padding: '12px 20px', fontWeight: 800, fontSize: '0.75rem' }}>{item.category}</td>
                    <td style={{ padding: '12px 20px', fontWeight: 900 }}>{item.stock} <span style={{ fontSize: '0.65rem', opacity: 0.5 }}>/ {item.minStock}</span></td>
                    <td style={{ padding: '12px 20px', fontWeight: 800, fontSize: '0.75rem' }}>{item.expiry}</td>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        padding: '4px 10px', 
                        background: item.status === 'IN STOCK' ? '#ecfdf5' : item.status === 'LOW STOCK' ? '#fff7ed' : '#fef2f2',
                        color: item.status === 'IN STOCK' ? '#059669' : item.status === 'LOW STOCK' ? '#c2410c' : '#dc2626',
                        border: '1px solid currentColor',
                        fontSize: '0.6rem',
                        fontWeight: 900
                      }}>
                         {item.status}
                      </div>
                    </td>
                    <td style={{ padding: '12px 20px' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => showToast(`Initiating Reorder: ${item.id}`, "info")} title="Request Restock"><ShoppingCart size={16} /></button>
                        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer' }} onClick={() => showToast(`Opening Asset Editor: ${item.id}`, "info")} title="Edit Asset"><Edit3 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <style jsx global>{`
          .custom-scrollbar::-webkit-scrollbar { width: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; border-radius: 10px; }
        `}</style>
      </div>
    </DashboardLayout>
  );
}

