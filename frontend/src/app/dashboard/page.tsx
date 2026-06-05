"use client";

import ReactMarkdown from 'react-markdown';
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen, GraduationCap, LayoutDashboard, LogOut, Sliders, CheckCircle,
  HelpCircle, User, Award, Flame, AlertCircle, Loader2, Sparkles, Save,
  MessageSquare, ChevronDown, ChevronUp, Trash2, CalendarDays, Clock
} from "lucide-react";
import WhatIfPanel from "../../components/what-if-panel";
import AICoachChat from "../../components/ai-coach-chat";
import dynamic from "next/dynamic";
const RechartsWrapper = dynamic(() => import("../../components/charts/recharts-wrapper"), {
  ssr: false,
});
import api from "../../lib/api";

type ActiveTab = "dashboard" | "chat";

interface SavedPlan {
  id: string;
  plan_content: string;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<ActiveTab>("dashboard");

  // Route Guard states
  const [loadingUser, setLoadingUser] = useState(true);
  const [userName, setUserName] = useState("Student");

  // Dashboard states
  const [predictedScore, setPredictedScore] = useState(82.5);
  const [confidenceScore, setConfidenceScore] = useState(0.89);
  const [riskLevel, setRiskLevel] = useState("Low");
  const [featureImportance, setFeatureImportance] = useState({
    "attendance_rate": 2.4,
    "study_hours_per_week": 1.2,
    "sleep_hours_per_day": 0.5,
    "screen_time_per_day": -0.8,
    "study_consistency": 1.0,
    "parental_involvement": 0.0,
    "access_to_resources": 0.0,
    "motivation_level": 0.0,
  });
  const [recommendations, setRecommendations] = useState([
    { feature: "study_hours_per_week", current: "12 hrs", recommended: "18.0 hrs", impact: 3.6 },
    { feature: "sleep_hours_per_day", current: "7 hrs", recommended: "8.0 hrs", impact: 1.5 },
  ]);
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

  const [studentProfile, setStudentProfile] = useState({
    study_hours_per_week: 12,
    attendance_rate: 90,
    sleep_hours_per_day: 7,
    screen_time_per_day: 4,
    physical_activity_hours_per_week: 5,
    study_consistency: 0.7,
    parental_involvement: "Medium",
    access_to_resources: "Medium",
    family_income: "Medium",
    motivation_level: "Medium",
    internet_access: true,
    extracurricular: false,
  });

  // Verification & loading flow
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const hasSubmitted = localStorage.getItem("hasSubmittedSurvey");

    if (!token) {
      router.push("/login");
      return;
    }

    if (role === "teacher") {
      router.push("/teacher");
      return;
    }

    if (hasSubmitted !== "true") {
      router.push("/questionnaire");
      return;
    }

    setUserName(localStorage.getItem("userName") || "Student");
    setLoadingUser(false);

    // Fetch latest prediction metrics from backend PostgreSQL
    const fetchLatest = async () => {
      try {
        const cached = localStorage.getItem("latestPrediction");
        if (cached) {
          const parsed = JSON.parse(cached);
          updateDashboardStates(parsed);
        }

        const res = await api.get("/questionnaire/latest");
        if (res.data) {
          setStudentProfile({
            study_hours_per_week: res.data.study_hours_per_week,
            attendance_rate: res.data.attendance_rate,
            sleep_hours_per_day: res.data.sleep_hours_per_day,
            screen_time_per_day: res.data.screen_time_per_day,
            physical_activity_hours_per_week: res.data.physical_activity_hours_per_week,
            study_consistency: res.data.study_consistency,
            parental_involvement: res.data.parental_involvement,
            access_to_resources: res.data.access_to_resources,
            family_income: res.data.family_income,
            motivation_level: res.data.motivation_level,
            internet_access: res.data.internet_access,
            extracurricular: res.data.extracurricular,
          });
        }
      } catch (e) {
        console.log("Using cached/local inputs for student predictions.");
      }
    };

    const fetchPlans = async () => {
      try {
        const res = await api.get("/coach/plans");
        if (res.data) {
          setSavedPlans(res.data);
        }
      } catch (e) {
        console.log("Failed to fetch saved plans.");
      }
    };

