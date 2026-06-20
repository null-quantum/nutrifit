import type {
  Exercise,
  MealEstimate,
  SafeUser,
  UserProfile,
  DailyLogEntry,
} from "@/lib/types";
import {
  getUser,
  saveUser,
  patchUser,
  clearUser,
} from "@/lib/offline/repositories/userRepository";
import {
  getLog,
  saveLog as repoSaveLog,
  getWeeklyLogs,
  addMeal,
  removeMeal,
  getMealsForToday,
} from "@/lib/offline/repositories/dailyLogRepository";
import {
  getChatHistory,
  addChatMessage,
  clearChatHistory,
} from "@/lib/offline/repositories/chatRepository";
import { enqueue } from "@/lib/offline/syncQueue";
import { buildOnboardedFlatUser } from "@/lib/nutrition";

// Re-export repository functions + chat for the UI.
export {
  getMealsForToday,
  addMeal,
  removeMeal,
  getChatHistory,
  addChatMessage,
  clearChatHistory,
};

/**
 * Bearer-token for the JWT cookie (cross-site iframe preview support).
 */
const TOKEN_KEY = "nutrifit_token";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : false;
}

export class OfflineError extends Error {
  constructor(
    message = "You're offline. AI features need an internet connection."
  ) {
    super(message);
    this.name = "OfflineError";
  }
}

