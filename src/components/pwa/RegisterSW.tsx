"use client";

import { useEffect } from "react";

/**
 * Registers the NutriFit service worker for offline / PWA support.
 * Only registers in PRODUCTION — in dev mode, Turbopack's HMR uses
 * dynamic URLs that the SW can't cache, causing console errors.
 */
export function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    // Skip in development to avoid interfering with HMR / Turbopack.
    if (process.env.NODE_ENV !== "production") return;

    const onLoad = () => {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {
          // SW registration is best-effort; ignore failures.
        });
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });
  }, []);
  return null;
}
