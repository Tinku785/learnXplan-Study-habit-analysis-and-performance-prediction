"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { GraduationCap, Lock, Mail, User as UserIcon, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import api from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState("student");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Clean local storage on mount
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!email || !password || (isSignUp && !name)) {
      setError("Please fill in all required fields.");
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Sign Up Flow
        await api.post("/api/auth/register", {
          name,
          email,
          password,
          role,
        });
        
        setSuccess("Account successfully registered! Logging you in...");
        
        // Auto Login after registration
        const loginParams = new URLSearchParams();
        loginParams.append("username", email);
        loginParams.append("password", password);
        
        const loginRes = await api.post("/api/auth/login", loginParams, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });
        
        const token = loginRes.data.access_token;
        localStorage.setItem("token", token);
        
        // Pull user info
        const meRes = await api.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        localStorage.setItem("role", meRes.data.role);
        localStorage.setItem("userName", meRes.data.name || "Student");
        localStorage.setItem("userEmail", meRes.data.email);
        
        // Redirect
        if (meRes.data.role === "teacher") {
          router.push("/teacher");
        } else {
          router.push("/questionnaire");
        }
      } else {
        // Sign In Flow
        const loginParams = new URLSearchParams();
        loginParams.append("username", email);
        loginParams.append("password", password);
        
        const loginRes = await api.post("/api/auth/login", loginParams, {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        });
        
        const token = loginRes.data.access_token;
        localStorage.setItem("token", token);
        
        // Pull user info
        const meRes = await api.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        localStorage.setItem("role", meRes.data.role);
        localStorage.setItem("userName", meRes.data.name || "User");
        localStorage.setItem("userEmail", meRes.data.email);
        
        if (meRes.data.role === "teacher") {
          router.push("/teacher");
        } else {
          // Check if student has already completed a survey
          try {
            await api.get("/api/questionnaire/latest", {
              headers: { Authorization: `Bearer ${token}` },
            });
            localStorage.setItem("hasSubmittedSurvey", "true");
            router.push("/dashboard");
          } catch (qError: any) {
            router.push("/questionnaire");
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      let errorMessage = "Authentication request failed.";
      if (err.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (Array.isArray(detail)) {
          errorMessage = detail.map((d: any) => {
            // Strip out common pydantic prefixes if present for cleaner copy
            return d.msg.replace("Value error, ", "");
          }).join(", ");
        } else if (typeof detail === "string") {
          errorMessage = detail;
        } else {
          errorMessage = JSON.stringify(detail);
        }
      }
      setError(`${errorMessage} (Entering offline sandbox mode is available below)`);
    } finally {
      setLoading(false);
    }
  };

  const triggerGuestMode = (guestRole: string) => {
    localStorage.setItem("token", "mock-session-token");
    localStorage.setItem("role", guestRole);
    if (guestRole === "teacher") {
      localStorage.setItem("userName", "Professor Harrison");
      localStorage.setItem("userEmail", "harrison@university.edu");
      router.push("/teacher");
    } else {
      localStorage.setItem("userName", "Alex Mercer");
      localStorage.setItem("userEmail", "alex.mercer@student.edu");
      // Check if they want to build questionnaire first or go to dashboard
      router.push("/questionnaire");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center px-6 py-12 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[20%] left-[20%] -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[20%] right-[20%] translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-2xl mb-2">
            <GraduationCap className="h-5 w-5 text-indigo-400" />
            <span className="font-extrabold text-sm tracking-tight">Learn<span className="text-indigo-400">X</span>Plan</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Welcome to the AI Platform</h2>
          <p className="text-xs text-slate-400">Analyze habits, simulate what-if study metrics, and plan success.</p>
        </div>

        {/* Card Panel */}
        <div className="p-8 rounded-2xl glass-panel relative overflow-hidden shadow-2xl">
          
          {/* Tab Switcher */}
          <div className="flex border-b border-slate-900 mb-6 bg-slate-950/40 p-1.5 rounded-xl">
            <button
              onClick={() => {
                setIsSignUp(false);
                setError("");
              }}
              className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all ${
                !isSignUp 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/15" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setIsSignUp(true);
                setError("");
              }}
              className={`flex-1 text-center py-2.5 rounded-lg text-xs font-bold transition-all ${
                isSignUp 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/15" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Register
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-4 p-3 bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs rounded-xl flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-xs rounded-xl">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-slate-900 border border-slate-800/80 hover:border-slate-700/60 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu"
                  className="w-full bg-slate-900 border border-slate-800/80 hover:border-slate-700/60 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-800/80 hover:border-slate-700/60 rounded-xl py-3 pl-10 pr-4 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {isSignUp && (
              <div className="space-y-1.5 pt-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Account Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("student")}
                    className={`py-2 px-4 rounded-xl text-xs font-semibold border transition-all ${
                      role === "student"
                        ? "bg-indigo-600/10 border-indigo-500 text-indigo-400"
                        : "bg-slate-900 border-slate-800/80 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("teacher")}
                    className={`py-2 px-4 rounded-xl text-xs font-semibold border transition-all ${
                      role === "teacher"
                        ? "bg-indigo-600/10 border-indigo-500 text-indigo-400"
                        : "bg-slate-900 border-slate-800/80 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    Teacher
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/15 disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-1.5"
            >
              {loading ? (
                "Authorizing..."
              ) : (
                <>
                  {isSignUp ? "Register Account" : "Access Workspace"}{" "}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Guest Portal Callouts */}
          <div className="mt-8 pt-6 border-t border-slate-900 space-y-4">
            <div className="text-center">
              <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-widest block mb-3">Database Offline Sandbox Bypass</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => triggerGuestMode("student")}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-900/60 border border-slate-800/80 text-[10px] font-bold text-indigo-400 flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Sparkles className="h-3 w-3" /> Guest Student
              </button>
              <button
                type="button"
                onClick={() => triggerGuestMode("teacher")}
                className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-900/60 border border-slate-800/80 text-[10px] font-bold text-purple-400 flex items-center justify-center gap-1 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Sparkles className="h-3 w-3" /> Guest Teacher
              </button>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center text-[10px] text-slate-600 font-mono">
          Secure, authenticated connections powered by JSON Web Tokens.
        </div>

      </div>
    </div>
  );
}
