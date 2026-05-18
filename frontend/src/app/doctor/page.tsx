"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Users,
  Clock,
  MessageSquare,
  Plus,
  ArrowRight,
  AlertCircle,
  FileText,
  TrendingUp,
  Heart,
  Zap,
  Globe,
  Cpu,
  FlaskConical,
  Bell,
  Search,
  CheckCircle,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/components/ToastProvider";

export default function DoctorDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [sessionUser, setSessionUser] = useState("Dr. Sarah Smith");
  const [stationId, setStationId] = useState("MED-ALPHA-09");
  const [highRiskPatients, setHighRiskPatients] = useState<any[]>([]);
  const [queue, setQueue] = useState<any[]>([]);
  const [pendingAppointments, setPendingAppointments] = useState<any[]>([]);
  const [riskScore, setRiskScore] = useState<any>(null);
  const { showToast } = useToast();

  const fetchDoctorData = async (doctorId: number) => {
    try {
      const { apiService } = await import("@/services/api");

      // Fetch Patients
      const patients = await apiService.getAssignedPatients(doctorId);
      setHighRiskPatients(
        patients.map((p: any) => ({
          name: p.name.toUpperCase(),
          status: "STABLE",
          vitals: "72 BPM",
          condition: "ROUTINE CHECKUP",
          id: p.username,
          dbId: p.id,
        })),
      );

      // Fetch Appointments
      const allAppts = await apiService.getDoctorAppointments(doctorId);
      setPendingAppointments(
        allAppts.filter((a: any) => a.status === "admin_approved"),
      );
      setQueue(
        allAppts
          .filter((a: any) => a.status === "scheduled")
          .map((a: any) => ({
            name: a.patient.name.toUpperCase(),
            id: a.patient.username,
            type: a.type.toUpperCase(),
            time: a.scheduled_at
              ? new Date(a.scheduled_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "TBD",
            status: "CONFIRMED",
          })),
      );
    } catch (e) {
      console.error("Clinical sync failed:", e);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const { apiService } = await import("@/services/api");
      const appt = pendingAppointments.find((a) => a.id === id);
      await apiService.updateAppointment(id, {
        status: "scheduled",
        scheduled_at: new Date().toISOString(), // Or take from a picker
      });
      const session = JSON.parse(
        localStorage.getItem("medichain_session") || "null",
      );
      fetchDoctorData(session.doctor_id);
    } catch (e) {
      console.error("Approval failed:", e);
    }
  };

  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Clinical Status");
  const [prescription, setPrescription] = useState({
    medicine: "",
    power: "",
    amount: "",
  });
  const [testName, setTestName] = useState("");
  const [queuedTests, setQueuedTests] = useState<string[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [prescribedMedsList, setPrescribedMedsList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchInventory = async (hospitalId: number) => {
    try {
      const { apiService } = await import("@/services/api");
      const data = await apiService.getHospitalInventory(hospitalId);
      // Mock if empty for demo
      const items =
        data.length > 0
          ? data
          : [
              {
                name: "PARACETAMOL",
                quantity: 500,
                unit_price: 10,
                power: "500MG",
              },
              {
                name: "AMOXICILLIN",
                quantity: 0,
                unit_price: 25,
                power: "250MG",
              },
              {
                name: "IBUPROFEN",
                quantity: 150,
                unit_price: 15,
                power: "400MG",
              },
              {
                name: "METFORMIN",
                quantity: 300,
                unit_price: 20,
                power: "500MG",
              },
              { name: "LIPITOR", quantity: 0, unit_price: 45, power: "10MG" },
            ];
      setInventory(items);
    } catch (e) {
      console.error(e);
    }
  };

  const handleTestRequest = async () => {
    if (queuedTests.length === 0) return;
    try {
      const { apiService } = await import("@/services/api");
      const session = JSON.parse(
        localStorage.getItem("medichain_session") || "null",
      );
      await apiService.requestLabTest({
        patient_id: selectedPatient.dbId,
        doctor_id: session.doctor_id,
        hospital_id: session.hospital_id,
        test_name: queuedTests.join(", "),
      });
      showToast(
        `${queuedTests.length} Diagnostic Requests Transmitted`,
        "success",
      );
      setQueuedTests([]);
      setTestName("");
    } catch (e) {
      showToast("Transmission Error", "error");
    }
  };

  const handleAddTest = () => {
    if (testName && !queuedTests.includes(testName)) {
      setQueuedTests([...queuedTests, testName]);
      setTestName("");
    }
  };

  const handleAddMed = () => {
    if (prescription.medicine && prescription.amount) {
      setPrescribedMedsList([...prescribedMedsList, { ...prescription }]);
      setPrescription({ medicine: "", power: "", amount: "" });
    }
  };

  const handleFinalPrescribe = async () => {
    try {
      const { apiService } = await import("@/services/api");
      const session = JSON.parse(
        localStorage.getItem("medichain_session") || "null",
      );
      await apiService.prescribeMeds({
        patient_id: selectedPatient.dbId,
        doctor_id: session.doctor_id,
        hospital_id: session.hospital_id,
        medicines: prescribedMedsList,
      });
      showToast(
        `${prescribedMedsList.length} Medications Transmitted`,
        "success",
      );
      setPrescribedMedsList([]);
      setSelectedPatient(null);
    } catch (e) {
      showToast("Transmission Error", "error");
    }
  };

  const handleAdmit = async () => {
    try {
      const { apiService } = await import("@/services/api");
      const session = JSON.parse(
        localStorage.getItem("medichain_session") || "null",
      );
      await apiService.requestAdmission({
        patient_id: selectedPatient.dbId,
        doctor_id: session.doctor_id,
        hospital_id: session.hospital_id,
        reason: "DOCTOR INITIATED ADMISSION",
      });
      showToast("Admission Protocol Initiated", "success");
    } catch (e) {
      showToast("Admission Failure", "error");
    }
  };

  useEffect(() => {
    const fetchRisk = async () => {
      if (selectedPatient?.dbId) {
        try {
          const { apiService } = await import("@/services/api");
          const score = await apiService.getPatientRiskScore(
            selectedPatient.dbId,
          );
          setRiskScore(score);
        } catch (e) {
          console.error("Risk sync failed:", e);
          setRiskScore(null);
        }
      }
    };
    fetchRisk();
  }, [selectedPatient]);

  useEffect(() => {
    setMounted(true);
    const session = JSON.parse(localStorage.getItem("medichain_session") || "null");
    if (session && session.role === "doctor") {
      setSessionUser(session.name);
      if (session.doctor_id) fetchDoctorData(session.doctor_id);
      if (session.hospital_id) fetchInventory(session.hospital_id);
    }

    const timer = setInterval(() => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }) +
          " • " +
          now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [router]);

  if (!mounted) return null;

  return (
    <DashboardLayout role="doctor" userName={sessionUser}>
      {/* Header Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "3rem",
        }}
      >
        <div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900 }}>
            CLINICAL COMMAND CENTER
          </h1>
          <p style={{ color: "var(--text-secondary)", fontWeight: 700 }}>
            STATION ID: {stationId} • {currentDateTime.toUpperCase()}
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button className="btn-outline">
            <FileText size={18} /> REPORTS
          </button>
          <button className="btn-black">
            <Plus size={18} /> NEW ENCOUNTER
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: "2rem",
        }}
      >
        {/* Patient Roster */}
        <div
          className="card"
          style={{
            padding: "0",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1.5rem 2rem",
              borderBottom: "2px solid #000",
              background: "#fff",
            }}
          >
            <h3
              style={{
                fontWeight: 900,
                fontSize: "0.8rem",
                letterSpacing: "2px",
              }}
            >
              ASSIGNED PATIENTS
            </h3>
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: 900,
                background: "#10b981",
                color: "#fff",
                padding: "6px 10px",
                borderRadius: "2px",
              }}
            >
              {highRiskPatients.length} ACTIVE
            </span>
          </div>

          <div style={{ width: "100%", overflowX: "auto", height: "800px", overflowY: "auto" }} className="custom-scrollbar">
            <table
              className="data-table"
              style={{ border: "none", minWidth: "100%" }}
            >
              <thead>
                <tr style={{ textAlign: "left", position: "sticky", top: 0, background: "#fff", zIndex: 10, boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                  <th style={{ padding: "1rem 2rem", fontSize: "0.65rem", letterSpacing: "1px", width: "80px" }}>S.NO</th>
                  <th
                    style={{
                      padding: "1rem 2rem",
                      fontSize: "0.65rem",
                      letterSpacing: "1px",
                      minWidth: "250px"
                    }}
                  >
                    IDENTITY
                  </th>
                  <th
                    style={{
                      padding: "1rem 1rem",
                      fontSize: "0.65rem",
                      letterSpacing: "1px",
                      width: "180px"
                    }}
                  >
                    CONDITION
                  </th>
                  <th
                    style={{
                      padding: "1rem 1rem",
                      fontSize: "0.65rem",
                      letterSpacing: "1px",
                      width: "120px"
                    }}
                  >
                    VITALS
                  </th>
                  <th
                    style={{
                      padding: "1rem 2rem",
                      fontSize: "0.65rem",
                      letterSpacing: "1px",
                      textAlign: "right",
                    }}
                  >
                    ACTIONS
                  </th>
                </tr>
              </thead>
              <tbody>
                {highRiskPatients.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        textAlign: "center",
                        padding: "3rem",
                        opacity: 0.3,
                        fontWeight: 900,
                      }}
                    >
                      NO CLINICAL SESSIONS ACTIVE
                    </td>
                  </tr>
                ) : (
                  highRiskPatients.map((patient, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                      <td style={{ padding: "1.5rem 2rem", fontWeight: 900, fontSize: "0.75rem", opacity: 0.3 }}>{(i + 1).toString().padStart(2, "0")}</td>
                      <td style={{ padding: "1.5rem 2rem" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "14px",
                          }}
                        >
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              background: "#000",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "0.8rem",
                              fontWeight: 900,
                            }}
                          >
                            {patient.name[0]}
                          </div>
                          <div style={{ whiteSpace: "nowrap" }}>
                            <p style={{ fontWeight: 900, fontSize: "0.85rem" }}>
                              {patient.name}
                            </p>
                            <p
                              style={{
                                fontSize: "0.65rem",
                                opacity: 0.5,
                                fontWeight: 700,
                                marginTop: "2px",
                              }}
                            >
                              {patient.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "1.5rem 1rem",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                        }}
                      >
                        {patient.condition}
                      </td>
                      <td style={{ padding: "1.5rem 1rem" }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <Activity size={14} color="#dc2626" />
                          <span style={{ fontSize: "0.8rem", fontWeight: 900 }}>
                            {patient.vitals}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{ padding: "1.5rem 2rem", textAlign: "right" }}
                      >
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          style={{
                            background: "#000",
                            color: "#fff",
                            border: "none",
                            padding: "8px 18px",
                            fontSize: "0.65rem",
                            fontWeight: 900,
                            cursor: "pointer",
                            letterSpacing: "1px",
                            transition: "background 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#333")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#000")
                          }
                        >
                          DIAGNOSE
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Section: Alerts and Activity */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Pending Consultation Requests */}
          <div
            className="card"
            style={{ padding: "0", border: "2px solid #3b82f6" }}
          >
            <div
              style={{
                padding: "1.25rem",
                background: "#3b82f6",
                color: "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3
                style={{
                  fontWeight: 900,
                  fontSize: "0.7rem",
                  letterSpacing: "2px",
                }}
              >
                PENDING REQUESTS
              </h3>
              <Bell size={16} />
            </div>
            <div style={{ padding: "1rem", height: "350px", overflowY: "auto" }} className="custom-scrollbar">
              {pendingAppointments.length === 0 ? (
                <p
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 800,
                    opacity: 0.3,
                    textAlign: "center",
                    padding: "1rem",
                  }}
                >
                  NO PENDING TASKS
                </p>
              ) : (
                pendingAppointments.map((appt, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "1rem",
                      borderBottom: "1px solid #eee",
                      display: "flex",
                      gap: "15px",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontSize: "0.7rem", fontWeight: 900, opacity: 0.3 }}>{(i + 1).toString().padStart(2, "0")}</span>
                    <div style={{ flex: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <p style={{ fontWeight: 900, fontSize: "0.75rem" }}>
                          {appt.patient.name.toUpperCase()}
                        </p>
                        <p
                          style={{
                            fontSize: "0.6rem",
                            fontWeight: 700,
                            opacity: 0.5,
                          }}
                        >
                          {appt.type} • {appt.preferred_time}
                        </p>
                      </div>
                      <button
                        onClick={() => handleApprove(appt.id)}
                        style={{
                          background: "#10b981",
                          color: "#fff",
                          border: "none",
                          padding: "5px 10px",
                          fontSize: "0.6rem",
                          fontWeight: 900,
                          cursor: "pointer",
                        }}
                      >
                        APPROVE
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <style jsx global>{`
              .custom-scrollbar::-webkit-scrollbar { width: 6px; }
              .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; border-radius: 10px; }
            `}</style>
          </div>
          <div
            className="card"
            style={{ 
              background: "linear-gradient(145deg, #000 0%, #1a1a1a 100%)", 
              color: "#fff", 
              padding: "2rem",
              position: "relative",
              overflow: "hidden",
              border: "2px solid #333"
            }}
          >
            {/* Background scanning animation effect */}
            <div className="ai-scan-line" style={{ 
              position: "absolute", 
              top: 0, 
              left: 0, 
              right: 0, 
              height: "2px", 
              background: "linear-gradient(90deg, transparent, #3b82f6, transparent)",
              boxShadow: "0 0 15px #3b82f6",
              zIndex: 1,
              animation: "scan 4s linear infinite"
            }}></div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "2.5rem",
                position: "relative",
                zIndex: 2
              }}
            >
              <div>
                <h3
                  style={{
                    fontWeight: 900,
                    fontSize: "0.85rem",
                    letterSpacing: "3px",
                    color: "#3b82f6"
                  }}
                >
                  AI RISK ANALYSIS
                </h3>
                <p
                  style={{ fontSize: "0.6rem", fontWeight: 700, opacity: 0.4, letterSpacing: "1px" }}
                >
                  COGNITIVE DIAGNOSTIC NODE: V1.0.4 ACTIVE
                </p>
              </div>
              <div className="pulse-slow">
                <Cpu size={22} color="#3b82f6" />
              </div>
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "1.2rem", position: "relative", zIndex: 2 }}
            >
              {riskScore ? (
                <div
                  style={{
                    border: "1px solid rgba(255,255,255,0.1)",
                    padding: "1.5rem",
                    background: "rgba(255,255,255,0.03)",
                    borderRadius: "4px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                    <span style={{ fontSize: "0.6rem", fontWeight: 900, color: riskScore.risk_level === "CRITICAL" ? "#ef4444" : "#10b981", letterSpacing: "1px" }}>
                      STATUS: {riskScore.risk_level}
                    </span>
                    <span style={{ fontSize: "0.6rem", fontWeight: 900, opacity: 0.5 }}>LATEST SYNC</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: "10px" }}>
                    <h2 style={{ fontSize: "2.5rem", fontWeight: 900, margin: 0 }}>{riskScore.score_value}<span style={{ fontSize: "1rem", opacity: 0.3 }}>/10</span></h2>
                    <div style={{ flex: 1, height: "4px", background: "rgba(255,255,255,0.1)", borderRadius: "2px", overflow: "hidden" }}>
                      <div style={{ width: `${riskScore.score_value * 10}%`, height: "100%", background: riskScore.score_value > 7 ? "#ef4444" : "#3b82f6", boxShadow: "0 0 10px currentColor" }}></div>
                    </div>
                  </div>
                  <p style={{ fontSize: "0.6rem", fontWeight: 700, opacity: 0.5, marginTop: "1rem" }}>
                    CALCULATED AT: {new Date(riskScore.calculated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </div>
              ) : (
                <>
                  {/* Predictive Alert Block */}
                  <div
                    style={{
                      borderLeft: "4px solid #fbbf24",
                      background: "rgba(251, 191, 36, 0.05)",
                      padding: "1.2rem",
                      position: "relative"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <p style={{ fontSize: "0.6rem", fontWeight: 900, color: "#fbbf24", letterSpacing: "1px" }}>PREDICTIVE ALERT</p>
                      <Activity size={12} color="#fbbf24" className="pulse" />
                    </div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 800, color: "#fff", lineHeight: "1.4" }}>
                      82% RISK OF HYPERTENSIVE CRISIS DETECTED IN ROOM 102
                    </p>
                    <div style={{ marginTop: "0.8rem", display: "flex", gap: "10px" }}>
                       <span style={{ fontSize: "0.55rem", padding: "2px 6px", background: "rgba(255,255,255,0.1)", fontWeight: 900 }}>TREND: RISING</span>
                       <span style={{ fontSize: "0.55rem", padding: "2px 6px", background: "rgba(255,255,255,0.1)", fontWeight: 900 }}>PRIORITY: HIGH</span>
                    </div>
                  </div>

                  {/* Recovery Trend Block */}
                  <div
                    style={{
                      borderLeft: "4px solid #10b981",
                      background: "rgba(16, 185, 129, 0.05)",
                      padding: "1.2rem",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                      <p style={{ fontSize: "0.6rem", fontWeight: 900, color: "#10b981", letterSpacing: "1px" }}>RECOVERY TREND</p>
                      <CheckCircle size={12} color="#10b981" />
                    </div>
                    <p style={{ fontSize: "0.85rem", fontWeight: 800, color: "#fff", lineHeight: "1.4" }}>
                      STABLE VITALS IMPROVEMENT OBSERVED ACROSS WARD-ALPHA
                    </p>
                  </div>
                </>
              )}
            </div>

            <style jsx>{`
              @keyframes scan {
                0% { top: 0; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { top: 100%; opacity: 0; }
              }
              .pulse-slow {
                animation: pulse 3s infinite;
              }
              @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
              }
            `}</style>
          </div>

          <div className="card" style={{ border: "2px solid #dc2626" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <h3
                style={{
                  fontWeight: 900,
                  fontSize: "0.7rem",
                  letterSpacing: "1px",
                }}
              >
                CRITICAL LOGISTICS
              </h3>
              <Activity size={16} color="#dc2626" />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "#fef2f2",
                padding: "10px",
              }}
            >
              <FlaskConical size={18} color="#dc2626" />
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 900,
                    color: "#dc2626",
                  }}
                >
                  BLOOD BANK SHORTAGE
                </p>
                <p style={{ fontSize: "0.6rem", fontWeight: 700 }}>
                  O- RESERVES BELOW 10%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Drill-down Modal */}
      <AnimatePresence>
        {selectedPatient && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPatient(null)}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.8)",
                backdropFilter: "blur(8px)",
              }}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                width: "800px",
                maxWidth: "95vw",
                background: "#fff",
                position: "relative",
                border: "4px solid #000",
                maxHeight: "90vh",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  padding: "2rem",
                  background: "#000",
                  color: "#fff",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 900 }}>
                    {selectedPatient.name}
                  </h2>
                  <p
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      opacity: 0.5,
                    }}
                  >
                    {selectedPatient.id} • CLINICAL HISTORY
                  </p>
                </div>
                <button
                  onClick={handleAdmit}
                  style={{
                    background: "#dc2626",
                    color: "#fff",
                    border: "none",
                    padding: "10px 20px",
                    fontSize: "0.7rem",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  ADMIT PATIENT
                </button>
              </div>

              <div style={{ padding: "2rem" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "2rem",
                    marginBottom: "2rem",
                    borderBottom: "1px solid #eee",
                  }}
                >
                  {[
                    "Clinical Status",
                    "Past Records",
                    "Diagnostics",
                    "Pharmacy",
                  ].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: "1rem 0",
                        background: "none",
                        border: "none",
                        borderBottom:
                          activeTab === tab ? "4px solid #000" : "none",
                        fontWeight: 900,
                        fontSize: "0.75rem",
                        cursor: "pointer",
                        opacity: activeTab === tab ? 1 : 0.3,
                      }}
                    >
                      {tab.toUpperCase()}
                    </button>
                  ))}
                </div>

                {activeTab === "Clinical Status" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2rem",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "1.5rem",
                      }}
                    >
                      <div className="card" style={{ padding: "1.5rem" }}>
                        <p
                          style={{
                            fontSize: "0.6rem",
                            fontWeight: 900,
                            opacity: 0.5,
                          }}
                        >
                          BLOOD PRESSURE
                        </p>
                        <p style={{ fontSize: "1.5rem", fontWeight: 900 }}>
                          120/80
                        </p>
                      </div>
                      <div className="card" style={{ padding: "1.5rem" }}>
                        <p
                          style={{
                            fontSize: "0.6rem",
                            fontWeight: 900,
                            opacity: 0.5,
                          }}
                        >
                          HEART RATE
                        </p>
                        <p style={{ fontSize: "1.5rem", fontWeight: 900 }}>
                          72 BPM
                        </p>
                      </div>
                      <div className="card" style={{ padding: "1.5rem" }}>
                        <p
                          style={{
                            fontSize: "0.6rem",
                            fontWeight: 900,
                            opacity: 0.5,
                          }}
                        >
                          SPO2
                        </p>
                        <p style={{ fontSize: "1.5rem", fontWeight: 900 }}>
                          98%
                        </p>
                      </div>
                    </div>
                    <div
                      className="card"
                      style={{
                        padding: "1.5rem",
                        background: "#fef2f2",
                        border: "1px solid #dc2626",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "0.75rem",
                          fontWeight: 900,
                          color: "#dc2626",
                          marginBottom: "1rem",
                        }}
                      >
                        ACTIVE PROBLEMS & COMPLAINTS
                      </h4>
                      <ul
                        style={{
                          paddingLeft: "1.25rem",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          lineHeight: "1.6",
                        }}
                      >
                        <li>CHRONIC HYPERTENSION (STAGE 1)</li>
                        <li>TYPE 2 DIABETES MELLITUS</li>
                        <li>OCCASIONAL CHEST DISCOMFORT</li>
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === "Past Records" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1rem",
                    }}
                  >
                    {[
                      {
                        date: "2024-03-12",
                        type: "ANNUAL PHYSICAL",
                        provider: "DR. SARAH SMITH",
                      },
                      {
                        date: "2023-11-05",
                        type: "CARDIOLOGY CONSULT",
                        provider: "DR. MICHAEL ROSS",
                      },
                      {
                        date: "2023-08-19",
                        type: "ER VISIT - CHEST PAIN",
                        provider: "CITY GENERAL",
                      },
                    ].map((rec, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "1.5rem",
                          border: "1px solid #eee",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <p style={{ fontWeight: 900, fontSize: "0.8rem" }}>
                            {rec.type}
                          </p>
                          <p
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              opacity: 0.5,
                            }}
                          >
                            {rec.date} • {rec.provider}
                          </p>
                        </div>
                        <button
                          className="btn-outline"
                          style={{ fontSize: "0.6rem", padding: "6px 12px" }}
                        >
                          VIEW RECORD
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "Diagnostics" && (
                  <div>
                    <div
                      style={{
                        background: "#f4f4f5",
                        padding: "1.5rem",
                        border: "2px dashed #000",
                        marginBottom: "2rem",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.65rem",
                          fontWeight: 900,
                          marginBottom: "1rem",
                        }}
                      >
                        REQUISITION NEW DIAGNOSTIC
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          marginBottom: "1rem",
                        }}
                      >
                        <input
                          type="text"
                          placeholder="TEST NAME (e.g. BLOOD SUGAR)"
                          value={testName}
                          onChange={(e) => setTestName(e.target.value)}
                          style={{
                            flex: 1,
                            padding: "10px",
                            border: "2px solid #000",
                            fontWeight: 800,
                            fontSize: "0.8rem",
                          }}
                        />
                        <button
                          onClick={handleAddTest}
                          disabled={!testName}
                          style={{
                            padding: "10px 20px",
                            background: testName ? "#000" : "#ccc",
                            color: "#fff",
                            border: "none",
                            fontWeight: 900,
                            fontSize: "0.7rem",
                            cursor: testName ? "pointer" : "not-allowed",
                          }}
                        >
                          ADD TO ORDER
                        </button>
                      </div>
                      <p
                        style={{
                          fontSize: "0.55rem",
                          fontWeight: 900,
                          opacity: 0.5,
                          marginBottom: "0.5rem",
                        }}
                      >
                        QUICK SELECT STANDARD TESTS:
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        {[
                          "COMPLETE BLOOD COUNT (CBC)",
                          "LIPID PANEL",
                          "LIVER FUNCTION TEST (LFT)",
                          "KIDNEY FUNCTION TEST (KFT)",
                          "THYROID PROFILE",
                          "BLOOD SUGAR (FASTING)",
                          "URINALYSIS",
                          "X-RAY CHEST",
                          "ECG",
                          "MRI BRAIN",
                        ].map((test, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              !queuedTests.includes(test) &&
                              setQueuedTests([...queuedTests, test])
                            }
                            style={{
                              padding: "8px 12px",
                              background: queuedTests.includes(test)
                                ? "#10b981"
                                : "#fff",
                              color: queuedTests.includes(test)
                                ? "#fff"
                                : "#000",
                              border: "1px solid #000",
                              fontWeight: 900,
                              fontSize: "0.6rem",
                              cursor: queuedTests.includes(test)
                                ? "default"
                                : "pointer",
                              transition: "all 0.2s",
                            }}
                          >
                            {test} {queuedTests.includes(test) && "✓"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {queuedTests.length > 0 && (
                      <div
                        className="card"
                        style={{ padding: "1.5rem", marginBottom: "2rem" }}
                      >
                        <h4
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 900,
                            letterSpacing: "1px",
                            marginBottom: "1.5rem",
                          }}
                        >
                          QUEUED DIAGNOSTICS ({queuedTests.length})
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          {queuedTests.map((t, i) => (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "10px",
                                borderBottom: "1px solid #eee",
                              }}
                            >
                              <span
                                style={{ fontWeight: 900, fontSize: "0.8rem" }}
                              >
                                {t}
                              </span>
                              <button
                                onClick={() =>
                                  setQueuedTests(
                                    queuedTests.filter((_, idx) => idx !== i),
                                  )
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#dc2626",
                                  fontWeight: 900,
                                  fontSize: "0.6rem",
                                  cursor: "pointer",
                                }}
                              >
                                REMOVE
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={handleTestRequest}
                          style={{
                            width: "100%",
                            marginTop: "1.5rem",
                            background: "#000",
                            color: "#fff",
                            border: "none",
                            padding: "15px",
                            fontWeight: 900,
                            fontSize: "0.8rem",
                            cursor: "pointer",
                          }}
                        >
                          TRANSMIT FULL DIAGNOSTICS ORDER TO LAB
                        </button>
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.6rem",
                          fontWeight: 900,
                          opacity: 0.5,
                        }}
                      >
                        PREVIOUS RESULTS
                      </p>
                      <div
                        style={{
                          padding: "1rem",
                          border: "1px solid #eee",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <span
                            style={{ fontWeight: 800, fontSize: "0.75rem" }}
                          >
                            HEMATOLOGY PANEL
                          </span>
                          <p
                            style={{
                              fontSize: "0.6rem",
                              fontWeight: 700,
                              opacity: 0.5,
                            }}
                          >
                            UPLOADED BY LAB NODE • 2H AGO
                          </p>
                        </div>
                        <span
                          style={{
                            fontSize: "0.6rem",
                            fontWeight: 900,
                            color: "#10b981",
                          }}
                        >
                          COMPLETED
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "Pharmacy" && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "2rem",
                    }}
                  >
                    {/* Medicine Selection Engine */}
                    <div
                      style={{
                        background: "#f4f4f5",
                        padding: "1.5rem",
                        border: "2px solid #000",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "1.5rem",
                        }}
                      >
                        <p
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 900,
                            letterSpacing: "1px",
                          }}
                        >
                          PHARMACEUTICAL INVENTORY SELECTOR
                        </p>
                        <div style={{ position: "relative", width: "250px" }}>
                          <Search
                            size={14}
                            style={{
                              position: "absolute",
                              left: "10px",
                              top: "50%",
                              transform: "translateY(-50%)",
                              opacity: 0.5,
                            }}
                          />
                          <input
                            type="text"
                            placeholder="SEARCH MEDICINES..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "8px 8px 8px 30px",
                              border: "1px solid #000",
                              fontSize: "0.7rem",
                              fontWeight: 800,
                            }}
                          />
                        </div>
                      </div>

                      {/* Inventory Grid */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(150px, 1fr))",
                          gap: "10px",
                          maxHeight: "200px",
                          overflowY: "auto",
                          padding: "4px",
                          marginBottom: "1.5rem",
                        }}
                      >
                        {inventory
                          .filter((i) =>
                            i.name
                              .toLowerCase()
                              .includes(searchTerm.toLowerCase()),
                          )
                          .map((item, idx) => (
                            <div
                              key={idx}
                              onClick={() =>
                                item.quantity > 0 &&
                                setPrescription({
                                  ...prescription,
                                  medicine: item.name,
                                  power: item.power,
                                })
                              }
                              style={{
                                padding: "12px",
                                background:
                                  item.quantity > 0 ? "#10b981" : "#dc2626",
                                color: "#fff",
                                cursor:
                                  item.quantity > 0 ? "pointer" : "not-allowed",
                                opacity: item.quantity > 0 ? 1 : 0.4,
                                border:
                                  prescription.medicine === item.name
                                    ? "3px solid #000"
                                    : "none",
                                textAlign: "center",
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                              }}
                            >
                              <p
                                style={{ fontSize: "0.7rem", fontWeight: 900 }}
                              >
                                {item.name}
                              </p>
                              <p
                                style={{
                                  fontSize: "0.55rem",
                                  fontWeight: 800,
                                  opacity: 0.8,
                                }}
                              >
                                {item.quantity > 0
                                  ? `IN STOCK (${item.quantity})`
                                  : "OUT OF STOCK"}
                              </p>
                            </div>
                          ))}
                      </div>

                      {/* Quick Selection Form */}
                      {prescription.medicine && (
                        <motion.div
                          initial={{ y: 10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1fr 1fr auto",
                            gap: "10px",
                            alignItems: "flex-end",
                            background: "#fff",
                            padding: "1.5rem",
                            border: "2px solid #000",
                          }}
                        >
                          <div>
                            <label
                              style={{
                                fontSize: "0.55rem",
                                fontWeight: 900,
                                display: "block",
                                marginBottom: "5px",
                              }}
                            >
                              SELECTED MEDICINE
                            </label>
                            <div
                              style={{
                                padding: "10px",
                                background: "#f4f4f5",
                                fontWeight: 900,
                                fontSize: "0.8rem",
                              }}
                            >
                              {prescription.medicine}
                            </div>
                          </div>
                          <div>
                            <label
                              style={{
                                fontSize: "0.55rem",
                                fontWeight: 900,
                                display: "block",
                                marginBottom: "5px",
                              }}
                            >
                              POWER / DOSAGE
                            </label>
                            <input
                              type="text"
                              value={prescription.power || ""}
                              onChange={(e) =>
                                setPrescription({
                                  ...prescription,
                                  power: e.target.value,
                                })
                              }
                              style={{
                                width: "100%",
                                padding: "10px",
                                border: "1px solid #000",
                                fontWeight: 800,
                                fontSize: "0.8rem",
                              }}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                fontSize: "0.55rem",
                                fontWeight: 900,
                                display: "block",
                                marginBottom: "5px",
                              }}
                            >
                              AMOUNT (QTY)
                            </label>
                            <input
                              type="number"
                              value={prescription.amount}
                              onChange={(e) =>
                                setPrescription({
                                  ...prescription,
                                  amount: e.target.value,
                                })
                              }
                              style={{
                                width: "100%",
                                padding: "10px",
                                border: "1px solid #000",
                                fontWeight: 800,
                                fontSize: "0.8rem",
                              }}
                            />
                          </div>
                          <button
                            onClick={handleAddMed}
                            style={{
                              background: "#000",
                              color: "#fff",
                              border: "none",
                              padding: "12px 20px",
                              fontWeight: 900,
                              fontSize: "1rem",
                              cursor: "pointer",
                            }}
                          >
                            +
                          </button>
                        </motion.div>
                      )}
                    </div>

                    {/* Prescribed List Queued */}
                    {prescribedMedsList.length > 0 && (
                      <div className="card" style={{ padding: "1.5rem" }}>
                        <h4
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 900,
                            letterSpacing: "1px",
                            marginBottom: "1.5rem",
                          }}
                        >
                          QUEUED PRESCRIPTION ({prescribedMedsList.length})
                        </h4>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          {prescribedMedsList.map((med, i) => (
                            <div
                              key={i}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "10px",
                                borderBottom: "1px solid #eee",
                              }}
                            >
                              <div>
                                <span
                                  style={{
                                    fontWeight: 900,
                                    fontSize: "0.8rem",
                                  }}
                                >
                                  {med.medicine}
                                </span>
                                <span
                                  style={{
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                    opacity: 0.5,
                                    marginLeft: "10px",
                                  }}
                                >
                                  {med.power} • {med.amount} UNITS
                                </span>
                              </div>
                              <button
                                onClick={() =>
                                  setPrescribedMedsList(
                                    prescribedMedsList.filter(
                                      (_, idx) => idx !== i,
                                    ),
                                  )
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "#dc2626",
                                  fontWeight: 900,
                                  fontSize: "0.6rem",
                                  cursor: "pointer",
                                }}
                              >
                                REMOVE
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          onClick={handleFinalPrescribe}
                          style={{
                            width: "100%",
                            marginTop: "1.5rem",
                            background: "#10b981",
                            color: "#fff",
                            border: "none",
                            padding: "15px",
                            fontWeight: 900,
                            fontSize: "0.8rem",
                            cursor: "pointer",
                          }}
                        >
                          TRANSMIT FULL PRESCRIPTION TO PHARMACY
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
