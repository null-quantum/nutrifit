"use client";

import { motion } from "framer-motion";
import { useTheme, THEMES } from "@/lib/theme";
import { Palette, Check } from "lucide-react";

/**
 * ThemePicker — floating palette swatches for choosing dashboard colors.
 * Shown in the Settings tab.
 */
export function ThemePicker() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-slate-800 font-black text-sm">
        <Palette className="size-4 text-slate-500" />
        <span>Color Palette</span>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {THEMES.map((t) => {
          const isActive = theme === t.name;
          return (
            <motion.button
              key={t.name}
              onClick={() => setTheme(t.name)}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={`relative flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                isActive
                  ? "border-slate-800 bg-slate-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Swatch */}
              <div
                className="w-full h-8 rounded-lg"
                style={{
                  background: `linear-gradient(90deg, ${t.swatch[0]}, ${t.swatch[1]}, ${t.swatch[2]})`,
                }}
              />
              {/* Label */}
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-wide text-center">
                {t.label}
              </span>
              {/* Active check */}
              {isActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1.5 -right-1.5 size-5 bg-slate-900 rounded-full flex items-center justify-center"
                >
                  <Check className="size-3 text-white" />
                </motion.div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
