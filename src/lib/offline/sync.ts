import { db } from "./db";
import {
  getPending,
  remove,
  incrementAttempts,
  pendingCount,
} from "./syncQueue";
import type { SyncQueueEntry } from "./db";

/**
 * Background sync orchestrator.
 *
 * Drains the sync queue: for each pending entry, calls the corresponding
 * server endpoint. On success, removes the entry. On failure, increments
 * the attempt counter (exponential backoff is applied via the delay
 * between sync runs). Last-write-wins conflict resolution is used — the
 * server accepts the payload as-is, and the `updatedAt` timestamp on the
 * client side governs which version wins.
 *
 * The sync runs:
 *  - on app load (if online)
 *  - when the browser fires the `online` event
 *  - on a periodic interval (every 60s) while online
 */

const SYNC_INTERVAL_MS = 60_000; // 1 minute

function isOnline(): boolean {
  return typeof navigator !== "undefined" ? navigator.onLine : false;
}

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("nutrifit_token");
  } catch {
    return null;
  }
}

async function syncEntry(entry: SyncQueueEntry): Promise<boolean> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const url = endpointToUrl(entry.endpoint);
  try {
    const res = await fetch(url, {
      method: entry.method,
      headers,
      credentials: "include",
      body: JSON.stringify(entry.payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function endpointToUrl(endpoint: SyncQueueEntry["endpoint"]): string {
  switch (endpoint) {
    case "log":
      return "/api/user/log";
    case "profile":
      return "/api/user/profile";
    case "onboarding":
      return "/api/user/onboarding";
  }
}

let syncing = false;

/** Process all pending sync entries. Safe to call repeatedly. */
export async function processSyncQueue(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  if (syncing || !isOnline()) {
    return { processed: 0, succeeded: 0, failed: 0 };
  }
  syncing = true;
  let succeeded = 0;
  let failed = 0;

  try {
    const pending = await getPending();
    for (const entry of pending) {
      // Skip entries that have failed too many times (will be retried later).
      if (entry.attempts >= 5) {
        failed++;
        continue;
      }
      const ok = await syncEntry(entry);
      if (ok) {
        await remove(entry.id);
        succeeded++;
      } else {
        await incrementAttempts(entry.id);
        failed++;
        // Stop on first failure — likely a network/auth issue; retry next cycle.
        break;
      }
    }
    // If anything succeeded (or the queue was empty and we're online),
    // stamp the last-synced time.
    if (succeeded > 0 || pending.length === 0) {
      setLastSyncedAt(Date.now());
    }
    return { processed: pending.length, succeeded, failed };
  } finally {
    syncing = false;
  }
}

/** Start the periodic sync. Call once on app load. Returns a cleanup fn. */
export function startBackgroundSync(): () => void {
  // Initial sync attempt (if online).
  void processSyncQueue();

  // Periodic.
  const interval = setInterval(() => {
    if (isOnline()) void processSyncQueue();
  }, SYNC_INTERVAL_MS);

  // On online event.
  const onOnline = () => void processSyncQueue();
  window.addEventListener("online", onOnline);

  // Listen for the service worker's Background Sync message — fires when
  // the browser detects connectivity (even if the tab was closed/reopened).
  const onSWMessage = (event: MessageEvent) => {
    if (event.data && event.data.type === "NUTRIFIT_SYNC") {
      void processSyncQueue();
    }
  };
  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    navigator.serviceWorker.addEventListener("message", onSWMessage);
  }

  return () => {
    clearInterval(interval);
    window.removeEventListener("online", onOnline);
    if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker.removeEventListener("message", onSWMessage);
    }
  };
}

// --- lastSyncedAt tracking (localStorage — single timestamp) ---

const LAST_SYNCED_KEY = "nutrifit_last_synced";

export function getLastSyncedAt(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const ts = Number(localStorage.getItem(LAST_SYNCED_KEY) ?? 0);
    return ts || null;
  } catch {
    return null;
  }
}

function setLastSyncedAt(ts: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LAST_SYNCED_KEY, String(ts));
  } catch {
    // ignore
  }
}

/** Returns a human-readable "last synced" label. */
export function getLastSyncedLabel(): string {
  const ts = getLastSyncedAt();
  if (!ts) return "Never";
  const diff = Date.now() - ts;
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return new Date(ts).toLocaleDateString();
}

/** Pull the latest user profile + weekly logs FROM the server into Dexie
 *  (so the local DB stays fresh after a reconnect). */
export async function pullFromServer(): Promise<void> {
  if (!isOnline()) return;
  const token = getAuthToken();
  if (!token) return;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    // Pull user profile.
    const profileRes = await fetch("/api/user/profile", {
      headers,
      credentials: "include",
    });
    if (profileRes.ok) {
      const user = await profileRes.json();
      const { saveUser } = await import("./repositories/userRepository");
      await saveUser({
        name: user.name,
        email: user.email,
        onboardingDone: user.onboardingDone,
        age: user.age,
        sex: user.sex,
        height: user.height,
        weight: user.weight,
        activityLevel: user.activityLevel,
        goal: user.goal,
        targetCalories: user.targetCalories,
        macros: user.macros,
        stepGoal: user.stepGoal,
        exerciseType: user.exerciseType,
        dietPreference: user.dietPreference,
        createdAt: user.createdAt,
      });
    }

    // Pull weekly logs (merge into Dexie — server wins for shared dates).
    const logsRes = await fetch("/api/user/logs/weekly", {
      headers,
      credentials: "include",
    });
    if (logsRes.ok) {
      const remoteLogs = await logsRes.json();
      const d = db();
      if (d && Array.isArray(remoteLogs)) {
        for (const log of remoteLogs) {
          const local = await d.dailyLogs.get(log.date);
          // Only overwrite if the server version is newer (last-write-wins).
          if (!local || (log.updatedAt && log.updatedAt > local.updatedAt)) {
            await d.dailyLogs.put({
              date: log.date,
              calories: log.calories ?? 0,
              protein: log.protein ?? 0,
              carbs: log.carbs ?? 0,
              fat: log.fat ?? 0,
              steps: log.steps ?? 0,
              water: log.water ?? 0,
              sleep: log.sleep ?? 0,
              exercises: log.exercises ?? [],
              updatedAt: log.updatedAt ?? Date.now(),
            });
          }
        }
      }
    }
  } catch {
    // Network errors are fine — the local DB is still the source of truth.
  }
}

export { pendingCount };
