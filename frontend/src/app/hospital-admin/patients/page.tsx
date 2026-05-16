"use client";
import { useEffect, useState } from "react";
import { Users, Search, Filter, Bed, Activity, User, ShieldCheck, Heart, MapPin, Calendar, Clock } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";
import { motion } from "framer-motion";

export default function PatientRegistryPage() {
  const { showToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [hospitalId, setHospitalId] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
    if (session?.hospital_id) {
      setHospitalId(session.hospital_id);
      fetchPatientRegistry(session.hospital_id);
    }
  }, []);

  const fetchPatientRegistry = async (hId: number) => {
    setLoading(true);
    try {
      const { apiService } = await import("@/services/api");
      
      // Fetch patients and admissions in parallel
      const [patientData, admissionData] = await Promise.all([
        apiService.getPatients(hId),
        apiService.getAdmissions() // This might need hospital_id filtering if API supports it
      ]);

      // Map admissions to patients for room info
      const roomMapping = new Map();
      admissionData.forEach((adm: any) => {
        if (adm.status === "admitted" && adm.room_number) {
          roomMapping.set(adm.patient_id, adm.room_number);
        }
      });

      const mappedPatients = patientData.map((p: any) => ({
        ...p,
        room: roomMapping.get(p.id) || "OUTPATIENT",
        status: roomMapping.has(p.id) ? "IN-PATIENT" : "OUT-PATIENT",
        doctorName: p.assigned_doctor?.user?.name || "NOT ASSIGNED",
        nurseName: p.assigned_nurse?.name || "NOT ASSIGNED"
      }));

      setPatients(mappedPatients);
    } catch (error) {
      showToast("Identity sync failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.room.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <DashboardLayout role="hospital_admin" userName="Admin Manju">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>PATIENT REGISTRY</h1>
          <p style={{ color: 'var(--text-secondary)', fontWeight: 700 }}>READ-ONLY ACCESS • GLOBAL FACILITY PATIENT AUDIT</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <div style={{ padding: '10px 20px', background: '#000', color: '#fff', fontSize: '0.7rem', fontWeight: 900 }}>
              TOTAL REGISTRY: {patients.length}
           </div>
        </div>
      </div>

      <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} size={18} />
            <input 
              type="text" 
              placeholder="SEARCH PATIENTS BY NAME, ID, OR ROOM" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '15px 16px 15px 50px', background: '#f4f4f5', border: 'none', fontWeight: '700', fontSize: '0.8rem' }}
            />
          </div>
          <button className="btn-outline" onClick={() => fetchPatientRegistry(hospitalId!)}>
            <Activity size={18} /> SYNC REGISTRY
          </button>
        </div>

        <div className="table-responsive" style={{ border: '2px solid #000' }}>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }} className="custom-scrollbar">
            <table className="data-table" style={{ border: 'none' }}>
              <thead>
                <tr style={{ background: '#000', color: '#fff', position: 'sticky', top: 0, zIndex: 10 }}>
                  <th style={{ padding: '12px 20px', fontSize: '0.65rem' }}>S.NO</th>
                  <th style={{ padding: '12px 20px' }}>PATIENT IDENTITY</th>
                  <th style={{ padding: '12px 20px' }}>LOCATION / AGE</th>
                  <th style={{ padding: '12px 20px' }}>CARE TEAM</th>
                  <th style={{ padding: '12px 20px' }}>FACILITY STATUS</th>
                  <th style={{ padding: '12px 20px' }}>ROOM/BED</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', fontWeight: 900 }}>SYNCHRONIZING SECURE NODE DATA...</td>
                  </tr>
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '4rem', fontWeight: 900 }}>NO PATIENT RECORDS FOUND</td>
                  </tr>
                ) : filteredPatients.map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '15px 20px', fontWeight: 900, fontSize: '0.75rem', opacity: 0.3 }}>{(i + 1).toString().padStart(2, '0')}</td>
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <div style={{ width: '35px', height: '35px', background: '#f4f4f5', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, border: '1px solid #000' }}>
                           <User size={18} />
                         </div>
                         <div>
                           <p style={{ fontWeight: '900', fontSize: '0.85rem' }}>{p.name.toUpperCase()}</p>
                           <p style={{ fontSize: '0.65rem', color: '#999', fontWeight: 700 }}>ID: {p.username}</p>
                         </div>
                      </div>
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800 }}>
                            <MapPin size={12} /> {p.location || "N/A"}
                         </div>
                         <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.5 }}>AGE: {p.age || "N/A"}</div>
                      </div>
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '6px', height: '6px', background: '#3b82f6', borderRadius: '50%' }}></div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>DR. {p.doctorName.split(' ').pop().toUpperCase()}</span>
                         </div>
                         <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 900 }}>NRS. {p.nurseName.split(' ').pop().toUpperCase()}</span>
                         </div>
                      </div>
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        fontSize: '0.6rem', 
                        fontWeight: 900, 
                        background: p.status === 'IN-PATIENT' ? '#000' : '#f4f4f5',
                        color: p.status === 'IN-PATIENT' ? '#fff' : '#000',
                        border: '1px solid #000'
                      }}>{p.status}</span>
                    </td>
                    <td style={{ padding: '15px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 900, color: p.room === 'OUTPATIENT' ? '#999' : '#000' }}>
                         <Bed size={16} />
                         <span style={{ fontSize: '0.85rem' }}>{p.room}</span>
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
      
      <div style={{ textAlign: 'center', opacity: 0.3, marginTop: '2rem' }}>
         <p style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '2px' }}>MEDICHAIN+ SECURE AUDIT PROTOCOL • VIEW-ONLY TERMINAL</p>
      </div>
    </DashboardLayout>
  );
}
