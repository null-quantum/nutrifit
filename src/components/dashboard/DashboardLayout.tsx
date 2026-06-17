"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BarChart3,
  Apple,
  Dumbbell,
  ShoppingBag,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Sidebar from "./Sidebar";
import { FloatingChatbot } from "./FloatingChatbot";

const navItems = [
  { id: "overview", name: "Overview", icon: LayoutDashboard },
  { id: "analytics", name: "Analytics", icon: BarChart3 },
  { id: "nutrition", name: "Nutrition", icon: Apple },
  { id: "fitness", name: "Fitness", icon: Dumbbell },
  { id: "store", name: "Store", icon: ShoppingBag },
  { id: "settings", name: "Settings", icon: Settings },
];

export default function DashboardLayout({
  activeTab,
  setActiveTab,
  children,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}) {
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Ambient background orbs for depth */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div
          className="nf-orb"
          style={{
            width: "40vw",
            height: "40vw",
            top: "-12vw",
            right: "-10vw",
            background:
              "radial-gradient(circle at 50% 50%, oklch(0.82 0.14 194), transparent 70%)",
            opacity: 0.35,
          }}
        />
        <div
          className="nf-orb"
          style={{
            width: "32vw",
            height: "32vw",
            bottom: "-8vw",
            left: "18vw",
            background:
              "radial-gradient(circle at 50% 50%, oklch(0.84 0.15 142), transparent 70%)",
            opacity: 0.3,
          }}
        />
      </div>

      {/* Fixed Sidebar (desktop only) */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Mobile Top Bar with horizontal scrolling tabs */}
      <div className="lg:hidden sticky top-0 z-40 nf-premium rounded-none border-b border-white/40">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 via-teal-400 to-emerald-400 flex items-center justify-center shadow-md shadow-teal-500/20">
              <Sparkles size={14} className="text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-base font-black tracking-tighter">
              <span className="nf-text-aurora">NutriFit</span>
              <span className="text-cyan-500">.</span>
            </h1>
          </div>
          <button
            onClick={() => void logout()}
            className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-rose-500 transition-colors px-3 py-1.5 rounded-lg hover:bg-rose-50/60"
          >
            <LogOut size={14} /> Exit
          </button>
        </div>
        <div className="flex gap-1.5 px-3 pb-3 overflow-x-auto nf-scroll">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                  isActive
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeMobileTab"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 shadow-md shadow-teal-500/30"
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon size={14} /> {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Fluid Main Content */}
      <main className="lg:pl-72 p-4 sm:p-6 lg:p-8 min-h-screen flex flex-col">
        <div className="max-w-7xl mx-auto w-full flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
        <footer className="mt-auto pt-8 pb-2 text-center text-xs text-slate-400 font-semibold">
          <div className="max-w-7xl mx-auto px-2">
            NutriFit — Your AI health companion. Targets are estimates; consult a
            professional for medical advice.
          </div>
        </footer>
      </main>

      {/* Floating AI chatbot — available on every dashboard tab */}
      <FloatingChatbot />
    </div>
  );
}
