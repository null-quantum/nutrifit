"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { staggerContainer, riseItem, scaleIn, springSoft } from "./motion";
import {
  User,
  ShieldCheck,
  Weight,
  Ruler,
  Footprints,
  Flame,
  Loader2,
  Save,
  Info,
  AlertCircle,
  Bell,
  Droplet,
  Utensils,
  Dumbbell,
  CheckCircle2,
} from "lucide-react";
import {
  getReminderPrefs,
  saveReminderPrefs,
  getPermission,
  requestPermission,
  type ReminderPrefs,
} from "@/lib/notifications";
import { useToast } from "@/hooks/use-toast";

export default function UserSettingsTab() {
  const { user, updateProfile } = useAuthStore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<"" | "success" | "error">("");
  const [errorMsg, setErrorMsg] = useState("");

  // Reminder preferences + notification permission
  const [prefs, setPrefs] = useState<ReminderPrefs>(() => getReminderPrefs());
  const [perm, setPerm] = useState<NotificationPermission>(() => getPermission());

  function updatePrefs(patch: Partial<ReminderPrefs>) {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    saveReminderPrefs(next);
  }

  async function handleEnableReminders() {
    if (perm !== "granted") {
      const result = await requestPermission();
      setPerm(result);
      if (result !== "granted") {
        toast({
          title: "Notifications blocked",
          description: "Enable notifications in your browser settings to receive reminders.",
          variant: "destructive",
        });
        return;
      }
    }
    updatePrefs({ enabled: true });
    toast({ title: "Reminders enabled! 🔔", description: "You'll get water, meal, and workout notifications." });
  }

  // Populate local form states with live fallback user values
  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState(user?.age?.toString() || "");
  const [weight, setWeight] = useState(user?.weight?.toString() || "");
  const [height, setHeight] = useState(user?.height?.toString() || "");
  const [stepGoal, setStepGoal] = useState(
    user?.stepGoal?.toString() || "10000",
  );
  const [exerciseType, setExerciseType] = useState(
    user?.exerciseType || "Cardio",
  );

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("");
    setErrorMsg("");
    try {
      await updateProfile({
        name,
        age: Number(age),
        sex: user?.sex,
        height: Number(height),
        weight: Number(weight),
        stepGoal: Number(stepGoal),
        exerciseType,
        dietPreference: user?.dietPreference,
      });
      setStatus("success");
      setTimeout(() => setStatus(""), 4000);
    } catch (err) {
      setStatus("error");
      setErrorMsg(
        err instanceof Error ? err.message : "Failed to save settings.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Shared input class — elevated frosted style with focus lift
  const inputBase =
    "w-full px-4 py-3.5 bg-white/60 backdrop-blur-md border border-white/70 rounded-xl font-medium text-slate-800 text-base outline-none transition-all duration-300 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] focus:bg-white focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400/60 focus:shadow-[0_8px_24px_-8px_rgba(16,185,129,0.25),inset_0_1px_2px_rgba(0,0,0,0.04)] focus:-translate-y-0.5";

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="max-w-3xl relative"
    >
      {/* Ambient backdrop orb */}
      <div
        className="nf-orb"
        style={{
          width: 280,
          height: 280,
          top: -40,
          right: -60,
          background:
            "radial-gradient(circle at 50% 50%, oklch(0.82 0.14 194), transparent 70%)",
          opacity: 0.25,
        }}
      />

      <motion.div
        variants={riseItem}
        className="nf-premium nf-aurora-border rounded-3xl p-8 space-y-8 relative"
      >
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            <span className="nf-text-aurora">Account Configurations</span>
          </h2>
          <p className="text-base text-slate-400 font-medium mt-1">
            Manage your active metabolic metrics, credentials, and tracking
            vectors.
          </p>
        </div>

        <motion.div
          variants={riseItem}
          className="flex items-start gap-2 p-4 bg-slate-50/60 backdrop-blur-md border border-slate-200/60 rounded-2xl text-xs font-semibold text-slate-500"
        >
          <Info size={14} className="shrink-0 mt-0.5 text-slate-400" />
          <p>
            Updating age, weight, or height recalculates your TDEE &amp; macro
            targets automatically via the Mifflin-St Jeor equation. Changes save
            to your account and sync to this device.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {status === "success" && (
            <motion.div
              key="success"
              variants={scaleIn}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, scale: 0.94 }}
              className="p-4 bg-emerald-50/80 backdrop-blur-md border border-emerald-200 text-emerald-800 rounded-2xl text-base font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/10"
            >
              <ShieldCheck size={18} className="text-emerald-600" /> Profile
              updated — your TDEE &amp; macros have been recalculated.
            </motion.div>
          )}

          {status === "error" && (
            <motion.div
              key="error"
              variants={scaleIn}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, scale: 0.94 }}
              className="p-4 bg-rose-50/80 backdrop-blur-md border border-rose-200 text-rose-700 rounded-2xl text-base font-bold flex items-center gap-2 shadow-lg shadow-rose-500/10"
            >
              <AlertCircle size={18} className="text-rose-600" />
              {errorMsg || "Failed to save settings. Please try again."}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleUpdateProfile} className="space-y-8">
          {/* Core Identity Credentials Grid */}
          <motion.div variants={riseItem} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-700 uppercase tracking-wider">
                Full Operator Name
              </label>
              <div className="relative group">
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10"
                  size={18}
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`${inputBase} pl-12`}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-black text-slate-400 uppercase tracking-wider">
                Email Node (Immutable Token)
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-4 py-3.5 bg-slate-100/80 backdrop-blur-md border border-slate-200 text-slate-400 rounded-xl font-medium cursor-not-allowed text-base"
              />
            </div>
          </motion.div>

          <motion.div variants={riseItem} className="border-t border-slate-100 pt-6">
            <h3 className="text-lg font-black text-slate-800 tracking-tight mb-4">
              Biometric Calibration
            </h3>

            {/* Biometric grid — glass mini-cards per field */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                {
                  label: "Age (yrs)",
                  icon: User,
                  value: age,
                  setter: setAge,
                  accent: "from-cyan-400 to-teal-500",
                },
                {
                  label: "Weight (kg)",
                  icon: Weight,
                  value: weight,
                  setter: setWeight,
                  accent: "from-emerald-400 to-teal-500",
                },
                {
                  label: "Height (cm)",
                  icon: Ruler,
                  value: height,
                  setter: setHeight,
                  accent: "from-teal-400 to-cyan-500",
                },
                {
                  label: "Step Target",
                  icon: Footprints,
                  value: stepGoal,
                  setter: setStepGoal,
                  accent: "from-cyan-400 to-emerald-500",
                },
              ].map((field) => {
                const Icon = field.icon;
                return (
                  <div
                    key={field.label}
                    className="space-y-2 group"
                  >
                    <label className="flex items-center gap-1.5 text-xs font-black text-slate-600 uppercase tracking-wider">
                      <span
                        className={`inline-flex w-5 h-5 rounded-md bg-gradient-to-br ${field.accent} items-center justify-center text-white shadow-sm`}
                      >
                        <Icon size={11} />
                      </span>
                      {field.label}
                    </label>
                    <input
                      type="number"
                      value={field.value}
                      onChange={(e) => field.setter(e.target.value)}
                      className={`${inputBase} px-3 py-3 text-center font-mono font-bold`}
                      required
                    />
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Tactical Routine Activity Threshold Select Box */}
          <motion.div variants={riseItem} className="space-y-2 pt-2">
            <label className="block text-sm font-black text-slate-700 uppercase tracking-wider">
              Primary Kinetic Pathway
            </label>
            <div className="relative group">
              <Flame
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors z-10"
                size={18}
              />
              <select
                value={exerciseType}
                onChange={(e) => setExerciseType(e.target.value)}
                className={`${inputBase} pl-12 font-bold cursor-pointer appearance-none`}
              >
                <option value="Cardio">Cardio Endurance Processing</option>
                <option value="Strength Training">
                  Hypertrophy Strength Training
                </option>
                <option value="Yoga / Flexibility">Yoga Core Restoration</option>
                <option value="HIIT (High Intensity)">
                  HIIT Metabolic Volatility Circuits
                </option>
              </select>
            </div>
          </motion.div>

          {/* Form Submission Execution Engine */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.01 }}
            whileTap={{ scale: 0.98 }}
            transition={springSoft}
            variants={riseItem}
            className="relative w-full nf-btn-gradient nf-shimmer font-black text-base tracking-wide uppercase py-4 rounded-xl flex justify-center items-center gap-2 cursor-pointer disabled:opacity-75 mt-4 overflow-hidden"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              <>
                <Save size={18} /> Save Configurations
              </>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* REMINDERS SECTION */}
      <motion.div
        variants={riseItem}
        className="nf-premium rounded-3xl p-8 space-y-6"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500 to-teal-500 text-white rounded-xl shadow-lg shadow-cyan-500/20">
            <Bell size={20} />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight">
              Smart Reminders
            </h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Water · Meals · Workout notifications
            </p>
          </div>
        </div>

        {!prefs.enabled ? (
          <div className="text-center py-6 space-y-4">
            <p className="text-sm font-semibold text-slate-500">
              Get gentle reminders to stay hydrated, eat on time, and hit your workouts.
            </p>
            <motion.button
              onClick={handleEnableReminders}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="nf-btn-gradient nf-shimmer px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wider inline-flex items-center gap-2"
            >
              <Bell size={16} /> Enable Reminders
            </motion.button>
            {perm === "denied" && (
              <p className="text-xs text-rose-500 font-bold">
                Notifications are blocked — enable them in your browser settings.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Master toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50/80 rounded-2xl border border-slate-200/60">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={18} className="text-emerald-500" />
                <span className="font-bold text-slate-700 text-sm">Reminders Active</span>
              </div>
              <button
                onClick={() => updatePrefs({ enabled: false })}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
              >
                Disable
              </button>
            </div>

            {/* Water */}
            <ReminderToggle
              icon={<Droplet size={16} />}
              label="Hydration"
              description="Every 2 hours, 9am–9pm"
              enabled={prefs.water}
              onToggle={() => updatePrefs({ water: !prefs.water })}
              tint="text-sky-500 bg-sky-50"
            />

            {/* Meals */}
            <ReminderToggle
              icon={<Utensils size={16} />}
              label="Meal Times"
              description="Breakfast 8am · Lunch 12pm · Dinner 7pm"
              enabled={prefs.meals}
              onToggle={() => updatePrefs({ meals: !prefs.meals })}
              tint="text-amber-500 bg-amber-50"
            />

            {/* Workout */}
            <div className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-slate-200/60">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${prefs.workout ? "text-emerald-500 bg-emerald-50" : "text-slate-300 bg-slate-50"}`}>
                  <Dumbbell size={16} />
                </div>
                <div>
                  <p className="font-bold text-slate-700 text-sm">Workout</p>
                  <p className="text-xs text-slate-400 font-semibold">Daily at your chosen time</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="time"
                  value={prefs.workoutTime}
                  onChange={(e) => updatePrefs({ workoutTime: e.target.value })}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/40"
                />
                <ToggleSwitch
                  on={prefs.workout}
                  onClick={() => updatePrefs({ workout: !prefs.workout })}
                />
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function ReminderToggle({
  icon,
  label,
  description,
  enabled,
  onToggle,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  tint: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/60 rounded-2xl border border-slate-200/60">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${enabled ? tint : "text-slate-300 bg-slate-50"}`}>
          {icon}
        </div>
        <div>
          <p className="font-bold text-slate-700 text-sm">{label}</p>
          <p className="text-xs text-slate-400 font-semibold">{description}</p>
        </div>
      </div>
      <ToggleSwitch on={enabled} onClick={onToggle} />
    </div>
  );
}

function ToggleSwitch({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-11 h-6 rounded-full transition-colors ${on ? "bg-emerald-500" : "bg-slate-300"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 size-5 bg-white rounded-full shadow-sm transition-transform ${on ? "translate-x-5" : ""}`}
      />
    </button>
  );
}
