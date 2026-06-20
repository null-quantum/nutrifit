"use client";

import { useEffect, useState } from "react";

/**
 * Tracks the browser's online/offline status reactively.
 *
 * SSR-safe: always initializes to `true` (online) so the server-rendered
 * HTML matches the first client render. The actual `navigator.onLine`
 * value is read in a `useEffect` (after hydration) to avoid mismatches.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    // Read the real status after mount (client-only) — this runs after
    // hydration so it can't cause a server/client mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOnline(navigator.onLine);
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return online;
}
