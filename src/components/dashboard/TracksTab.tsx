"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { AnimatedNumber } from "./AnimatedNumber";
import { staggerContainer, riseItem, springSoft } from "./motion";
import {
  Scale,
  Activity,
  Droplets,
  Brain,
  ShieldAlert,
  Heart,
  CheckCircle2,
  Loader2,
  Info,
} from "lucide-react";

type ClinicalTrack = {
  id: string;
  name: string;
  desc: string;
  icon: typeof Scale;
  bg: string;
  accentColor: string;
  calorieMultiplier: number;
  proteinRatio: number;
};

// Enhanced 2026 clinical track metadata mapping perfectly to your architectural criteria
const clinicalTracks: ClinicalTrack[] = [
  {
    id: "Standard Balanced",
    name: "Weight Management",
    desc: "Sustainable calorie configurations and lean metric enhancement routing.",
    icon: Scale,
    bg: "bg-orange-50 text-orange-500",
    accentColor: "border-orange-500",
    calorieMultiplier: 1.0,
    proteinRatio: 0.3,
  },
  {
    id: "PCOS Focus Optimization",
    name: "PCOS / PCOD Control",
    desc: "Hormone-optimized nutrient ratios and insulin-stabilization filters.",
    icon: Activity,
    bg: "bg-emerald-50 text-emerald-600",
    accentColor: "border-emerald-500",
    calorieMultiplier: 0.95,
    proteinRatio: 0.35,
  },
  {
    id: "Low-Glycemic Glucose Control",
    name: "Diabetes Management",
    desc: "Glycemic load stabilization profiles mapping blood sugar safety thresholds.",
    icon: ShieldAlert,
    bg: "bg-blue-50 text-blue-500",
    accentColor: "border-blue-500",
    calorieMultiplier: 0.9,
    proteinRatio: 0.3,
  },
  {
    id: "Low-FODMAP Gut Health",
    name: "Digestive Health",
    desc: "Gut-friendly recipes tailored to minimize bloating and metabolic friction.",
    icon: Droplets,
    bg: "bg-purple-50 text-purple-500",
    accentColor: "border-purple-500",
    calorieMultiplier: 1.0,
    proteinRatio: 0.25,
  },
  {
    id: "Mindfulness Stress Reduction",
    name: "Mental Resilience",
    desc: "Mindfulness nutritional tracking structures minimizing oxidative stressors.",
    icon: Brain,
    bg: "bg-pink-50 text-pink-500",
    accentColor: "border-pink-500",
    calorieMultiplier: 1.0,
    proteinRatio: 0.25,
  },
  {
    id: "Cardiovascular Sodium Regulation",
    name: "Heart Health Matrix",
    desc: "Sodium restrictions and clear lipid optimization parameters.",
    icon: Heart,
    bg: "bg-red-50 text-red-500",
    accentColor: "border-red-500",
    calorieMultiplier: 0.95,
    proteinRatio: 0.3,
  },
];

export default function TracksTab() {
  const { user } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  // Local selection state — the backend has no dedicated "update track"
  // endpoint, so selection is UI-only (visual + macro preview).
  const [localTrack, setLocalTrack] = useState<string | null>(null);

  // State mutator loop: updates local selection + computes a live macro preview.
  const handleSelectTrack = (track: ClinicalTrack) => {
    if (isUpdating) return;
    setIsUpdating(true);

    // Simulate the original async commit; macro math stays client-side so the
    // UI behaves the same as the original (instant metric refresh).
    setTimeout(() => {
      setLocalTrack(track.id);
      setIsUpdating(false);
    }, 350);
  };

  const activeDietPreference = localTrack || user?.dietPreference || "Standard Balanced";

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-3">
            Clinical Architecture
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            <span className="nf-text-aurora">Personalized Coaching Grid</span>
          </h2>
          <p className="text-slate-500 text-base mt-2 max-w-2xl">
            Select an active track condition below. Your daily calorie bounds,
            macro rings, and active AI context will shift instantly.
          </p>
        </div>

        <AnimatePresence>
          {isUpdating && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -6 }}
              transition={springSoft}
              className="flex items-center gap-2 text-xs font-bold text-teal-600 bg-teal-50 border border-teal-100 px-4 py-2 rounded-xl h-fit shadow-sm nf-ring-glow"
            >
              <Loader2 size={14} className="animate-spin" />
              <span>Syncing Metrics...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex items-start gap-2 p-4 nf-premium rounded-2xl text-xs font-semibold text-slate-500"
      >
        <Info size={14} className="shrink-0 mt-0.5 text-slate-400" />
        <p>
          Track selection is preview-only in this build — your active preference
          comes from onboarding. Re-running onboarding will persist a new track.
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {clinicalTracks.map((track) => {
          const Icon = track.icon;
          const isSelected = activeDietPreference === track.id;
          const proteinPct = Math.round(track.proteinRatio * 100);
          const caloriePct = Math.round(track.calorieMultiplier * 100);

          return (
            <motion.div
              key={track.id}
              variants={riseItem}
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.99 }}
              transition={springSoft}
              onClick={() => handleSelectTrack(track)}
              className={`nf-premium p-8 rounded-3xl flex flex-col justify-between h-72 relative overflow-hidden cursor-pointer ${
                isSelected ? "nf-aurora-border" : ""
              }`}
            >
              {/* Selected Notification Accent Badge */}
              <AnimatePresence>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0.4, opacity: 0, rotate: -45 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={springSoft}
                    className="absolute top-4 right-4 text-emerald-600"
                  >
                    <CheckCircle2 size={22} fill="#ecfdf5" />
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <motion.div
                  whileHover={{ rotate: -6, scale: 1.08 }}
                  transition={springSoft}
                  className={`relative w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${track.bg}`}
                >
                  {/* gradient ring backdrop */}
                  <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-emerald-400/20 blur-md -z-10" />
                  <Icon size={26} />
                </motion.div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">
                  {track.name}
                </h3>
                <p className="text-slate-400 text-sm font-semibold leading-relaxed mt-2.5 line-clamp-2">
                  {track.desc}
                </p>
              </div>

              {/* Animated macro preview bars */}
              <div className="space-y-2.5 mt-4">
                <div>
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <span>Calorie Load</span>
                    <span className="font-mono text-slate-600">
                      <AnimatedNumber value={caloriePct} suffix="%" />
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${caloriePct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    <span>Protein Ratio</span>
                    <span className="font-mono text-slate-600">
                      <AnimatedNumber value={proteinPct} suffix="%" />
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${proteinPct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
