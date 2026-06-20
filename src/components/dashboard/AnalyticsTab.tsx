"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { AnimatedNumber } from "./AnimatedNumber";
import { staggerContainer, riseItem } from "./motion";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Flame,
  Footprints,
  Sparkles,
  Loader2,
  FileText,
  Lightbulb,
  Target,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type AnalyticsDay = {
  date: string;
  day: string;
  calories: number;
  steps: number;
  protein: number;
};

function getLast7Days(): AnalyticsDay[] {
  const days: AnalyticsDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      date: d.toISOString().split("T")[0],
      day: dayNames[d.getDay()],
      calories: 0,
      steps: 0,
      protein: 0,
    });
  }
  return days;
}

export default function AnalyticsTab() {
  const [data, setData] = useState<AnalyticsDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((s) => s.user);

  // Weekly report state
  const [report, setReport] = useState<{
    summary: string;
    insights: string[];
    recommendations: string[];
    adherenceScore: number;
  } | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  const handleGenerateReport = async () => {
    setReportLoading(true);
    setReportError("");
    setReport(null);
    try {
      const logs = await api.weeklyLogs();
      const result = await api.weeklyReport({
        userContext: user ?? undefined,
        recentLogs: logs.map((l) => ({
          date: l.date,
          calories: l.calories,
          protein: l.protein,
          carbs: l.carbs,
          fat: l.fat,
          steps: l.steps,
        })),
      });
      setReport(result);
    } catch (err) {
      setReportError(
        err instanceof Error ? err.message : "Failed to generate report."
      );
    } finally {
      setReportLoading(false);
    }
  };

  useEffect(() => {
    const fetchWeeklyAnalytics = async () => {
      try {
        const logs = await api.weeklyLogs();
        const logArr = logs || [];
        const days = getLast7Days();
        const merged = days.map((day) => {
          const log = logArr.find((l) => l.date === day.date);
          return {
            ...day,
            calories: log?.calories || 0,
            steps: log?.steps || 0,
            protein: log?.protein || 0,
          };
        });
        setData(merged);
      } catch (err) {
        console.error("Analytics fetch failed:", err);
        setData(getLast7Days());
      } finally {
        setIsLoading(false);
      }
    };
    void fetchWeeklyAnalytics();
  }, []);

  // Premium shimmer skeleton while data loads
  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="nf-premium rounded-3xl p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 nf-shimmer" />
                <div className="h-3 w-24 rounded bg-slate-100 nf-shimmer" />
              </div>
              <div className="h-8 w-24 rounded-lg bg-slate-100 nf-shimmer" />
              <div className="h-2.5 w-16 rounded bg-slate-100 nf-shimmer" />
            </div>
          ))}
        </div>
        <div className="nf-premium rounded-3xl p-6 space-y-6">
          <div className="h-5 w-40 rounded bg-slate-100 nf-shimmer" />
          <div className="h-[280px] w-full rounded-2xl bg-slate-100/60 nf-shimmer" />
        </div>
        <div className="nf-premium rounded-3xl p-6 space-y-6">
          <div className="h-5 w-40 rounded bg-slate-100 nf-shimmer" />
          <div className="h-[280px] w-full rounded-2xl bg-slate-100/60 nf-shimmer" />
        </div>
      </div>
    );
  }

  const avgCalories = Math.round(
    data.reduce((s, d) => s + d.calories, 0) / 7,
  );
  const avgSteps = Math.round(data.reduce((s, d) => s + d.steps, 0) / 7);
  const daysLogged = data.filter((d) => d.calories > 0).length;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* SUMMARY STATS */}
      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6"
      >
        <motion.div
          variants={riseItem}
          whileHover={{ y: -4 }}
          className="nf-premium rounded-3xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 ring-1 ring-emerald-100">
              <Flame size={18} />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Avg Calories
            </span>
          </div>
          <AnimatedNumber
            value={avgCalories}
            format={(n) => Math.round(n).toLocaleString()}
            className="nf-stat text-3xl font-black text-slate-900 tracking-tight"
          />
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
            kcal / day
          </p>
        </motion.div>

        <motion.div
          variants={riseItem}
          whileHover={{ y: -4 }}
          className="nf-premium rounded-3xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 text-cyan-600 ring-1 ring-cyan-100">
              <Footprints size={18} />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Avg Steps
            </span>
          </div>
          <AnimatedNumber
            value={avgSteps}
            format={(n) => Math.round(n).toLocaleString()}
            className="nf-stat text-3xl font-black text-slate-900 tracking-tight"
          />
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
            steps / day
          </p>
        </motion.div>

        <motion.div
          variants={riseItem}
          whileHover={{ y: -4 }}
          className="nf-premium rounded-3xl p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 text-teal-600 ring-1 ring-teal-100">
              <TrendingUp size={18} />
            </div>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Days Logged
            </span>
          </div>
          <AnimatedNumber
            value={daysLogged}
            className="nf-stat text-3xl font-black text-slate-900 tracking-tight"
          />
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">
            of last 7
          </p>
        </motion.div>
      </motion.div>

      {/* RECHARTS: Steps Bar Chart */}
      <motion.div
        variants={riseItem}
        whileHover={{ y: -4 }}
        className="nf-premium rounded-3xl p-6 space-y-6"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-50 to-cyan-100 text-cyan-600 ring-1 ring-cyan-100">
              <BarChart3 size={18} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Step Tracking
              </h3>
              <p className="text-xs text-slate-400 font-semibold">
                Daily step counts this week
              </p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 bg-slate-50 border border-slate-100 font-bold rounded-lg text-slate-500 flex items-center gap-1">
            <Calendar size={12} /> 7 Days
          </span>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} barCategoryGap="28%">
            <defs>
              <linearGradient id="stepsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#14b8a6" />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{ fill: "oklch(0.6 0.12 185 / 0.06)" }}
            />
            <Bar
              dataKey="steps"
              fill="url(#stepsGradient)"
              radius={[8, 8, 0, 0]}
              animationDuration={1200}
              animationBegin={200}
            />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* RECHARTS: Calorie & Protein Area Chart */}
      <motion.div
        variants={riseItem}
        whileHover={{ y: -4 }}
        className="nf-premium rounded-3xl p-6 space-y-6"
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-600 ring-1 ring-emerald-100">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                Calorie Trend
              </h3>
              <p className="text-xs text-slate-400 font-semibold">
                Calories and protein over the week
              </p>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="calArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="proArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0d9488" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#0d9488" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              vertical={false}
            />
            <XAxis
              dataKey="day"
              tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 700 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              cursor={{
                stroke: "#cbd5e1",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="calories"
              stroke="#10b981"
              strokeWidth={3}
              fill="url(#calArea)"
              isAnimationActive
              animationDuration={1500}
              activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }}
              name="Calories"
              style={{ filter: "drop-shadow(0 2px 6px oklch(0.6 0.14 160 / 0.4))" }}
            />
            <Area
              type="monotone"
              dataKey="protein"
              stroke="#0d9488"
              strokeWidth={3}
              fill="url(#proArea)"
              isAnimationActive
              animationDuration={1500}
              animationBegin={300}
              activeDot={{ r: 6, strokeWidth: 0, fill: "#0d9488" }}
              name="Protein (g)"
              style={{ filter: "drop-shadow(0 2px 6px oklch(0.5 0.12 175 / 0.35))" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* AI WEEKLY REPORT */}
      <motion.div
        variants={riseItem}
        className="nf-premium nf-aurora-border rounded-3xl p-6 space-y-5"
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-500 text-white rounded-xl shadow-lg shadow-teal-500/20">
              <FileText size={18} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                AI Weekly Report
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Personalized insights from your week's data
              </p>
            </div>
          </div>
          <motion.button
            onClick={handleGenerateReport}
            disabled={reportLoading}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="nf-btn-gradient nf-shimmer px-5 py-2.5 rounded-xl font-black text-sm uppercase tracking-wider flex items-center gap-2 disabled:opacity-60"
          >
            {reportLoading ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Analyzing…
              </>
            ) : (
              <>
                <Sparkles size={15} /> Generate Report
              </>
            )}
          </motion.button>
        </div>

        {reportError && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle size={14} /> {reportError}
          </div>
        )}

        {report && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-5"
          >
            {/* Adherence score ring */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-slate-50 to-white rounded-2xl border border-slate-200/60">
              <div className="relative size-16 shrink-0">
                <svg className="size-16 -rotate-90" viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="6" />
                  <motion.circle
                    cx="32" cy="32" r="28" fill="none"
                    stroke={report.adherenceScore >= 70 ? "#10b981" : report.adherenceScore >= 40 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 28}
                    initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                    animate={{
                      strokeDashoffset: 2 * Math.PI * 28 - (report.adherenceScore / 100) * 2 * Math.PI * 28,
                    }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-black nf-stat text-slate-800">
                    {report.adherenceScore}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
                  Adherence Score
                </p>
                <p className="text-sm font-bold text-slate-700 mt-0.5">
                  {report.adherenceScore >= 70
                    ? "Great consistency this week! 🎉"
                    : report.adherenceScore >= 40
                    ? "Decent progress — room to improve. 💪"
                    : "Let's get back on track next week. 📈"}
                </p>
              </div>
            </div>

            {/* Summary */}
            <div className="p-4 bg-cyan-50/60 rounded-2xl border border-cyan-100/60">
              <p className="text-sm font-semibold text-slate-700 leading-relaxed">
                {report.summary}
              </p>
            </div>

            {/* Insights */}
            <div className="space-y-2">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Lightbulb size={13} className="text-amber-500" /> Key Insights
              </p>
              {report.insights.map((insight, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="flex items-start gap-2.5 p-3 bg-white/60 rounded-xl border border-slate-200/60"
                >
                  <span className="size-1.5 rounded-full bg-cyan-400 mt-2 shrink-0" />
                  <p className="text-sm font-medium text-slate-600">{insight}</p>
                </motion.div>
              ))}
            </div>

            {/* Recommendations */}
            <div className="space-y-2">
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Target size={13} className="text-emerald-500" /> Recommendations for Next Week
              </p>
              {report.recommendations.map((rec, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-start gap-2.5 p-3 bg-emerald-50/60 rounded-xl border border-emerald-100/60"
                >
                  <span className="size-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                  <p className="text-sm font-medium text-slate-600">{rec}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
