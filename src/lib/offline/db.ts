import Dexie, { type Table } from "dexie";

/**
 * NutriFit local-first database (Dexie / IndexedDB).
 *
 * This is the SOURCE OF TRUTH for all client data. The server (Postgres) is
 * a sync target — writes go here first (instant), then a background sync
 * queue pushes them upstream when online. Reads always come from here.
 *
 * Tables:
 *  - users:        cached user profile (single-row, id="local-user")
 *  - dailyLogs:    per-day metrics (keyed by date for fast lookup)
 *  - syncQueue:    pending write operations to push to the server
 *  - chatHistory:  AI copilot conversation (persists across sessions)
 *  - mealHistory:  logged meals for the "Today's Meals" list
 */

export type SyncOperation = "upsert" | "delete";

export type SyncQueueEntry = {
  id: string;
  /** Which server endpoint to sync to: "log" | "profile" | "onboarding" */
  endpoint: "log" | "profile" | "onboarding";
  /** HTTP method */
  method: "POST" | "PUT";
  /** The payload to send */
  payload: Record<string, unknown>;
  /** When the write happened (for conflict resolution) */
  createdAt: number;
  /** Number of failed sync attempts (exponential backoff) */
  attempts: number;
};

export type LocalUser = {
  id: string; // "local-user" — single row
  name: string;
  email: string;
  onboardingDone: boolean;
  age?: number;
  sex?: string;
  height?: number;
  weight?: number;
  activityLevel?: string;
  goal?: string;
  targetCalories?: number;
  macros?: { protein: number; carbs: number; fat: number };
  stepGoal?: number;
  exerciseType?: string;
  dietPreference?: string;
  createdAt: string;
  updatedAt: number;
};

export type LocalDailyLog = {
  date: string; // YYYY-MM-DD — primary key
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  steps: number;
  water: number;
  sleep: number;
  exercises?: unknown[];
  updatedAt: number;
};

export type LocalMeal = {
  id: string;
  text: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  date: string; // YYYY-MM-DD
  createdAt: number;
};

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  createdAt: number;
};

export class NutriFitDB extends Dexie {
  users!: Table<LocalUser, string>;
  dailyLogs!: Table<LocalDailyLog, string>;
  syncQueue!: Table<SyncQueueEntry, string>;
  chatHistory!: Table<ChatMessage, string>;
  mealHistory!: Table<LocalMeal, string>;

  constructor() {
    super("nutrifit-dexie");
    this.version(1).stores({
      // `&` = primary key, `,` separates indexed fields
      users: "&id, email",
      dailyLogs: "&date, updatedAt",
      syncQueue: "&id, endpoint, createdAt, attempts",
      chatHistory: "&id, createdAt",
      mealHistory: "&id, date, createdAt",
    });
  }
}

// Singleton — shared across the app.
let dbInstance: NutriFitDB | null = null;

export function getDB(): NutriFitDB {
  if (typeof window === "undefined") {
    // SSR safety — Dexie only works in the browser.
    throw new Error("Dexie database can only be used in the browser.");
  }
  if (!dbInstance) {
    dbInstance = new NutriFitDB();
  }
  return dbInstance;
}

/** Safe accessor that returns null on SSR (for use in guards). */
export function db(): NutriFitDB | null {
  if (typeof window === "undefined") return null;
  return getDB();
}
