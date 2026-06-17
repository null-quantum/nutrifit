"use client";

import { useEffect, useRef, useState } from "react";

/**
 * AnimatedNumber — counts up from 0 to `value` with an ease-out curve.
 *
 * Premium SaaS stat feel. Respects prefers-reduced-motion (jumps to value).
 * Re-runs whenever `value` changes (e.g. after a log save).
 */
export function AnimatedNumber({
  value,
  duration = 1100,
  delay = 0,
  format,
  className,
  suffix,
  prefix,
}: {
  value: number;
  duration?: number;
  delay?: number;
  format?: (n: number) => string;
  className?: string;
  suffix?: string;
  prefix?: string;
}) {
  const [display, setDisplay] = useState(0);
  const prefersReduced = useRef(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      prefersReduced.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
    }

    if (prefersReduced.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplay(value);
      return;
    }

    let raf = 0;
    let start = 0;
    const from = 0;
    const to = value;

    const tick = (ts: number) => {
      if (!start) start = ts;
      const elapsed = ts - start - delay;
      if (elapsed < 0) {
        raf = requestAnimationFrame(tick);
        return;
      }
      const t = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      const next = from + (to - from) * eased;
      setDisplay(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration, delay]);

  const formatted = format ? format(display) : Math.round(display).toString();

  return (
    <span className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
