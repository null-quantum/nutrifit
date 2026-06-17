"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { AnimatedNumber } from "./AnimatedNumber";
import { staggerContainer, riseItem } from "./motion";
import {
  Flame,
  Sparkles,
  ClipboardList,
  PlusCircle,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  Utensils,
  Footprints,
  X,
  Send,
  RotateCcw,
} from "lucide-react";

// Elevated Macro Bar — animated fill width, gradient + glow, count-up grams
function MacroBar({
  label,
  current,
  target,
  gradient,
  glow,
  delay = 0,
}: {
  label: string;
  current: number;
  target: number;
  gradient: string;
  glow: string;
  delay?: number;
}) {
  const percent = Math.min(Math.round((current / target) * 100) || 0, 100);
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-sm">
        <span className="font-black text-slate-700 tracking-tight">{label}</span>
        <span className="font-bold text-slate-400 nf-stat">{percent}%</span>
      </div>
      <div className="w-full h-2.5 bg-slate-100/80 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${gradient}`}
          style={{ boxShadow: glow }}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay }}
        />
      </div>
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
          {label}
        </span>
        <span className="text-[11px] font-bold text-slate-500 nf-stat">
          <AnimatedNumber
            value={current}
            format={(n) => Math.round(n).toString()}
            suffix="g"
          />{" "}
          / {target}g
        </span>
      </div>
    </div>
  );
}

