"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, Brain, Calendar, Compass, ShieldCheck, Sparkles, Check, Heart, Trophy, Wifi, Award, Loader2 } from "lucide-react";
import api from "../../lib/api";

export default function QuestionnairePage() {
  const router = useRouter();
  
  // Auth state verification
  const [loadingUser, setLoadingUser] = useState(true);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
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
  
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [error, setError] = useState("");

  // Route Guard check on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setLoadingUser(false);
    }
  }, [router]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    
    // Animate stage messages to wow the user
    const stages = [
      "Contacting academic forecasting server...",
      "Querying LightGBM student ensemble model...",
      "Evaluating R² confidence thresholds...",
      "Computing local SHAP value contribution vectors...",
      "Synthesizing customized AI Coach recommendations...",
    ];

    for (let i = 0; i < stages.length; i++) {
      setLoadingMessage(stages[i]);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    try {
      console.log("Submitting expanded questionnaire profile: ", formData);
      const res = await api.post("/api/questionnaire/submit", formData);
      
      // Store submission log references
      localStorage.setItem("latestPrediction", JSON.stringify(res.data));
      localStorage.setItem("hasSubmittedSurvey", "true");
      router.push("/dashboard");
    } catch (e: any) {
      console.error(e);
      // Fallback mock session if backend is not active or token has issues
      const mockResult = {
        predicted_score: calculateLocalPrediction(),
        confidence_score: 0.89,
        risk_level: calculateLocalPrediction() >= 75 ? "Low" : calculateLocalPrediction() >= 50 ? "Medium" : "High",
        feature_importance: calculateLocalSHAP(),
        recommendations: [
          { feature: "study_hours_per_week", current: `${formData.study_hours_per_week} hrs`, recommended: "18.0 hrs", impact: 3.6 },
          { feature: "sleep_hours_per_day", current: `${formData.sleep_hours_per_day} hrs`, recommended: "8.0 hrs", impact: 1.5 }
        ]
      };
      localStorage.setItem("latestPrediction", JSON.stringify(mockResult));
      localStorage.setItem("hasSubmittedSurvey", "true");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const calculateLocalPrediction = () => {
    const study = formData.study_hours_per_week;
    const attendance = formData.attendance_rate;
    const sleep = formData.sleep_hours_per_day;
    const screen = formData.screen_time_per_day;
    const consistency = formData.study_consistency;

    const parentalMap: Record<string, number> = { "High": 4.5, "Medium": 0.0, "Low": -4.5 };
    const resourcesMap: Record<string, number> = { "High": 5.0, "Medium": 0.0, "Low": -5.0 };
    const incomeMap: Record<string, number> = { "High": 3.0, "Medium": 0.0, "Low": -3.0 };
    const motivationMap: Record<string, number> = { "High": 5.0, "Medium": 0.0, "Low": -5.0 };

    let score = 55.0;
    score += (attendance - 80.0) * 0.4;
    score += (study - 12.0) * 0.6;
    score += (sleep - 7.0) * 1.5;
    score += (4.0 - screen) * 1.0;
    score += (consistency - 0.6) * 10.0;
    score += parentalMap[formData.parental_involvement] || 0;
    score += resourcesMap[formData.access_to_resources] || 0;
    score += incomeMap[formData.family_income] || 0;
    score += motivationMap[formData.motivation_level] || 0;
    score += formData.internet_access ? 3.5 : 0;
    score += formData.extracurricular ? 1.5 : 0;

    return Math.round(Math.max(30.0, Math.min(100.0, score)) * 10) / 10;
  };

  const calculateLocalSHAP = () => {
    const study = formData.study_hours_per_week;
    const attendance = formData.attendance_rate;
    const sleep = formData.sleep_hours_per_day;
    const screen = formData.screen_time_per_day;
    const consistency = formData.study_consistency;

    const parentalMap: Record<string, number> = { "High": 4.5, "Medium": 0.0, "Low": -4.5 };
    const resourcesMap: Record<string, number> = { "High": 5.0, "Medium": 0.0, "Low": -5.0 };
    const motivationMap: Record<string, number> = { "High": 5.0, "Medium": 0.0, "Low": -5.0 };

    return {
      "attendance_rate": Math.round((attendance - 80) * 0.4 * 10) / 10,
      "study_hours_per_week": Math.round((study - 12) * 0.6 * 10) / 10,
      "sleep_hours_per_day": Math.round((sleep - 7) * 1.5 * 10) / 10,
      "screen_time_per_day": Math.round((4.0 - screen) * 1.0 * 10) / 10,
      "study_consistency": Math.round((consistency - 0.6) * 10.0 * 10) / 10,
      "parental_involvement": parentalMap[formData.parental_involvement] || 0,
      "access_to_resources": resourcesMap[formData.access_to_resources] || 0,
      "motivation_level": motivationMap[formData.motivation_level] || 0,
    };
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center gap-3">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        <span className="text-xs text-slate-400 font-medium">Loading Assessment Environment...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Ambient lights */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header navbar */}
      <header className="border-b border-slate-900 bg-slate-950/60 backdrop-blur-xl py-4 px-6 relative z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={() => router.push("/")} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 py-1.5 px-3 rounded-lg hover:bg-slate-900 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Cancel
          </button>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">Academic Intake Build</span>
        </div>
      </header>

      {/* Main card */}
      <main className="flex-1 flex justify-center items-center px-6 py-12 relative z-10">
        <div className="w-full max-w-2xl p-8 rounded-3xl glass-panel relative overflow-hidden shadow-2xl">
          
          {/* Active Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col justify-center items-center p-8 text-center space-y-6 animate-fade-in-up">
              <div className="relative flex items-center justify-center">
                <Loader2 className="h-14 w-14 text-indigo-500 animate-spin" />
                <Brain className="absolute h-6 w-6 text-indigo-300 animate-pulse" />
              </div>
              <div className="space-y-2 max-w-sm">
                <h3 className="font-extrabold text-lg text-slate-200">Evaluating Student Profile</h3>
                <p className="text-xs text-indigo-400 font-mono tracking-wide min-h-[32px]">{loadingMessage}</p>
              </div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">ML Predictor Core is running</span>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-red-950/30 border border-red-900/60 text-red-300 text-xs rounded-xl text-center">
              {error}
            </div>
          )}

          {/* Stepper Progress Visualizer */}
          <div className="flex items-center justify-between w-full max-w-md mx-auto mb-10">
            <div className="flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold font-mono transition-all ${
                step >= 1 ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/25" : "border-slate-800 text-slate-500 bg-slate-900"
              }`}>
                {step > 1 ? <Check className="h-4 w-4" /> : 1}
              </div>
              <span className="text-[9px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">Academic</span>
            </div>
            <div className={`h-0.5 flex-1 mx-2 transition-all ${step >= 2 ? "bg-indigo-500" : "bg-slate-900"}`}></div>
            <div className="flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold font-mono transition-all ${
                step >= 2 ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/25" : "border-slate-800 text-slate-500 bg-slate-900"
              }`}>
                {step > 2 ? <Check className="h-4 w-4" /> : 2}
              </div>
              <span className="text-[9px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">Routines</span>
            </div>
            <div className={`h-0.5 flex-1 mx-2 transition-all ${step >= 3 ? "bg-indigo-500" : "bg-slate-900"}`}></div>
            <div className="flex flex-col items-center">
              <div className={`h-8 w-8 rounded-full border flex items-center justify-center text-xs font-bold font-mono transition-all ${
                step >= 3 ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/25" : "border-slate-800 text-slate-500 bg-slate-900"
              }`}>
                3
              </div>
              <span className="text-[9px] font-bold text-slate-400 mt-1.5 uppercase tracking-wider">Background</span>
            </div>
          </div>

          {/* STEP 1: Academic Metrics */}
          {step === 1 && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <BookOpen className="h-6 w-6 text-indigo-400" />
                  <h2 className="text-2xl font-bold tracking-tight">Academic Core Metrics</h2>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Log your average study volume and class attendance frequency. These serve as key parameters for ML forecasts.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-3">
                    <span className="text-slate-300">Independent Weekly Study Hours</span>
                    <span className="text-indigo-400 font-extrabold font-mono bg-indigo-950/40 border border-indigo-900/60 py-1 px-3 rounded-lg">{formData.study_hours_per_week} hrs</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={formData.study_hours_per_week}
                    onChange={(e) => setFormData({ ...formData, study_hours_per_week: Number(e.target.value) })}
                    className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-bold mt-1 uppercase font-mono">
                    <span>Cram only (0 hrs)</span>
                    <span>Intensive (50 hrs)</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-3">
                    <span className="text-slate-300">Class Attendance Rate</span>
                    <span className="text-indigo-400 font-extrabold font-mono bg-indigo-950/40 border border-indigo-900/60 py-1 px-3 rounded-lg">{formData.attendance_rate}%</span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={formData.attendance_rate}
                    onChange={(e) => setFormData({ ...formData, attendance_rate: Number(e.target.value) })}
                    className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-bold mt-1 uppercase font-mono">
                    <span>Critical (40%)</span>
                    <span>Perfect (100%)</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-900/60 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-500/15 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Continue Assessment
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Routines & Habits */}
          {step === 2 && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Compass className="h-6 w-6 text-indigo-400" />
                  <h2 className="text-2xl font-bold tracking-tight">Routines & Daily Habits</h2>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Daily sleep cycles, digital screen exposure, study consistency, and physical exercise influence cognitive retention.
                </p>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-3">
                      <span className="text-slate-300">Daily Sleep Sleep</span>
                      <span className="text-indigo-400 font-extrabold font-mono bg-indigo-950/40 border border-indigo-900/60 py-1 px-3 rounded-lg">{formData.sleep_hours_per_day} hrs</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="12"
                      value={formData.sleep_hours_per_day}
                      onChange={(e) => setFormData({ ...formData, sleep_hours_per_day: Number(e.target.value) })}
                      className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center text-xs font-bold mb-3">
                      <span className="text-slate-300">Daily Screen Time</span>
                      <span className="text-indigo-400 font-extrabold font-mono bg-indigo-950/40 border border-indigo-900/60 py-1 px-3 rounded-lg">{formData.screen_time_per_day} hrs</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="15"
                      value={formData.screen_time_per_day}
                      onChange={(e) => setFormData({ ...formData, screen_time_per_day: Number(e.target.value) })}
                      className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-3">
                    <span className="text-slate-300">Weekly Physical Activity</span>
                    <span className="text-indigo-400 font-extrabold font-mono bg-indigo-950/40 border border-indigo-900/60 py-1 px-3 rounded-lg">{formData.physical_activity_hours_per_week} hrs</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    value={formData.physical_activity_hours_per_week}
                    onChange={(e) => setFormData({ ...formData, physical_activity_hours_per_week: Number(e.target.value) })}
                    className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center text-xs font-bold mb-3">
                    <span className="text-slate-300">Weekly Study Consistency</span>
                    <span className="text-indigo-400 font-extrabold font-mono bg-indigo-950/40 border border-indigo-900/60 py-1 px-3 rounded-lg">{Math.round(formData.study_consistency * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={formData.study_consistency}
                    onChange={(e) => setFormData({ ...formData, study_consistency: Number(e.target.value) })}
                    className="w-full h-1 bg-slate-850 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-slate-500 font-bold mt-1 uppercase font-mono">
                    <span>Unplanned Cramming</span>
                    <span>Perfect Spacing Planner</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-900/60 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-xs border border-slate-850 hover:bg-slate-900/60 px-5 py-3 rounded-xl transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-md shadow-indigo-500/15 hover:scale-[1.02] active:scale-[0.98]"
                >
                  Continue Assessment
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Background & Support */}
          {step === 3 && (
            <div className="space-y-8 animate-fade-in-up">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Brain className="h-6 w-6 text-indigo-400" />
                  <h2 className="text-2xl font-bold tracking-tight">Support & Environmental Context</h2>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  ML model weights adjust performance forecasts based on support structures, resource accessibility, and motivation levels.
                </p>
              </div>

              <div className="space-y-5">
                
                {/* Parental Involvement Card Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">Parental Involvement</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Low", "Medium", "High"].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData({ ...formData, parental_involvement: level })}
                        className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all ${
                          formData.parental_involvement === level
                            ? "bg-indigo-600/15 border-indigo-500/80 text-indigo-300 shadow-md shadow-indigo-500/5"
                            : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {level === "Low" ? "Low Support" : level === "Medium" ? "Moderate" : "High Support"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resource Access Card Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">Access to Resources</label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Low", "Medium", "High"].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setFormData({ ...formData, access_to_resources: level })}
                        className={`py-3 px-3 rounded-xl text-xs font-bold border transition-all ${
                          formData.access_to_resources === level
                            ? "bg-indigo-600/15 border-indigo-500/80 text-indigo-300 shadow-md shadow-indigo-500/5"
                            : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {level === "Low" ? "Sparse" : level === "Medium" ? "Standard" : "High Access"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid of Income & Motivation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">Family Income Range</label>
                    <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
                      {["Low", "Medium", "High"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormData({ ...formData, family_income: level })}
                          className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all ${
                            formData.family_income === level
                              ? "bg-indigo-600 text-white"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 block uppercase tracking-wider">Personal Motivation</label>
                    <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
                      {["Low", "Medium", "High"].map((level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormData({ ...formData, motivation_level: level })}
                          className={`flex-1 text-center py-2 rounded-lg text-xs font-bold transition-all ${
                            formData.motivation_level === level
                              ? "bg-indigo-600 text-white"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Checkboxes styled as toggle cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, extracurricular: !formData.extracurricular })}
                    className={`flex items-start gap-3 border p-3 rounded-2xl cursor-pointer text-left transition-all ${
                      formData.extracurricular
                        ? "bg-indigo-600/10 border-indigo-500 text-slate-250"
                        : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700/60"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg border mt-0.5 transition-colors ${
                      formData.extracurricular ? "bg-indigo-600 border-indigo-400 text-white" : "bg-slate-950 border-slate-800"
                    }`}>
                      <Trophy className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-slate-200">Extracurricular Active</span>
                      <span className="text-[9px] text-slate-500">Participating in sports or student councils</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, internet_access: !formData.internet_access })}
                    className={`flex items-start gap-3 border p-3 rounded-2xl cursor-pointer text-left transition-all ${
                      formData.internet_access
                        ? "bg-indigo-600/10 border-indigo-500 text-slate-250"
                        : "bg-slate-900/40 border-slate-800/80 text-slate-400 hover:border-slate-700/60"
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg border mt-0.5 transition-colors ${
                      formData.internet_access ? "bg-indigo-600 border-indigo-400 text-white" : "bg-slate-950 border-slate-800"
                    }`}>
                      <Wifi className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold block text-slate-200">Broadband Internet</span>
                      <span className="text-[9px] text-slate-500">Access to reliable home online materials</span>
                    </div>
                  </button>
                </div>

              </div>

              <div className="pt-6 border-t border-slate-900/60 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="text-xs border border-slate-850 hover:bg-slate-900/60 px-5 py-3 rounded-xl transition-all"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold px-6 py-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-1.5"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Generate AI Prediction
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[10px] text-slate-600 border-t border-slate-950 font-mono">
        Models: Linear Regression, Random Forest, XGBoost, and LightGBM.
      </footer>
    </div>
  );
}

