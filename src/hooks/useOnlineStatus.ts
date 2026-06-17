"use client";

import { useEffect, useState } from "react";

/**
 * Tracks the browser's online/offline status reactively.
 * Online = `navigator.onLine`; updates on the window `online`/`offline`
 * events. Used by the global OfflineBanner and to trigger sync-on-online.
 */
export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
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
