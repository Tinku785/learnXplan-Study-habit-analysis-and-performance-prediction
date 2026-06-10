"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, User, Save, Check, StopCircle, Loader2, MessageSquare, Zap } from "lucide-react";
import ReactMarkdown from "react-markdown";
import api from "../lib/api";

interface Message {
  id: number;
  sender: "user" | "coach";
  text: string;
  timestamp: Date;
}

interface SavedPlan {
  id: string;
  plan_content: string;
  created_at: string;
}

interface AICoachChatProps {
  studentProfile: any;
  prediction: { predicted_score: number; risk_level: string };
  onPlanSaved?: (plan: SavedPlan) => void;
  compact?: boolean;
}

const QUICK_PROMPTS = [
  { label: "7-Day Study Plan", prompt: "Create a detailed 7-day study plan for me based on my profile." },
  { label: "Risk Reduction", prompt: "What are the top 3 things I can do to lower my academic risk?" },
  { label: "Sleep & Marks", prompt: "Explain how sleep affects my predicted exam score with specific advice." },
  { label: "Consistency Tips", prompt: "Give me 5 actionable study consistency tips tailored to my schedule." },
  { label: "30-Day Plan", prompt: "Create a 30-day improvement roadmap targeting my weakest areas." },
];

export default function AICoachChat({
  studentProfile,
  prediction,
  onPlanSaved,
  compact = false,
}: AICoachChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "coach",
      text: `Hello! 👋 I'm your **LearnXPlan AI Coach**, powered by advanced language models.\n\nI can see your current profile:\n- **Predicted Score**: ${prediction.predicted_score}% (${prediction.risk_level} Risk)\n- **Study Hours**: ${studentProfile.study_hours_per_week} hrs/week\n- **Attendance**: ${studentProfile.attendance_rate}%\n\nI can help you with personalized study plans, risk reduction strategies, and academic optimization. What would you like to work on today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedMessageIds, setSavedMessageIds] = useState<number[]>([]);
  const [savingMessageId, setSavingMessageId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      sender: "user",
      text: textToSend,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await api.post("/api/coach/chat", { message: textToSend });
      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "coach",
          text: res.data.response,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      console.log("Offline coach fallback active.");
      await new Promise((resolve) => setTimeout(resolve, 800));

      const study = studentProfile.study_hours_per_week;
      const query = textToSend.toLowerCase();
      let coachAdvice = "";

      if (query.includes("7") && query.includes("plan")) {
        coachAdvice = `## 📅 Your Personalized 7-Day Study Plan\n\nBased on your profile (${study} hrs/week, ${prediction.predicted_score}% predicted), here's your optimized schedule:\n\n### Day 1 – Foundation Reset\n- **Morning (7–9 AM):** Review previous week's notes\n- **Evening (6–8 PM):** Focus on your weakest subject\n- 🎯 *Goal: Identify knowledge gaps*\n\n### Day 2 – Deep Work Session\n- **Morning (7–9 AM):** Active reading & mind-mapping\n- **Evening (6–8 PM):** Practice problems\n- 🎯 *Goal: Build conceptual understanding*\n\n### Day 3 – Active Recall Practice\n- **Morning (7–8:30 AM):** Flashcard review\n- **Evening (6–8 PM):** Mock test (timed)\n- 🎯 *Goal: Strengthen memory retention*\n\n### Day 4 – Rest & Light Review\n- **Morning (8–9 AM):** Light reading only\n- **No evening sessions** – Recovery day\n- 🎯 *Goal: Cognitive recovery*\n\n### Day 5–6 – Intensive Revision\n- **Morning (7–9 AM):** Full subject revision\n- **Evening (6–8:30 PM):** Problem solving\n- 🎯 *Goal: Consolidate learning*\n\n### Day 7 – Assessment & Planning\n- **Morning (8–10 AM):** Full mock test\n- **Afternoon:** Review errors & plan next week\n- 🎯 *Goal: Track progress & iterate*\n\n---\n**💡 Tip:** Stick to 2-hour blocks with 15-minute breaks. Avoid cramming — spacing is key!`;
      } else if (query.includes("risk") || query.includes("lower")) {
        coachAdvice = `## 🎯 Top 3 Risk Reduction Strategies\n\nYour current risk level is **${prediction.risk_level}** with a predicted score of **${prediction.predicted_score}%**. Here's how to improve:\n\n### 1. 📈 Boost Attendance to 95%+\n- **Current:** ${studentProfile.attendance_rate}%\n- **Target:** 95%\n- **Impact:** +2.5 predicted marks\n- Missing class = missing context that's hard to recover\n\n### 2. ⏰ Optimize Study Hours\n- **Current:** ${study} hrs/week\n- **Target:** 18+ hrs/week\n- **Impact:** +3.6 predicted marks\n- Use the Pomodoro method: 25-min blocks with 5-min breaks\n\n### 3. 😴 Fix Your Sleep Schedule\n- **Current:** ${studentProfile.sleep_hours_per_day} hrs/day\n- **Target:** 8 hrs/day\n- **Impact:** +1.5 predicted marks\n- Sleep consolidates memory — non-negotiable for academic success`;
      } else if (query.includes("sleep")) {
        coachAdvice = `## 😴 Sleep & Academic Performance\n\nYour current sleep is **${studentProfile.sleep_hours_per_day} hrs/day**. Here's the science:\n\n### Why Sleep Matters\n- **Memory consolidation** happens during REM sleep\n- Lack of sleep reduces **attention span by 30%**\n- 8 hours = optimal cognitive performance\n\n### Your Action Plan\n1. **Set a fixed sleep time** (e.g., 10:30 PM – 6:30 AM)\n2. **Avoid screens 1hr before bed** — blue light disrupts melatonin\n3. **No caffeine after 2 PM**\n4. Keep your room **cool (18–20°C)** and dark\n\n### Expected Impact\nImproving sleep from ${studentProfile.sleep_hours_per_day} to 8 hrs could add **+1.5 marks** to your predicted score. 🌙`;
      } else {
        coachAdvice = `## 💡 Personalized Academic Advice\n\nBased on your profile, here are my top recommendations:\n\n### Current Status\n| Factor | Your Value | Optimal |\n|--------|-----------|--------|\n| Study Hours | ${study} hrs/wk | 18+ hrs |\n| Attendance | ${studentProfile.attendance_rate}% | 95%+ |\n| Sleep | ${studentProfile.sleep_hours_per_day} hrs | 8 hrs |\n\n### Quick Wins\n1. **Consistency** > Intensity — study a little every day\n2. **Active recall** beats passive reading (flashcards, quizzes)\n3. **Reduce screen time** to free up focus bandwidth\n\nWould you like a **detailed plan** for any specific area? Try asking for a *7-day study plan* or *risk reduction tips*! 🚀`;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sender: "coach",
          text: coachAdvice,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePlan = async (msg: Message) => {
    if (savingMessageId === msg.id || savedMessageIds.includes(msg.id)) return;
    setSavingMessageId(msg.id);
    try {
      const res = await api.post("/api/coach/plans", { plan_content: msg.text });
      setSavedMessageIds((prev) => [...prev, msg.id]);
      if (onPlanSaved && res.data) {
        onPlanSaved(res.data);
      }
    } catch (e) {
      console.error("Failed to save plan", e);
    } finally {
      setSavingMessageId(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(input);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  // ── COMPACT MODE (sidebar widget) ──
  if (compact) {
    return (
      <div className="flex flex-col h-full gap-3">
        {/* Message Feed */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[320px] scrollbar-thin">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-2 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`p-1.5 rounded-xl border flex-shrink-0 mt-0.5 ${
                msg.sender === "user"
                  ? "bg-slate-900 border-slate-800 text-indigo-400"
                  : "bg-indigo-950/40 border-indigo-900/60 text-indigo-400"
              }`}>
                {msg.sender === "user" ? <User className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
              </div>
              <div className={`flex flex-col gap-1.5 max-w-[85%] ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === "user"
                    ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-tr-none"
                    : "bg-slate-900/80 border border-slate-800 text-slate-300 rounded-tl-none prose prose-invert prose-xs prose-indigo max-w-none prose-p:leading-relaxed prose-li:my-0 prose-p:my-0.5 prose-headings:my-1"
                }`}>
                  {msg.sender === "coach" ? (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
                {msg.sender === "coach" && msg.id !== 1 && (
                  <button
                    onClick={() => handleSavePlan(msg)}
                    disabled={savedMessageIds.includes(msg.id) || savingMessageId === msg.id}
                    className={`flex items-center gap-1 px-2 py-1 text-[9px] font-bold uppercase tracking-wider rounded-lg transition-all border ${
                      savedMessageIds.includes(msg.id)
                        ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/60"
                        : "bg-slate-900/40 text-slate-500 border-slate-800 hover:bg-slate-800 hover:text-indigo-300"
                    }`}
                  >
                    {savingMessageId === msg.id ? (
                      <Loader2 className="h-2.5 w-2.5 animate-spin" />
                    ) : savedMessageIds.includes(msg.id) ? (
                      <><Check className="h-2.5 w-2.5" /> Saved</>
                    ) : (
                      <><Save className="h-2.5 w-2.5" /> Save Plan</>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-start gap-2">
              <div className="p-1.5 rounded-xl bg-indigo-950/40 border border-indigo-900/60 text-indigo-400 mt-0.5">
                <Sparkles className="h-3 w-3 animate-pulse" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-500 italic rounded-tl-none flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-900/80">
          {QUICK_PROMPTS.slice(0, 3).map((p) => (
            <button
              key={p.label}
              type="button"
              disabled={loading}
              onClick={() => handleSend(p.prompt)}
              className="text-[8px] font-bold font-mono tracking-wide px-2 py-1 bg-slate-900 hover:bg-slate-900/60 border border-slate-800 text-indigo-400 rounded-lg transition-all disabled:opacity-50"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }} className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI Coach..."
            className="flex-1 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all disabled:opacity-50 active:scale-95"
          >
            <Send className="h-3 w-3" />
          </button>
        </form>
      </div>
    );
  }

  // ── FULL PAGE MODE ──
  return (
    <div className="flex flex-col h-full bg-slate-950 rounded-3xl border border-slate-800/60 overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-sm flex-shrink-0">
        <div className="relative">
          <div className="p-2.5 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 text-indigo-400 rounded-2xl">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse"></span>
        </div>
        <div>
          <h2 className="font-extrabold text-base text-slate-100 tracking-tight">LearnXPlan AI Coach</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span> Online
            </span>
            <span className="text-[10px] text-slate-600">•</span>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Gemini AI • Personalized</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-xl flex items-center gap-1.5">
            <Zap className="h-3 w-3 text-amber-400" />
            <span className="text-[10px] font-bold text-slate-300">{prediction.predicted_score}% predicted</span>
          </div>
          <div className={`px-2.5 py-1 border rounded-xl text-[10px] font-bold uppercase ${
            prediction.risk_level === "Low" ? "bg-emerald-950/60 border-emerald-800/60 text-emerald-400" :
            prediction.risk_level === "Medium" ? "bg-amber-950/60 border-amber-800/60 text-amber-400" :
            "bg-rose-950/60 border-rose-800/60 text-rose-400"
          }`}>
            {prediction.risk_level} Risk
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center border ${
              msg.sender === "user"
                ? "bg-indigo-600/20 border-indigo-500/30 text-indigo-400"
                : "bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border-indigo-500/20 text-indigo-400"
            }`}>
              {msg.sender === "user" ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            </div>

            {/* Bubble */}
            <div className={`flex flex-col gap-2 max-w-[80%] ${msg.sender === "user" ? "items-end" : "items-start"}`}>
              <div className={`text-[10px] font-semibold flex items-center gap-2 ${
                msg.sender === "user" ? "text-slate-500 flex-row-reverse" : "text-slate-500"
              }`}>
                <span>{msg.sender === "user" ? "You" : "AI Coach"}</span>
                <span className="text-slate-700">{formatTime(msg.timestamp)}</span>
              </div>

              <div className={`rounded-2xl text-sm leading-relaxed shadow-sm ${
                msg.sender === "user"
                  ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white px-4 py-3 rounded-tr-none shadow-indigo-500/10"
                  : "bg-slate-900 border border-slate-800 text-slate-200 px-5 py-4 rounded-tl-none prose prose-invert prose-sm prose-indigo max-w-none prose-p:leading-relaxed prose-p:my-1 prose-li:my-0.5 prose-ul:my-2 prose-ol:my-2 prose-headings:text-slate-100 prose-headings:font-bold prose-h2:text-base prose-h3:text-sm prose-h4:text-xs prose-strong:text-indigo-300 prose-code:text-indigo-300 prose-code:bg-indigo-950/40 prose-code:px-1 prose-code:rounded prose-table:text-xs prose-th:text-slate-300 prose-td:text-slate-400 prose-hr:border-slate-800"
              }`}>
                {msg.sender === "coach" ? (
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                ) : (
                  <span>{msg.text}</span>
                )}
              </div>

              {/* Save Plan Button */}
              {msg.sender === "coach" && msg.id !== 1 && (
                <button
                  onClick={() => handleSavePlan(msg)}
                  disabled={savedMessageIds.includes(msg.id) || savingMessageId === msg.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all border ${
                    savedMessageIds.includes(msg.id)
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-900/60 cursor-default"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-indigo-300 hover:border-indigo-900/60 active:scale-95"
                  }`}
                >
                  {savingMessageId === msg.id ? (
                    <><Loader2 className="h-3 w-3 animate-spin" /> Saving...</>
                  ) : savedMessageIds.includes(msg.id) ? (
                    <><Check className="h-3 w-3" /> Saved to Dashboard</>
                  ) : (
                    <><Save className="h-3 w-3" /> Save Plan to Dashboard</>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20 text-indigo-400">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-5 py-4">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
                <span className="italic text-xs">AI Coach is thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      <div className="px-6 py-3 border-t border-slate-800/60 bg-slate-900/20 flex-shrink-0">
        <p className="text-[9px] text-slate-600 uppercase tracking-widest font-mono font-bold mb-2">Quick Prompts</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p.label}
              type="button"
              disabled={loading}
              onClick={() => handleSend(p.prompt)}
              className="text-[10px] font-semibold px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-900/60 text-indigo-400 hover:text-indigo-300 rounded-xl transition-all disabled:opacity-40 active:scale-95 flex items-center gap-1.5"
            >
              <Zap className="h-2.5 w-2.5" />
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-slate-800/60 bg-slate-900/30 flex-shrink-0">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
          className="flex items-end gap-3"
        >
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask for a study plan, risk advice, or academic tips... (Enter to send, Shift+Enter for new line)"
              rows={1}
              style={{ minHeight: "44px", maxHeight: "120px", resize: "none" }}
              className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 focus:border-indigo-500 rounded-2xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-all leading-relaxed overflow-auto"
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 120) + "px";
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex-shrink-0 p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/40 disabled:text-indigo-800 text-white rounded-2xl transition-all shadow-lg shadow-indigo-500/10 disabled:opacity-50 active:scale-95"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
        <p className="text-[9px] text-slate-700 mt-2 text-center font-mono">
          Press Enter to send • Shift+Enter for new line • Powered by Gemini AI
        </p>
      </div>
    </div>
  );
}
