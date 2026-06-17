"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  Check,
  Flame,
  Activity,
  Target,
  Users,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * AuthPage — split-screen Sign In / Sign Up view.
 *
 * Ported from the original Vite/React `src/pages/AuthPage.jsx`. The
 * react-router-dom navigation has been replaced by the Zustand
 * `useAuthStore` view switcher, and the bespoke axios instance has been
 * replaced by the store's `login` / `register` actions (which talk to
 * the Next.js API routes via `@/lib/api`).
 *
 * Layout + Tailwind classes are preserved 1:1 so the light
 * glassmorphism (slate-50 canvas, animated cyan/teal/emerald mesh blobs
 * with `mix-blend-multiply`, white/70 `backdrop-blur-2xl` auth card,
 * cyan→teal gradient buttons) is identical to the source.
 */
export default function AuthPage() {
  const { login, register, setView } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await login(formData.email, formData.password);
      // Store sets view to dashboard (or onboarding if not yet done).
      setView("dashboard");
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err?.message || "Invalid credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      await register(formData.name, formData.email, formData.password);
      // New users always go through onboarding first.
      setView("onboarding");
    } catch (err: any) {
      console.error("Registration failed:", err);
      setError(err?.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (toLogin: boolean) => {
    setIsLogin(toLogin);
    setError("");
  };

  // Google button is decorative in this port (no OAuth provider wired up).
  const handleGoogle = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.4, ease: "easeOut" as const },
    },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3, ease: "easeIn" as const } },
  };

  return (
    <div className="w-screen min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-600 relative overflow-hidden selection:bg-cyan-100 selection:text-cyan-900">
      {/* ========================================= */}
      {/* BACKGROUND: CONTINUOUS FLUID MESH GRADIENT */}
      {/* ========================================= */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Grid Overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] z-10"
          style={{
            backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Cyan Blob */}
        <motion.div
          animate={{
            x: [0, 100, 0, -100, 0],
            y: [0, 50, 100, 50, 0],
            scale: [1, 1.1, 1, 0.9, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-cyan-200/60 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"
        />
        {/* Turquoise/Teal Blob */}
        <motion.div
          animate={{
            x: [0, -100, 0, 100, 0],
            y: [0, 100, 50, 0, 0],
            scale: [1, 0.9, 1.1, 1, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] bg-teal-200/60 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"
        />
        {/* Light Green Blob */}
        <motion.div
          animate={{
            x: [100, 0, -100, 0, 100],
            y: [100, 50, 0, 50, 100],
            scale: [0.9, 1, 1.1, 1, 0.9],
          }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] left-[20%] w-[55vw] h-[55vw] bg-emerald-200/60 rounded-full mix-blend-multiply filter blur-[100px] opacity-70"
        />
      </div>

      {/* ========================================= */}
      {/* LEFT SIDE: 50% - Animated Motion Graphic  */}
      {/* ========================================= */}
      <div className="w-full lg:w-1/2 min-h-[50vh] lg:min-h-screen flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-12 relative z-10">
        <div className="absolute top-8 left-8 lg:top-12 lg:left-12 flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]" />
          <a
            href="/"
            className="text-2xl font-extrabold text-slate-900 tracking-tight hover:opacity-80 transition-opacity"
          >
            NutriFit
          </a>
        </div>

        <div className="w-full max-w-[500px] mx-auto mt-12 lg:mt-0">
          <div className="relative h-[280px] w-full mb-12 flex items-center justify-center">
            <motion.div
              animate={{ y: [-10, 10, -10] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-4 left-0 w-48 bg-white/80 backdrop-blur-xl border border-white rounded-2xl p-4 shadow-xl shadow-slate-200/50 z-20"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-500 flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Calories
                  </p>
                  <p className="text-sm font-bold text-slate-800">1,850</p>
                </div>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "77%" }}
                  transition={{ duration: 2, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-orange-400 to-rose-400 rounded-full"
                />
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [10, -10, 10] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-20 right-0 w-48 bg-white/80 backdrop-blur-xl border border-white rounded-2xl p-4 shadow-xl shadow-slate-200/50 z-30"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 text-cyan-600 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Current BMI
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    22.4{" "}
                    <span className="text-xs text-emerald-500 font-semibold ml-1">
                      Healthy
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [-5, 5, -5], x: [-5, 5, -5] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute bottom-4 left-10 w-56 bg-white/80 backdrop-blur-xl border border-white rounded-2xl p-4 shadow-xl shadow-cyan-500/10 z-10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-500" />
                  <span className="text-xs font-semibold text-slate-600">
                    AI Goal Sync
                  </span>
                </div>
                <span className="text-xs font-black text-cyan-600">78%</span>
              </div>
            </motion.div>
          </div>

          <h1 className="text-4xl lg:text-[52px] font-black leading-[1.1] text-slate-900 mb-6 tracking-tight">
            Personalized Nutrition <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-teal-500">
              Powered By AI
            </span>
          </h1>
          <p className="text-slate-500 text-base lg:text-lg mb-8 leading-relaxed max-w-[400px] font-medium">
            Get meal plans, calorie insights, BMI tracking and fitness
            recommendations tailored specifically for your goals.
          </p>

          <div className="grid grid-cols-2 gap-y-4 gap-x-2">
            {[
              "Personalized Nutrition",
              "BMI Analysis",
              "Calorie Tracking",
              "Fitness Planning",
              "AI Recommendations",
              "Progress Monitoring",
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 text-slate-600 font-semibold text-sm"
              >
                <Check
                  className="w-4 h-4 text-teal-500 shrink-0"
                  strokeWidth={3}
                />
                {item}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-8 mt-8 border-t border-slate-200/60">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-slate-50" />
              <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-slate-50" />
              <div className="w-8 h-8 rounded-full bg-slate-400 border-2 border-slate-50" />
              <div className="w-8 h-8 rounded-full bg-cyan-100 border-2 border-slate-50 flex items-center justify-center">
                <Users className="w-3 h-3 text-cyan-600" />
              </div>
            </div>
            <p className="text-sm font-medium text-slate-500">
              Trusted by{" "}
              <span className="text-slate-800 font-bold">1,000+</span> Users
            </p>
          </div>
        </div>
      </div>

      {/* ========================================= */}
      {/* RIGHT SIDE: 50% - Auth Card Centered    */}
      {/* ========================================= */}
      <div className="w-full lg:w-1/2 min-h-[50vh] lg:min-h-screen flex items-center justify-center p-6 sm:p-8 lg:p-12 relative z-10">
        {/* Back-home affordance */}
        <button
          type="button"
          onClick={() => setView("landing")}
          className="absolute top-6 left-6 lg:top-8 lg:left-8 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-cyan-600 transition-colors cursor-pointer z-20"
        >
          <ArrowLeft className="w-4 h-4" />
          Back home
        </button>

        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-[520px] bg-white/70 backdrop-blur-2xl border border-white rounded-[2rem] p-10 sm:p-14 shadow-[0_20px_60px_rgba(0,0,0,0.05),0_0_40px_rgba(6,182,212,0.1)]"
        >
          {/* Pill Toggle */}
          <div className="flex p-1.5 bg-slate-200/50 rounded-xl mb-10 border border-slate-200/50 backdrop-blur-sm">
            <button
              onClick={() => handleToggle(true)}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-300 ${
                isLogin
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleToggle(false)}
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-300 ${
                !isLogin
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Sign Up
            </button>
          </div>

          <div className="min-h-[340px]">
            <AnimatePresence mode="wait">
              {isLogin ? (
                <motion.form
                  key="login"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                  onSubmit={handleLoginSubmit}
                >
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                      Welcome Back
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mb-6">
                      Enter your credentials to access your dashboard.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold text-center">
                      ⚠️ {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Email Address"
                        className="w-full bg-white/60 border border-slate-200 rounded-xl pl-14 pr-4 py-4 text-slate-900 font-medium placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                      />
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        placeholder="Password"
                        className="w-full bg-white/60 border border-slate-200 rounded-xl pl-14 pr-12 py-4 text-slate-900 font-medium placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500 transition-colors cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <a
                      href="#"
                      className="text-sm font-bold text-cyan-600 hover:text-cyan-500 transition-colors"
                    >
                      Forgot Password?
                    </a>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-300 flex items-center justify-center gap-2 group text-lg disabled:opacity-70 cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                      <>
                        Sign In{" "}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  variants={formVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-6"
                  onSubmit={handleRegisterSubmit}
                >
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">
                      Create Account
                    </h2>
                    <p className="text-sm font-medium text-slate-500 mb-6">
                      Start your data-driven health journey today.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-xs font-bold text-center">
                      ⚠️ {error}
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="relative group">
                      <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Full Name"
                        className="w-full bg-white/60 border border-slate-200 rounded-xl pl-14 pr-4 py-4 text-slate-900 font-medium placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                      />
                    </div>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="Email Address"
                        className="w-full bg-white/60 border border-slate-200 rounded-xl pl-14 pr-4 py-4 text-slate-900 font-medium placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                      />
                    </div>
                    <div className="relative group">
                      <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-cyan-500 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        placeholder="Password"
                        className="w-full bg-white/60 border border-slate-200 rounded-xl pl-14 pr-12 py-4 text-slate-900 font-medium placeholder:text-slate-400 outline-none transition-all duration-300 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-500 transition-colors cursor-pointer"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full mt-2 py-4 rounded-xl font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.5)] bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-300 flex items-center justify-center gap-2 group text-lg disabled:opacity-70 cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                      <>
                        Create Account{" "}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleGoogle}
            className="mt-8 w-full py-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold transition-all duration-200 flex items-center justify-center gap-3 text-base shadow-sm cursor-pointer"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
