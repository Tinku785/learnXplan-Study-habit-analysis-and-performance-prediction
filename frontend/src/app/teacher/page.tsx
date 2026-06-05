"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, BarChart3, GraduationCap, Grid, LogOut, TrendingUp, Users, Eye, ShieldAlert, Award, ArrowUpRight, Loader2, Sparkles } from "lucide-react";
import api from "../../lib/api";
import dynamic from "next/dynamic";
const RechartsWrapper = dynamic(() => import("../../components/charts/recharts-wrapper"), {
  ssr: false,
});

export default function TeacherPage() {
  const router = useRouter();

  // Guard states
  const [loadingUser, setLoadingUser] = useState(true);
  const [isTeacher, setIsTeacher] = useState(false);
  const [userName, setUserName] = useState("Instructor");

  // Model comparison benchmarks state
  const [benchmarks, setBenchmarks] = useState([
    { model_name: "Linear Regression", r2_score: 0.762, mae: 3.12, rmse: 4.10, is_trained: false },
    { model_name: "Random Forest", r2_score: 0.845, mae: 2.21, rmse: 2.94, is_trained: false },
    { model_name: "XGBoost", r2_score: 0.884, mae: 1.95, rmse: 2.45, is_trained: false },
    { model_name: "LightGBM", r2_score: 0.902, mae: 1.78, rmse: 2.21, is_trained: true }
  ]);

  // Students list
  const [students, setStudents] = useState([
    { id: 1, name: "Alice Smith", email: "alice@example.com", predicted_score: 88.5, risk: "Low", study_hours: 18, attendance: 95, shap: { "attendance_rate": 2.8, "study_hours_per_week": 1.8 } },
    { id: 2, name: "Bob Johnson", email: "bob@example.com", predicted_score: 42.0, risk: "High", study_hours: 4, attendance: 62, shap: { "attendance_rate": -3.2, "study_hours_per_week": -2.4 } },
    { id: 3, name: "Charlie Davis", email: "charlie@example.com", predicted_score: 76.5, risk: "Low", study_hours: 12, attendance: 88, shap: { "attendance_rate": 0.8, "study_hours_per_week": 0.4 } },
    { id: 4, name: "Diana Prince", email: "diana@example.com", predicted_score: 58.0, risk: "Medium", study_hours: 8, attendance: 78, shap: { "attendance_rate": -0.8, "study_hours_per_week": -1.2 } },
    { id: 5, name: "Evan Wright", email: "evan@example.com", predicted_score: 34.2, risk: "High", study_hours: 3, attendance: 58, shap: { "attendance_rate": -4.1, "study_hours_per_week": -3.0 } },
  ]);

  // Drawer for individual student SHAP
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Authenticate user & load backend data
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token) {
      router.push("/login");
      return;
    }

    if (role !== "teacher") {
      setIsTeacher(false);
      setLoadingUser(false);
      return;
    }

    setIsTeacher(true);
    setUserName(localStorage.getItem("userName") || "Instructor");
    setLoadingUser(false);

    const loadData = async () => {
      try {
        const benchRes = await api.get("/analytics/model-comparison");
        if (benchRes.data && benchRes.data.length > 0) {
          setBenchmarks(benchRes.data);
        }
        
        const rosterRes = await api.get("/analytics/aggregate");
        if (rosterRes.data && rosterRes.data.length > 0) {
          // Map DB models to list structure
          const mapped = rosterRes.data.map((item: any, idx: number) => ({
            id: idx + 1,
            name: item.full_name || "Student",
            email: item.email,
            predicted_score: item.predicted_score,
            risk: item.risk_level,
            study_hours: 12, // fallback representation
            attendance: 85,
            shap: item.feature_importance
          }));
          setStudents(mapped);
        }
      } catch (e) {
        console.log("Teacher dashboard operating in local sandbox simulation.");
      }
    };
    loadData();
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center gap-3">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-400 font-medium font-mono">Authenticating workspace permissions...</span>
      </div>
    );
  }

  // Access Denied Screen for students
  if (!isTeacher) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-6 relative overflow-hidden">
        <div className="absolute top-[30%] left-[30%] -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="w-full max-w-md p-8 rounded-3xl glass-panel text-center space-y-6 border-rose-900/40 relative z-10 shadow-2xl">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-rose-600/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div className="space-y-2">
            <h3 className="font-extrabold text-xl text-slate-200">Instructor Clearance Required</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your account is registered as a student. Access to the aggregate comparison logs, research metrics, and rosters is restricted.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-500/15"
            >
              Go to Student Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-slate-250 py-2 transition-colors font-semibold"
            >
              Switch Account / Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  const highRiskCount = students.filter(s => s.risk === "High").length;
  const averageScore = Math.round(students.reduce((acc, curr) => acc + curr.predicted_score, 0) / students.length);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background Ambient Lights */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/60 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600/10 border border-indigo-500/20 rounded-xl">
              <GraduationCap className="h-6 w-6 text-indigo-400" />
            </div>
            <span className="font-extrabold text-lg tracking-tight">
              Learn<span className="text-indigo-400 font-bold">X</span>Plan
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-350 font-mono">Teacher: {userName}</span>
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-slate-250 p-2 rounded-xl hover:bg-slate-900 transition-colors" title="Sign Out">
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Panel */}
      <main className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 space-y-8 relative z-10">
        
        {/* Nav Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight">Research & Analytics Dashboard</h2>
            <p className="text-xs text-slate-400">Review comparative ML metrics, condition correlations, and student risk reports.</p>
          </div>
          <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-xs font-bold text-slate-450 border border-slate-850 hover:bg-slate-900/60 py-2.5 px-4 rounded-xl transition-all self-start sm:self-auto">
            <ArrowLeft className="h-4 w-4" /> Return Home
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-panel relative overflow-hidden flex items-center justify-between shadow-lg">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono block">Roster Size</span>
              <span className="text-3xl font-black block">{students.length} Students</span>
              <span className="text-[10px] text-emerald-400 mt-1 block font-bold font-mono">100% active submissions</span>
            </div>
            <div className="p-4 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-2xl shadow-inner">
              <Users className="h-6 w-6 animate-pulse" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
          </div>

          <div className="p-6 rounded-2xl glass-panel relative overflow-hidden flex items-center justify-between shadow-lg">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono block">Average Forecast Grade</span>
              <span className="text-3xl font-black block">{averageScore}%</span>
              <span className="text-[10px] text-indigo-400 mt-1 block font-bold font-mono">Class benchmark target</span>
            </div>
            <div className="p-4 bg-purple-600/10 border border-purple-500/20 text-purple-400 rounded-2xl shadow-inner">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
          </div>

          <div className="p-6 rounded-2xl glass-panel relative overflow-hidden flex items-center justify-between shadow-lg border-rose-900/10">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest font-mono block">Critical Interventions</span>
              <span className="text-3xl font-black block text-rose-500">{highRiskCount} Alerts</span>
              <span className="text-[10px] text-rose-450 mt-1 block font-bold font-mono">Expected grades below 50%</span>
            </div>
            <div className="p-4 bg-rose-955/60 border border-rose-900 text-rose-400 rounded-2xl shadow-inner">
              <AlertTriangle className="h-6 w-6 text-rose-500" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-rose-600"></div>
          </div>
        </div>

        {/* Student Roster Table */}
        <div className="rounded-3xl glass-panel overflow-hidden shadow-2xl border-slate-800/80">
          <div className="p-6 border-b border-slate-900 bg-slate-900/10">
            <h3 className="font-extrabold text-lg text-slate-200">Active Student Roster</h3>
            <p className="text-[10px] text-slate-400 mt-1">Real-time inference prediction outputs and Explainable SHAP overlays.</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-900/35 text-slate-500 text-xs font-mono font-bold tracking-wider">
                  <th className="p-4 pl-6 uppercase">Student Name</th>
                  <th className="p-4 uppercase">Email Address</th>
                  <th className="p-4 text-center uppercase">Expected Grade</th>
                  <th className="p-4 text-center uppercase">Risk Category</th>
                  <th className="p-4 text-center uppercase">Explainable AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/40">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-900/20 transition-all duration-150 group">
                    <td className="p-4 pl-6 font-bold text-slate-250 group-hover:text-white transition-colors">{student.name}</td>
                    <td className="p-4 text-slate-400 font-mono text-xs">{student.email}</td>
                    <td className="p-4 text-center font-bold text-indigo-400 font-mono text-base">{Math.round(student.predicted_score)}%</td>
                    <td className="p-4 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border ${
                        student.risk === "Low" ? "bg-emerald-950/60 border-emerald-800/50 text-emerald-400" :
                        student.risk === "Medium" ? "bg-amber-950/60 border-amber-800/50 text-amber-400" :
                        "bg-rose-950/60 border-rose-800/50 text-rose-400"
                      }`}>
                        {student.risk}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-xs text-indigo-400 hover:text-indigo-300 font-bold px-4 py-2 rounded-xl transition-all shadow-inner shadow-slate-950/50 hover:scale-[1.03] active:scale-[0.97]"
                      >
                        <Eye className="h-4 w-4" /> Analyze SHAP
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Model Benchmarking & Background Correlations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Benchmarks Section */}
          <div className="p-6 rounded-3xl glass-panel relative overflow-hidden shadow-2xl border-slate-800/80">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-1.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                <BarChart3 className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg tracking-tight">Academic Regressor Benchmarks</h3>
                <p className="text-[10px] text-slate-400 mt-1">Cross-model comparison metrics trained and validated on academic datasets.</p>
              </div>
            </div>
            
            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-900 text-slate-500 font-bold uppercase font-mono tracking-wider">
                    <th className="pb-3 uppercase">Model Class</th>
                    <th className="pb-3 text-center uppercase">R² Accuracy</th>
                    <th className="pb-3 text-center uppercase">MAE</th>
                    <th className="pb-3 text-center uppercase">RMSE</th>
                    <th className="pb-3 text-right uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/50">
                  {benchmarks.map((b, idx) => (
                    <tr key={idx} className="group">
                      <td className="py-4 font-bold text-slate-200">{b.model_name}</td>
                      <td className="py-4 text-center font-mono">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="font-black text-indigo-400 text-sm">{b.r2_score}</span>
                          <div className="w-20 bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900">
                            <div className="bg-indigo-500 h-full rounded-full transition-all" style={{ width: `${b.r2_score * 100}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-center font-mono text-slate-450">{b.mae}</td>
                      <td className="py-4 text-center font-mono text-slate-450">{b.rmse}</td>
                      <td className="py-4 text-right">
                        <span className={`inline-block text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border ${
                          b.is_trained 
                            ? "bg-emerald-950/40 border-emerald-800/40 text-emerald-450 shadow-inner shadow-emerald-500/5" 
                            : "bg-slate-900 border-slate-900 text-slate-500"
                        }`}>
                          {b.is_trained ? "Active" : "Benchmark"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Correlations Heatmap Grid */}
          <div className="p-6 rounded-3xl glass-panel relative overflow-hidden shadow-2xl border-slate-800/80">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-1.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                <Grid className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="font-extrabold text-lg tracking-tight">Environmental Correlation Grid</h3>
                <p className="text-[10px] text-slate-400 mt-1">Heat map displaying target grade correlation to qualitative background conditions.</p>
              </div>
            </div>

            {/* Custom styled correlation grid */}
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-4 gap-3 text-center text-[9px] font-bold tracking-wider uppercase font-mono text-slate-500">
                <div>Metric Context</div>
                <div>Low Level</div>
                <div>Medium</div>
                <div>High Level</div>
              </div>
              
              <div className="space-y-3 text-xs font-semibold text-slate-200">
                <div className="grid grid-cols-4 gap-3 items-center text-center">
                  <div className="text-left font-bold text-[10px] text-slate-400 uppercase tracking-wide leading-tight">Parental Support</div>
                  <div className="p-3 rounded-2xl bg-rose-950/20 text-rose-455 border border-rose-900/35 font-mono font-bold">-4.5</div>
                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-900 text-slate-500 font-mono font-bold">0.0</div>
                  <div className="p-3 rounded-2xl bg-emerald-950/20 text-emerald-450 border border-emerald-900/35 font-mono font-bold">+4.5</div>
                </div>

                <div className="grid grid-cols-4 gap-3 items-center text-center">
                  <div className="text-left font-bold text-[10px] text-slate-400 uppercase tracking-wide leading-tight">Resource Access</div>
                  <div className="p-3 rounded-2xl bg-rose-950/20 text-rose-455 border border-rose-900/35 font-mono font-bold">-5.0</div>
                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-900 text-slate-500 font-mono font-bold">0.0</div>
                  <div className="p-3 rounded-2xl bg-emerald-950/20 text-emerald-455 border border-emerald-900/35 font-mono font-bold">+5.0</div>
                </div>

                <div className="grid grid-cols-4 gap-3 items-center text-center">
                  <div className="text-left font-bold text-[10px] text-slate-400 uppercase tracking-wide leading-tight">Family Income</div>
                  <div className="p-3 rounded-2xl bg-rose-955/20 text-rose-400 border border-rose-900/20 font-mono font-bold">-3.0</div>
                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-900 text-slate-500 font-mono font-bold">0.0</div>
                  <div className="p-3 rounded-2xl bg-emerald-955/20 text-emerald-400 border border-emerald-900/20 font-mono font-bold">+3.0</div>
                </div>

                <div className="grid grid-cols-4 gap-3 items-center text-center">
                  <div className="text-left font-bold text-[10px] text-slate-400 uppercase tracking-wide leading-tight">Personal Motivation</div>
                  <div className="p-3 rounded-2xl bg-rose-950/20 text-rose-455 border border-rose-900/35 font-mono font-bold">-5.0</div>
                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-900 text-slate-500 font-mono font-bold">0.0</div>
                  <div className="p-3 rounded-2xl bg-emerald-950/20 text-emerald-450 border border-emerald-900/35 font-mono font-bold">+5.0</div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* SHAP Detail Modal Overlay */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300">
          <div className="w-full max-w-xl p-8 rounded-3xl glass-panel relative shadow-2xl border-slate-800 animate-fade-in-up">
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="text-[9px] text-indigo-400 font-black tracking-widest uppercase font-mono bg-indigo-950/40 border border-indigo-900/60 py-1 px-2.5 rounded-lg">Local Explanations</span>
                <h3 className="text-2xl font-black tracking-tight mt-2 text-slate-100">XAI Analysis: {selectedStudent.name}</h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">{selectedStudent.email} | Score: {Math.round(selectedStudent.predicted_score)}%</p>
              </div>
              <div className="p-2 border border-slate-800 rounded-2xl text-slate-450 font-bold font-mono text-xs flex items-center gap-1">
                <Award className="h-4 w-4 text-indigo-400" /> SHAP Values
              </div>
            </div>
            
            <div className="h-64 mb-8 bg-slate-950/50 border border-slate-900/50 rounded-2xl p-4">
              <RechartsWrapper data={selectedStudent.shap} />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedStudent(null)}
                className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-500/15"
              >
                Close Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-950 py-4 text-center text-[10px] text-slate-600 font-mono">
        LearnXPlan Instructor Portal. Powered by LightGBM Regressors.
      </footer>
    </div>
  );
}

