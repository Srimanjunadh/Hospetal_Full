"use client";
import { useEffect, useState } from "react";
import { Package, Search, Truck, CheckCircle, Clock, Pill, Plus, RefreshCcw } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";

export default function PharmacyPage() {
  console.log("Rendering PharmacyPage...");
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const [addingStock, setAddingStock] = useState<{id: number, name: string} | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [stockAmount, setStockAmount] = useState(0);
  const [nurseRequests, setNurseRequests] = useState<any[]>([]);
  const [preparedOrders, setPreparedOrders] = useState<Set<number>>(new Set());
  const [preparedNurseRequests, setPreparedNurseRequests] = useState<Set<number>>(new Set());
  
  const [formData, setFormData] = useState({
    name: "",
    category: "Medicine",
    quantity: 0,
    min_threshold: 50
  });

  const fetchOrders = async () => {
    try {
      const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
      const hId = session?.hospital_id;
      if (!hId) return;

      const { apiService } = await import("@/services/api");
      const data = await apiService.getPharmacyOrders(hId);
      setOrders(data.map((o: any) => ({
        dbId: o.id,
        id: `ORD-${o.id.toString().padStart(4, '0')}`,
        patient: o.patient?.name?.toUpperCase() || "UNKNOWN",
        status: o.status.toUpperCase(),
        medicines: Array.isArray(o.medicines) ? o.medicines.map((m: any) => `${m.medicine || m.name} (x${m.amount || m.quantity})`).join(", ") : "NO DETAIL",
        time: new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      })));
      setLoading(false);
    } catch (e) { console.error(e); }
  };

  const handleMarkOrderDone = async (id: number) => {
    try {
      const { apiService } = await import("@/services/api");
      await apiService.markDoctorOrderDone(id);
      showToast("DOCTOR ORDER DISPATCHED & STOCK UPDATED", "success");
      fetchOrders();
      fetchInventory();
      setPreparedOrders(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (e) { showToast("Operation failed", "error"); }
  };

  const fetchInventory = async () => {
    try {
      const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
      const hId = session?.hospital_id;
      
      const { apiService } = await import("@/services/api");
      const data = await apiService.getHospitalInventory(hId);
      setInventory(data.filter((item: any) => item.category === "Pharmacy" || item.category === "Medicine"));
    } catch (e: any) { 
      console.error("Inventory Fetch Error:", e.message); 
    }
  };

  const fetchNurseRequests = async () => {
    try {
      const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
      const { apiService } = await import("@/services/api");
      const data = await apiService.getPharmacyNurseRequests(session.hospital_id);
      setNurseRequests(data);
    } catch (e) { console.error(e); }
  };

  const handleMarkRequestDone = async (id: number) => {
    try {
      const { apiService } = await import("@/services/api");
      await apiService.markNurseRequestDone(id);
      showToast("NURSE REQUEST DISPATCHED & STOCK UPDATED", "success");
      fetchNurseRequests();
      fetchInventory();
      setPreparedNurseRequests(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (e) { showToast("Operation failed", "error"); }
  };

  const handleAddStock = async () => {
    if (!addingStock) return;
    try {
      const { apiService } = await import("@/services/api");
      await apiService.addStock(addingStock.id, stockAmount);
      showToast(`Added ${stockAmount} units to ${addingStock.name}`, "success");
      setAddingStock(null);
      setStockAmount(0);
      fetchInventory();
    } catch (e) { showToast("Failed to update stock", "error"); }
  };

  const handleSaveItem = async () => {
    try {
      const { apiService } = await import("@/services/api");
      const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
      
      if (editingItem) {
        await apiService.updateInventoryItem(editingItem.id, formData);
        showToast("Item updated successfully", "success");
      } else {
        await apiService.createInventoryItem({ ...formData, hospital_id: session.hospital_id });
        showToast("New medicine registered", "success");
      }
      
      setIsAddingNew(false);
      setEditingItem(null);
      setFormData({ name: "", category: "Medicine", quantity: 0, min_threshold: 50 });
      fetchInventory();
    } catch (e) { showToast("Operation failed", "error"); }
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm("Are you sure you want to remove this item?")) return;
    try {
      const { apiService } = await import("@/services/api");
      await apiService.deleteInventoryItem(id);
      showToast("Item removed", "success");
      fetchInventory();
    } catch (e) { showToast("Deletion failed", "error"); }
  };

  useEffect(() => { 
    fetchOrders(); 
    fetchInventory();
    fetchNurseRequests();
  }, []);

  return (
    <DashboardLayout role="hospital_admin" userName="Pharmacy Node">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>PHARMACY DISPENSARY</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>STATION: PHARMA-CORE-09 • READY FOR DISPENSING</p>
        </div>
        <button className="btn-black" onClick={() => setIsAddingNew(true)}>
          <Plus size={18} /> ADD NEW MEDICINE
        </button>
      </div>      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card" style={{ borderLeft: '8px solid #000' }}>
          <p className="card-title" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>NODE STATUS</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 10px #10b981' }}></div>
            <h2 className="card-value" style={{ fontSize: '1.25rem' }}>OPERATIONAL</h2>
          </div>
        </div>
        <div className="card">
          <p className="card-title" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>PENDING QUEUE</p>
          <h2 className="card-value" style={{ fontSize: '1.5rem' }}>{orders.length + nurseRequests.length}</h2>
        </div>
        <div className="card">
          <p className="card-title" style={{ fontSize: '0.6rem', letterSpacing: '1px' }}>STORAGE LOAD</p>
          <h2 className="card-value" style={{ fontSize: '1.5rem' }}>82.4%</h2>
        </div>
        <div className="card" style={{ background: '#000', color: '#fff' }}>
          <p className="card-title" style={{ fontSize: '0.6rem', letterSpacing: '1px', color: '#666' }}>TEMP CONTROL</p>
          <h2 className="card-value" style={{ fontSize: '1.5rem', color: '#fff' }}>4.2°C</h2>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start', marginBottom: '3rem' }}>
        {/* Active Medication Orders Card */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', border: '2px solid #000' }}>
          <div style={{ padding: '1.2rem 1.5rem', background: '#000', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '1px' }}>DOCTOR ORDERS</h3>
            <span style={{ fontSize: '0.55rem', fontWeight: 900, background: '#dc2626', color: '#fff', padding: '4px 8px', borderRadius: '2px' }}>{orders.length} PENDING</span>
          </div>
          
          <div style={{ width: '100%', overflowX: 'auto', height: '400px', overflowY: 'auto' }} className="custom-scrollbar">
            <table className="data-table" style={{ border: 'none', minWidth: '100%' }}>
              <thead>
                <tr style={{ textAlign: 'left', background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
                  <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.6rem' }}>S.NO</th>
                  <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.6rem' }}>PATIENT</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.6rem' }}>MEDS</th>
                  <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.6rem', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                   <tr><td colSpan={4} style={{ textAlign: 'center', padding: '3rem', opacity: 0.3, fontWeight: 900 }}>EMPTY</td></tr>
                ) : orders.map((ord, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee', background: preparedOrders.has(ord.dbId) ? '#f0fdf4' : 'transparent' }}>
                    <td style={{ padding: '1.2rem 1.5rem', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                    <td style={{ padding: '1.2rem 1.5rem', fontWeight: 900, fontSize: '0.75rem' }}>{ord.patient}</td>
                    <td style={{ padding: '1.2rem 1rem', fontSize: '0.65rem', fontWeight: 700 }}>{ord.medicines}</td>
                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>
                       <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                         {!preparedOrders.has(ord.dbId) ? (
                           <button onClick={() => setPreparedOrders(new Set(preparedOrders).add(ord.dbId))} style={{ background: '#f4f4f5', border: '1px solid #000', padding: '6px 10px', fontSize: '0.55rem', fontWeight: 900, cursor: 'pointer' }}>ADD</button>
                         ) : (
                           <button onClick={() => handleMarkOrderDone(ord.dbId)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 10px', fontSize: '0.55rem', fontWeight: 900, cursor: 'pointer' }}>DONE</button>
                         )}
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Nurse Medicine Requests Card */}
        <div className="card" style={{ padding: '0', overflow: 'hidden', border: '2px solid #000' }}>
          <div style={{ padding: '1.2rem 1.5rem', background: '#000', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 900, fontSize: '0.75rem', letterSpacing: '1px' }}>NURSE REQUESTS</h3>
            <span style={{ fontSize: '0.55rem', fontWeight: 900, background: '#10b981', color: '#fff', padding: '4px 8px', borderRadius: '2px' }}>{nurseRequests.length} ACTIVE</span>
          </div>
          
          <div style={{ width: '100%', overflowX: 'auto', height: '400px', overflowY: 'auto' }} className="custom-scrollbar">
            <table className="data-table" style={{ border: 'none', minWidth: '100%' }}>
              <thead>
                <tr style={{ textAlign: 'left', background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
                  <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.6rem' }}>S.NO</th>
                  <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.6rem' }}>PATIENT</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.6rem' }}>MEDS</th>
                  <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.6rem', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {nurseRequests.length === 0 ? (
                   <tr><td colSpan={4} style={{ textAlign: 'center', padding: '3rem', opacity: 0.3, fontWeight: 900 }}>EMPTY</td></tr>
                ) : nurseRequests.map((req, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee', background: preparedNurseRequests.has(req.id) ? '#f0fdf4' : 'transparent' }}>
                    <td style={{ padding: '1.2rem 1.5rem', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                    <td style={{ padding: '1.2rem 1.5rem', fontWeight: 900, fontSize: '0.75rem' }}>{req.patient_name.toUpperCase()}</td>
                    <td style={{ padding: '1.2rem 1rem', fontSize: '0.65rem', fontWeight: 700 }}>
                       {req.medicines.slice(0, 2).map((m: any, j: number) => (
                         <div key={j} style={{ color: m.source === 'nurse' ? '#dc2626' : '#000' }}>{m.name}</div>
                       ))}
                       {req.medicines.length > 2 && <div style={{ opacity: 0.5 }}>+{req.medicines.length - 2} more</div>}
                    </td>
                    <td style={{ padding: '1.2rem 1.5rem', textAlign: 'right' }}>
                       <div style={{ display: 'flex', gap: '5px', justifyContent: 'flex-end' }}>
                         {!preparedNurseRequests.has(req.id) ? (
                           <button onClick={() => setPreparedNurseRequests(new Set(preparedNurseRequests).add(req.id))} style={{ background: '#f4f4f5', border: '1px solid #000', padding: '6px 10px', fontSize: '0.55rem', fontWeight: 900, cursor: 'pointer' }}>ADD</button>
                         ) : (
                           <button onClick={() => handleMarkRequestDone(req.id)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 10px', fontSize: '0.55rem', fontWeight: 900, cursor: 'pointer' }}>DONE</button>
                         )}
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Stock Management Card - FULL WIDTH */}
      <div className="card" style={{ padding: '0', overflow: 'hidden', border: '2px solid #000', marginBottom: '3rem' }}>
        <div style={{ padding: '1.5rem 2rem', background: '#fff', borderBottom: '2px solid #000', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontWeight: 900, fontSize: '0.8rem', letterSpacing: '2px' }}>STOCK MANAGEMENT (MASTER INVENTORY)</h3>
          <button className="btn-black" style={{ padding: '8px', borderRadius: '4px' }} onClick={fetchInventory}>
            <RefreshCcw size={14} />
          </button>
        </div>
        
        <div style={{ width: '100%', overflowX: 'auto', maxHeight: '500px', overflowY: 'auto' }} className="custom-scrollbar">
          <table className="data-table" style={{ border: 'none', minWidth: '100%' }}>
            <thead>
              <tr style={{ textAlign: 'left', background: '#f8fafc', position: 'sticky', top: 0, zIndex: 10 }}>
                <th style={{ padding: '1rem 2rem', fontSize: '0.65rem', letterSpacing: '1px' }}>S.NO</th>
                <th style={{ padding: '1rem 2rem', fontSize: '0.65rem', letterSpacing: '1px' }}>ITEM</th>
                <th style={{ padding: '1rem 1rem', fontSize: '0.65rem', letterSpacing: '1px' }}>STATUS</th>
                <th style={{ padding: '1rem 1rem', fontSize: '0.65rem', letterSpacing: '1px' }}>CURRENT STOCK</th>
                <th style={{ padding: '1rem 1rem', fontSize: '0.65rem', letterSpacing: '1px' }}>UNIT PRICE</th>
                <th style={{ padding: '1rem 2rem', fontSize: '0.65rem', letterSpacing: '1px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '4rem', opacity: 0.3, fontWeight: 900 }}>NO INVENTORY TRACKED</td></tr>
              ) : inventory.map((item, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '1.2rem 2rem', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                  <td style={{ padding: '1.2rem 2rem' }}>
                     <p style={{ fontWeight: 900, fontSize: '0.85rem' }}>{item.name}</p>
                     <p style={{ fontSize: '0.6rem', opacity: 0.5, fontWeight: 700 }}>{item.category.toUpperCase()}</p>
                  </td>
                  <td style={{ padding: '1.2rem 1rem' }}>
                     <span style={{ 
                       padding: '4px 8px', 
                       fontSize: '0.55rem', 
                       fontWeight: 900, 
                       background: item.quantity <= item.min_threshold ? '#fee2e2' : '#dcfce7',
                       color: item.quantity <= item.min_threshold ? '#dc2626' : '#10b981',
                       borderRadius: '4px'
                     }}>
                       {item.quantity <= item.min_threshold ? 'CRITICAL STOCK' : 'IN STOCK'}
                     </span>
                  </td>
                  <td style={{ padding: '1.2rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 900, fontSize: '0.9rem' }}>
                        {item.quantity} UNITS
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1.2rem 1rem', fontWeight: 800, fontSize: '0.8rem' }}>
                    ${item.unit_price?.toFixed(2) || "0.00"}
                  </td>
                  <td style={{ padding: '1.2rem 2rem', textAlign: 'right' }}>
                     <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button 
                          onClick={() => setAddingStock({id: item.id, name: item.name})}
                          style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 12px', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer' }}
                        >
                          STOCK +
                        </button>
                        <button 
                          onClick={() => {
                            setEditingItem(item);
                            setFormData({ name: item.name, category: item.category, quantity: item.quantity, min_threshold: item.min_threshold });
                            setIsAddingNew(true);
                          }}
                          style={{ background: '#000', color: '#fff', border: 'none', padding: '8px 12px', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer' }}
                        >
                          EDIT
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '8px 12px', fontSize: '0.6rem', fontWeight: 900, cursor: 'pointer' }}
                        >
                          DEL
                        </button>
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
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; border-radius: 10px; }
        `}</style>
      </div>

      {/* Add Stock Modal */}
      {addingStock && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} onClick={() => setAddingStock(null)} />
          <div style={{ width: '400px', background: '#fff', position: 'relative', border: '4px solid #000', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '1rem' }}>REPLENISH STOCK</h2>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '1.5rem' }}>Item: {addingStock.name}</p>
            
            <label style={{ fontSize: '0.65rem', fontWeight: 900, display: 'block', marginBottom: '8px' }}>QUANTITY TO ADD</label>
            <input 
              type="number" 
              value={stockAmount} 
              onChange={(e) => setStockAmount(parseInt(e.target.value))}
              style={{ width: '100%', padding: '12px', border: '2px solid #000', marginBottom: '1.5rem', fontWeight: 900 }}
            />
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setAddingStock(null)} style={{ flex: 1, padding: '12px', border: '2px solid #000', background: '#fff', fontWeight: 900, cursor: 'pointer' }}>CANCEL</button>
              <button onClick={handleAddStock} style={{ flex: 1, padding: '12px', background: '#000', color: '#fff', border: 'none', fontWeight: 900, cursor: 'pointer' }}>CONFIRM</button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Medicine Modal */}
      {isAddingNew && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }} onClick={() => { setIsAddingNew(false); setEditingItem(null); }} />
          <div style={{ width: '500px', background: '#fff', position: 'relative', border: '4px solid #000', padding: '2.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, marginBottom: '2rem' }}>{editingItem ? 'EDIT MEDICINE' : 'REGISTER NEW MEDICINE'}</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div>
                  <label style={{ fontSize: '0.65rem', fontWeight: 900, display: 'block', marginBottom: '8px' }}>MEDICINE NAME</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. PARACETAMOL 500MG"
                    style={{ width: '100%', padding: '12px', border: '2px solid #000', fontWeight: 900 }}
                  />
               </div>
               <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                     <label style={{ fontSize: '0.65rem', fontWeight: 900, display: 'block', marginBottom: '8px' }}>INITIAL QTY</label>
                     <input 
                       type="number" 
                       value={formData.quantity} 
                       onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value)})}
                       style={{ width: '100%', padding: '12px', border: '2px solid #000', fontWeight: 900 }}
                     />
                  </div>
                  <div>
                     <label style={{ fontSize: '0.65rem', fontWeight: 900, display: 'block', marginBottom: '8px' }}>MIN THRESHOLD</label>
                     <input 
                       type="number" 
                       value={formData.min_threshold} 
                       onChange={(e) => setFormData({...formData, min_threshold: parseInt(e.target.value)})}
                       style={{ width: '100%', padding: '12px', border: '2px solid #000', fontWeight: 900 }}
                     />
                  </div>
               </div>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2.5rem' }}>
              <button onClick={() => { setIsAddingNew(false); setEditingItem(null); }} style={{ flex: 1, padding: '15px', border: '2px solid #000', background: '#fff', fontWeight: 900, cursor: 'pointer' }}>CANCEL</button>
              <button onClick={handleSaveItem} style={{ flex: 1, padding: '15px', background: '#000', color: '#fff', border: 'none', fontWeight: 900, cursor: 'pointer' }}>{editingItem ? 'UPDATE RECORD' : 'CREATE RECORD'}</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
