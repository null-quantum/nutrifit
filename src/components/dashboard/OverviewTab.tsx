"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api, getMealsForToday, addMeal, removeMeal } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { AnimatedNumber } from "./AnimatedNumber";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  MagneticCard,
  ShimmerLine,
  EASE,
} from "@/components/shared/animations";
import {
  Sparkline,
  CalorieRing,
  MacroDonut,
  WeeklyTrendChart,
} from "./charts";
import {
  Flame,
  Beef,
  Wheat,
  Droplet,
  Footprints,
  Heart,
  TrendingUp,
  TrendingDown,
  Sparkles,
  Utensils,
  PlusCircle,
  X,
  Loader2,
  CheckCircle2,
  ShieldAlert,
  Moon,
  Activity,
  Brain,
  Send,
  RefreshCw,
} from "lucide-react";

type Meal = {
  id: string;
  text: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export default function OverviewTab() {
  const { user } = useAuthStore();

  const targetCalories = user?.targetCalories || 2200;
  const macros = user?.macros || { protein: 165, carbs: 220, fat: 73 };

  // Live data state
  const [loggedData, setLoggedData] = useState({
    calories: 1450,
    protein: 118,
    carbs: 165,
    fat: 48,
    steps: 7400,
    water: 1.5,
    sleep: 7.2,
  });

  // Meal logger state
  const [mealInput, setMealInput] = useState("");
  const [mealEstimate, setMealEstimate] = useState<{
    calories: number; protein: number; carbs: number; fat: number; tip?: string;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [mealError, setMealError] = useState("");
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [mealRemoved, setMealRemoved] = useState(false);

  // Steps logger state
  const [stepsInput, setStepsInput] = useState("");
  const [isSavingSteps, setIsSavingSteps] = useState(false);
  const [stepsSaved, setStepsSaved] = useState(false);

  // Load today's meals + weekly logs on mount
  useEffect(() => {
    void (async () => {
      try {
        const meals = await getMealsForToday();
        setTodayMeals(meals.map((m: any) => ({
          id: m.id, text: m.text, calories: m.calories,
          protein: m.protein, carbs: m.carbs, fat: m.fat,
        })));
        const logs = await api.weeklyLogs();
        if (logs.length > 0) {
          const today = logs.find((l: any) => l.date === new Date().toISOString().split("T")[0]);
          if (today) {
            setLoggedData((prev) => ({
              ...prev,
              calories: today.calories || prev.calories,
              protein: today.protein || prev.protein,
              carbs: today.carbs || prev.carbs,
              fat: today.fat || prev.fat,
              steps: today.steps || prev.steps,
            }));
          }
        }
      } catch { /* ignore */ }
    })();
  }, []);

  // --- Handlers ---
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
      setMealError(err instanceof Error ? err.message : "Could not analyze that meal.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmMeal = async () => {
    if (!mealEstimate) return;
    setIsAddingMeal(true);
    const next = {
      calories: loggedData.calories + mealEstimate.calories,
      protein: loggedData.protein + mealEstimate.protein,
      carbs: loggedData.carbs + mealEstimate.carbs,
      fat: loggedData.fat + mealEstimate.fat,
      steps: loggedData.steps,
      water: loggedData.water,
      sleep: loggedData.sleep,
    };
    setLoggedData(next);
    const meal: Meal = {
      id: `meal-${Date.now()}`, text: mealInput.trim(), ...mealEstimate,
    };
    setTodayMeals((prev) => [meal, ...prev]);
    try {
      await api.saveLog({
        date: new Date().toISOString().split("T")[0],
        calories: next.calories, protein: next.protein,
        carbs: next.carbs, fat: next.fat, steps: next.steps,
      });
      try { await addMeal({ text: meal.text, calories: meal.calories, protein: meal.protein, carbs: meal.carbs, fat: meal.fat, date: new Date().toISOString().split("T")[0] }); } catch { /* ignore */ }
    } catch { /* totals already updated locally */ }
    setMealInput("");
    setMealEstimate(null);
    setIsAddingMeal(false);
  };

  const handleRemoveMeal = (id: string) => {
    const meal = todayMeals.find((m) => m.id === id);
    if (!meal) return;
    setLoggedData((prev) => ({
      ...prev,
      calories: Math.max(prev.calories - meal.calories, 0),
      protein: Math.max(prev.protein - meal.protein, 0),
      carbs: Math.max(prev.carbs - meal.carbs, 0),
      fat: Math.max(prev.fat - meal.fat, 0),
    }));
    setTodayMeals((prev) => prev.filter((m) => m.id !== id));
    setMealRemoved(true);
    setTimeout(() => setMealRemoved(false), 2500);
    void removeMeal(id);
  };

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
        calories: next.calories, protein: next.protein, carbs: next.carbs,
        fat: next.fat, steps: next.steps,
      });
      setStepsSaved(true);
      setTimeout(() => setStepsSaved(false), 2500);
      setStepsInput("");
    } catch { /* updated locally */ }
    setIsSavingSteps(false);
  };

  // Derived values
  const calPct = Math.min(Math.round((loggedData.calories / targetCalories) * 100), 100);
  const proteinPct = Math.min(Math.round((loggedData.protein / macros.protein) * 100), 100);
  const carbsPct = Math.min(Math.round((loggedData.carbs / macros.carbs) * 100), 100);
  const fatPct = Math.min(Math.round((loggedData.fat / macros.fat) * 100), 100);
  const stepsPct = Math.min(Math.round((loggedData.steps / (user?.stepGoal || 10000)) * 100), 100);
  const waterPct = Math.min(Math.round((loggedData.water / 2.5) * 100), 100);
  const sleepPct = Math.min(Math.round((loggedData.sleep / 8) * 100), 100);
  const healthScore = Math.round((calPct + proteinPct + stepsPct + waterPct + sleepPct) / 5);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 18 ? "Good Afternoon" : "Good Evening";

  return (
    <motion.div
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-12"
    >
      {/* ========== SECTION 1: HERO GREETING ========== */}
      <StaggerItem direction="up" distance={30}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 text-white">
          {/* Ambient glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="size-4 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                {greeting}, {user?.name?.split(" ")[0] ?? "Athlete"} 👋
              </h2>
              <div className="flex items-center gap-3 mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Health Score</span>
                  <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-lg text-sm font-black flex items-center gap-1.5">
                    <AnimatedNumber value={healthScore} />
                    <span className="text-xs text-emerald-400/80">{healthScore >= 70 ? "Optimal" : healthScore >= 40 ? "Good" : "Low"}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick stats row */}
            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-2xl font-black text-cyan-400 nf-stat">
                  <AnimatedNumber value={loggedData.calories} format={(n) => Math.round(n).toLocaleString()} />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">kcal eaten</div>
              </div>
              <div className="w-px bg-slate-700/50" />
              <div className="text-center">
                <div className="text-2xl font-black text-emerald-400 nf-stat">
                  <AnimatedNumber value={loggedData.steps} format={(n) => Math.round(n).toLocaleString()} />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">steps</div>
              </div>
              <div className="w-px bg-slate-700/50" />
              <div className="text-center">
                <div className="text-2xl font-black text-amber-400 nf-stat">
                  {todayMeals.length}
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">meals</div>
              </div>
            </div>
          </div>
        </div>
      </StaggerItem>

      {/* ========== SECTION 2: LIVE METRIC CARDS (4 cards with sparklines) ========== */}
      <StaggerContainer stagger={0.08} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories */}
        <MagneticCard strength={4} lift={4} className="rounded-2xl p-5 bg-white border border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-orange-50 text-orange-500 rounded-lg">
              <Flame className="size-4" />
            </div>
            <span className="text-xs font-bold text-slate-400 nf-stat">{calPct}%</span>
          </div>
          <div className="text-2xl font-black nf-stat text-slate-800">
            <AnimatedNumber value={loggedData.calories} format={(n) => Math.round(n).toLocaleString()} />
            <span className="text-sm text-slate-400 font-bold ml-1">/{targetCalories}</span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Calories</div>
          <Sparkline data={[40, 55, 30, 70, 65, 85, calPct]} color="#f97316" className="mt-3" />
        </MagneticCard>

        {/* Protein */}
        <MagneticCard strength={4} lift={4} className="rounded-2xl p-5 bg-white border border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-rose-50 text-rose-500 rounded-lg">
              <Beef className="size-4" />
            </div>
            <span className="text-xs font-bold text-slate-400 nf-stat">{proteinPct}%</span>
          </div>
          <div className="text-2xl font-black nf-stat text-slate-800">
            <AnimatedNumber value={loggedData.protein} />
            <span className="text-sm text-slate-400 font-bold ml-1">/{macros.protein}g</span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Protein</div>
          <Sparkline data={[60, 50, 70, 55, 80, 65, proteinPct]} color="#f43f5e" className="mt-3" />
        </MagneticCard>

        {/* Steps */}
        <MagneticCard strength={4} lift={4} className="rounded-2xl p-5 bg-white border border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-cyan-50 text-cyan-500 rounded-lg">
              <Footprints className="size-4" />
            </div>
            <span className="text-xs font-bold text-slate-400 nf-stat">{stepsPct}%</span>
          </div>
          <div className="text-2xl font-black nf-stat text-slate-800">
            <AnimatedNumber value={loggedData.steps} format={(n) => Math.round(n).toLocaleString()} />
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Steps</div>
          <Sparkline data={[30, 50, 40, 60, 70, 55, stepsPct]} color="#06b6d4" className="mt-3" />
        </MagneticCard>

        {/* Water */}
        <MagneticCard strength={4} lift={4} className="rounded-2xl p-5 bg-white border border-slate-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-sky-50 text-sky-500 rounded-lg">
              <Droplet className="size-4" />
            </div>
            <span className="text-xs font-bold text-slate-400 nf-stat">{waterPct}%</span>
          </div>
          <div className="text-2xl font-black nf-stat text-slate-800">
            <AnimatedNumber value={loggedData.water} format={(n) => n.toFixed(1)} />
            <span className="text-sm text-slate-400 font-bold ml-1">/2.5L</span>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Water</div>
          <Sparkline data={[40, 60, 50, 70, 65, 80, waterPct]} color="#0ea5e9" className="mt-3" />
        </MagneticCard>
      </StaggerContainer>

      {/* ========== SECTION 3: CALORIE RING + MACRO DONUT + WEEKLY TREND ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calorie Ring */}
        <ScrollReveal direction="up" distance={40} duration={0.7}>
          <div className="rounded-2xl p-6 bg-white border border-slate-200/60 shadow-sm flex flex-col items-center">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Today's Calories</h3>
            <CalorieRing
              value={loggedData.calories}
              target={targetCalories}
              size={180}
            />
            <div className="mt-4 flex items-center gap-4 text-center">
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Remaining</div>
                <div className="text-lg font-black nf-stat text-emerald-600">
                  {Math.max(targetCalories - loggedData.calories, 0).toLocaleString()}
                </div>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Burned</div>
                <div className="text-lg font-black nf-stat text-orange-500">
                  {Math.round(loggedData.steps * 0.04).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Macro Donut */}
        <ScrollReveal direction="up" distance={40} duration={0.7} delay={0.1}>
          <div className="rounded-2xl p-6 bg-white border border-slate-200/60 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Macro Breakdown</h3>
            <MacroDonut
              protein={loggedData.protein}
              carbs={loggedData.carbs}
              fat={loggedData.fat}
            />
            <div className="mt-4 space-y-2">
              {[
                { label: "Protein", val: loggedData.protein, target: macros.protein, color: "bg-rose-400", pct: proteinPct },
                { label: "Carbs", val: loggedData.carbs, target: macros.carbs, color: "bg-amber-400", pct: carbsPct },
                { label: "Fat", val: loggedData.fat, target: macros.fat, color: "bg-sky-400", pct: fatPct },
              ].map((m) => (
                <div key={m.label} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${m.color}`} />
                  <span className="text-xs font-bold text-slate-600 flex-1">{m.label}</span>
                  <span className="text-xs font-black nf-stat text-slate-700">{m.val}g / {m.target}g</span>
                  <span className="text-xs font-bold text-slate-400 w-8 text-right">{m.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Weekly Trend Chart */}
        <ScrollReveal direction="up" distance={40} duration={0.7} delay={0.2}>
          <div className="rounded-2xl p-6 bg-white border border-slate-200/60 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">7-Day Trend</h3>
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <TrendingUp className="size-3" /> +12%
              </span>
            </div>
            <WeeklyTrendChart targetCalories={targetCalories} />
          </div>
        </ScrollReveal>
      </div>

      <ShimmerLine />

      {/* ========== SECTION 4: AI INSIGHT + QUICK ACTIONS ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insight */}
        <ScrollReveal direction="up" distance={30} className="lg:col-span-2">
          <div className="rounded-2xl p-6 bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-100/60">
            <div className="flex items-center gap-2 text-cyan-700 font-black mb-3">
              <Brain className="size-5" /> AI Insight
            </div>
            <p className="text-sm font-semibold text-slate-700 leading-relaxed">
              You're{" "}
              <span className="font-black text-cyan-700">
                {Math.max(macros.protein - loggedData.protein, 0)}g below
              </span>{" "}
              your protein target. Adding a Greek yogurt or protein shake would close the gap.
              Your step count is {stepsPct >= 80 ? "excellent" : stepsPct >= 50 ? "on track" : "below target"} —
              {stepsPct >= 80 ? " keep it up!" : " try a short walk after lunch."}
            </p>
            <div className="mt-4">
              <p className="text-xs font-black text-cyan-700/70 uppercase tracking-widest mb-2">
                Suggested Fillers:
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Greek Yogurt", protein: "20g" },
                  { name: "3 Eggs", protein: "18g" },
                  { name: "Chicken Breast", protein: "30g" },
                  { name: "Protein Shake", protein: "25g" },
                ].map((s) => (
                  <div key={s.name} className="flex items-center gap-2 px-3 py-1.5 bg-white/70 rounded-lg border border-cyan-100/60">
                    <span className="text-xs font-bold text-slate-600">{s.name}</span>
                    <span className="text-xs font-black text-cyan-600">{s.protein}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Quick Stats */}
        <ScrollReveal direction="up" distance={30} delay={0.1}>
          <div className="rounded-2xl p-6 bg-white border border-slate-200/60 shadow-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Wellness Today</h3>
            {[
              { icon: Moon, label: "Sleep", val: `${loggedData.sleep}h`, pct: sleepPct, color: "text-indigo-500", bar: "bg-indigo-400" },
              { icon: Droplet, label: "Hydration", val: `${loggedData.water}L`, pct: waterPct, color: "text-sky-500", bar: "bg-sky-400" },
              { icon: Footprints, label: "Steps", val: loggedData.steps.toLocaleString(), pct: stepsPct, color: "text-cyan-500", bar: "bg-cyan-400" },
            ].map((s) => (
              <div key={s.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <s.icon className={`size-4 ${s.color}`} />
                    <span className="text-xs font-bold text-slate-600">{s.label}</span>
                  </div>
                  <span className="text-xs font-black nf-stat text-slate-700">{s.val}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${s.bar}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${s.pct}%` }}
                    transition={{ duration: 1, ease: EASE.out, delay: 0.3 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>

      <ShimmerLine />

      {/* ========== SECTION 5: SMART MEAL LOGGER + STEPS ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meal Logger (2/3) */}
        <ScrollReveal direction="up" distance={40} className="lg:col-span-2">
          <div className="rounded-2xl p-6 bg-white border border-slate-200/60 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-teal-500 text-white rounded-xl shadow-lg shadow-cyan-500/20">
                <Utensils className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Smart Meal Logger</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Log meals in plain English — AI does the math
                </p>
              </div>
            </div>

            {mealError && (
              <div className="mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="size-4" /> {mealError}
              </div>
            )}

            <form onSubmit={handleAnalyzeMeal} className="space-y-3">
              <textarea
                value={mealInput}
                onChange={(e) => setMealInput(e.target.value)}
                placeholder="e.g. Grilled chicken breast with brown rice, broccoli, and a drizzle of olive oil"
                rows={2}
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none"
                disabled={isAnalyzing}
              />
              <motion.button
                type="submit"
                disabled={isAnalyzing || !mealInput.trim()}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-lg shadow-cyan-500/20 transition-all"
              >
                {isAnalyzing ? (
                  <><Loader2 className="size-4 animate-spin" /> Analyzing…</>
                ) : (
                  <><Sparkles className="size-4" /> Estimate Macros</>
                )}
              </motion.button>
            </form>

            {/* AI estimate preview */}
            <AnimatePresence>
              {mealEstimate && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 12, scale: 0.97 }}
                  transition={{ duration: 0.4, ease: EASE.out }}
                  className="mt-3 bg-gradient-to-br from-cyan-50 to-teal-50 border border-cyan-200/60 rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-cyan-700 uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles className="size-3" /> AI Estimate
                    </span>
                    <button onClick={() => setMealEstimate(null)} className="text-slate-400 hover:text-slate-600">
                      <X className="size-4" />
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
                          <AnimatedNumber value={s.v} />{s.u}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{s.k}</div>
                      </div>
                    ))}
                  </div>
                  {mealEstimate.tip && <p className="text-xs text-slate-500 italic">💡 {mealEstimate.tip}</p>}
                  <motion.button
                    onClick={handleConfirmMeal}
                    disabled={isAddingMeal}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-slate-900 text-white font-black text-sm py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-60"
                  >
                    {isAddingMeal ? <Loader2 className="size-4 animate-spin" /> : <><PlusCircle className="size-4" /> Add to Today</>}
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Today's meals list */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">Today's Meals</span>
                {mealRemoved && <span className="text-[11px] font-bold text-rose-500">Meal removed</span>}
              </div>
              {todayMeals.length === 0 ? (
                <div className="text-center py-6 text-xs font-semibold text-slate-400">
                  No meals logged yet — describe what you ate above.
                </div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin" }}>
                  <AnimatePresence>
                    {todayMeals.map((m) => (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 12 }}
                        className="flex items-center gap-3 bg-slate-50/80 rounded-xl p-3 group"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-700 truncate">{m.text}</p>
                          <p className="text-[11px] font-semibold text-slate-400 nf-stat">
                            {m.calories} kcal · P{m.protein}g · C{m.carbs}g · F{m.fat}g
                          </p>
                        </div>
                        <button onClick={() => handleRemoveMeal(m.id)} className="shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors opacity-0 group-hover:opacity-100">
                          <X className="size-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Steps Logger (1/3) */}
        <ScrollReveal direction="up" distance={40} delay={0.1}>
          <div className="rounded-2xl p-6 bg-white border border-slate-200/60 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-cyan-50 text-cyan-600 rounded-xl">
                <Footprints className="size-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900 tracking-tight">Update Steps</h4>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">From your phone or watch</p>
              </div>
            </div>

            {stepsSaved && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="size-4" /> Steps updated!
              </div>
            )}

            <form onSubmit={handleUpdateSteps} className="space-y-3">
              <input
                type="number"
                inputMode="numeric"
                placeholder="e.g. 8500"
                value={stepsInput}
                onChange={(e) => setStepsInput(e.target.value)}
                className="w-full bg-slate-50/80 border border-slate-200/80 rounded-xl px-4 py-3.5 text-2xl font-black text-slate-800 placeholder:text-slate-300 placeholder:text-base outline-none focus:bg-white focus:ring-2 focus:ring-cyan-500/50 transition-all nf-stat text-center"
              />
              <div className="grid grid-cols-3 gap-2">
                {[5000, 8000, 10000].map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setStepsInput(String(q))}
                    className="text-xs font-bold bg-slate-50 border border-slate-200 text-slate-600 hover:text-cyan-700 hover:border-cyan-300 py-2 rounded-lg transition-all nf-stat"
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
                {isSavingSteps ? <Loader2 className="size-4 animate-spin" /> : <><RefreshCw className="size-4" /> Update</>}
              </motion.button>
            </form>

            <div className="mt-auto pt-4 border-t border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current</p>
              <p className="text-2xl font-black nf-stat text-slate-800">
                <AnimatedNumber value={loggedData.steps} format={(n) => Math.round(n).toLocaleString()} />
              </p>
              <p className="text-[10px] font-bold text-slate-400">
                / {(user?.stepGoal ?? 10000).toLocaleString()} goal
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </motion.div>
  );
}
