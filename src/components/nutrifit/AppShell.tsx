"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useAuthStore, type AppView } from "@/store/useAuthStore";
import LandingPage from "@/components/landing/LandingPage";
import AuthPage from "@/components/auth/AuthPage";
import Onboarding from "@/components/onboarding/Onboarding";
import Dashboard from "@/components/dashboard/Dashboard";
import { MeshBackground } from "./MeshBackground";

/**
 * View router — implements the Public/Protected route contract:
 *  - Public views (landing, auth): authenticated users are redirected
 *    to onboarding (if incomplete) or dashboard.
 *  - Protected views (onboarding, dashboard): unauthenticated users are
 *    sent to auth; authenticated-but-not-onboarded users are forced to
 *    onboarding.
 *
 * The landing page renders its own dark cinematic background; the light
 * glassmorphism views (auth, onboarding) sit on top of the shared
 * MeshBackground. The dashboard has its own slate-50 canvas.
 */
function resolveView(
  isAuthenticated: boolean,
  onboardingDone: boolean,
  requested: AppView
): AppView {
  if (!isAuthenticated) {
    return requested === "auth" ? "auth" : "landing";
  }
  if (!onboardingDone) {
    return "onboarding";
  }
  return "dashboard";
}

export function AppShell() {
  const { isAuthenticated, user, view, isCheckingAuth, hasChecked, checkAuth } =
    useAuthStore();

  useEffect(() => {
    if (!hasChecked) {
      void checkAuth();
    }
  }, [hasChecked, checkAuth]);

  const effectiveView = resolveView(
    isAuthenticated,
    user?.onboardingDone ?? false,
    view
  );

  const showLoader = isCheckingAuth && !hasChecked;
  const showMesh = effectiveView === "auth" || effectiveView === "onboarding";

  return (
    <>
      {showMesh && <MeshBackground />}
      <AnimatePresence mode="wait">
        {showLoader ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex min-h-screen items-center justify-center"
          >
            <div className="nf-glass flex flex-col items-center gap-4 rounded-3xl px-10 py-8">
              <span className="flex size-12 items-center justify-center rounded-2xl nf-btn-gradient">
                <Loader2 className="size-6 animate-spin text-white" />
              </span>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading NutriFit…
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={effectiveView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={showMesh ? "relative z-10" : "relative"}
          >
            {effectiveView === "landing" && <LandingPage />}
            {effectiveView === "auth" && <AuthPage />}
            {effectiveView === "onboarding" && <Onboarding />}
            {effectiveView === "dashboard" && <Dashboard />}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
