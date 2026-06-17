"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, X, Sparkles } from "lucide-react";

/**
 * Captures the browser's `beforeinstallprompt` event and surfaces a custom
 * "Install NutriFit" call-to-action. Browsers only fire this event when:
 *  - the app is served over HTTPS (or localhost),
 *  - a valid web manifest + service worker are registered, and
 *  - the user hasn't already installed/dismissed it recently.
 *
 * We also remember a dismissal in localStorage for 7 days so the banner
 * doesn't nag right after the user closes it.
 */

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "nutrifit_install_dismissed";
const DISMISS_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

function isRecentlyDismissed(): boolean {
  try {
    const ts = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
    if (!ts) return false;
    return Date.now() - ts < DISMISS_TTL;
  } catch {
    return false;
  }
}

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [visible, setVisible] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already installed (running as standalone PWA)? Don't show.
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(display-mode: standalone)").matches
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInstalled(true);
      return;
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      if (isRecentlyDismissed()) return;
      setDeferred(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    const onInstalled = () => {
      setInstalled(true);
      setVisible(false);
      setDeferred(null);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function handleInstall() {
    if (!deferred) return;
    await deferred.prompt();
    const choice = await deferred.userChoice;
    if (choice.outcome === "accepted") {
      setInstalled(true);
      setVisible(false);
    } else {
      // user dismissed the native prompt — hide our banner too.
      setVisible(false);
    }
    setDeferred(null);
  }

  function handleDismiss() {
    setVisible(false);
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  }

  if (installed) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-4 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2"
        >
          <div className="nf-glass flex items-center gap-3 rounded-2xl p-4 pr-3 shadow-2xl">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl nf-btn-gradient">
              <Sparkles className="size-5 text-white" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-900">
                Install NutriFit
              </p>
              <p className="text-xs text-slate-500">
                Add to your home screen for offline access.
              </p>
            </div>
            <button
              type="button"
              onClick={handleInstall}
              className="nf-btn-gradient flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold"
            >
              <Download className="size-3.5" />
              Install
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Dismiss"
              className="shrink-0 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="size-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
