import type { UserProfile } from "@/lib/nutrition";

/**
 * Flat user shape — matches the frontend contract from the original
 * Vite/Express project so dashboard components can read `user.age`,
 * `user.macros.protein`, `user.targetCalories`, etc. directly.
 *
 * The DB still stores these inside a nested `profile` Json for
 * normalization; the API layer flattens it on the way out.
 */
export type SafeUser = {
  id: string;
  name: string;
  email: string;
  onboardingDone: boolean;
  // Flattened biometric profile (present after onboarding)
  age?: number;
  sex?: string;
  height?: number; // heightCm
  weight?: number; // weightKg
  activityLevel?: string;
  goal?: string;
  targetCalories?: number;
  macros?: { protein: number; carbs: number; fat: number };
  stepGoal?: number;
  exerciseType?: string;
  dietPreference?: string;
  createdAt: string;
};

/** A single exercise returned by the AI workout generator. */
export type Exercise = {
  id: number | string;
  name: string;
  sets: number;
  reps: number | string;
  target: string;
  form: string;
  avoid?: string;
};

/** Meal macro estimate returned by the AI meal analyzer. */
export type MealEstimate = {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items?: string[];
  tip?: string;
  notes?: string;
};

/** A single daily log entry. */
export type DailyLogEntry = {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  steps: number;
  water: number;
  sleep: number;
  exercises?: Exercise[];
};

export type { UserProfile };
