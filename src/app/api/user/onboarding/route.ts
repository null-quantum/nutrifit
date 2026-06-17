import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession, toSafeUser, AuthError } from "@/lib/auth";
import { buildProfile } from "@/lib/nutrition";

export async function POST(request: Request) {
  try {
    const user = await getSession();
    if (!user) {
      throw new AuthError("Not authenticated", 401);
    }

    const body = await request.json().catch(() => ({}));
    const age = Number(body?.age);
    const height = Number(body?.height ?? body?.heightCm);
    const weight = Number(body?.weight ?? body?.weightKg);
    const stepGoal = Number(body?.stepGoal);
    const sex = String(body?.sex ?? body?.gender ?? "male") as "male" | "female";
    const exerciseType = String(body?.exerciseType ?? "Core Stability & Rehabilitation");
    const dietPreference = String(body?.dietPreference ?? "Standard Balanced Macro Split");

    if (
      !Number.isFinite(age) ||
      age < 5 ||
      age > 120 ||
      !Number.isFinite(height) ||
      height < 80 ||
      height > 260 ||
      !Number.isFinite(weight) ||
      weight < 25 ||
      weight > 400 ||
      !Number.isFinite(stepGoal) ||
      stepGoal < 0 ||
      stepGoal > 100000
    ) {
      throw new AuthError("Please complete all fields with valid values.", 400);
    }

    // Mifflin-St Jeor BMR, TDEE = BMR * 1.55, macros 30/40/30.
    const profile = buildProfile({
      age,
      sex,
      heightCm: height,
      weightKg: weight,
      stepGoal,
      // The nutrition lib expects an ExerciseType enum; we keep the raw
      // human-readable label from the dropdown in the stored profile so
      // the dashboard displays the user's exact choice.
      exerciseType: "moderate",
      dietPreference: "balanced",
    });

    const storedProfile = {
      age,
      sex,
      heightCm: height,
      weightKg: weight,
      activityLevel: "moderate",
      goal: "maintain",
      targetCalories: profile.targetCalories,
      macros: profile.macros,
      stepGoal,
      exerciseType,
      dietPreference,
    };

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        onboardingDone: true,
        profile: storedProfile,
      },
    });

    return NextResponse.json({
      message: "Onboarding complete",
      user: toSafeUser(updated),
    });
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 500;
    const message =
      err instanceof Error ? err.message : "Server error";
    return NextResponse.json({ message }, { status });
  }
}
