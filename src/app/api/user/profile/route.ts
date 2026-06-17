import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, toSafeUser, AuthError } from "@/lib/auth";
import { calculateBMR, calculateTDEE, calculateMacros } from "@/lib/nutrition";

/**
 * PUT /api/user/profile
 *
 * Updates the user's name and/or biometric profile fields. When any
 * biometric input (age, sex, height, weight) changes, TDEE and macros
 * are recomputed via Mifflin-St Jeor (BMR × 1.55, 30/40/30 split) so
 * the dashboard targets stay accurate.
 *
 * Accepts a flat payload matching the SafeUser shape (name, age, sex,
 * height, weight, stepGoal, exerciseType, dietPreference). Returns the
 * updated flat user.
 */
export async function PUT(request: Request) {
  try {
    const user = await getSession();
    if (!user) {
      throw new AuthError("Not authenticated", 401);
    }

    const body = await request.json().catch(() => ({}));

    // --- Name (core field) ---
    const name =
      typeof body?.name === "string" && body.name.trim().length > 0
        ? body.name.trim().slice(0, 80)
        : undefined;

    // --- Biometric profile fields (optional, only updated if provided) ---
    type StoredProfile = {
      age?: number;
      sex?: string;
      heightCm?: number;
      weightKg?: number;
      activityLevel?: string;
      goal?: string;
      targetCalories?: number;
      macros?: { protein: number; carbs: number; fat: number };
      stepGoal?: number;
      exerciseType?: string;
      dietPreference?: string;
    };
    const existing = (user.profile as StoredProfile | null) ?? {};
    const age =
      body?.age !== undefined ? Number(body.age) : existing.age;
    const sex =
      body?.sex !== undefined ? String(body.sex) : existing.sex;
    const height =
      body?.height !== undefined ? Number(body.height) : existing.heightCm;
    const weight =
      body?.weight !== undefined ? Number(body.weight) : existing.weightKg;
    const stepGoal =
      body?.stepGoal !== undefined ? Number(body.stepGoal) : existing.stepGoal;
    const exerciseType =
      body?.exerciseType !== undefined
        ? String(body.exerciseType)
        : existing.exerciseType;
    const dietPreference =
      body?.dietPreference !== undefined
        ? String(body.dietPreference)
        : existing.dietPreference;

    // Validate biometrics if we have enough to recompute.
    const canCompute =
      age !== undefined && sex !== undefined && height !== undefined && weight !== undefined;
    if (canCompute) {
      if (
        !Number.isFinite(age) || age < 5 || age > 120 ||
        !Number.isFinite(height) || height < 80 || height > 260 ||
        !Number.isFinite(weight) || weight < 25 || weight > 400 ||
        (sex !== "male" && sex !== "female")
      ) {
        throw new AuthError("Please provide valid biometric values.", 400);
      }
      if (stepGoal !== undefined && (!Number.isFinite(stepGoal) || stepGoal < 0 || stepGoal > 100000)) {
        throw new AuthError("Step goal must be between 0 and 100000.", 400);
      }
    }

    // Recompute TDEE + macros if biometrics are present.
    let targetCalories = existing.targetCalories as number | undefined;
    let macros = existing.macros as
      | { protein: number; carbs: number; fat: number }
      | undefined;
    if (canCompute) {
      const bmr = calculateBMR(weight!, height!, age!, sex as "male" | "female");
      targetCalories = calculateTDEE(bmr);
      macros = calculateMacros(targetCalories);
    }

    const updatedProfile: StoredProfile = {
      age,
      sex,
      heightCm: height,
      weightKg: weight,
      activityLevel: existing.activityLevel ?? "moderate",
      goal: existing.goal ?? "maintain",
      targetCalories,
      macros,
      stepGoal,
      exerciseType,
      dietPreference,
    };

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        ...(name ? { name } : {}),
        profile: updatedProfile,
      },
    });

    return NextResponse.json(toSafeUser(updated));
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 500;
    const message =
      err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ message }, { status });
  }
}

export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
  return NextResponse.json(toSafeUser(user));
}
