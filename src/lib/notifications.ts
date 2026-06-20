"use client";

/**
 * NutriFit notifications manager.
 *
 * Schedules water, meal, and workout reminders using the Web Notifications
 * API. Preferences are stored in localStorage. Runs via a periodic interval
 * while the app is open (service worker push would need a backend — out of
 * scope for this build, but the architecture supports upgrading to it).
 *
 * Reminders:
 *  - Water: every 2 hours, 9am–9pm ("Time to hydrate! 💧")
 *  - Meals: breakfast 8am, lunch 12pm, dinner 7pm
 *  - Workout: once daily at a user-configurable time
 */

const PREFS_KEY = "nutrifit_reminder_prefs";

export type ReminderPrefs = {
  enabled: boolean;
  water: boolean;
  meals: boolean;
  workout: boolean;
  workoutTime: string; // "HH:MM" 24h, default "17:00"
};

const DEFAULT_PREFS: ReminderPrefs = {
  enabled: false,
  water: true,
  meals: true,
  workout: true,
  workoutTime: "17:00",
};

export function getReminderPrefs(): ReminderPrefs {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function saveReminderPrefs(prefs: ReminderPrefs): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export function getPermission(): NotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  return Notification.permission;
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (typeof window === "undefined" || !("Notification" in window)) return "denied";
  try {
    return await Notification.requestPermission();
  } catch {
    return "denied";
  }
}

function sendNotification(title: string, body: string, icon?: string) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body,
      icon: icon || "/icon-1024.png",
      badge: "/icon-1024.png",
      tag: title, // prevent duplicates
    });
  } catch {
    // ignore
  }
}

// Track which reminders have fired today (so we don't spam).
const firedKey = "nutrifit_reminders_fired";
function getFiredToday(): Record<string, boolean> {
  try {
    const today = new Date().toISOString().split("T")[0];
    const raw = localStorage.getItem(firedKey);
    if (!raw) return {};
    const data = JSON.parse(raw);
    if (data.date !== today) return {}; // reset daily
    return data.fired ?? {};
  } catch {
    return {};
  }
}
function markFired(key: string) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const fired = getFiredToday();
    fired[key] = true;
    localStorage.setItem(firedKey, JSON.stringify({ date: today, fired }));
  } catch {
    // ignore
  }
}

/**
 * Check all reminders and fire any that are due. Call this on an interval
 * (e.g. every 30 seconds) while the app is open.
 */
export function checkReminders(user?: {
  name?: string;
  stepGoal?: number;
  exerciseType?: string;
}) {
  const prefs = getReminderPrefs();
  if (!prefs.enabled || getPermission() !== "granted") return;

  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  const fired = getFiredToday();

  // Water reminder — every 2 hours from 9am to 9pm
  if (prefs.water && hours >= 9 && hours <= 21 && hours % 2 === 0 && minutes < 5) {
    const key = `water-${hours}`;
    if (!fired[key]) {
      sendNotification(
        "💧 Hydration Reminder",
        `Time to drink a glass of water! Staying hydrated keeps your metabolism sharp.`,
        "/chatbot-icon.png"
      );
      markFired(key);
    }
  }

  // Meal reminders
  if (prefs.meals) {
    const meals = [
      { time: "08:00", key: "breakfast", title: "🍳 Breakfast Time", body: "Start your day with a balanced meal to fuel your morning." },
      { time: "12:00", key: "lunch", title: "🥗 Lunch Time", body: "Refuel midday — aim for protein + veggies + complex carbs." },
      { time: "19:00", key: "dinner", title: "🍽️ Dinner Time", body: "Wind down with a lighter meal. Log it in NutriFit!" },
    ];
    for (const meal of meals) {
      if (timeStr === meal.time && !fired[meal.key]) {
        sendNotification(meal.title, meal.body, "/chatbot-icon.png");
        markFired(meal.key);
      }
    }
  }

  // Workout reminder
  if (prefs.workout) {
    const [wh, wm] = prefs.workoutTime.split(":").map(Number);
    if (hours === wh && minutes === wm && !fired["workout"]) {
      const exerciseType = user?.exerciseType ?? "your workout";
      sendNotification(
        "🏋️ Workout Reminder",
        `Time for ${exerciseType}! Your body is ready. Open NutriFit to generate a plan.`,
        "/chatbot-icon.png"
      );
      markFired("workout");
    }
  }
}

/** Start the reminder checker. Returns a cleanup function. */
export function startReminders(getUser: () => { name?: string; stepGoal?: number; exerciseType?: string } | null): () => void {
  // Check every 30 seconds.
  const interval = setInterval(() => {
    checkReminders(getUser() ?? undefined);
  }, 30_000);
  return () => clearInterval(interval);
}
