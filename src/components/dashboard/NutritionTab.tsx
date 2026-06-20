"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import type { MealEstimate } from "@/lib/types";
import { AnimatedNumber } from "./AnimatedNumber";
import {
  GlassCard,
  staggerContainer,
  riseItem,
  scaleIn,
  springSoft,
} from "./motion";
import {
  Apple,
  Utensils,
  Flame,
  ShieldCheck,
  HeartPulse,
  Sparkles,
  Loader2,
  CheckCircle,
  AlertCircle,
  Camera,
  X,
} from "lucide-react";

const quickPrompts = [
  "2 eggs and toast with butter",
  "Chicken salad bowl with avocado",
  "Protein shake with banana and oats",
  "Pasta with marinara sauce",
  "Grilled salmon with brown rice",
  "Greek yogurt with honey and berries",
];

const macroStyles: Record<
  string,
  { from: string; to: string; text: string; bar: string; halo: string }
> = {
  Calories: {
    from: "#fb923c",
    to: "#f59e0b",
    text: "text-orange-600",
    bar: "from-orange-400 to-amber-500",
    halo: "bg-orange-400",
  },
  Protein: {
    from: "#fb7185",
    to: "#ec4899",
    text: "text-rose-600",
    bar: "from-rose-400 to-pink-500",
    halo: "bg-rose-400",
  },
  Carbs: {
    from: "#fbbf24",
    to: "#eab308",
    text: "text-amber-600",
    bar: "from-amber-400 to-yellow-500",
    halo: "bg-amber-400",
  },
  Fat: {
    from: "#38bdf8",
    to: "#06b6d4",
    text: "text-sky-600",
    bar: "from-sky-400 to-cyan-500",
    halo: "bg-sky-400",
  },
};

