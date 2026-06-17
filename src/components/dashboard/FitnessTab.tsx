"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { Exercise, SafeUser } from "@/lib/types";
import { AnimatedNumber } from "./AnimatedNumber";
import {
  GlassCard,
  staggerContainer,
  riseItem,
  scaleIn,
  springSoft,
} from "./motion";
import {
  Dumbbell,
  Flame,
  CheckCircle2,
  Target,
  Sparkles,
  HelpCircle,
  ShieldAlert,
  Check,
  ChevronDown,
  RotateCcw,
  WifiOff,
  RefreshCw,
  Loader2,
} from "lucide-react";

const tierAccents: Record<string, { active: string; ring: string; text: string }> =
  {
    Experience: {
      active: "from-teal-500/15 to-cyan-500/10 border-teal-400/50 text-teal-700",
      ring: "nf-ring-glow",
      text: "text-teal-700",
    },
    Objective: {
      active: "from-cyan-500/15 to-sky-500/10 border-cyan-400/50 text-cyan-700",
      ring: "nf-ring-glow",
      text: "text-cyan-700",
    },
    Gear: {
      active:
        "from-emerald-500/15 to-teal-500/10 border-emerald-400/50 text-emerald-700",
      ring: "nf-ring-glow",
      text: "text-emerald-700",
    },
  };