export default function OverviewTab() {
  const { user } = useAuthStore();

  const targetCalories = user?.targetCalories || 2459;
  const macros = user?.macros || { protein: 200, carbs: 300, fat: 100 };

  // Today's running totals (calories/macros accumulate as meals are added;
  // steps are set directly since people know them from their phone/watch).
  const [loggedData, setLoggedData] = useState({
    calories: 1800,
    protein: 158,
    carbs: 246,
    fat: 82,
    steps: 8400,
  });

  // --- Smart meal logger state ---
  const [mealInput, setMealInput] = useState("");
  const [mealEstimate, setMealEstimate] = useState<{
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    tip?: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [mealError, setMealError] = useState("");

  // --- Steps logger state ---
  const [stepsInput, setStepsInput] = useState("");
  const [isSavingSteps, setIsSavingSteps] = useState(false);
  const [stepsSaved, setStepsSaved] = useState(false);

  // Meals logged this session (for the "Today's Meals" list)
  type LoggedMeal = {
    id: string;
    text: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  const [todayMeals, setTodayMeals] = useState<LoggedMeal[]>([]);
  const [mealRemoved, setMealRemoved] = useState(false);

  // Calorie Ring Calculations
  const ringRadius = 54;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset =
    ringCircumference -
    (Math.min(loggedData.calories, targetCalories) / targetCalories) *
      ringCircumference;
  const ringPercent = Math.round(
    (Math.min(loggedData.calories, targetCalories) / targetCalories) * 100,
  );

  // --- Smart meal logger handlers ---

  // Step 1: describe a meal → AI estimates calories + macros (preview).
  const handleAnalyzeMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealInput.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setMealError("");
    setMealEstimate(null);
    try {
      const { analysis } = await api.analyzeMeal(mealInput.trim());
      setMealEstimate(analysis);
    } catch (err) {
      setMealError(
        err instanceof Error ? err.message : "Could not analyze that meal.",
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Step 2: confirm the estimate → add to today's running totals + persist.
  const handleConfirmMeal = async () => {
    if (!mealEstimate) return;
    setIsAddingMeal(true);
    const next = {
      calories: loggedData.calories + mealEstimate.calories,
      protein: loggedData.protein + mealEstimate.protein,
      carbs: loggedData.carbs + mealEstimate.carbs,
      fat: loggedData.fat + mealEstimate.fat,
      steps: loggedData.steps,
    };
    setLoggedData(next);
    setTodayMeals((prev) => [
      {
        id: `meal-${Date.now()}`,
        text: mealInput.trim(),
        ...mealEstimate,
      },
      ...prev,
    ]);
    try {
      await api.saveLog({
        date: new Date().toISOString().split("T")[0],
        calories: next.calories,
        protein: next.protein,
        carbs: next.carbs,
        fat: next.fat,
        steps: next.steps,
      });
    } catch {
      // totals already updated locally; sync happens in the background
    }
    setMealInput("");
    setMealEstimate(null);
    setIsAddingMeal(false);
  };

  // Remove a meal from today's list + subtract from totals.
  const handleRemoveMeal = (id: string) => {
    const meal = todayMeals.find((m) => m.id === id);
    if (!meal) return;
    const next = {
      calories: Math.max(loggedData.calories - meal.calories, 0),
      protein: Math.max(loggedData.protein - meal.protein, 0),
      carbs: Math.max(loggedData.carbs - meal.carbs, 0),
      fat: Math.max(loggedData.fat - meal.fat, 0),
      steps: loggedData.steps,
    };
    setLoggedData(next);
    setTodayMeals((prev) => prev.filter((m) => m.id !== id));
    setMealRemoved(true);
    setTimeout(() => setMealRemoved(false), 2500);
    void api.saveLog({
      date: new Date().toISOString().split("T")[0],
      ...next,
    });
  };

  // --- Steps logger handler ---
  const handleUpdateSteps = async (e: React.FormEvent) => {
    e.preventDefault();
    const steps = Number(stepsInput) || 0;
    if (!steps) return;
    setIsSavingSteps(true);
    const next = { ...loggedData, steps };
    setLoggedData(next);
    try {
      await api.saveLog({
        date: new Date().toISOString().split("T")[0],
        ...next,
      });
      setStepsSaved(true);
      setTimeout(() => setStepsSaved(false), 2500);
      setStepsInput("");
    } catch {
      // updated locally already
    } finally {
      setIsSavingSteps(false);
    }
  };

  // Quick-meal suggestion chips
  const QUICK_MEALS = [
    "2 eggs, toast, and black coffee",
    "Grilled chicken salad with avocado",
    "Protein shake with banana and oats",
    "Salmon with quinoa and broccoli",
    "Greek yogurt with honey and berries",
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-12"
    >
      {/* ROW 1: Hero Intelligence & User Streak */}
      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* The Hero Card — dark, grain, aurora border, floating orbs */}
        <motion.div
          variants={riseItem}
          whileHover={{ y: -4 }}
          className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 text-white relative flex flex-col justify-between nf-grain nf-aurora-border"
        >
          {/* Floating orbs (clipped to card) */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
            <motion.div
              className="nf-orb"
              style={{
                width: 240,
                height: 240,
                top: "-70px",
                right: "-50px",
                opacity: 0.7,
                background:
                  "radial-gradient(circle at 30% 30%, oklch(0.7 0.16 200), transparent 70%)",
              }}
              animate={{ x: [0, 18, 0], y: [0, 14, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="nf-orb"
              style={{
                width: 200,
                height: 200,
                bottom: "-60px",
                left: "18%",
                opacity: 0.6,
                background:
                  "radial-gradient(circle at 50% 50%, oklch(0.78 0.16 150), transparent 70%)",
              }}
              animate={{ x: [0, -16, 0], y: [0, -12, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
              Good Evening,{" "}
              {user?.name ? user.name.split(" ")[0] : "Operator"}{" "}
              <span className="text-2xl">👋</span>
            </h2>
            <div className="flex items-center gap-3 mt-4">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
                Health Score
              </span>
              <motion.span
                className="bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-xl flex items-center gap-1.5 ring-1 ring-emerald-400/30"
                animate={{
                  boxShadow: [
                    "0 0 0 0 oklch(0.78 0.16 150 / 0)",
                    "0 0 22px 2px oklch(0.78 0.16 150 / 0.5)",
                    "0 0 0 0 oklch(0.78 0.16 150 / 0)",
                  ],
                }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <AnimatedNumber value={87} className="nf-stat font-black text-sm" />
                <span className="text-emerald-400/80 text-xs font-bold">Optimal</span>
              </motion.span>
            </div>
          </div>

          <div className="relative z-10 mt-8 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div className="space-y-1">
              <p className="text-emerald-400 font-bold flex items-center gap-2 text-sm">
                <CheckCircle2 size={16} /> Protein Goal: On Track
              </p>
              <p className="text-amber-400 font-bold flex items-center gap-2 text-sm">
                <ShieldAlert size={16} /> Hydration: Slightly Low
              </p>
            </div>

            <motion.button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("nutrifit:open-chat"))
              }
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="nf-btn-gradient nf-shimmer relative overflow-hidden px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider flex items-center gap-2"
            >
              <Sparkles size={16} /> Ask AI Copilot
            </motion.button>
          </div>
        </motion.div>

        {/* User / Streak Card */}
        <motion.div
          variants={riseItem}
          whileHover={{ y: -4 }}
          className="nf-premium rounded-3xl p-6 flex flex-col justify-between"
        >
          <div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
              {user?.name || "Daniel Reeve"}
            </p>
            <p className="text-xl font-black text-slate-800 tracking-tight mt-1">
              Goal: <span className="nf-text-gradient">{user?.goal || "Fat Loss"}</span>
            </p>
            <p className="text-sm font-semibold text-slate-500 mt-1">
              Week 3 Phase
            </p>
          </div>

          <div className="mt-6 bg-orange-50/80 border border-orange-100/60 rounded-2xl p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-xl text-orange-500 shrink-0">
              <Flame size={24} className="fill-orange-500" />
            </div>
            <div>
              <p className="font-black text-orange-700 text-lg leading-none">
                <AnimatedNumber value={12} className="nf-stat" /> Day Streak
              </p>
              <p className="text-xs font-bold text-orange-500/80 mt-1">
                Logged meals for 12 consecutive days.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ROW 2: Contextual Metrics (Ring + Macros + Insight) */}
      <motion.div
        variants={staggerContainer}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Contextual Calorie Ring */}
        <motion.div
          variants={riseItem}
          whileHover={{ y: -4 }}
          className="nf-premium rounded-3xl p-6 flex flex-col justify-between"
        >
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">
            Today&apos;s Calories
          </p>

          <div className="flex items-center justify-center my-4">
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90">
                <circle
                  cx="56"
                  cy="56"
                  r={ringRadius}
                  stroke="#eef2f7"
                  strokeWidth="10"
                  fill="transparent"
                />
                <motion.circle
                  cx="56"
                  cy="56"
                  r={ringRadius}
                  stroke="url(#calorieGradient)"
                  strokeWidth="10"
                  fill="transparent"
                  strokeLinecap="round"
                  filter="url(#ringGlow)"
                  strokeDasharray={ringCircumference}
                  initial={{ strokeDashoffset: ringCircumference }}
                  animate={{ strokeDashoffset: ringOffset }}
                  transition={{ duration: 1.4, ease: "easeOut" }}
                />
                <defs>
                  <linearGradient
                    id="calorieGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <filter id="ringGlow" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2.5" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <AnimatedNumber
                  value={loggedData.calories}
                  format={(n) => Math.round(n).toLocaleString()}
                  className="nf-stat text-3xl font-black text-slate-800"
                />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                  kcal
                </span>
                <span className="text-[10px] font-bold text-cyan-600 mt-0.5 nf-stat">
                  {ringPercent}% of target
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100/80">
            <span className="font-black text-slate-400 uppercase tracking-widest">
              Target
            </span>
            <AnimatedNumber
              value={targetCalories}
              format={(n) => Math.round(n).toLocaleString()}
              suffix=" kcal"
              className="nf-stat font-black text-slate-700"
            />
          </div>
        </motion.div>

        {/* Macro Progress Bars */}
        <motion.div
          variants={riseItem}
          whileHover={{ y: -4 }}
          className="nf-premium rounded-3xl p-6 flex flex-col justify-center space-y-5"
        >
          <MacroBar
            label="Protein"
            current={loggedData.protein}
            target={macros.protein}
            gradient="bg-gradient-to-r from-rose-400 to-rose-500"
            glow="0 0 12px oklch(0.65 0.2 15 / 0.45)"
            delay={0.1}
          />
          <MacroBar
            label="Carbs"
            current={loggedData.carbs}
            target={macros.carbs}
            gradient="bg-gradient-to-r from-amber-300 to-amber-500"
            glow="0 0 12px oklch(0.78 0.16 75 / 0.45)"
            delay={0.2}
          />
          <MacroBar
            label="Fat"
            current={loggedData.fat}
            target={macros.fat}
            gradient="bg-gradient-to-r from-sky-400 to-sky-500"
            glow="0 0 12px oklch(0.65 0.14 230 / 0.45)"
            delay={0.3}
          />
        </motion.div>

        {/* Visible AI Insight */}
        <motion.div
          variants={riseItem}
          whileHover={{ y: -4 }}
          className="rounded-3xl p-6 flex flex-col justify-between bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-100/60 shadow-xl shadow-cyan-200/30 backdrop-blur-xl"
        >
          <div>
            <div className="flex items-center gap-2 text-cyan-700 font-black mb-3">
              <Sparkles size={18} /> AI Insight
            </div>
            <p className="text-base font-semibold text-slate-700 leading-relaxed">
              You are currently{" "}
              <span className="font-black text-cyan-700">
                <AnimatedNumber
                  value={Math.max(macros.protein - loggedData.protein, 0)}
                  suffix="g"
                  className="nf-stat"
                />{" "}
                below
              </span>{" "}
              your protein target.
            </p>
          </div>

          <div className="mt-4">
            <p className="text-xs font-black text-cyan-700/70 uppercase tracking-widest mb-2">
              Suggested Fillers:
            </p>
            <ul className="space-y-1.5 text-sm font-bold text-slate-600">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Greek
                Yogurt (20g)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> 3
                Hardboiled Eggs (18g)
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> Grilled
                Chicken Breast (30g)
              </li>
            </ul>
          </div>
        </motion.div>
      </motion.div>

      {/* ROW 3: Smart Daily Logger */}
      <motion.div variants={riseItem} className="pt-8 border-t border-slate-200/60">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-teal-500 text-white rounded-xl shadow-lg shadow-cyan-500/20">
            <Utensils size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Smart Daily Logger
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Log meals in plain English — AI does the math
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT (2/3): Meal logger */}
          <motion.div
            variants={riseItem}
            className="lg:col-span-2 nf-premium rounded-3xl p-6 space-y-4"
          >
            {mealError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                <ShieldAlert size={14} /> {mealError}
              </div>
            )}

            <form onSubmit={handleAnalyzeMeal} className="space-y-3">
              <textarea
                value={mealInput}
                onChange={(e) => setMealInput(e.target.value)}
                placeholder="e.g. Grilled chicken breast with brown rice, broccoli, and a drizzle of olive oil"
                rows={3}
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl px-4 py-3.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all resize-none nf-scroll"
                disabled={isAnalyzing}
              />
              <div className="flex flex-wrap gap-2">
                {QUICK_MEALS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setMealInput(q);
                      setMealEstimate(null);
                      setMealError("");
                    }}
                    className="text-[11px] font-bold bg-white/70 border border-slate-200/70 text-slate-600 hover:text-cyan-700 hover:border-cyan-300 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap"
                  >
                    {q}
                  </button>
                ))}
              </div>
              <motion.button
                type="submit"
                disabled={isAnalyzing || !mealInput.trim()}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="nf-btn-gradient w-full py-3.5 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 nf-shimmer"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Analyzing…
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Estimate Macros
                  </>
                )}
              </motion.button>
            </form>

            {/* AI estimate preview — confirm to add to today */}
            {mealEstimate && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-200/60 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-cyan-700 uppercase tracking-widest flex items-center gap-1.5">
                    <Sparkles size={13} /> AI Estimate
                  </span>
                  <button
                    type="button"
                    onClick={() => setMealEstimate(null)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { k: "Calories", v: mealEstimate.calories, c: "text-orange-600", u: "" },
                    { k: "Protein", v: mealEstimate.protein, c: "text-rose-600", u: "g" },
                    { k: "Carbs", v: mealEstimate.carbs, c: "text-amber-600", u: "g" },
                    { k: "Fat", v: mealEstimate.fat, c: "text-sky-600", u: "g" },
                  ].map((s) => (
                    <div key={s.k} className="bg-white/60 rounded-xl py-2">
                      <div className={`text-lg font-black nf-stat ${s.c}`}>
                        <AnimatedNumber value={s.v} />
                        {s.u}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {s.k}
                      </div>
                    </div>
                  ))}
                </div>
                {mealEstimate.tip && (
                  <p className="text-xs text-slate-500 font-medium italic">
                    💡 {mealEstimate.tip}
                  </p>
                )}
                <motion.button
                  type="button"
                  onClick={handleConfirmMeal}
                  disabled={isAddingMeal}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-slate-900 text-white font-black text-sm py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-60"
                >
                  {isAddingMeal ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Adding…
                    </>
                  ) : (
                    <>
                      <PlusCircle size={16} /> Add to Today
                    </>
                  )}
                </motion.button>
              </motion.div>
            )}

            {/* Today's meals list */}
            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                  Today&apos;s Meals
                </span>
                {mealRemoved && (
                  <span className="text-[11px] font-bold text-rose-500 flex items-center gap-1">
                    <X size={11} /> Meal removed
                  </span>
                )}
              </div>
              {todayMeals.length === 0 ? (
                <div className="text-center py-6 text-xs font-semibold text-slate-400">
                  No meals logged yet — describe what you ate above.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto nf-scroll pr-1">
                  {todayMeals.map((m) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 12 }}
                      className="flex items-center gap-3 bg-white/60 border border-slate-200/60 rounded-xl p-3 group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">
                          {m.text}
                        </p>
                        <p className="text-[11px] font-semibold text-slate-400 nf-stat">
                          {m.calories} kcal · P{m.protein}g · C{m.carbs}g · F{m.fat}g
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMeal(m.id)}
                        className="shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100"
                        aria-label="Remove meal"
                      >
                        <X size={15} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* RIGHT (1/3): Steps logger */}
          <motion.div
            variants={riseItem}
            className="nf-premium rounded-3xl p-6 flex flex-col gap-4"
          >
            <div className="flex items-center gap-2">
              <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                <Footprints size={18} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 tracking-tight">
                  Update Steps
                </h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  From your phone or watch
                </p>
              </div>
            </div>

            {stepsSaved && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={14} /> Steps updated!
              </div>
            )}

            <form onSubmit={handleUpdateSteps} className="space-y-3">
              <input
                type="number"
                inputMode="numeric"
                placeholder="e.g. 8500"
                value={stepsInput}
                onChange={(e) => setStepsInput(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-2xl px-4 py-3.5 text-2xl font-black text-slate-800 placeholder:text-slate-300 placeholder:text-base outline-none focus:bg-white focus:ring-2 focus:ring-cyan-500/50 transition-all nf-stat text-center"
              />
              <div className="grid grid-cols-3 gap-2">
                {[5000, 8000, 10000].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setStepsInput(String(q))}
                    className="text-xs font-bold bg-white/70 border border-slate-200/70 text-slate-600 hover:text-cyan-700 hover:border-cyan-300 py-2 rounded-lg transition-all nf-stat"
                  >
                    {q.toLocaleString()}
                  </button>
                ))}
              </div>
              <motion.button
                type="submit"
                disabled={isSavingSteps || !stepsInput}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-slate-900 text-white font-black text-sm py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {isSavingSteps ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <RotateCcw size={15} /> Update
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-auto pt-4 border-t border-slate-200/60 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Current
              </p>
              <p className="text-2xl font-black nf-stat text-slate-800">
                <AnimatedNumber
                  value={loggedData.steps}
                  format={(n) => Math.round(n).toLocaleString()}
                />
              </p>
              <p className="text-[10px] font-bold text-slate-400">
                / {user?.stepGoal?.toLocaleString() || "10,000"} goal
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