async function request<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url, {
    credentials: "include",
    headers,
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (data && typeof data === "object" &&
        ("message" in data
          ? String((data as { message: unknown }).message)
          : "error" in data
          ? String((data as { error: unknown }).error)
          : null)) || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

/* ------------------------------------------------------------------ */
/* Auth — must hit the server (credential verification + JWT).        */
/* After auth, the user profile is cached to Dexie.                    */
/* ------------------------------------------------------------------ */

export const api = {
  register: async (
    name: string,
    email: string,
    password: string
  ): Promise<{ user: SafeUser }> => {
    if (!isOnline()) {
      throw new OfflineError(
        "Sign up needs a connection the first time."
      );
    }
    const res = await request<{
      user: SafeUser;
      token?: string;
      message?: string;
    }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    if (res.token) setToken(res.token);
    // Cache to Dexie (source of truth for all future reads).
    await saveUser({
      name: res.user.name,
      email: res.user.email,
      onboardingDone: res.user.onboardingDone,
      createdAt: res.user.createdAt,
    });
    return { user: res.user };
  },

  login: async (
    email: string,
    password: string
  ): Promise<{ user: SafeUser }> => {
    if (!isOnline()) {
      throw new OfflineError(
        "Sign in needs a connection the first time."
      );
    }
    const res = await request<{
      user: SafeUser;
      token?: string;
      message?: string;
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (res.token) setToken(res.token);
    // Cache the full profile to Dexie.
    await saveUser({
      name: res.user.name,
      email: res.user.email,
      onboardingDone: res.user.onboardingDone,
      age: res.user.age,
      sex: res.user.sex,
      height: res.user.height,
      weight: res.user.weight,
      activityLevel: res.user.activityLevel,
      goal: res.user.goal,
      targetCalories: res.user.targetCalories,
      macros: res.user.macros,
      stepGoal: res.user.stepGoal,
      exerciseType: res.user.exerciseType,
      dietPreference: res.user.dietPreference,
      createdAt: res.user.createdAt,
    });
    return { user: res.user };
  },

  logout: async (): Promise<void> => {
    try {
      await request<{ message?: string }>("/api/auth/logout", {
        method: "POST",
      });
    } catch {
      // ignore
    }
    setToken(null);
    await clearUser();
    await clearChatHistory();
  },

  /** LOCAL-FIRST: read user from Dexie (instant, offline-capable). */
  profile: async (): Promise<SafeUser> => {
    const local = await getUser();
    if (!local) throw new Error("No local session");
    // Map LocalUser → SafeUser (flat shape the UI expects).
    return {
      id: local.id,
      name: local.name,
      email: local.email,
      onboardingDone: local.onboardingDone,
      age: local.age,
      sex: local.sex,
      height: local.height,
      weight: local.weight,
      activityLevel: local.activityLevel,
      goal: local.goal,
      targetCalories: local.targetCalories,
      macros: local.macros,
      stepGoal: local.stepGoal,
      exerciseType: local.exerciseType,
      dietPreference: local.dietPreference,
      createdAt: local.createdAt,
    };
  },

  /** LOCAL-FIRST onboarding: compute TDEE client-side, save to Dexie,
   *  enqueue sync. Works fully offline. */
  onboarding: async (payload: {
    age: number;
    gender?: string;
    sex?: string;
    height: number;
    weight: number;
    stepGoal: number;
    exerciseType: string;
    dietPreference: string;
  }): Promise<{ user: SafeUser; message?: string }> => {
    const sex = (payload.sex ?? payload.gender ?? "male") as "male" | "female";
    const flat = buildOnboardedFlatUser({
      age: payload.age,
      sex,
      heightCm: payload.height,
      weightKg: payload.weight,
      stepGoal: payload.stepGoal,
      exerciseType: payload.exerciseType,
      dietPreference: payload.dietPreference,
    });
    const existing = await getUser();
    const saved = await saveUser({
      name: existing?.name ?? "Local Athlete",
      email: existing?.email ?? "local@nutrifit.app",
      createdAt: existing?.createdAt ?? new Date().toISOString(),
      ...flat,
    });
    // Enqueue sync (so the server gets the onboarding when online).
    await enqueue("onboarding", "POST", payload);
    return {
      user: {
        id: saved.id,
        name: saved.name,
        email: saved.email,
        onboardingDone: saved.onboardingDone,
        age: saved.age,
        sex: saved.sex,
        height: saved.height,
        weight: saved.weight,
        activityLevel: saved.activityLevel,
        goal: saved.goal,
        targetCalories: saved.targetCalories,
        macros: saved.macros,
        stepGoal: saved.stepGoal,
        exerciseType: saved.exerciseType,
        dietPreference: saved.dietPreference,
        createdAt: saved.createdAt,
      },
    };
  },

  /** LOCAL-FIRST profile update: save to Dexie, enqueue sync. */
  updateProfile: async (payload: {
    name?: string;
    age?: number;
    sex?: string;
    height?: number;
    weight?: number;
    stepGoal?: number;
    exerciseType?: string;
    dietPreference?: string;
  }): Promise<SafeUser> => {
    const existing = await getUser();
    if (!existing) throw new Error("No local session");

    // Recompute TDEE/macros if biometrics changed.
    const age = payload.age ?? existing.age ?? 25;
    const sex = (payload.sex ?? existing.sex ?? "male") as "male" | "female";
    const height = payload.height ?? existing.height ?? 170;
    const weight = payload.weight ?? existing.weight ?? 70;
    const stepGoal = payload.stepGoal ?? existing.stepGoal ?? 10000;
    const exerciseType = payload.exerciseType ?? existing.exerciseType ?? "Standard";
    const dietPreference =
      payload.dietPreference ?? existing.dietPreference ?? "Standard Balanced";

    const flat = buildOnboardedFlatUser({
      age,
      sex,
      heightCm: height,
      weightKg: weight,
      stepGoal,
      exerciseType,
      dietPreference,
    });
    const updated = await patchUser({
      name: payload.name ?? existing.name,
      ...flat,
    });
    if (!updated) throw new Error("Failed to update profile");

    // Enqueue sync.
    await enqueue("profile", "PUT", {
      name: updated.name,
      age,
      sex,
      height,
      weight,
      stepGoal,
      exerciseType,
      dietPreference,
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      onboardingDone: updated.onboardingDone,
      age: updated.age,
      sex: updated.sex,
      height: updated.height,
      weight: updated.weight,
      activityLevel: updated.activityLevel,
      goal: updated.goal,
      targetCalories: updated.targetCalories,
      macros: updated.macros,
      stepGoal: updated.stepGoal,
      exerciseType: updated.exerciseType,
      dietPreference: updated.dietPreference,
      createdAt: updated.createdAt,
    };
  },

  /** LOCAL-FIRST daily log: save to Dexie instantly, enqueue sync. */
  saveLog: async (payload: {
    date?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    steps?: number;
    water?: number;
    sleep?: number;
    exercises?: Exercise[];
  }): Promise<{ message: string; log: DailyLogEntry }> => {
    const saved = await repoSaveLog(payload);
    // Enqueue sync (server gets the full day's log).
    await enqueue("log", "POST", {
      date: saved.date,
      calories: saved.calories,
      protein: saved.protein,
      carbs: saved.carbs,
      fat: saved.fat,
      steps: saved.steps,
      water: saved.water,
      sleep: saved.sleep,
      exercises: saved.exercises ?? [],
    });
    return {
      message: "Saved locally",
      log: {
        id: saved.date,
        userId: "local",
        date: saved.date,
        calories: saved.calories,
        protein: saved.protein,
        carbs: saved.carbs,
        fat: saved.fat,
        steps: saved.steps,
        water: saved.water,
        sleep: saved.sleep,
        exercises: (saved.exercises as Exercise[]) ?? [],
      },
    };
  },

  /** LOCAL-FIRST weekly logs: read from Dexie (instant). */
  weeklyLogs: async (): Promise<DailyLogEntry[]> => {
    const localLogs = await getWeeklyLogs();
    return localLogs.map((l) => ({
      id: l.date,
      userId: "local",
      date: l.date,
      calories: l.calories,
      protein: l.protein,
      carbs: l.carbs,
      fat: l.fat,
      steps: l.steps,
      water: l.water,
      sleep: l.sleep,
      exercises: (l.exercises as Exercise[]) ?? [],
    }));
  },

  // --- AI features methods (online-only, with friendly offline errors) ---

  generateWorkout: async (payload: {
    fitnessLevel?: string;
    workoutFocus?: string;
    equipment?: string;
    userContext?: Partial<SafeUser>;
  }): Promise<{ success: boolean; plan: Exercise[]; exercises: Exercise[] }> => {
    if (!isOnline()) {
      throw new OfflineError(
        "Workout generation needs a connection. Your last cached plan is still available below."
      );
    }
    return request<{ success: boolean; plan: Exercise[]; exercises: Exercise[] }>(
      "/api/ai/generate-workout",
      { method: "POST", body: JSON.stringify(payload) }
    );
  },

  analyzeMeal: async (mealDescription: string) => {
    if (!isOnline()) {
      throw new OfflineError(
        "Meal analysis needs a connection. Your recent analyses are cached below."
      );
    }
    return request<{ analysis: MealEstimate; estimate: MealEstimate }>(
      "/api/ai/analyze-meal",
      { method: "POST", body: JSON.stringify({ mealDescription }) }
    );
  },

  /** POST /api/ai/analyze-meal-photo — AI vision meal analysis from a photo. */
  analyzeMealPhoto: async (image: string, mimeType: string) => {
    if (!isOnline()) {
      throw new OfflineError(
        "Photo analysis needs a connection. Please reconnect to analyze meal photos."
      );
    }
    return request<{ analysis: MealEstimate }>(
      "/api/ai/analyze-meal-photo",
      { method: "POST", body: JSON.stringify({ image, mimeType }) }
    );
  },

  chat: async (payload: {
    message: string;
    userContext?: Partial<SafeUser>;
    chatHistory?: { role: "assistant" | "user"; text: string }[];
    recentLogs?: {
      date: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      steps: number;
    }[];
    todayMeals?: {
      text: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
    }[];
  }): Promise<{ reply: string }> => {
    if (!isOnline()) {
      throw new OfflineError(
        "I'm offline right now — I need a connection to generate new responses. Your profile and logs are still available."
      );
    }
    return request<{ reply: string }>("/api/ai/chat", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /** POST /api/ai/weekly-report — AI-generated weekly nutrition summary. */
  weeklyReport: async (payload: {
    userContext?: Partial<SafeUser>;
    recentLogs: {
      date: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      steps: number;
    }[];
  }): Promise<{
    summary: string;
    insights: string[];
    recommendations: string[];
    adherenceScore: number;
  }> => {
    if (!isOnline()) {
      throw new OfflineError(
        "Weekly report generation needs a connection."
      );
    }
    return request<{
      summary: string;
      insights: string[];
      recommendations: string[];
      adherenceScore: number;
    }>("/api/ai/weekly-report", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};

export type { SafeUser, UserProfile, Exercise, MealEstimate, DailyLogEntry };
