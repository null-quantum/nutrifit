import { NextResponse } from "next/server";
import { getSession, toSafeUser, AuthError } from "@/lib/auth";
import { aiComplete } from "@/lib/ai";
import type { SafeUser } from "@/lib/types";

/**
 * POST /api/ai/chat
 * The NutriFit AI Copilot — a conversational assistant that knows the
 * user's biometric profile. Mirrors the original Express `/ai/chat` route
 * (fixed to actually call the model, unlike the buggy original).
 */
export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthError("Not authenticated", 401);
    }
    // Flatten the nested profile Json into the top-level fields the
    // prompt expects (user.age, user.macros, etc.).
    const user = toSafeUser(session);

    const body = await request.json().catch(() => ({}));
    const message = String(body?.message ?? "").trim();
    const userContext = (body?.userContext ?? {}) as Partial<SafeUser>;

    if (message.length < 1) {
      throw new AuthError("Message is required", 400);
    }
    if (message.length > 2000) {
      throw new AuthError("Message is too long", 400);
    }

    const systemPrompt =
      "You are the NutriFit AI assistant — a friendly, science-backed health, " +
      "nutrition and fitness coach. Be concise, practical, and tailored to the " +
      "user's biometric profile. Respond in plain text (short paragraphs or " +
      "bullet points). Never invent medical diagnoses.";

    const userPrompt = `User Profile:
- Age: ${userContext.age ?? user.age ?? "N/A"}
- Sex: ${userContext.sex ?? user.sex ?? "N/A"}
- Weight: ${userContext.weight ?? user.weight ?? "N/A"} kg
- Height: ${userContext.height ?? user.height ?? "N/A"} cm
- Step Goal: ${userContext.stepGoal ?? user.stepGoal ?? 10000}
- Exercise: ${userContext.exerciseType ?? user.exerciseType ?? "Standard"}
- Diet: ${userContext.dietPreference ?? user.dietPreference ?? "Standard Balanced"}
- Daily Target Calories: ${userContext.targetCalories ?? user.targetCalories ?? "N/A"}
- Macros: ${JSON.stringify(userContext.macros ?? user.macros ?? {})}

User Query: "${message}"

Provide a helpful, specific answer tailored to their metrics.`;

    const reply = await aiComplete(systemPrompt, userPrompt);

    return NextResponse.json({ reply });
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 500;
    const message =
      err instanceof Error ? err.message : "AI chatbot error";
    return NextResponse.json({ error: message }, { status });
  }
}