export default function FitnessTab({ user }: { user: SafeUser | null }) {
  const [isOnline, setIsOnline] = useState(() =>
    typeof window !== "undefined" ? navigator.onLine : true,
  );
  const [syncingStatus, setSyncingStatus] = useState("");

  // Hydrate local states directly from hard-drive cache on initial render pass
  const [generatedRoutine, setGeneratedRoutine] = useState<Exercise[]>(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("nutrifit_local_routine");
      return cached ? JSON.parse(cached) : [];
    }
    return [];
  });

  const [hasGeneratedPlan, setHasGeneratedPlan] = useState(() => {
    if (typeof window !== "undefined") {
      return !!localStorage.getItem("nutrifit_local_routine");
    }
    return false;
  });

  const [completedExercises, setCompletedExercises] = useState<
    (string | number)[]
  >(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("nutrifit_local_progress");
      return cached ? JSON.parse(cached) : [];
    }
    return [];
  });

  const [fitnessLevel, setFitnessLevel] = useState(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("nutrifit_local_meta");
      return cached ? JSON.parse(cached).fitnessLevel : "Intermediate";
    }
    return "Intermediate";
  });

  const [workoutFocus, setWorkoutFocus] = useState(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("nutrifit_local_meta");
      return cached ? JSON.parse(cached).workoutFocus : "Hypertrophy Strength";
    }
    return "Hypertrophy Strength";
  });

  const [equipment, setEquipment] = useState(() => {
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem("nutrifit_local_meta");
      return cached ? JSON.parse(cached).equipment : "Dumbbells Only";
    }
    return "Dumbbells Only";
  });

  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [expandedExercise, setExpandedExercise] = useState<string | number | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState("");

  const targetSteps = user?.stepGoal || 10000;
  const activePathway = user?.exerciseType || "Cardio Endurance Processing";

  const saveToLocalCache = (
    routine: Exercise[],
    progress: (string | number)[],
    meta: { fitnessLevel: string; workoutFocus: string; equipment: string },
  ) => {
    localStorage.setItem("nutrifit_local_routine", JSON.stringify(routine));
    localStorage.setItem("nutrifit_local_progress", JSON.stringify(progress));
    localStorage.setItem("nutrifit_local_meta", JSON.stringify(meta));
  };

  const triggerBackgroundCloudSync = () => {
    setSyncingStatus("syncing");
    setTimeout(() => {
      setSyncingStatus("synced");
      setTimeout(() => setSyncingStatus(""), 4000);
    }, 2000);
  };

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);
      triggerBackgroundCloudSync();
    };
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // Dispatches questionnaire data to the backend AI engine
  const handleRunAiGeneration = async () => {
    setIsAiGenerating(true);
    setErrorMessage("");

    // Fail-Safe Interceptor: Block request if client has no network access
    if (!navigator.onLine) {
      setErrorMessage(
        "Cannot connect to AI cluster while offline. Please reconnect or use cached data.",
      );
      setIsAiGenerating(false);
      return;
    }

    try {
      const response = await api.generateWorkout({
        fitnessLevel,
        workoutFocus,
        equipment,
        userContext: {
          age: user?.age,
          weight: user?.weight,
          height: user?.height,
          stepGoal: user?.stepGoal,
          exerciseType: user?.exerciseType,
          dietPreference: user?.dietPreference,
        },
      });

      if (response.success && response.plan) {
        const dynamicPlan = response.plan;
        setGeneratedRoutine(dynamicPlan);
        setHasGeneratedPlan(true);

        // Mirror the fresh AI plan to local cache immediately
        saveToLocalCache(dynamicPlan, completedExercises, {
          fitnessLevel,
          workoutFocus,
          equipment,
        });
      } else {
        throw new Error("Invalid payload schema received from AI node.");
      }
    } catch (err) {
      console.error("AI pipeline communication error:", err);
      setErrorMessage(
        "AI cluster timeout. Please verify internet access and backend server status.",
      );
    } finally {
      setIsAiGenerating(false);
    }
  };

  const toggleExerciseCheck = (
    id: string | number,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    const updatedProgress = completedExercises.includes(id)
      ? completedExercises.filter((item) => item !== id)
      : [...completedExercises, id];

    setCompletedExercises(updatedProgress);
    saveToLocalCache(generatedRoutine, updatedProgress, {
      fitnessLevel,
      workoutFocus,
      equipment,
    });
  };

  const resetWizardDeck = () => {
    setCompletedExercises([]);
    setGeneratedRoutine([]);
    setHasGeneratedPlan(false);
    localStorage.removeItem("nutrifit_local_routine");
    localStorage.removeItem("nutrifit_local_progress");
  };

  const progressPct =
    generatedRoutine.length > 0
      ? Math.round(
          (completedExercises.length / generatedRoutine.length) * 100,
        )
      : 0;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-8 text-slate-800"
    >
      {/* CONNECTION NOTIFIER OVERLAYS */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 bg-linear-to-r from-rose-500/10 via-orange-500/5 to-transparent border border-rose-100 backdrop-blur-xl rounded-2xl flex items-center gap-3 text-sm font-bold text-rose-700"
          >
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              <WifiOff size={18} className="text-rose-500" />
            </motion.span>
            <span>
              Offline State Triggered. Local Storage Fallback Cache Layer is
              active.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {syncingStatus === "syncing" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 bg-linear-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-100 rounded-2xl flex items-center gap-3 text-sm font-bold text-amber-700"
          >
            <Loader2 size={16} className="animate-spin text-amber-500" />
            <span>Syncing local progress matrix to cloud data cluster...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {syncingStatus === "synced" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 bg-linear-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-100 rounded-2xl flex items-center gap-3 text-sm font-bold text-emerald-800"
          >
            <RefreshCw size={18} className="text-emerald-500" />
            <span>
              Cloud Synchronization Complete. Local hard-drive configurations
              match cluster values.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-4 bg-rose-50/80 backdrop-blur-md border border-rose-200 text-rose-700 rounded-2xl text-sm font-bold flex items-center gap-2"
          >
            <ShieldAlert size={16} /> {errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER CARD */}
      <motion.div
        variants={riseItem}
        className="nf-premium nf-aurora-border rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden"
      >
        <div className="absolute -top-12 -right-10 w-48 h-48 bg-teal-400/15 rounded-full blur-3xl pointer-events-none nf-orb" />
        <div className="flex items-center gap-4 relative">
          <div className="p-3.5 nf-glass text-teal-600 rounded-2xl">
            <Dumbbell size={26} />
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight nf-text-aurora">
              {activePathway}
            </h3>
            <p className="text-sm text-slate-400 font-bold uppercase tracking-wider mt-1">
              Active Performance Track Pathways Operational
            </p>
          </div>
        </div>

        {hasGeneratedPlan && (
          <motion.button
            onClick={resetWizardDeck}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={springSoft}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:bg-slate-800 cursor-pointer relative"
          >
            <RotateCcw size={14} /> Re-Calibrate Wizard
          </motion.button>
        )}
      </motion.div>

      {/* QUESTIONNAIRE WIZARD */}
      <AnimatePresence mode="wait">
        {!hasGeneratedPlan && (
          <motion.div
            key="wizard"
            variants={scaleIn}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, scale: 0.97 }}
            className="nf-premium rounded-3xl p-8 relative overflow-hidden space-y-8 max-w-4xl mx-auto"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none nf-orb" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none nf-orb" />

            <motion.div
              variants={riseItem}
              className="text-center space-y-2 max-w-xl mx-auto relative"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-linear-to-r from-teal-500/10 to-cyan-500/10 border border-teal-100 text-teal-700 font-bold text-xs uppercase tracking-wider">
                <Sparkles size={12} className="animate-pulse" /> Core
                Initialization
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">
                Setup Your AI Training Target
              </h3>
              <p className="text-slate-400 text-base font-medium">
                Answer these fast biometric questions to structure a tailored
                workflow execution layout.
              </p>
            </motion.div>

            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 relative"
            >
              <SelectionColumn
                label="Experience Tier"
                accentKey="Experience"
                options={["Beginner", "Intermediate", "Advanced"]}
                value={fitnessLevel}
                onChange={setFitnessLevel}
              />
              <SelectionColumn
                label="Primary Objective"
                accentKey="Objective"
                options={[
                  "Hypertrophy Strength",
                  "Metabolic Volatility",
                  "Core Restoration",
                ]}
                value={workoutFocus}
                onChange={setWorkoutFocus}
              />
              <SelectionColumn
                label="Gear Deployment"
                accentKey="Gear"
                options={[
                  "Pure Bodyweight",
                  "Dumbbells Only",
                  "Full Commercial Gym",
                ]}
                value={equipment}
                onChange={setEquipment}
              />
            </motion.div>

            <motion.div
              variants={riseItem}
              className="pt-4 text-center relative"
            >
              <motion.button
                onClick={() => void handleRunAiGeneration()}
                disabled={isAiGenerating}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={springSoft}
                className="nf-glow nf-shimmer w-full sm:w-72 nf-btn-gradient text-white font-black text-base tracking-wide uppercase py-4 rounded-xl cursor-pointer disabled:opacity-75 disabled:pointer-events-none flex items-center justify-center gap-2 mx-auto"
              >
                {isAiGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    <span>Streaming True AI Plan...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    <span>Generate Customized Plan</span>
                  </>
                )}
              </motion.button>

              {/* Pulsing dots loader during generation */}
              <AnimatePresence>
                {isAiGenerating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-center gap-2 mt-6"
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="w-2.5 h-2.5 rounded-full bg-linear-to-r from-teal-500 to-cyan-500"
                        animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{
                          duration: 0.9,
                          repeat: Infinity,
                          delay: i * 0.15,
                          ease: "easeInOut",
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Shimmer skeleton cards during generation */}
              <AnimatePresence>
                {isAiGenerating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3 mt-6 text-left"
                  >
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="nf-shimmer nf-glass-soft rounded-2xl p-4 h-16 border border-white/40"
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EXERCISE CORE MANAGEMENT PANEL */}
      <AnimatePresence mode="wait">
        {hasGeneratedPlan && (
          <motion.div
            key="routine"
            variants={scaleIn}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, scale: 0.97 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            <div className="lg:col-span-7 space-y-4">
              <GlassCard className="p-6 space-y-4" hover={false}>
                <div className="flex items-center gap-2 font-black text-lg tracking-tight mb-2 border-b border-slate-100/60 pb-3">
                  <Target size={20} className="text-teal-500" />
                  <span>Generated Circuit Objectives</span>
                </div>

                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="space-y-3"
                >
                  {generatedRoutine.map((exercise, idx) => {
                    const isExpanded = expandedExercise === exercise.id;
                    const isChecked = completedExercises.includes(exercise.id);

                    return (
                      <motion.div
                        key={exercise.id}
                        variants={riseItem}
                        custom={idx}
                        whileHover={{ y: -3 }}
                        transition={springSoft}
                        onClick={() =>
                          setExpandedExercise(isExpanded ? null : exercise.id)
                        }
                        className={`nf-premium rounded-2xl transition-all overflow-hidden cursor-pointer ${
                          isExpanded ? "nf-ring-glow" : ""
                        }`}
                      >
                        <div className="p-4 flex items-center justify-between gap-4 select-none">
                          <div className="flex items-center gap-4 min-w-0">
                            <motion.button
                              type="button"
                              onClick={(e) => toggleExerciseCheck(exercise.id, e)}
                              whileHover={{ scale: 1.12 }}
                              whileTap={{ scale: 0.88 }}
                              transition={springSoft}
                              className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 relative ${
                                isChecked
                                  ? "bg-linear-to-r from-teal-500 to-emerald-500 border-teal-400 text-white nf-ring-glow"
                                  : "border-slate-300 bg-white/60 text-transparent hover:border-teal-400"
                              }`}
                            >
                              <motion.span
                                initial={false}
                                animate={{
                                  scale: isChecked ? 1 : 0,
                                  opacity: isChecked ? 1 : 0,
                                }}
                                transition={springSoft}
                              >
                                <Check size={14} strokeWidth={3} />
                              </motion.span>
                            </motion.button>

                            <div className="min-w-0">
                              <h4
                                className={`text-base font-extrabold tracking-tight truncate transition-all ${
                                  isChecked
                                    ? "text-slate-400 line-through"
                                    : "text-slate-800"
                                }`}
                              >
                                {exercise.name}
                              </h4>
                              <p className="text-sm text-slate-400 font-bold uppercase tracking-wide mt-0.5">
                                {exercise.sets} Sets{" "}
                                <span className="text-slate-300 mx-1">•</span>{" "}
                                {exercise.reps} Reps
                              </p>
                            </div>
                          </div>

                          <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={springSoft}
                          >
                            <ChevronDown
                              size={18}
                              className="text-slate-400 shrink-0"
                            />
                          </motion.div>
                        </div>

                        <AnimatePresence initial={false}>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-5 pt-1 border-t border-slate-100/60 space-y-4 text-sm font-medium">
                                <div className="bg-slate-50/70 rounded-xl p-3 text-xs font-bold text-slate-500 uppercase tracking-wider mt-3">
                                  Target Zone:{" "}
                                  <span className="nf-text-aurora font-black normal-case tracking-tight">
                                    {exercise.target}
                                  </span>
                                </div>

                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1.5 text-emerald-700 font-black text-xs uppercase tracking-wider">
                                    <HelpCircle size={14} /> Correct Execution
                                    Form
                                  </div>
                                  <p className="text-slate-600 leading-relaxed pl-5 bg-emerald-50/30 border-l-2 border-emerald-500 py-1 rounded-r-md">
                                    {exercise.form}
                                  </p>
                                </div>

                                <div className="space-y-1.5">
                                  <div className="flex items-center gap-1.5 text-rose-600 font-black text-xs uppercase tracking-wider">
                                    <ShieldAlert size={14} /> What to Avoid /
                                    Safety Risks
                                  </div>
                                  <p className="text-slate-600 leading-relaxed pl-5 bg-rose-50/30 border-l-2 border-rose-500 py-1 rounded-r-md">
                                    {exercise.avoid ||
                                      "No specific contraindications."}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </GlassCard>
            </div>

            {/* TELEMETRY VISUAL INDICATORS */}
            <GlassCard className="lg:col-span-5 p-6 space-y-6" hover={false}>
              <div className="flex items-center gap-2.5 font-black text-sm uppercase tracking-wider text-slate-400">
                <Flame size={20} className="text-orange-500 animate-pulse" />
                <span>Routine Telemetry Dashboard</span>
              </div>

              <div className="p-5 nf-glass-soft border border-white/50 rounded-2xl space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-black text-slate-500 uppercase tracking-wide">
                    Circuit Completion:
                  </span>
                  <span className="nf-stat text-2xl font-black text-slate-900">
                    <AnimatedNumber
                      value={progressPct}
                      duration={800}
                      suffix="%"
                    />
                  </span>
                </div>

                <div className="w-full h-3.5 bg-slate-200/70 rounded-full overflow-hidden relative border border-slate-100/60">
                  <motion.div
                    className="h-full bg-linear-to-r from-teal-500 via-cyan-500 to-emerald-500 rounded-full relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{
                      duration: 1,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <div className="absolute inset-0 nf-shimmer rounded-full" />
                  </motion.div>
                </div>

                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>0 Completed</span>
                  <span className="nf-stat">
                    {completedExercises.length} / {generatedRoutine.length}{" "}
                    Checked
                  </span>
                </div>
              </div>

              <div className="p-5 nf-glass-soft border border-white/50 rounded-2xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black text-slate-500 uppercase tracking-wide">
                    Daily Step Objective:
                  </span>
                  <span className="nf-stat text-xl font-black text-slate-900">
                    {targetSteps.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100/60 flex items-start gap-3 px-1 text-slate-400 text-xs font-semibold leading-relaxed">
                <CheckCircle2
                  size={16}
                  className="text-emerald-500 shrink-0 mt-0.5"
                />
                <p>
                  Checking off items increments your metric progress bar live. To
                  request form alternatives, ping your floating{" "}
                  <span className="text-rose-500 font-bold">
                    Copilot Core Chatbot
                  </span>{" "}
                  down in the corner.
                </p>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ----------------------------------------------------------------
   Selection column — glass pill with active state ring-glow
----------------------------------------------------------------- */
function SelectionColumn({
  label,
  accentKey,
  options,
  value,
  onChange,
}: {
  label: string;
  accentKey: keyof typeof tierAccents;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const accent = tierAccents[accentKey];
  return (
    <motion.div variants={riseItem} className="space-y-3">
      <label className="block text-xs font-black text-slate-400 tracking-widest">
        {label}
      </label>
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const active = value === option;
          return (
            <motion.button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              whileHover={{ scale: 1.02, x: 2 }}
              whileTap={{ scale: 0.98 }}
              transition={springSoft}
              className={`w-full text-left px-4 py-3.5 rounded-xl border text-sm font-bold flex justify-between items-center transition-colors cursor-pointer ${
                active
                  ? `nf-premium ${accent.ring} bg-linear-to-r ${accent.active}`
                  : "border-slate-100/70 bg-white/50 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{option}</span>
              <AnimatePresence>
                {active && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={springSoft}
                    className={accent.text}
                  >
                    <Check size={14} />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
