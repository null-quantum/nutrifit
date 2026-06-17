import type {
  Exercise,
  MealEstimate,
  SafeUser,
  UserProfile,
  DailyLogEntry,
} from "@/lib/types";
import { localGet, localSet, localDel, KEYS } from "@/lib/localDb";

/**
 * Bearer-token fallback for the HTTP-only JWT cookie (cross-site iframe
 * preview support).
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
    // ignore storage errors (private mode, etc.)
  }
}

/** True when the browser reports no network connection. */
export function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : true;
}

/**
 * Friendly error thrown by AI methods when the device is offline.
 * UI catch blocks surface `err.message` directly.
 */
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
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

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
/* Local-first daily-log helpers (IndexedDB)                          */
/* ------------------------------------------------------------------ */

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function last7DateStrings(): string[] {
  const out: string[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().split("T")[0]);
  }
  return out;
}

async function readLocalLogs(): Promise<DailyLogEntry[]> {
  return (await localGet<DailyLogEntry[]>(KEYS.logs)) ?? [];
}

async function writeLocalLogs(logs: DailyLogEntry[]): Promise<void> {
  await localSet(KEYS.logs, logs);
}

/** Background-sync: push any locally-queued logs to the server when online. */
export async function syncPendingLogs(): Promise<void> {
  if (!isOnline()) return;
  const pending = (await localGet<DailyLogEntry[]>(KEYS.pendingSync)) ?? [];
  if (pending.length === 0) return;
  for (const entry of pending) {
    try {
      await request<{ message: string; log: DailyLogEntry }>(
        "/api/user/log",
        {
          method: "POST",
          body: JSON.stringify(entry),
        }
      );
    } catch {
      // leave in queue for next attempt
      return;
    }
  }
  await localDel(KEYS.pendingSync);
}

