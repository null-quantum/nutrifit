"use client";

/**
 * Tiny IndexedDB-backed key-value store for NutriFit's local-first layer.
 *
 * Used to persist the user profile + daily logs offline so the app stays
 * fully functional without a network connection. Falls back to in-memory
 * (no-op) if IndexedDB is unavailable (SSR, private mode, etc.).
 */

const DB_NAME = "nutrifit-local";
const DB_VERSION = 1;
const STORE = "kv";

let dbPromise: Promise<IDBDatabase | null> | null = null;

function openDB(): Promise<IDBDatabase | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!("indexedDB" in window)) return Promise.resolve(null);
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
  return dbPromise;
}

function tx(
  db: IDBDatabase,
  mode: IDBTransactionMode
): IDBObjectStore {
  return db.transaction(STORE, mode).objectStore(STORE);
}

export async function localGet<T = unknown>(key: string): Promise<T | undefined> {
  const db = await openDB();
  if (!db) return undefined;
  return new Promise((resolve) => {
    const req = tx(db, "readonly").get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => resolve(undefined);
  });
}

export async function localSet<T>(key: string, value: T): Promise<void> {
  const db = await openDB();
  if (!db) return;
  await new Promise<void>((resolve) => {
    const req = tx(db, "readwrite").put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
  });
}

export async function localDel(key: string): Promise<void> {
  const db = await openDB();
  if (!db) return;
  await new Promise<void>((resolve) => {
    const req = tx(db, "readwrite").delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
  });
}

/** Storage keys used across the app. */
export const KEYS = {
  user: "user", // flat SafeUser (last known, online or offline)
  logs: "logs", // DailyLogEntry[] (local log history)
  pendingSync: "pendingSync", // DailyLogEntry[] queued to push when back online
} as const;
