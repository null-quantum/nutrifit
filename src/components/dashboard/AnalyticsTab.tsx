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
} from "lucide-react";
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
    </motion.div>
  );
}
