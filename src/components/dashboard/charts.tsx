"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  YAxis,
  Tooltip,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import { useMemo } from "react";

/**
 * Reads a CSS variable from :root and returns its value.
 * Re-reads when the theme changes (via a MutationObserver on data-theme).
 * This is needed because Recharts SVG attributes can't use var() directly.
 */
function useThemeVar(varName: string, fallback: string): string {
  const [val, setVal] = useState(fallback);

  useEffect(() => {
    const read = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      if (v) setVal(v);
    };
    read();
    // Watch for theme changes
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "style"] });
    return () => observer.disconnect();
  }, [varName]);

  return val;
}

/* ============================================================
   MINI SPARKLINE
   Tiny animated line chart for metric cards.
   ============================================================ */

type SparklineProps = {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
};

export function Sparkline({
  data,
  color = "#06b6d4",
  height = 40,
  className = "",
}: SparklineProps) {
  const chartData = useMemo(
    () => data.map((v, i) => ({ x: i, y: v })),
    [data]
  );

  const gradientId = `spark-${color.replace("#", "")}`;

  return (
    <div className={className} style={{ height, width: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis domain={["dataMin - 5", "dataMax + 5"]} hide />
          <Tooltip
            contentStyle={{
              background: "rgba(15,23,42,0.9)",
              border: "none",
              borderRadius: "8px",
              fontSize: "11px",
              color: "#fff",
              padding: "4px 8px",
            }}
            labelFormatter={() => ""}
            formatter={(v: number) => [`${v}`, ""]}
            cursor={false}
          />
          <Area
            type="monotone"
            dataKey="y"
            stroke={color}
            strokeWidth={2}
            fill={`url(#${gradientId})`}
            isAnimationActive
            animationDuration={1200}
            animationBegin={200}
            dot={false}
            activeDot={{ r: 3, strokeWidth: 0, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ============================================================
   CALORIE RING
   Large animated radial progress chart.
   ============================================================ */

type CalorieRingProps = {
  value: number;
  target: number;
  size?: number;
  label?: string;
  sublabel?: string;
  color?: string;
};

export function CalorieRing({
  value,
  target,
  size = 200,
  label = "",
  sublabel = "",
}: CalorieRingProps) {
  const pct = Math.min(Math.round((value / target) * 100), 100);
  const ringFrom = useThemeVar("--nf-ring-from", "#06b6d4");
  const ringVia = useThemeVar("--nf-ring-via", "#14b8a6");
  const ringTo = useThemeVar("--nf-ring-to", "#10b981");
  const data = [{ name: "progress", value: pct, fill: ringFrom }];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="72%"
          outerRadius="100%"
          barSize={14}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <defs>
            <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={ringFrom} />
              <stop offset="50%" stopColor={ringVia} />
              <stop offset="100%" stopColor={ringTo} />
            </linearGradient>
          </defs>
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: "rgba(0,0,0,0.06)" }}
            dataKey="value"
            cornerRadius={10}
            fill="url(#ringGrad)"
            isAnimationActive
            animationDuration={1400}
            animationBegin={300}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <motion.span
          className="text-3xl md:text-4xl font-black text-slate-900 nf-stat"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          {value.toLocaleString()}
        </motion.span>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
          {label || `/ ${target.toLocaleString()} kcal`}
        </span>
        {sublabel && (
          <span className="text-[10px] font-bold text-emerald-500 mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   MACRO DONUT
   Animated donut chart showing macro distribution.
   ============================================================ */

type MacroDonutProps = {
  protein: number;
  carbs: number;
  fat: number;
  size?: number;
};

export function MacroDonut({
  protein,
  carbs,
  fat,
  size = 160,
}: MacroDonutProps) {
  const total = protein + carbs + fat || 1;
  const data = [
    { name: "Protein", value: protein, fill: "#f43f5e" },
    { name: "Carbs", value: carbs, fill: "#f59e0b" },
    { name: "Fat", value: fat, fill: "#0ea5e9" },
  ];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="90%"
          barSize={20}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, total]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: "rgba(0,0,0,0.04)" }}
            dataKey="value"
            cornerRadius={8}
            isAnimationActive
            animationDuration={1200}
            animationBegin={400}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-xl font-black text-slate-800 nf-stat">
          {total}g
        </span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Total Macros
        </span>
      </div>
    </div>
  );
}

/* ============================================================
   LIVE METRIC CARD
   Card with a mini sparkline + animated number.
   ============================================================ */

type LiveMetricCardProps = {
  label: string;
  value: number;
  unit: string;
  target?: number;
  data: number[];
  color: string;
  icon: React.ReactNode;
  delay?: number;
};

export function LiveMetricCard({
  label,
  value,
  unit,
  target,
  data,
  color,
  icon,
  delay = 0,
}: LiveMetricCardProps) {
  const pct = target ? Math.min(Math.round((value / target) * 100), 100) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="nf-premium rounded-2xl p-5 group cursor-default"
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="p-2 rounded-lg"
          style={{ background: `${color}15`, color }}
        >
          {icon}
        </div>
        {pct !== null && (
          <span
            className="text-[10px] font-black px-2 py-0.5 rounded-full"
            style={{
              background: pct >= 70 ? "#10b98115" : pct >= 40 ? "#f59e0b15" : "#ef444415",
              color: pct >= 70 ? "#10b981" : pct >= 40 ? "#f59e0b" : "#ef4444",
            }}
          >
            {pct}%
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-slate-900 nf-stat mb-0.5">
        {value.toLocaleString()}
        <span className="text-sm font-bold text-slate-400 ml-1">{unit}</span>
      </p>
      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
        {label}
        {target ? ` / ${target.toLocaleString()}` : ""}
      </p>
      <Sparkline data={data} color={color} height={36} />
    </motion.div>
  );
}

/* ============================================================
   WEEKLY TREND CHART
   Interactive area chart showing calories over 7 days.
   ============================================================ */

type WeeklyTrendChartProps = {
  targetCalories?: number;
  className?: string;
};

export function WeeklyTrendChart({
  targetCalories = 2200,
  className = "",
}: WeeklyTrendChartProps) {
  const accent = useThemeVar("--nf-accent", "#06b6d4");
  const accent2 = useThemeVar("--nf-accent-2", "#14b8a6");
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const data = useMemo(() => {
    const days: { day: string; calories: number; target: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        day: dayNames[d.getDay()],
        calories: Math.round(targetCalories * (0.6 + Math.random() * 0.5)),
        target: targetCalories,
      });
    }
    return days;
  }, [targetCalories]);

  return (
    <div className={`w-full ${className}`}>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity={0.3} />
              <stop offset="100%" stopColor={accent} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Tooltip
            contentStyle={{
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              fontSize: "12px",
              fontWeight: 700,
              boxShadow: "0 8px 24px -8px rgba(0,0,0,0.15)",
            }}
            labelStyle={{ fontWeight: 800, color: "#0f172a" }}
            formatter={(val: number) => [`${val} kcal`, "Calories"]}
          />
          <Area
            type="monotone"
            dataKey="calories"
            stroke={accent}
            strokeWidth={2.5}
            fill="url(#trendGrad)"
            isAnimationActive
            animationDuration={1200}
            animationBegin={300}
            dot={{ r: 3, fill: accent, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: accent2, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex justify-between px-1 mt-1">
        {data.map((d, i) => (
          <span key={i} className="text-[9px] font-bold text-slate-400">
            {d.day}
          </span>
        ))}
      </div>
    </div>
  );
}
