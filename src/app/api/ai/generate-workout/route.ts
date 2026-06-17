import { NextResponse } from "next/server";
import { getSession, toSafeUser, AuthError } from "@/lib/auth";
import { aiComplete, extractJSON } from "@/lib/ai";
import type { Exercise, SafeUser } from "@/lib/types";

/**
 * POST /api/ai/generate-workout
 * Mirrors the original Express route's payload (`fitnessLevel`,
 * `workoutFocus`, `equipment`, `userContext`) and prompt structure,
 * fixed to actually call the model (the original had an undefined `ai`
 * variable) via z-ai-web-dev-sdk.
 *
 * Biometrics come from the authenticated session (flattened profile),
 * with `userContext` from the client as a fallback.
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthError("Unauthorized — please sign in.", 401);
    }

    if (!session.onboardingDone) {
      throw new AuthError(
        "Please complete onboarding before generating a workout.",
        400
      );
    }
    // Flatten the nested profile Json into top-level biometric fields.
    const user = toSafeUser(session);

    const body = await request.json().catch(() => ({}));
    const fitnessLevel = String(
      body?.fitnessLevel ?? "Intermediate"
    ).slice(0, 60);
    const workoutFocus = String(
      body?.workoutFocus ?? "Hypertrophy Strength"
    ).slice(0, 80);
    const equipment = String(body?.equipment ?? "Dumbbells Only").slice(0, 80);
    const userContext = (body?.userContext ?? {}) as Partial<SafeUser>;

    const age = userContext.age ?? user.age ?? 25;
    const weight = userContext.weight ?? user.weight ?? 70;
    const height = userContext.height ?? user.height ?? 175;

    const systemPrompt =
      "You are the core fitness engine for NutriFit AI. " +
      "You design safe, effective, progressive workout plans tailored to a person's biometrics and goals. " +
      "You ALWAYS respond with strictly valid JSON — no markdown, no commentary.";

    const userPrompt = `Generate a customized daily workout routine based on:
- Experience: ${fitnessLevel}
- Focus: ${workoutFocus}
- Equipment: ${equipment}
- User: Age ${age}, Weight ${weight}kg, Height ${height}cm

Return ONLY a valid JSON array. No markdown code blocks:
[
  {
    "id": "ex_1",
    "name": "Exercise name",
    "sets": 3,
    "reps": 12,
    "target": "Muscle group",
    "form": "How to perform correctly",
    "avoid": "Safety risks to avoid"
  }
]`;

    const raw = await aiComplete(systemPrompt, userPrompt);
    const plan = extractJSON<Exercise[]>(raw);

    if (!Array.isArray(plan) || plan.length === 0) {
      throw new AuthError("Could not generate a workout. Please try again.", 502);
    }

    return NextResponse.json({ success: true, plan, exercises: plan });
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 500;
    const message =
      err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status });
  }
}
