"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CloudOff, CheckCircle2 } from "lucide-react";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useAuthStore } from "@/store/useAuthStore";
import { processSyncQueue, pullFromServer } from "@/lib/offline/sync";

/**
 * Global connectivity banner.
 *
 * - Offline: a sticky amber strip at the very top telling the user their
 *   changes are saved locally and will sync when reconnected.
 * - Just-back-online: a brief green "Synced" toast (auto-dismisses).
 *
 * Also fires the background log-sync + auth re-check when connectivity
 * returns.
 */
export function OfflineBanner() {
  const online = useOnlineStatus();
  const { checkAuth, offlineMode } = useAuthStore();
  const [showSynced, setShowSynced] = useState(false);
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!online) {
      wasOffline.current = true;
      return;
    }
    // Came back online (or started online): pull fresh data + push queued writes.
    void pullFromServer();
    void processSyncQueue();
    void checkAuth();
    if (wasOffline.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowSynced(true);
      wasOffline.current = false;
      const t = setTimeout(() => setShowSynced(false), 3000);
      return () => clearTimeout(t);
    }
  }, [online, checkAuth]);

  const showOffline = !online || offlineMode;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] pointer-events-none">
      <AnimatePresence>
        {showOffline && (
          <motion.div
            key="offline"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-amber-500 text-white text-xs sm:text-sm font-semibold px-4 py-2 flex items-center justify-center gap-2 shadow-md"
          >
            <CloudOff className="size-4 shrink-0" />
            <span>
              You&apos;re offline — your data is saved on this device and will
              sync automatically when you reconnect.
            </span>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSynced && (
          <motion.div
            key="synced"
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="bg-emerald-600 text-white text-xs sm:text-sm font-semibold px-4 py-2 flex items-center justify-center gap-2 shadow-md"
          >
            <CheckCircle2 className="size-4 shrink-0" />
            <span>Back online — local changes synced.</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