    fetchLatest();
    fetchPlans();
  }, [router]);

  const updateDashboardStates = (data: any) => {
    setPredictedScore(data.predicted_score);
    setConfidenceScore(data.confidence_score);
    setRiskLevel(data.risk_level);
    setFeatureImportance(data.feature_importance);
    setRecommendations(data.recommendations || []);
  };

  const handleSimulationResult = (result: any) => {
    updateDashboardStates(result);
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/");
  };

  const handlePlanSaved = (newPlan: SavedPlan) => {
    setSavedPlans((prev) => [newPlan, ...prev]);
  };

  const formatPlanDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const extractPlanTitle = (content: string): string => {
    // Try to extract a title from the first heading or line
    const lines = content.trim().split("\n");
    for (const line of lines) {
      const stripped = line.replace(/^#+\s*/, "").trim();
      if (stripped.length > 0) return stripped.length > 60 ? stripped.slice(0, 60) + "…" : stripped;
    }
    return "AI Study Plan";
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center gap-3">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-400 font-medium font-mono">Verifying student credentials...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* Background Ambient Lights */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Navbar */}
      <header className="border-b border-slate-900 bg-slate-950/60 sticky top-0 z-50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-7 w-7 text-indigo-400" />
            <span className="font-extrabold text-lg tracking-tight">
              Learn<span className="text-indigo-400 font-bold">X</span>Plan
            </span>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "dashboard"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "chat"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Coach
              {savedPlans.length > 0 && (
                <span className="ml-1 bg-indigo-500/30 text-indigo-300 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                  {savedPlans.length}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl">
              <User className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-300">{userName}</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-900 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ── DASHBOARD TAB ── */}
      {activeTab === "dashboard" && (
        <div className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">

          {/* Left Column: Forecast & SHAP Charts */}
          <div className="lg:col-span-2 space-y-6">

            {/* Gauge metrics card */}
            <div className="p-6 rounded-3xl glass-panel relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl border-slate-800/80">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>

              <div className="space-y-4 text-center md:text-left">
                <div>
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono bg-indigo-950/40 border border-indigo-900/60 py-1 px-2.5 rounded-lg">Performance Forecast</span>
                  <h2 className="text-3xl font-black mt-3 tracking-tight">Expected Exam Grade</h2>
                  <p className="text-xs text-slate-400 mt-2 max-w-sm leading-relaxed">
                    Generated via a LightGBM regression model. Confidence: <strong className="text-slate-200">{Math.round(confidenceScore * 100)}%</strong>.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <span className="text-[10px] text-slate-500 font-bold font-mono flex items-center gap-1.5 uppercase">
                    <Award className="h-4 w-4 text-indigo-400" /> Accuracy metrics: active
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-6 bg-slate-900/40 border border-slate-900 p-4 rounded-2xl">
                <div className="text-center">
                  <span className="text-[9px] uppercase font-bold text-slate-500 block tracking-wider font-mono">Risk Index</span>
                  <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black mt-2 uppercase tracking-wide border ${
                    riskLevel === "Low" ? "bg-emerald-950/60 border-emerald-800/60 text-emerald-400" :
                    riskLevel === "Medium" ? "bg-amber-950/60 border-amber-800/60 text-amber-400" :
                    "bg-rose-950/60 border-rose-800/60 text-rose-400"
                  }`}>
                    {riskLevel} Risk
                  </span>
                </div>

                <div className="relative flex items-center justify-center">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" className="text-slate-950" strokeWidth="7" fill="transparent" />
                    <circle cx="48" cy="48" r="40" stroke="currentColor"
                      className={`transition-all duration-1000 ease-out ${
                        riskLevel === "Low" ? "text-emerald-500" :
                        riskLevel === "Medium" ? "text-amber-500" :
                        "text-rose-500"
                      }`}
                      strokeWidth="7" fill="transparent"
                      strokeDasharray={2 * Math.PI * 40}
                      strokeDashoffset={2 * Math.PI * 40 * (1 - predictedScore / 100)}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute font-black text-xl font-mono text-slate-100 drop-shadow-md">{Math.round(predictedScore)}%</span>
                </div>
              </div>
            </div>

            {/* Actionable recommendations */}
            <div className="space-y-4">
              <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest font-mono flex items-center gap-2">
                <Flame className="h-4 w-4 text-indigo-400" /> Actionable Recommendation Engine
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border flex items-start gap-3.5 transition-all duration-300 hover:scale-[1.01] ${
                      rec.impact >= 2.5
                        ? "bg-indigo-950/20 border-indigo-900/40 hover:border-indigo-500/30"
                        : "bg-slate-900/30 border-slate-900 hover:border-slate-800"
                    }`}
                  >
                    <div className={`p-2 rounded-xl mt-0.5 ${
                      rec.impact >= 2.5 ? "bg-indigo-600/10 text-indigo-400" : "bg-emerald-600/10 text-emerald-400"
                    }`}>
                      <CheckCircle className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs capitalize text-slate-200">
                        Adjust {rec.feature.replace(/_/g, " ")}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                        Increase from <span className="font-semibold text-slate-200">{rec.current}</span> to{" "}
                        <span className="font-bold text-indigo-300">{rec.recommended}</span>.
                      </p>
                      <span className="text-[10px] text-emerald-400 font-extrabold mt-2 block font-mono">
                        Forecast Impact: +{rec.impact} marks
                      </span>
                    </div>
                  </div>
                ))}
                {recommendations.length === 0 && (
                  <div className="col-span-2 p-6 rounded-2xl border border-slate-900 bg-slate-900/30 text-center text-xs text-slate-500 italic">
                    Outstanding profile! Your current routines align perfectly with success benchmarks.
                  </div>
                )}
              </div>
            </div>

            {/* Recharts explainability */}
            <div className="p-6 rounded-3xl glass-panel relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="font-extrabold text-lg tracking-tight">Explainable AI (SHAP Contributions)</h3>
                  <p className="text-[10px] text-slate-400 mt-1 leading-normal">Quantifies positive (green) and negative (red) parameter contributions to the model prediction.</p>
                </div>
                <HelpCircle className="h-4 w-4 text-slate-500 hover:text-slate-400 cursor-pointer" />
              </div>
              <div className="h-60 mt-4">
                <RechartsWrapper data={featureImportance} />
              </div>
            </div>

            {/* Simulator sandbox */}
            <div className="p-6 rounded-3xl glass-panel">
              <div className="flex items-center gap-2 mb-6">
                <Sliders className="h-5 w-5 text-indigo-400" />
                <h3 className="font-bold text-lg tracking-tight">Counterfactual Simulator Sandbox</h3>
              </div>
              <WhatIfPanel initialProfile={studentProfile} onSimulate={handleSimulationResult} />
            </div>

            {/* ── SAVED PLANS SECTION ── */}
            {savedPlans.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest font-mono flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-indigo-400" /> Saved Study Plans
                    <span className="ml-1 bg-indigo-950/60 border border-indigo-900/60 text-indigo-400 text-[9px] font-bold px-2 py-0.5 rounded-full">
                      {savedPlans.length}
                    </span>
                  </h3>
                  <button
                    onClick={() => setActiveTab("chat")}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors"
                  >
                    <Sparkles className="h-3 w-3" /> Ask AI Coach
                  </button>
                </div>

                <div className="space-y-3">
                  {savedPlans.map((plan) => (
                    <div key={plan.id} className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden transition-all duration-200">
                      {/* Plan header */}
                      <button
                        onClick={() => setExpandedPlanId(expandedPlanId === plan.id ? null : plan.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-900/60 transition-colors"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="p-1.5 bg-indigo-950/60 border border-indigo-900/60 text-indigo-400 rounded-lg flex-shrink-0 mt-0.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-200 truncate">
                              {extractPlanTitle(plan.plan_content)}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {formatPlanDate(plan.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                          {expandedPlanId === plan.id ? (
                            <ChevronUp className="h-4 w-4 text-slate-500" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-slate-500" />
                          )}
                        </div>
                      </button>

                      {/* Expanded plan content */}
                      {expandedPlanId === plan.id && (
                        <div className="px-4 pb-4 border-t border-slate-800/60">
                          <div className="mt-3 bg-slate-950/60 rounded-xl p-4 border border-slate-800/40">
                            <div className="prose prose-invert prose-sm prose-indigo max-w-none
                              prose-headings:text-slate-100 prose-headings:font-bold
                              prose-p:text-slate-300 prose-p:leading-relaxed
                              prose-strong:text-indigo-300 prose-strong:font-semibold
                              prose-li:text-slate-300 prose-li:my-0.5
                              prose-ul:my-2 prose-ol:my-2
                              prose-h1:text-base prose-h2:text-sm prose-h3:text-xs
                              prose-code:text-indigo-300 prose-code:bg-indigo-950/40 prose-code:px-1 prose-code:rounded
                              prose-hr:border-slate-800">
                              <ReactMarkdown>{plan.plan_content}</ReactMarkdown>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Mini AI Coach preview */}
          <div className="lg:col-span-1">
            <div className="h-full rounded-3xl glass-panel p-6 flex flex-col justify-between min-h-[500px] sticky top-24">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-900 mb-4">
                <div className="p-1.5 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-200">AI Educational Coach</h3>
                  <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">Personalized LLM Mentor</span>
                </div>
                <button
                  onClick={() => setActiveTab("chat")}
                  className="ml-auto text-[9px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wide border border-indigo-900/60 bg-indigo-950/30 px-2 py-1 rounded-lg transition-colors"
                >
                  Full View →
                </button>
              </div>
              <div className="flex-1 flex flex-col justify-between overflow-hidden">
                <AICoachChat
                  studentProfile={studentProfile}
                  prediction={{ predicted_score: predictedScore, risk_level: riskLevel }}
                  onPlanSaved={handlePlanSaved}
                  compact={true}
                />
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── CHAT TAB ── */}
      {activeTab === "chat" && (
        <div className="max-w-7xl mx-auto w-full px-6 py-8 flex-1 flex gap-8 relative z-10">

          {/* Full-width Chat */}
          <div className="flex-1 flex flex-col min-h-[calc(100vh-120px)]">
            <AICoachChat
              studentProfile={studentProfile}
              prediction={{ predicted_score: predictedScore, risk_level: riskLevel }}
              onPlanSaved={handlePlanSaved}
              compact={false}
            />
          </div>

          {/* Saved Plans Sidebar */}
          <div className="w-80 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24 rounded-3xl glass-panel p-5 space-y-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-indigo-400" />
                <h3 className="font-extrabold text-xs text-slate-200 uppercase tracking-widest font-mono">Saved Plans</h3>
                {savedPlans.length > 0 && (
                  <span className="ml-auto bg-indigo-950/60 border border-indigo-900/60 text-indigo-400 text-[9px] font-bold px-2 py-0.5 rounded-full">
                    {savedPlans.length}
                  </span>
                )}
              </div>

              {savedPlans.length === 0 ? (
                <div className="text-center py-8 text-slate-600">
                  <CalendarDays className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs italic">No saved plans yet.</p>
                  <p className="text-[10px] mt-1 text-slate-700">Ask for a study plan and save it!</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
                  {savedPlans.map((plan) => (
                    <button
                      key={plan.id}
                      onClick={() => {
                        setExpandedPlanId(plan.id);
                        setActiveTab("dashboard");
                        // Scroll to saved plans section
                        setTimeout(() => {
                          document.getElementById("saved-plans-section")?.scrollIntoView({ behavior: "smooth" });
                        }, 100);
                      }}
                      className="w-full text-left p-3 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/60 hover:border-slate-700 transition-all group"
                    >
                      <div className="flex items-start gap-2">
                        <div className="p-1 bg-indigo-950/60 border border-indigo-900/60 text-indigo-400 rounded-lg flex-shrink-0 mt-0.5">
                          <CalendarDays className="h-2.5 w-2.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-300 group-hover:text-slate-100 transition-colors line-clamp-2">
                            {extractPlanTitle(plan.plan_content)}
                          </p>
                          <p className="text-[9px] text-slate-600 mt-0.5">
                            {formatPlanDate(plan.created_at)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-950 py-4 text-center text-[10px] text-slate-600 font-mono">
        Models deployed: LightGBM regressor & Gemini-2.5-flash instruction sets.
      </footer>
    </div>
  );
}
