import { db, type LocalDailyLog, type LocalMeal } from "../db";

/**
 * Daily-log repository — reads/writes daily metrics + meal history (Dexie).
 * IndexedDB is the source of truth; the sync queue pushes to the server.
 */

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

export async function getLog(date?: string): Promise<LocalDailyLog | undefined> {
  const d = db();
  if (!d) return undefined;
  return d.dailyLogs.get(date ?? todayStr());
}

export async function saveLog(
  data: Partial<Omit<LocalDailyLog, "date" | "updatedAt">> & {
    date?: string;
  }
): Promise<LocalDailyLog> {
  const d = db();
  if (!d) throw new Error("Database unavailable");
  const date = data.date ?? todayStr();
  const existing = (await d.dailyLogs.get(date)) ?? {
    date,
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    steps: 0,
    water: 0,
    sleep: 0,
    exercises: [],
  };
  const updated: LocalDailyLog = {
    ...existing,
    ...data,
    date,
    updatedAt: Date.now(),
  };
  await d.dailyLogs.put(updated);
  return updated;
}

export async function getWeeklyLogs(): Promise<LocalDailyLog[]> {
  const d = db();
  if (!d) return [];
  const dates = last7DateStrings();
  const logs = await d.dailyLogs.bulkGet(dates);
  return logs.filter((l): l is LocalDailyLog => !!l);
}

// --- Meal history (the "Today's Meals" list) ---

export async function getMealsForDate(date?: string): Promise<LocalMeal[]> {
  const d = db();
  if (!d) return [];
  const target = date ?? todayStr();
  return d.mealHistory.where("date").equals(target).reverse().sortBy("createdAt");
}

export async function getMealsForToday(): Promise<LocalMeal[]> {
  return getMealsForDate(todayStr());
}

export async function addMeal(meal: Omit<LocalMeal, "id" | "createdAt">): Promise<LocalMeal> {
  const d = db();
  if (!d) throw new Error("Database unavailable");
  const full: LocalMeal = {
    ...meal,
    id: `meal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: Date.now(),
  };
  await d.mealHistory.add(full);
  return full;
}

export async function removeMeal(id: string): Promise<void> {
  const d = db();
  if (!d) return;
  await d.mealHistory.delete(id);
}
