"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { startReminders, getReminderPrefs, checkReminders } from "@/lib/notifications";

/**
 * NotificationManager — mounts globally in the layout.
 *
 * Starts the periodic reminder checker (water/meal/workout) while the app
 * is open. Reads the user profile from the auth store so workout reminders
 * reference the user's exercise type.
 */
export function NotificationManager() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    // Only start if reminders are enabled.
    const prefs = getReminderPrefs();
    if (!prefs.enabled) return;

    const cleanup = startReminders(() => user);
    // Initial check on mount.
    checkReminders(user ?? undefined);
    return cleanup;
  }, [user]);

  return null;
}