export default function NutritionTab() {
  const { user } = useAuthStore();
  const targetCalories = user?.targetCalories || 2200;
  const macros = user?.macros || { protein: 165, carbs: 220, fat: 73 };
  const dietPreference = user?.dietPreference || "Standard Balanced";

  const [mealInput, setMealInput] = useState("");
  const [analysis, setAnalysis] = useState<MealEstimate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [history, setHistory] = useState<({ input: string } & MealEstimate)[]>(
    [],
  );

  // Photo analysis state
  const [photo, setPhoto] = useState<string | null>(null); // base64 data URL
  const [photoName, setPhotoName] = useState("");
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoAnalysis, setPhotoAnalysis] = useState<MealEstimate | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [photoSaved, setPhotoSaved] = useState(false);
  const fileInputRef = useState<HTMLInputElement | null>(null)[0];

  const analyzeMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealInput.trim()) return;
    setLoading(true);
    setError("");
    setAnalysis(null);
    setSaved(false);

    try {
      const res = await api.analyzeMeal(mealInput);
      const a = res.analysis;
      setAnalysis(a);
      setHistory((prev) =>
        [{ input: mealInput, ...a }, ...prev].slice(0, 10),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to analyze meal",
      );
    } finally {
      setLoading(false);
    }
  };

  const saveToLog = async () => {
    if (!analysis) return;
    try {
      const today = new Date().toISOString().split("T")[0];
      await api.saveLog({
        date: today,
        calories: analysis.calories,
        protein: analysis.protein,
        carbs: analysis.carbs,
        fat: analysis.fat,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save to daily log");
    }
  };

  const historyItems = history;

  // --- Photo analysis handlers ---

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select an image file.");
      return;
    }
    if (file.size > 5_000_000) {
      setPhotoError("Image is too large (max 5MB).");
      return;
    }
    setPhotoError("");
    setPhotoAnalysis(null);
    setPhotoName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const analyzePhoto = async () => {
    if (!photo) return;
    setPhotoLoading(true);
    setPhotoError("");
    setPhotoAnalysis(null);
    setPhotoSaved(false);
    try {
      // Extract base64 + mimeType from the data URL.
      const [meta, base64] = photo.split(",");
      const mimeType = meta.match(/data:(.*?);/)?.[1] ?? "image/jpeg";
      const res = await api.analyzeMealPhoto(base64, mimeType);
      setPhotoAnalysis(res.analysis);
    } catch (err) {
      setPhotoError(
        err instanceof Error ? err.message : "Failed to analyze photo."
      );
    } finally {
      setPhotoLoading(false);
    }
  };

  const savePhotoToLog = async () => {
    if (!photoAnalysis) return;
    try {
      const today = new Date().toISOString().split("T")[0];
      await api.saveLog({
        date: today,
        calories: photoAnalysis.calories,
        protein: photoAnalysis.protein,
        carbs: photoAnalysis.carbs,
        fat: photoAnalysis.fat,
      });
      // Also add to meal history
      try {
        const { addMeal } = await import("@/lib/api");
        await addMeal({
          text: photoName || "Photo meal",
          calories: photoAnalysis.calories,
          protein: photoAnalysis.protein,
          carbs: photoAnalysis.carbs,
          fat: photoAnalysis.fat,
          date: today,
        });
      } catch { /* ignore */ }
      setPhotoSaved(true);
      setTimeout(() => setPhotoSaved(false), 3000);
    } catch {
      setPhotoError("Failed to save to daily log");
    }
  };

  const clearPhoto = () => {
    setPhoto(null);
    setPhotoName("");
    setPhotoAnalysis(null);
    setPhotoError("");
    setPhotoSaved(false);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* TOP BANNER */}
      <motion.div
        variants={riseItem}
        className="nf-premium nf-aurora-border rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="absolute -top-12 -right-10 w-48 h-48 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none nf-orb" />
        <div className="flex items-center gap-4 relative">
          <div className="p-3.5 nf-glass text-emerald-600 rounded-2xl">
            <Apple size={26} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">
              AI Meal Analyzer
            </h3>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider mt-1">
              Describe what you ate, get instant macro breakdowns
            </p>
          </div>
        </div>
        <motion.div
          whileHover={{ scale: 1.03, y: -2 }}
          transition={springSoft}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50/80 border border-emerald-100 rounded-xl text-sm font-black text-emerald-700 uppercase tracking-wider"
        >
          <ShieldCheck size={16} /> {dietPreference}
        </motion.div>
      </motion.div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: MEAL INPUT + RESULTS + HISTORY */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-slate-800 font-black text-lg tracking-tight mb-3">
              <Utensils size={20} className="text-teal-500" />
              <span>Describe Your Meal</span>
            </div>

            <form onSubmit={analyzeMeal} className="space-y-3">
              <textarea
                value={mealInput}
                onChange={(e) => setMealInput(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 bg-slate-50/70 border border-slate-200/70 rounded-xl font-medium outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/40 text-sm text-slate-800 transition-all resize-none"
                placeholder="I ate 2 scrambled eggs with cheese, 2 slices of whole wheat toast with butter, and a glass of orange juice..."
                disabled={loading}
              />
              <motion.button
                type="submit"
                disabled={loading || !mealInput.trim()}
                whileHover={{ scale: 1.01, y: -1 }}
                whileTap={{ scale: 0.985 }}
                transition={springSoft}
                className="nf-btn-gradient nf-shimmer w-full text-white font-black text-sm uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:pointer-events-none"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} /> Analyze Meal
                  </>
                )}
              </motion.button>
            </form>

            {/* Quick prompts */}
            <div className="flex flex-wrap gap-2 mt-3">
              {quickPrompts.map((prompt) => (
                <motion.button
                  key={prompt}
                  type="button"
                  onClick={() => setMealInput(prompt)}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.96 }}
                  transition={springSoft}
                  className="nf-glass-soft px-3 py-1.5 rounded-lg text-slate-600 hover:text-emerald-700 text-xs font-bold transition-colors border border-white/50"
                >
                  {prompt}
                </motion.button>
              ))}
            </div>
          </GlassCard>

          {/* PHOTO ANALYSIS CARD */}
          <GlassCard className="p-6 space-y-4">
            <div className="flex items-center gap-2.5 text-slate-800 font-black text-lg tracking-tight mb-2">
              <Camera size={20} className="text-cyan-500" />
              <span>Snap a Photo</span>
            </div>
            <p className="text-xs text-slate-400 font-semibold -mt-2 mb-2">
              Upload or take a photo of your meal — AI vision estimates the macros.
            </p>

            {photoError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle size={14} /> {photoError}
              </div>
            )}

            {!photo ? (
              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-slate-300 rounded-2xl py-12 flex flex-col items-center justify-center gap-3 hover:border-cyan-400 hover:bg-cyan-50/30 transition-all">
                  <div className="p-4 bg-cyan-50 text-cyan-500 rounded-2xl">
                    <Camera size={28} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-black text-slate-700">
                      Tap to upload or take a photo
                    </p>
                    <p className="text-xs text-slate-400 font-semibold mt-1">
                      JPG, PNG · max 5MB
                    </p>
                  </div>
                </div>
              </label>
            ) : (
              <div className="space-y-4">
                {/* Preview */}
                <div className="relative rounded-2xl overflow-hidden">
                  <img
                    src={photo}
                    alt="Meal preview"
                    className="w-full max-h-64 object-cover"
                  />
                  <button
                    onClick={clearPhoto}
                    className="absolute top-2 right-2 size-8 rounded-full bg-slate-900/70 text-white flex items-center justify-center hover:bg-slate-900 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Analyze button */}
                {!photoAnalysis && (
                  <motion.button
                    onClick={analyzePhoto}
                    disabled={photoLoading}
                    whileHover={{ scale: 1.01, y: -1 }}
                    whileTap={{ scale: 0.985 }}
                    transition={springSoft}
                    className="nf-btn-gradient nf-shimmer w-full text-white font-black text-sm uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {photoLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Analyzing Photo...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} /> Analyze Photo
                      </>
                    )}
                  </motion.button>
                )}

                {/* Photo analysis result */}
                {photoAnalysis && (
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
                      {photoSaved && (
                        <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle size={12} /> Saved!
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { k: "Calories", v: photoAnalysis.calories, c: "text-orange-600", u: "" },
                        { k: "Protein", v: photoAnalysis.protein, c: "text-rose-600", u: "g" },
                        { k: "Carbs", v: photoAnalysis.carbs, c: "text-amber-600", u: "g" },
                        { k: "Fat", v: photoAnalysis.fat, c: "text-sky-600", u: "g" },
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
                    {photoAnalysis.items && photoAnalysis.items.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {photoAnalysis.items.map((item, i) => (
                          <span
                            key={i}
                            className="text-[11px] font-bold bg-white/70 px-2.5 py-1 rounded-full text-slate-600 border border-slate-200/60"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    )}
                    {photoAnalysis.tip && (
                      <p className="text-xs text-slate-500 font-medium italic">
                        💡 {photoAnalysis.tip}
                      </p>
                    )}
                    <motion.button
                      onClick={savePhotoToLog}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-slate-900 text-white font-black text-sm py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                    >
                      <ShieldCheck size={16} /> Save to Daily Log
                    </motion.button>
                  </motion.div>
                )}
              </div>
            )}
          </GlassCard>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-4 bg-rose-50/80 backdrop-blur-md border border-rose-200 text-rose-700 rounded-2xl text-sm font-bold flex items-center gap-2"
              >
                <AlertCircle size={16} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          <AnimatePresence mode="wait">
            {!analysis && !loading && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="nf-premium rounded-3xl p-10 relative overflow-hidden flex flex-col items-center justify-center text-center min-h-[260px]"
              >
                <div className="nf-orb w-40 h-40 bg-emerald-400/20 -top-6 -left-6 animate-pulse" />
                <div className="nf-orb w-32 h-32 bg-teal-400/20 -bottom-6 -right-6" />
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="p-4 nf-glass rounded-2xl text-emerald-500 mb-4 relative"
                >
                  <Utensils size={28} />
                </motion.div>
                <h4 className="text-lg font-black text-slate-900 tracking-tight relative">
                  Describe a meal to begin
                </h4>
                <p className="text-sm text-slate-400 font-semibold mt-1.5 max-w-xs relative">
                  Natural-language macro breakdowns powered by the AI engine.
                  Try a quick prompt above.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Analysis Results — spring scale-in */}
          <AnimatePresence mode="wait">
            {analysis && (
              <motion.div
                key="results"
                variants={scaleIn}
                initial="hidden"
                animate="show"
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 260, damping: 24 }}
                className="nf-premium rounded-3xl p-6 space-y-5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-black text-slate-900 tracking-tight">
                    Analysis Results
                  </h4>
                  <motion.button
                    onClick={() => void saveToLog()}
                    disabled={saved}
                    whileHover={{ scale: saved ? 1 : 1.04, y: saved ? 0 : -1 }}
                    whileTap={{ scale: saved ? 1 : 0.96 }}
                    transition={springSoft}
                    className={`nf-shimmer flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors ${
                      saved
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                        : "nf-btn-gradient text-white"
                    }`}
                  >
                    <CheckCircle size={14} />
                    {saved ? "Saved!" : "Save to Daily Log"}
                  </motion.button>
                </div>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-2 sm:grid-cols-4 gap-4"
                >
                  {[
                    {
                      label: "Calories",
                      value: analysis.calories,
                      unit: "kcal",
                      target: targetCalories,
                      pct: Math.round(
                        (analysis.calories / targetCalories) * 100,
                      ),
                    },
                    {
                      label: "Protein",
                      value: analysis.protein,
                      unit: "g",
                      target: macros.protein,
                      pct: Math.round(
                        (analysis.protein / macros.protein) * 100,
                      ),
                    },
                    {
                      label: "Carbs",
                      value: analysis.carbs,
                      unit: "g",
                      target: macros.carbs,
                      pct: Math.round((analysis.carbs / macros.carbs) * 100),
                    },
                    {
                      label: "Fat",
                      value: analysis.fat,
                      unit: "g",
                      target: macros.fat,
                      pct: Math.round((analysis.fat / macros.fat) * 100),
                    },
                  ].map((macro) => {
                    const s = macroStyles[macro.label];
                    const safePct = Math.min(macro.pct, 100);
                    return (
                      <motion.div
                        key={macro.label}
                        variants={riseItem}
                        whileHover={{ y: -4 }}
                        transition={springSoft}
                        className={`group nf-premium rounded-2xl p-4 text-center space-y-2 relative overflow-hidden`}
                      >
                        <div
                          className={`absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-16 ${s.halo} opacity-10 blur-2xl pointer-events-none`}
                        />
                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider relative">
                          {macro.label}
                        </span>
                        <span
                          className={`nf-stat text-2xl font-black block ${s.text} relative`}
                        >
                          <AnimatedNumber
                            value={macro.value}
                            duration={900}
                            delay={120}
                          />
                        </span>
                        <span className="text-[10px] text-slate-400 relative">
                          {macro.unit}
                        </span>
                        {/* Circular progress ring */}
                        <div className="relative w-14 h-14 mx-auto my-1">
                          <svg
                            className="absolute inset-0 -rotate-90"
                            viewBox="0 0 56 56"
                          >
                            <circle
                              cx="28"
                              cy="28"
                              r="24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="4"
                              className="text-slate-200/70"
                            />
                            <motion.circle
                              cx="28"
                              cy="28"
                              r="24"
                              fill="none"
                              strokeWidth="4"
                              strokeLinecap="round"
                              stroke={`url(#grad-${macro.label})`}
                              initial={{ strokeDasharray: "0 999" }}
                              animate={{
                                strokeDasharray: `${
                                  (safePct / 100) * (2 * Math.PI * 24)
                                } 999`,
                              }}
                              transition={{
                                duration: 1.1,
                                ease: [0.16, 1, 0.3, 1],
                                delay: 0.2,
                              }}
                            />
                            <defs>
                              <linearGradient
                                id={`grad-${macro.label}`}
                                x1="0"
                                y1="0"
                                x2="1"
                                y2="1"
                              >
                                <stop offset="0%" stopColor={s.from} />
                                <stop offset="100%" stopColor={s.to} />
                              </linearGradient>
                            </defs>
                          </svg>
                          <span
                            className={`absolute inset-0 flex items-center justify-center text-[10px] font-black ${s.text}`}
                          >
                            {macro.pct}%
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 relative">
                          of daily target
                        </span>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {analysis.items && analysis.items.length > 0 && (
                  <motion.div
                    variants={riseItem}
                    className="flex flex-wrap gap-2"
                  >
                    {analysis.items.map((it, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 + i * 0.04 }}
                        className="px-2.5 py-1 nf-glass-soft border border-white/50 rounded-md text-[11px] font-bold text-slate-600"
                      >
                        {it}
                      </motion.span>
                    ))}
                  </motion.div>
                )}

                {analysis.tip && (
                  <motion.div
                    variants={riseItem}
                    className="bg-linear-to-r from-emerald-50/70 to-teal-50/40 border border-emerald-100/60 rounded-2xl p-4 flex items-start gap-3"
                  >
                    <Sparkles
                      size={18}
                      className="text-emerald-500 shrink-0 mt-0.5"
                    />
                    <p className="text-sm text-emerald-800 font-semibold leading-relaxed">
                      {analysis.tip}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* History */}
          <AnimatePresence>
            {historyItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="nf-premium rounded-3xl p-6 space-y-4"
              >
                <h4 className="text-base font-black text-slate-800 tracking-tight">
                  Recent Analyses
                </h4>
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
                >
                  {historyItems.map((item, i) => (
                    <motion.div
                      key={i}
                      variants={riseItem}
                      whileHover={{ x: 4, y: -1 }}
                      transition={springSoft}
                      className="nf-glass-soft flex items-center justify-between p-3 rounded-xl border border-white/50"
                    >
                      <p className="text-sm text-slate-700 font-bold truncate max-w-[200px]">
                        {item.input}
                      </p>
                      <div className="flex gap-3 text-xs text-slate-500 font-semibold">
                        <span className="nf-stat">{item.calories} kcal</span>
                        <span className="nf-stat">P: {item.protein}g</span>
                        <span className="nf-stat">C: {item.carbs}g</span>
                        <span className="nf-stat">F: {item.fat}g</span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT: TARGET MACROS */}
        <GlassCard className="lg:col-span-5 p-6 space-y-6" hover={false}>
          <div className="flex items-center gap-2.5">
            <HeartPulse size={20} className="text-cyan-500" />
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider">
              Target Matrix Distribution
            </h3>
          </div>

          <div className="p-5 nf-glass-soft border border-white/50 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="text-orange-500 animate-pulse" size={20} />
              <span className="text-sm font-black text-slate-500 uppercase tracking-wide">
                Total Budget:
              </span>
            </div>
            <span className="nf-stat text-xl font-black text-slate-900">
              {targetCalories} kcal
            </span>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-3.5 pt-1"
          >
            {[
              {
                label: "Protein Target",
                value: macros.protein,
                wrap: "bg-rose-50/40 border-rose-100/30",
                txt: "text-rose-700",
              },
              {
                label: "Carbohydrate Target",
                value: macros.carbs,
                wrap: "bg-teal-50/40 border-teal-100/30",
                txt: "text-teal-700",
              },
              {
                label: "Fat Target",
                value: macros.fat,
                wrap: "bg-cyan-50/40 border-cyan-100/30",
                txt: "text-cyan-700",
              },
            ].map((t) => (
              <motion.div
                key={t.label}
                variants={riseItem}
                whileHover={{ x: 3 }}
                transition={springSoft}
                className={`flex justify-between items-center px-4 py-3 rounded-xl border ${t.wrap}`}
              >
                <span className="text-sm font-bold text-slate-600">
                  {t.label}
                </span>
                <span className={`nf-stat text-base font-black ${t.txt}`}>
                  {t.value}g
                </span>
              </motion.div>
            ))}
          </motion.div>

          <div className="pt-4 border-t border-slate-100/60 text-center">
            <p className="text-xs font-semibold text-slate-400 leading-relaxed">
              Use the AI Meal Analyzer to get instant macro breakdowns from
              natural language descriptions.
            </p>
          </div>
        </GlassCard>
      </div>
    </motion.div>
  );
}
