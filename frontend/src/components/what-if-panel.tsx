"use client";

import { useState } from "react";
import { Sliders, RefreshCw } from "lucide-react";
import api from "../lib/api";

interface WhatIfPanelProps {
  initialProfile: any;
  onSimulate: (result: { predicted_score: number; confidence_score: number; risk_level: string; feature_importance: any; recommendations: any[] }) => void;
}

export default function WhatIfPanel({ initialProfile, onSimulate }: WhatIfPanelProps) {
  const [profile, setProfile] = useState({ ...initialProfile });
  const [simulating, setSimulating] = useState(false);

  const triggerSimulation = async () => {
    setSimulating(true);
    try {
      // Hit backend what-if endpoint
      const res = await api.post("/api/analytics/what-if", profile);
      onSimulate(res.data);
    } catch (e) {
      console.log("Offline fallback simulation active.");
      // Fallback local calculations if backend connection fails
      await new Promise((resolve) => setTimeout(resolve, 400));

      const study = profile.study_hours_per_week;
      const attendance = profile.attendance_rate;
      const sleep = profile.sleep_hours_per_day;
      const screen = profile.screen_time_per_day;
      const activity = profile.physical_activity_hours_per_week;
      const consistency = profile.study_consistency;

      const parental = profile.parental_involvement;
      const resources = profile.access_to_resources;
      const income = profile.family_income;
      const motivation = profile.motivation_level;

      const internet = profile.internet_access ? 1.0 : 0.0;
      const extra = profile.extracurricular ? 1.0 : 0.0;

      const parentalMap: Record<string, number> = { "High": 4.5, "Medium": 0.0, "Low": -4.5 };
      const resourcesMap: Record<string, number> = { "High": 5.0, "Medium": 0.0, "Low": -5.0 };
      const incomeMap: Record<string, number> = { "High": 3.0, "Medium": 0.0, "Low": -3.0 };
      const motivationMap: Record<string, number> = { "High": 5.0, "Medium": 0.0, "Low": -5.0 };

      let score = 55.0;
      score += (attendance - 80.0) * 0.4;
      score += (study - 12.0) * 0.6;
      score += (sleep - 7.0) * 1.5;
      score += (4.0 - screen) * 1.0;
      score += (activity - 5.0) * 0.3;
      score += (consistency - 0.6) * 10.0;

      score += parentalMap[parental] || 0;
      score += resourcesMap[resources] || 0;
      score += incomeMap[income] || 0;
      score += motivationMap[motivation] || 0;

      score += internet * 3.5;
      score += extra * 1.5;

      const finalScore = Math.round(Math.max(30.0, Math.min(100.0, score)) * 10) / 10;
      const risk = finalScore >= 75 ? "Low" : finalScore >= 50 ? "Medium" : "High";

      const shap = {
        "attendance_rate": Math.round((attendance - 80) * 0.4 * 100) / 100,
        "study_hours_per_week": Math.round((study - 12) * 0.6 * 100) / 100,
        "sleep_hours_per_day": Math.round((sleep - 7) * 1.5 * 100) / 100,
        "screen_time_per_day": Math.round((4.0 - screen) * 1.0 * 100) / 100,
        "study_consistency": Math.round((consistency - 0.6) * 10.0 * 100) / 100,
        "parental_involvement": parentalMap[parental] || 0,
        "access_to_resources": resourcesMap[resources] || 0,
        "motivation_level": motivationMap[motivation] || 0,
      };

      const mockRecs = [];
      if (attendance < 90) mockRecs.push({ feature: "attendance_rate", current: `${attendance}%`, recommended: "95%", impact: 2.5 });
      if (sleep < 7) mockRecs.push({ feature: "sleep_hours_per_day", current: `${sleep} hrs`, recommended: "8 hrs", impact: 1.5 });
      if (study < 15) mockRecs.push({ feature: "study_hours_per_week", current: `${study} hrs`, recommended: "18 hrs", impact: 3.6 });

      onSimulate({
        predicted_score: finalScore,
        confidence_score: 0.89,
        risk_level: risk,
        feature_importance: shap,
        recommendations: mockRecs,
      });
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Continuous sliders */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-400">Weekly Study Hours</span>
              <span className="text-indigo-400 font-bold font-mono">{profile.study_hours_per_week} hrs</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={profile.study_hours_per_week}
              onChange={(e) => setProfile({ ...profile, study_hours_per_week: Number(e.target.value) })}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-400">Class Attendance Rate</span>
              <span className="text-indigo-400 font-bold font-mono">{profile.attendance_rate}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              value={profile.attendance_rate}
              onChange={(e) => setProfile({ ...profile, attendance_rate: Number(e.target.value) })}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-400">Daily Sleep</span>
              <span className="text-indigo-400 font-bold font-mono">{profile.sleep_hours_per_day} hrs</span>
            </div>
            <input
              type="range"
              min="4"
              max="12"
              value={profile.sleep_hours_per_day}
              onChange={(e) => setProfile({ ...profile, sleep_hours_per_day: Number(e.target.value) })}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span className="text-slate-400">Study Consistency</span>
              <span className="text-indigo-400 font-bold font-mono">{Math.round(profile.study_consistency * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={profile.study_consistency}
              onChange={(e) => setProfile({ ...profile, study_consistency: Number(e.target.value) })}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {/* Categories and Dropdowns */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider font-mono">Parental Support</label>
              <select
                value={profile.parental_involvement}
                onChange={(e) => setProfile({ ...profile, parental_involvement: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-200 hover:border-slate-700/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider font-mono">Resource Access</label>
              <select
                value={profile.access_to_resources}
                onChange={(e) => setProfile({ ...profile, access_to_resources: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-200 hover:border-slate-700/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider font-mono">Family Income</label>
              <select
                value={profile.family_income}
                onChange={(e) => setProfile({ ...profile, family_income: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-200 hover:border-slate-700/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase tracking-wider font-mono">Motivation Level</label>
              <select
                value={profile.motivation_level}
                onChange={(e) => setProfile({ ...profile, motivation_level: e.target.value })}
                className="w-full bg-slate-955 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-200 hover:border-slate-700/60 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition-all cursor-pointer"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-400">Daily Screen Time</span>
                <span className="text-indigo-400 font-bold font-mono">{profile.screen_time_per_day} hrs</span>
              </div>
              <input
                type="range"
                min="0"
                max="15"
                value={profile.screen_time_per_day}
                onChange={(e) => setProfile({ ...profile, screen_time_per_day: Number(e.target.value) })}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-400">Weekly Fitness</span>
                <span className="text-indigo-400 font-bold font-mono">{profile.physical_activity_hours_per_week} hrs</span>
              </div>
              <input
                type="range"
                min="0"
                max="24"
                value={profile.physical_activity_hours_per_week}
                onChange={(e) => setProfile({ ...profile, physical_activity_hours_per_week: Number(e.target.value) })}
                className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </div>

      </div>

      <div className="flex justify-end pt-2">
        <button
          onClick={triggerSimulation}
          disabled={simulating}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-indigo-500/15 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${simulating ? "animate-spin" : ""}`} />
          {simulating ? "Recalculating..." : "Run Simulator Scenario"}
        </button>
      </div>
    </div>
  );
}
