"use client";

import { useEffect } from "react";

/**
 * Registers the NutriFit service worker for offline / PWA support.
 * Mounted once at the root layout. In development the SW uses a
 * network-first strategy for HTML so HMR still works; offline loads
 * fall back to the cached app shell + the IndexedDB local-first layer.
 */
export function RegisterSW() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
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
