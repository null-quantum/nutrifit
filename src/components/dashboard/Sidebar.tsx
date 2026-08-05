"use client";

import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BarChart3,
  Apple,
  Dumbbell,
  ShoppingBag,
  Settings,
  LogOut,
  Sparkles,
  Home,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { SyncStatus } from "./SyncStatus";

type NavItem = {
  id: string;
  name: string;
  icon: typeof LayoutDashboard;
};

const navItems: NavItem[] = [
  { id: "overview", name: "Overview Metrics", icon: LayoutDashboard },
  { id: "analytics", name: "Kinetic Analytics", icon: BarChart3 },
  { id: "nutrition", name: "AI Meal Analyzer", icon: Apple },
  { id: "fitness", name: "Performance Pathways", icon: Dumbbell },
  { id: "store", name: "Wellness Store", icon: ShoppingBag },
  { id: "settings", name: "Settings", icon: Settings },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) {
  const logout = useAuthStore((s) => s.logout);

  return (
    <aside className="hidden lg:flex w-72 h-screen fixed left-0 top-0 flex-col z-50 p-5 nf-premium rounded-none border-r border-slate-200/60" style={{ background: "var(--nf-sidebar-bg)" }}>
      {/* Brand */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8 px-2 flex items-center gap-2.5"
      >
        <div className="relative w-9 h-9 rounded-xl flex items-center justify-center shadow-lg overflow-hidden" style={{ background: "var(--nf-gradient)" }}>
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px]" />
          <Sparkles size={16} className="text-white relative z-10" strokeWidth={2.5} />
          <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-cyan-400/40 to-emerald-400/30 blur-md -z-10" />
        </div>
        <h1 className="text-xl font-black tracking-tighter">
          <span className="nf-text-aurora">NutriFit</span>
          <span className="text-cyan-500">.</span>
        </h1>
      </motion.div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto nf-scroll pr-1">
        {navItems.map((item, idx) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.4,
                delay: 0.08 + idx * 0.04,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors duration-200 ${
                isActive
                  ? "text-transparent bg-clip-text nf-text-aurora"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {/* Animated active pill — slides between items via layoutId */}
              {isActive && (
                <motion.span
                  layoutId="activeNav"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="absolute inset-0 rounded-xl border"
                  style={{
                    background: "color-mix(in srgb, var(--nf-accent) 8%, transparent)",
                    borderColor: "color-mix(in srgb, var(--nf-accent) 25%, transparent)",
                    boxShadow: `0 0 20px -4px var(--nf-glow)`,
                  }}
                />
              )}

              {/* Animated left accent bar — also layoutId-linked */}
              {isActive && (
                <motion.span
                  layoutId="activeNavAccent"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full"
                  style={{ background: "var(--nf-gradient)" }}
                />
              )}

              <span
                className={`relative z-10 flex items-center gap-3 ${
                  isActive ? "" : ""
                }`}
                style={isActive ? { color: "var(--nf-text-accent)" } : undefined}
              >
                <Icon
                  size={20}
                  className={isActive ? "" : "text-slate-400"}
                  style={isActive ? { color: "var(--nf-accent)" } : undefined}
                />
                <span
                  className={
                    isActive
                      ? "bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 bg-clip-text text-transparent"
                      : ""
                  }
                >
                  {item.name}
                </span>
              </span>
            </motion.button>
          );
        })}
      </nav>

      {/* Sync status + AI status */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="mb-3 px-1 space-y-2"
      >
        <SyncStatus />
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/50 border border-emerald-200/40 backdrop-blur-md text-xs font-bold text-emerald-700">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          AI Assistant Ready
        </div>
      </motion.div>

      {/* Home + Logout */}
      <div className="space-y-1.5">
        <motion.button
          onClick={() => useAuthStore.getState().setView("landing")}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className="group relative w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-500 hover:text-cyan-600 transition-colors rounded-xl hover:bg-cyan-50/40"
        >
          <Home size={20} className="relative z-10 transition-transform group-hover:scale-110" />
          <span className="relative z-10">Home</span>
        </motion.button>
        <motion.button
          onClick={() => void logout()}
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className="group relative w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-400 hover:text-rose-500 transition-colors rounded-xl hover:bg-rose-50/40"
        >
          <LogOut size={20} className="relative z-10 transition-transform group-hover:scale-110" />
          <span className="relative z-10">Sign Out</span>
        </motion.button>
      </div>
    </aside>
  );
}
