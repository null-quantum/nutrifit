"use client";

import { useState } from "react";
import { Activity, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Onboarding — "Compile Biometric Matrix" form.
 *
 * Ported from the original Vite/React `src/pages/Onboarding.jsx`. The
 * react-router-dom `useNavigate` and the bespoke axios instance have
 * been replaced by the Zustand `useAuthStore` actions
 * (`completeOnboarding`, `logout`). The image asset is loaded from
 * `/public/assets/woman-thinking.jpg` (already copied there) instead of
 * a bundled import.
 *
 * Layout + Tailwind classes are preserved 1:1 so the floating
 * illustration (with the inline `float` keyframe), cyan→teal gradient
 * headline, frosted form panel and gradient submit button are identical
 * to the source.
 */
export default function Onboarding() {
  const { completeOnboarding, logout } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    age: "",
    gender: "male",
    weight: "",
    height: "",
    stepGoal: "10000",
    exerciseType: "Core Stability & Rehabilitation",
    dietPreference: "Standard Balanced Macro Split",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // The store injects the fresh user + sets view to "dashboard".
      await completeOnboarding({
        age: Number(formData.age),
        gender: formData.gender,
        height: Number(formData.height),
        weight: Number(formData.weight),
        stepGoal: Number(formData.stepGoal),
        exerciseType: formData.exerciseType,
        dietPreference: formData.dietPreference,
      });
    } catch (err: any) {
      console.error("Onboarding submission tracking error:", err);
      setError(
        err?.message ||
          "Failed to compile metric configuration profile data layers."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-800 antialiased relative overflow-hidden selection:bg-cyan-100 selection:text-cyan-900">
      {/* --- INJECTED CSS FOR FLOAT ANIMATION --- */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .onboarding-illustration {
          animation: float 6s ease-in-out infinite;
        }
      `}</style>

      {/* ================= LEFT SIDE: FLOATING SAAS GRAPHIC ================= */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 xl:p-20 border-r border-slate-200/60 overflow-hidden bg-slate-50 z-0">
        {/* Soft Animated Background Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-cyan-200/40 rounded-full mix-blend-multiply filter blur-[80px] animate-pulse pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-[80px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-xl space-y-12">
          <div className="space-y-4">
            <h1 className="text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Establish your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-teal-500">
                physiological blueprint.
              </span>
            </h1>
            <p className="text-base text-slate-600 font-medium max-w-md">
              We need to baseline your core metrics so the AI can build a highly
              optimized, personalized nutrition and training protocol.
            </p>
          </div>

          {/* THE MASSIVE FLOATING IMAGE (No Card Wrapper) */}
          <div className="w-full flex justify-center pt-4">
            <img
              src="/assets/woman-thinking.jpg"
              alt="Data Driven Nutrition Infographic"
              className="onboarding-illustration w-full max-w-[650px] h-auto object-contain mix-blend-multiply drop-shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* ================= RIGHT SIDE: FULL-SCALE COMPILATION FORM ================= */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 bg-white z-10">
        <div className="w-full max-w-md space-y-8">
          <div className="text-left space-y-3">
            <div className="inline-flex p-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-2xl shadow-lg shadow-cyan-500/20">
              <Activity size={24} />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight py-1">
                Compile Biometric Matrix
              </h2>
              <p className="text-sm text-slate-500 font-bold tracking-tight">
                Configure metabolic baselines and energy pathways.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold text-center">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="27"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-900 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-900 cursor-pointer transition-all"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Daily Steps
                </label>
                <input
                  type="number"
                  name="stepGoal"
                  value={formData.stepGoal}
                  onChange={handleChange}
                  placeholder="10000"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-900 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Weight (kg)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  placeholder="70"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-900 transition-all"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Height (cm)
                </label>
                <input
                  type="number"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="175"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-900 transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Active Exercise Routine
              </label>
              <select
                name="exerciseType"
                value={formData.exerciseType}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-900 cursor-pointer transition-all"
              >
                <option value="Core Stability & Rehabilitation">
                  Core Stability (Light Focus)
                </option>
                <option value="Hypertrophy & Strength Base">
                  Hypertrophy (Strength Base)
                </option>
                <option value="High-Intensity Cardio Endurance">
                  Cardio Endurance (V2 Max)
                </option>
                <option value="High-Intensity Interval Training (HIIT)">
                  HIIT (Metcon)
                </option>
                <option value="Flexibility, Mobility & Vinyasa Yoga">
                  Flexibility & Yoga
                </option>
                <option value="Progressive Bodyweight Calisthenics">
                  Bodyweight Calisthenics
                </option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Dietary Strategy
              </label>
              <select
                name="dietPreference"
                value={formData.dietPreference}
                onChange={handleChange}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-bold outline-none focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-slate-900 cursor-pointer transition-all"
              >
                <option value="Standard Balanced Macro Split">
                  Standard Balanced (40C/30P/30F)
                </option>
                <option value="High-Protein Low-Carbohydrate Shred">
                  High-Protein Low-Carb
                </option>
                <option value="High-Fat Ultra-Low Carb Ketogenic">
                  Ketogenic Protocol
                </option>
                <option value="Heart-Healthy Whole Food Mediterranean">
                  Mediterranean Diet
                </option>
                <option value="Strict Plant-Based Clean Vegan Plan">
                  Strict Plant-Based Vegan
                </option>
                <option value="Time-Restricted Intermittent Fasting Sync">
                  Intermittent Fasting
                </option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 disabled:opacity-70 text-white font-bold text-sm tracking-wide uppercase py-4 rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex justify-center items-center gap-2 mt-4 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <>
                  Initialize Core Profile <ArrowRight size={16} />
                  <Sparkles size={14} />
                </>
              )}
            </button>

            <div className="mt-8 text-center">
              <button
                onClick={() => {
                  void logout();
                }}
                type="button"
                className="text-xs font-semibold text-slate-400 hover:text-cyan-600 transition-colors cursor-pointer"
              >
                Logged in as the wrong user? Sign out safely.
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
