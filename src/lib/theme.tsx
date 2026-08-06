"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

/**
 * NutriFit Theme System — 5 distinctive color palettes.
 *
 * Each palette defines CSS custom properties (--nf-*) that components
 * use for accents, gradients, chart colors, and glows. The selected
 * theme is persisted in localStorage and applied to <html data-theme>.
 */

export type ThemeName =
  | "aurora"
  | "sunset"
  | "midnight"
  | "forest"
  | "ocean";

export type Theme = {
  name: ThemeName;
  label: string;
  swatch: string[]; // 3 colors for the picker preview
  vars: Record<string, string>;
};

export const THEMES: Theme[] = [
  {
    name: "aurora",
    label: "Aurora Teal",
    swatch: ["#06b6d4", "#14b8a6", "#10b981"],
    vars: {
      "--nf-accent": "#06b6d4",
      "--nf-accent-2": "#14b8a6",
      "--nf-accent-3": "#10b981",
      "--nf-gradient": "linear-gradient(100deg, #06b6d4, #14b8a6, #10b981)",
      "--nf-gradient-hover": "linear-gradient(100deg, #0ea5e9, #0d9488, #059669)",
      "--nf-ring-from": "#06b6d4",
      "--nf-ring-via": "#14b8a6",
      "--nf-ring-to": "#10b981",
      "--nf-glow": "rgba(6, 182, 212, 0.25)",
      "--nf-sidebar-bg": "linear-gradient(to bottom, rgba(255,255,255,0.85), rgba(255,255,255,0.6))",
      "--nf-chart-1": "#06b6d4",
      "--nf-chart-2": "#14b8a6",
      "--nf-chart-3": "#10b981",
      "--nf-hero-bg": "#0B1120",
      "--nf-text-accent": "#0891b2",
    },
  },
  {
    name: "sunset",
    label: "Sunset Coral",
    swatch: ["#f97316", "#ef4444", "#ec4899"],
    vars: {
      "--nf-accent": "#f97316",
      "--nf-accent-2": "#ef4444",
      "--nf-accent-3": "#ec4899",
      "--nf-gradient": "linear-gradient(100deg, #f97316, #ef4444, #ec4899)",
      "--nf-gradient-hover": "linear-gradient(100deg, #ea580c, #dc2626, #db2777)",
      "--nf-ring-from": "#f97316",
      "--nf-ring-via": "#ef4444",
      "--nf-ring-to": "#ec4899",
      "--nf-glow": "rgba(249, 115, 22, 0.25)",
      "--nf-sidebar-bg": "linear-gradient(to bottom, rgba(255,250,245,0.85), rgba(255,240,235,0.6))",
      "--nf-chart-1": "#f97316",
      "--nf-chart-2": "#ef4444",
      "--nf-chart-3": "#ec4899",
      "--nf-hero-bg": "#1a0a0a",
      "--nf-text-accent": "#ea580c",
    },
  },
  {
    name: "midnight",
    label: "Midnight Purple",
    swatch: ["#8b5cf6", "#6366f1", "#a855f7"],
    vars: {
      "--nf-accent": "#8b5cf6",
      "--nf-accent-2": "#6366f1",
      "--nf-accent-3": "#a855f7",
      "--nf-gradient": "linear-gradient(100deg, #8b5cf6, #6366f1, #a855f7)",
      "--nf-gradient-hover": "linear-gradient(100deg, #7c3aed, #4f46e5, #9333ea)",
      "--nf-ring-from": "#8b5cf6",
      "--nf-ring-via": "#6366f1",
      "--nf-ring-to": "#a855f7",
      "--nf-glow": "rgba(139, 92, 246, 0.25)",
      "--nf-sidebar-bg": "linear-gradient(to bottom, rgba(250,248,255,0.85), rgba(245,240,255,0.6))",
      "--nf-chart-1": "#8b5cf6",
      "--nf-chart-2": "#6366f1",
      "--nf-chart-3": "#a855f7",
      "--nf-hero-bg": "#0f0a1a",
      "--nf-text-accent": "#7c3aed",
    },
  },
  {
    name: "forest",
    label: "Forest Emerald",
    swatch: ["#059669", "#16a34a", "#84cc16"],
    vars: {
      "--nf-accent": "#059669",
      "--nf-accent-2": "#16a34a",
      "--nf-accent-3": "#84cc16",
      "--nf-gradient": "linear-gradient(100deg, #059669, #16a34a, #84cc16)",
      "--nf-gradient-hover": "linear-gradient(100deg, #047857, #15803d, #65a30d)",
      "--nf-ring-from": "#059669",
      "--nf-ring-via": "#16a34a",
      "--nf-ring-to": "#84cc16",
      "--nf-glow": "rgba(5, 150, 105, 0.25)",
      "--nf-sidebar-bg": "linear-gradient(to bottom, rgba(247,255,249,0.85), rgba(240,255,243,0.6))",
      "--nf-chart-1": "#059669",
      "--nf-chart-2": "#16a34a",
      "--nf-chart-3": "#84cc16",
      "--nf-hero-bg": "#0a1a0f",
      "--nf-text-accent": "#047857",
    },
  },
  {
    name: "ocean",
    label: "Ocean Blue",
    swatch: ["#0ea5e9", "#3b82f6", "#06b6d4"],
    vars: {
      "--nf-accent": "#0ea5e9",
      "--nf-accent-2": "#3b82f6",
      "--nf-accent-3": "#06b6d4",
      "--nf-gradient": "linear-gradient(100deg, #0ea5e9, #3b82f6, #06b6d4)",
      "--nf-gradient-hover": "linear-gradient(100deg, #0284c7, #2563eb, #0891b2)",
      "--nf-ring-from": "#0ea5e9",
      "--nf-ring-via": "#3b82f6",
      "--nf-ring-to": "#06b6d4",
      "--nf-glow": "rgba(14, 165, 233, 0.25)",
      "--nf-sidebar-bg": "linear-gradient(to bottom, rgba(248,252,255,0.85), rgba(240,248,255,0.6))",
      "--nf-chart-1": "#0ea5e9",
      "--nf-chart-2": "#3b82f6",
      "--nf-chart-3": "#06b6d4",
      "--nf-hero-bg": "#0a1428",
      "--nf-text-accent": "#0284c7",
    },
  },
];

const STORAGE_KEY = "nutrifit-theme";

type ThemeContextType = {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
  currentTheme: Theme;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "aurora",
  setTheme: () => {},
  currentTheme: THEMES[0],
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>("aurora");

  // Load saved theme on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeName | null;
      if (saved && THEMES.find((t) => t.name === saved)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setThemeState(saved);
      }
    } catch { /* ignore */ }
  }, []);

  // Apply theme CSS variables to :root
  useEffect(() => {
    const t = THEMES.find((th) => th.name === theme) ?? THEMES[0];
    const root = document.documentElement;
    Object.entries(t.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch { /* ignore */ }
  }, [theme]);

  const setTheme = (t: ThemeName) => setThemeState(t);
  const currentTheme = THEMES.find((t) => t.name === theme) ?? THEMES[0];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