export const api = {
  register: async (
    name: string,
    email: string,
    password: string
  ): Promise<{ user: SafeUser }> => {
    if (!isOnline()) {
      throw new OfflineError(
        "You're offline. Sign up needs a connection the first time."
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
    await localSet(KEYS.user, res.user);
    return { user: res.user };
  },

  login: async (
    email: string,
    password: string
  ): Promise<{ user: SafeUser }> => {
    if (!isOnline()) {
      throw new OfflineError(
        "You're offline. Sign in needs a connection the first time."
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
    await localSet(KEYS.user, res.user);
    return { user: res.user };
  },

  logout: async (): Promise<void> => {
    try {
      await request<{ message?: string }>("/api/auth/logout", {
        method: "POST",
      });
    } catch {
      // ignore network errors on logout
    }
    setToken(null);
    await localDel(KEYS.user);
  },

  /** GET /api/user/profile — online first, local fallback when offline. */
  profile: async (): Promise<SafeUser> => {
    if (isOnline()) {
      try {
        const user = await request<SafeUser>("/api/user/profile", {
          method: "GET",
        });
        await localSet(KEYS.user, user);
        return user;
      } catch {
        // fall through to local
      }
    }
    const local = await localGet<SafeUser>(KEYS.user);
    if (!local) throw new Error("No local session");
    return local;
  },

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
    if (isOnline()) {
      try {
        const res = await request<{ user: SafeUser; message?: string }>(
          "/api/user/onboarding",
          { method: "POST", body: JSON.stringify(payload) }
        );
        await localSet(KEYS.user, res.user);
        return res;
      } catch {
        // fall through to local computation
      }
    }
    // Offline (or server unreachable): compute TDEE/macros client-side.
    const { buildOnboardedFlatUser } = await import("@/lib/nutrition");
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
    const local = await localGet<SafeUser>(KEYS.user);
    const user: SafeUser = {
      id: local?.id ?? "local-user",
      name: local?.name ?? "Local Athlete",
      email: local?.email ?? "local@nutrifit.app",
      createdAt: local?.createdAt ?? new Date().toISOString(),
      ...flat,
    };
    await localSet(KEYS.user, user);
    return { user };
  },

  /**
   * PUT /api/user/profile — update name + biometric profile (recomputes
   * TDEE/macros server-side when biometrics change). Offline-aware: if
   * the server is unreachable, recomputes locally and saves to IndexedDB.
   */
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
    if (isOnline()) {
      try {
        const user = await request<SafeUser>("/api/user/profile", {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        await localSet(KEYS.user, user);
        return user;
      } catch {
        // fall through to local computation
      }
    }
    // Offline: recompute TDEE/macros locally from the new biometrics.
    const { buildOnboardedFlatUser } = await import("@/lib/nutrition");
    const local = await localGet<SafeUser>(KEYS.user);
    if (!local) throw new Error("No local session");
    const age = payload.age ?? local.age ?? 25;
    const sex = (payload.sex ?? local.sex ?? "male") as "male" | "female";
    const height = payload.height ?? local.height ?? 170;
    const weight = payload.weight ?? local.weight ?? 70;
    const stepGoal = payload.stepGoal ?? local.stepGoal ?? 10000;
    const exerciseType = payload.exerciseType ?? local.exerciseType ?? "Standard";
    const dietPreference =
      payload.dietPreference ?? local.dietPreference ?? "Standard Balanced";
    const flat = buildOnboardedFlatUser({
      age,
      sex,
      heightCm: height,
      weightKg: weight,
      stepGoal,
      exerciseType,
      dietPreference,
    });
    const user: SafeUser = {
      ...local,
      name: payload.name ?? local.name,
      ...flat,
    };
    await localSet(KEYS.user, user);
    return user;
  },

  /** POST /api/user/log — local-first (IndexedDB), background server sync. */
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
    const date = payload.date ?? todayStr();
    const logs = await readLocalLogs();
    const idx = logs.findIndex((l) => l.date === date);
    const entry: DailyLogEntry = {
      id: idx >= 0 ? logs[idx].id : `log-${date}`,
      userId: "local",
      date,
      calories: Number(payload.calories ?? 0),
      protein: Number(payload.protein ?? 0),
      carbs: Number(payload.carbs ?? 0),
      fat: Number(payload.fat ?? 0),
      steps: Number(payload.steps ?? 0),
      water: Number(payload.water ?? 0),
      sleep: Number(payload.sleep ?? 0),
      exercises: payload.exercises ?? [],
    };
    if (idx >= 0) logs[idx] = entry;
    else logs.push(entry);
    await writeLocalLogs(logs);

    // Background-sync to the server when online (best-effort).
    if (isOnline()) {
      request<{ message: string; log: DailyLogEntry }>("/api/user/log", {
        method: "POST",
        body: JSON.stringify(entry),
      }).catch(() => {
        // queue for later if it fails
        localGet<DailyLogEntry[]>(KEYS.pendingSync).then((q) => {
          const queue = q ?? [];
          if (!queue.some((e) => e.date === entry.date)) queue.push(entry);
          localSet(KEYS.pendingSync, queue);
        });
      });
    } else {
      const queue = (await localGet<DailyLogEntry[]>(KEYS.pendingSync)) ?? [];
      if (!queue.some((e) => e.date === entry.date)) queue.push(entry);
      await localSet(KEYS.pendingSync, queue);
    }

    return { message: "Log saved locally", log: entry };
  },

  /** GET /api/user/logs/weekly — local-first, refreshes from server online. */
  weeklyLogs: async (): Promise<DailyLogEntry[]> => {
    const dates = last7DateStrings();
    const local = await readLocalLogs();
    let result = local.filter((l) => dates.includes(l.date));

    if (isOnline()) {
      try {
        const remote = await request<DailyLogEntry[]>(
          "/api/user/logs/weekly",
          { method: "GET" }
        );
        // merge remote over local by date, keep any local-only entries
        const byDate = new Map<string, DailyLogEntry>();
        for (const l of result) byDate.set(l.date, l);
        for (const r of remote) byDate.set(r.date, r);
        result = dates
          .map((d) => byDate.get(d))
          .filter((x): x is DailyLogEntry => !!x);
        // persist merged back to local
        const merged = [...local];
        for (const r of remote) {
          const i = merged.findIndex((m) => m.date === r.date);
          if (i >= 0) merged[i] = r;
          else merged.push(r);
        }
        await writeLocalLogs(merged);
      } catch {
        // keep local result
      }
    }
    return result;
  },

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

  chat: async (payload: {
    message: string;
    userContext?: Partial<SafeUser>;
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
};

export type { SafeUser, UserProfile, Exercise, MealEstimate, DailyLogEntry };
