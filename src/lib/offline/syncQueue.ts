import { db, type SyncQueueEntry } from "./db";

/**
 * Sync queue — holds pending write operations destined for the server.
 *
 * Writes go here immediately (alongside Dexie) so the UI never blocks on
 * network. A background sync processor (`sync.ts`) drains the queue when
 * online, with exponential backoff on failure.
 */

function generateId(): string {
  return `sync-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Enqueue a write operation to be synced to the server. */
export async function enqueue(
  endpoint: SyncQueueEntry["endpoint"],
  method: SyncQueueEntry["method"],
  payload: Record<string, unknown>
): Promise<SyncQueueEntry> {
  const d = db();
  if (!d) throw new Error("Database unavailable");
  const entry: SyncQueueEntry = {
    id: generateId(),
    endpoint,
    method,
    payload,
    createdAt: Date.now(),
    attempts: 0,
  };
  await d.syncQueue.add(entry);

  // Register a background sync so the browser retries when online —
  // even if the tab was closed. Best-effort (not all browsers support it).
  registerBackgroundSync();

  return entry;
}

/** Ask the service worker to register a background sync tag. */
function registerBackgroundSync() {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  navigator.serviceWorker.ready
    .then((reg) => {
      const syncReg = reg as ServiceWorkerRegistration & {
        sync?: { register: (tag: string) => Promise<void> };
      };
      if (syncReg.sync) {
        return syncReg.sync.register("nutrifit-sync");
      }
    })
    .catch(() => {
      // Background sync not supported — the 60s interval + online event
      // still handle sync.
    });
}

/** Get all pending sync entries, oldest first. */
export async function getPending(): Promise<SyncQueueEntry[]> {
  const d = db();
  if (!d) return [];
  return d.syncQueue.orderBy("createdAt").toArray();
}

/** Remove a successfully-synced entry. */
export async function remove(entryId: string): Promise<void> {
  const d = db();
  if (!d) return;
  await d.syncQueue.delete(entryId);
}

/** Increment the attempt counter (for backoff). */
export async function incrementAttempts(entryId: string): Promise<void> {
  const d = db();
  if (!d) return;
  const entry = await d.syncQueue.get(entryId);
  if (entry) {
    await d.syncQueue.put({ ...entry, attempts: entry.attempts + 1 });
  }
}

/** How many operations are pending (for UI badges). */
export async function pendingCount(): Promise<number> {
  const d = db();
  if (!d) return 0;
  return d.syncQueue.count();
}

/** Clear the entire queue (e.g. on logout). */
export async function clearQueue(): Promise<void> {
  const d = db();
  if (!d) return;
  await d.syncQueue.clear();
}
