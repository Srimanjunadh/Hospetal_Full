"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { CreditCard, Receipt, Download, AlertCircle, CheckCircle2, ArrowUpRight, Zap, ShieldCheck } from "lucide-react";
import { apiService } from "@/services/api";
import { useToast } from "@/components/ToastProvider";
import { motion } from "framer-motion";

export default function PatientBillingPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showToast } = useToast();
  const [userName, setUserName] = useState("Patient");

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const session = JSON.parse(localStorage.getItem("medclues_session") || "null");
        if (session && session.role === 'patient') {
          setUserName(session.name);
          const data = await apiService.getPatientBills(session.id);
          setBills(data);
        }
      } catch (error) {
        showToast("Failed to sync financial node", "error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBills();
  }, []);

  const totalUnpaid = bills
    .filter(b => b.status === 'unpaid')
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <DashboardLayout role="patient" userName={userName}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* Financial Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <Zap size={14} />
              <span style={{ fontSize: '0.6rem', fontWeight: 800, letterSpacing: '2px', opacity: 0.5 }}>FINANCIAL TERMINAL</span>
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-1px' }}>BILLING & SETTLEMENTS</h1>
          </div>
          <div style={{ textAlign: 'right' }}>
             <p style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5, marginBottom: '4px' }}>OUTSTANDING BALANCE</p>
             <h2 style={{ fontSize: '2rem', fontWeight: 900 }}>₹{totalUnpaid.toLocaleString()}</h2>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2.5rem', alignItems: 'stretch' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
            {/* Active Bills */}
            <div className="card" style={{ background: '#fff', padding: '2.5rem', flex: 1, display: 'flex', flexDirection: 'column', marginBottom: 0 }}>
               <h3 style={{ fontSize: '0.8rem', fontWeight: 900, letterSpacing: '1px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                 <Receipt size={18} /> INVOICE HISTORY
               </h3>

               {isLoading ? (
                 <div style={{ padding: '4rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, opacity: 0.2 }}>SYNCHRONIZING...</div>
               ) : bills.length === 0 ? (
                 <div style={{ padding: '4rem', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, opacity: 0.2 }}>NO BILLING RECORDS FOUND</div>
               ) : (
                 <div style={{ maxHeight: '500px', overflowY: 'auto', border: '2px solid var(--bg-side)', flex: 1 }} className="custom-scrollbar">
                   <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f4f4f5', borderBottom: '2px solid var(--bg-side)', textAlign: 'left' }}>
                          <th style={{ padding: '15px 20px', fontSize: '0.65rem', letterSpacing: '1px' }}>S.NO</th>
                          <th style={{ padding: '15px 20px', fontSize: '0.65rem', letterSpacing: '1px' }}>INVOICE IDENTITY</th>
                          <th style={{ padding: '15px 20px', fontSize: '0.65rem', letterSpacing: '1px' }}>FISCAL AMOUNT</th>
                          <th style={{ padding: '15px 20px', fontSize: '0.65rem', letterSpacing: '1px', textAlign: 'right' }}>STATUS / ACTION</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bills.map((bill, i) => (
                          <tr key={bill.id} style={{ borderBottom: '1px solid #eee' }}>
                            <td style={{ padding: '15px 20px', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                            <td style={{ padding: '15px 20px' }}>
                               <div>
                                 <p style={{ fontWeight: 900, fontSize: '0.85rem' }}>{bill.reason.toUpperCase()}</p>
                                 <p style={{ fontSize: '0.6rem', fontWeight: 700, opacity: 0.4 }}>INV-{bill.id.toString().padStart(6, '0')} • {new Date().toLocaleDateString()}</p>
                               </div>
                            </td>
                            <td style={{ padding: '15px 20px', fontWeight: 900, fontSize: '1rem' }}>₹{bill.amount.toLocaleString()}</td>
                            <td style={{ padding: '15px 20px', textAlign: 'right' }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '15px', justifyContent: 'flex-end' }}>
                                  <span style={{ 
                                    fontSize: '0.55rem', 
                                    fontWeight: 900, 
                                    padding: '4px 8px', 
                                    background: bill.status === 'unpaid' ? '#000' : '#f4f4f5',
                                    color: bill.status === 'unpaid' ? '#fff' : '#000',
                                    borderRadius: '2px'
                                  }}>
                                    {bill.status.toUpperCase()}
                                  </span>
                                  <button 
                                    onClick={() => showToast(`Downloading INVOICE ${bill.id}...`, "success")}
                                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', opacity: 0.5 }}
                                  >
                                    <Download size={16} />
                                  </button>
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                   </table>
                 </div>
               )}
               <style jsx global>{`
                 .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                 .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
                 .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; border-radius: 0; }
               `}</style>
            </div>
          </div>

          {/* Sidebar Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', height: '100%' }}>
             <div className="card" style={{ background: '#000', color: '#fff', border: '2px solid #000', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CreditCard size={20} />
                  <h3 style={{ fontSize: '0.75rem', fontWeight: 900, letterSpacing: '1px' }}>QUICK SETTLE</h3>
                </div>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.7, lineHeight: 1.6 }}>
                  Settle your outstanding balance using secure digital assets or standard gateway nodes.
                </p>
                <button 
                  onClick={() => showToast("Payment Gateway Initializing...", "info")}
                  disabled={totalUnpaid === 0}
                  style={{ 
                    width: '100%', 
                    padding: '14px', 
                    background: '#fff', 
                    color: '#000', 
                    border: 'none', 
                    fontWeight: 900, 
                    fontSize: '0.75rem', 
                    cursor: totalUnpaid === 0 ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  PAY NOW <ArrowUpRight size={16} />
                </button>
             </div>

             <div className="card" style={{ padding: '2rem', marginBottom: 0 }}>
                <h4 style={{ fontSize: '0.6rem', fontWeight: 900, letterSpacing: '1px', opacity: 0.4, marginBottom: '1rem' }}>REPORTS</h4>
                <button style={{ width: '100%', padding: '12px', background: 'transparent', border: '2px solid var(--bg-side)', color: 'var(--bg-side)', fontSize: '0.65rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                  <Download size={14} /> EXPORT FISCAL REPORT
                </button>
             </div>

             <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '1rem 0', opacity: 0.4, marginTop: 'auto' }}>
                <ShieldCheck size={16} />
                <span style={{ fontSize: '0.55rem', fontWeight: 800 }}>AES-256 ENCRYPTED TRANSACTION NODE</span>
             </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
