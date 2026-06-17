"use client";

import { motion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Premium motion presets shared across dashboard tabs.
 * Use these with framer-motion's `variants` + `initial`/`whileInView`.
 */

export const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

export const riseItem: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

/** Standard spring used for hover/tap micro-interactions. */
export const springSoft = { type: "spring" as const, stiffness: 320, damping: 26 };

/**
 * GlassCard — the signature premium 2026 surface.
 * Frosted glass + gradient inner border + hover lift + optional aurora border.
 */
export function GlassCard({
  children,
  className = "",
  hover = true,
  aurora = false,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  aurora?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      variants={riseItem}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay }}
      whileHover={hover ? { y: -4 } : undefined}
      className={`nf-premium rounded-3xl ${aurora ? "nf-aurora-border" : ""} ${className}`}
    >
      {children}
    </motion.div>
  );
}
