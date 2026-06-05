import Link from "next/link";
import { ArrowRight, BookOpen, GraduationCap, LineChart, MessageSquare, Sparkles, ShieldCheck, Activity, Award } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-950 text-slate-100 font-sans relative overflow-hidden">
      {/* Background Ambient Lights */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse-glow" style={{ animationDelay: "-4s" }}></div>

      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

      {/* Header */}
      <header className="border-b border-slate-900/80 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2.5 group">
            <div className="p-2 bg-indigo-600/10 border border-indigo-500/30 rounded-xl group-hover:border-indigo-500/60 transition-all duration-300">
              <GraduationCap className="h-6 w-6 text-indigo-400 group-hover:scale-105 transition-transform" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              Learn<span className="text-indigo-400 font-bold">X</span>Plan
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-semibold text-slate-400 hover:text-indigo-400 hover:scale-[1.02] active:scale-[0.98] transition-all py-1.5 px-3">
              Sign In
            </Link>
            <Link href="/login" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 hover:scale-[1.02] active:scale-[0.98]">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 py-16 text-center relative z-10">
        <div className="max-w-5xl mx-auto space-y-12">
          
          {/* Neon Target Tag */}
          <div className="inline-flex items-center gap-1.5 bg-indigo-950/50 text-indigo-400 border border-indigo-800/60 text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-inner shadow-indigo-500/5">
            <Sparkles className="h-3 w-3 animate-pulse" />
            AI-Driven Academic Planning & Success Forecasting
          </div>

          {/* Heading */}
          <div className="space-y-6 max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.15] bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Unlock Academic Potential with <span className="gradient-text">Predictive Analytics</span>
            </h1>
            <p className="text-base md:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Synthesize machine learning models, Explainable AI contributions, and real-time counterfactual routines to isolate student risk factors early and optimize study behaviors.
            </p>
          </div>

          {/* Main Action Links */}
          <div className="flex flex-wrap justify-center items-center gap-4">
            <Link href="/login" className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-sm font-semibold px-8 py-4 rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 group">
              Start Academic Assessment <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href="/login" className="text-sm font-semibold border border-slate-800 hover:border-slate-700 bg-slate-900/40 hover:bg-slate-900/60 px-8 py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
              Instructor Dashboard
            </Link>
          </div>

          {/* Feature Grid */}
          <div className="pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto">
            
            <div className="p-6 rounded-2xl glass-panel hover:border-indigo-500/20 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-full">
              <div>
                <div className="h-10 w-10 rounded-xl bg-indigo-600/10 border border-indigo-500/30 flex items-center justify-center mb-5 group-hover:border-indigo-500/50 transition-colors">
                  <BookOpen className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="font-bold text-lg text-slate-200">1. Intake Profiler</h3>
                <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                  Log your academic habits, class attendance rate, sleep schedule, and background support structures in a structured onboarding wizard.
                </p>
              </div>
              <Link href="/login" className="mt-6 flex items-center gap-1 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                Build Profile <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl glass-panel hover:border-purple-500/20 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-full">
              <div>
                <div className="h-10 w-10 rounded-xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center mb-5 group-hover:border-purple-500/50 transition-colors">
                  <LineChart className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="font-bold text-lg text-slate-200">2. Explainable Forecasts</h3>
                <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                  Predict expected test scores instantly. Audit SHAP value contributions to pinpoint exactly how each habit impacts your grade.
                </p>
              </div>
              <Link href="/login" className="mt-6 flex items-center gap-1 text-xs font-semibold text-purple-400 group-hover:text-purple-300 transition-colors">
                Simulate Analytics <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="p-6 rounded-2xl glass-panel hover:border-emerald-500/20 hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-full">
              <div>
                <div className="h-10 w-10 rounded-xl bg-emerald-600/10 border border-emerald-500/30 flex items-center justify-center mb-5 group-hover:border-emerald-500/50 transition-colors">
                  <MessageSquare className="h-5 w-5 text-emerald-400" />
                </div>
                <h3 className="font-bold text-lg text-slate-200">3. AI Coaching Workspace</h3>
                <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                  Consult a Gemini-powered learning coach to interpret your model predictions and co-author optimized schedule guidelines.
                </p>
              </div>
              <Link href="/login" className="mt-6 flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors">
                Consult Coach <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

          </div>

          {/* Interactive Mock Dashboard Preview Panel */}
          <div className="p-1 rounded-3xl bg-slate-900/50 border border-slate-800/80 shadow-2xl shadow-indigo-500/5 max-w-4xl mx-auto overflow-hidden animate-float">
            <div className="rounded-[22px] overflow-hidden bg-slate-950/80 p-5 md:p-6 border border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
              
              <div className="text-left space-y-4 max-w-md">
                <span className="text-[10px] text-indigo-400 tracking-widest uppercase font-bold font-mono">Simulated Dashboard Preview</span>
                <h3 className="text-xl font-bold text-slate-200">Interactive Student Co-Pilot</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Visualize model metrics on the fly. Drag study and sleep sliders inside the Sandbox to see how counterfactual behaviors lift predicted performance.
                </p>
                <div className="flex gap-4 pt-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" /> Secure Encryption
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium">
                    <Activity className="h-4 w-4 text-indigo-400 animate-pulse" /> Real-time Inference
                  </div>
                </div>
              </div>

              {/* Graphical Preview Card */}
              <div className="w-full md:w-64 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4 text-left shadow-xl shadow-slate-950/50">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Exam Grade Forecast</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-950/60 border border-emerald-800 text-emerald-400">Low Risk</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" className="text-slate-800" strokeWidth="4.5" fill="transparent" />
                      <circle cx="32" cy="32" r="28" stroke="currentColor" className="text-indigo-400" strokeWidth="4.5" fill="transparent"
                        strokeDasharray={2 * Math.PI * 28}
                        strokeDashoffset={2 * Math.PI * 28 * (1 - 0.845)}
                      />
                    </svg>
                    <span className="absolute font-extrabold text-xs font-mono">85%</span>
                  </div>
                  <div className="space-y-1">
                    <div className="text-[11px] font-bold text-slate-200">Study: 18 hrs</div>
                    <div className="text-[10px] text-indigo-400 font-medium font-mono">Expected: +3.6 Marks</div>
                  </div>
                </div>
                <div className="pt-2.5 border-t border-slate-800/80 flex justify-between items-center text-[10px]">
                  <span className="text-slate-500 font-semibold flex items-center gap-1"><Award className="h-3 w-3 text-indigo-400" /> Active Model</span>
                  <span className="text-indigo-400 font-bold font-mono">LightGBM v1.2</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900/60 bg-slate-950/80 py-6 text-center text-[11px] text-slate-500 relative z-10">
        <p>&copy; {new Date().getFullYear()} LearnXPlan. Powered by LightGBM and Gemini AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

