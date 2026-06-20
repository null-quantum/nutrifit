import { NextResponse } from "next/server";
import { getSession, toSafeUser, AuthError } from "@/lib/auth";
import { aiComplete } from "@/lib/ai";
import type { SafeUser } from "@/lib/types";

/**
 * POST /api/ai/chat
 * The NutriFit AI Nutrition Coach — a conversational assistant with MEMORY.
 *
 * Accepts:
 *  - message: the user's new question
 *  - userContext: biometric profile (age, weight, macros, etc.)
 *  - chatHistory: recent conversation messages [{role, text}] (last ~10)
 *  - recentLogs: last 7 days of daily logs [{date, calories, protein, ...}]
 *  - todayMeals: meals logged today [{text, calories, protein, ...}]
 *
 * The AI uses all of this to give contextual, personalized responses that
 * reference the user's actual eating patterns, recent conversations, and
 * progress toward their goals.
 */
type ChatMsg = { role: "assistant" | "user"; text: string };
type LogEntry = {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  steps: number;
};
type MealEntry = {
  text: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthError("Not authenticated", 401);
    }
    const user = toSafeUser(session);

    const body = await request.json().catch(() => ({}));
    const message = String(body?.message ?? "").trim();
    const userContext = (body?.userContext ?? {}) as Partial<SafeUser>;
    const chatHistory = (body?.chatHistory ?? []) as ChatMsg[];
    const recentLogs = (body?.recentLogs ?? []) as LogEntry[];
    const todayMeals = (body?.todayMeals ?? []) as MealEntry[];

    if (message.length < 1) {
      throw new AuthError("Message is required", 400);
    }
    if (message.length > 2000) {
      throw new AuthError("Message is too long", 400);
    }

    // --- Build the memory-enriched system prompt ---
    const systemPrompt =
      "You are the NutriFit AI Nutrition Coach — a friendly, science-backed " +
      "health, nutrition and fitness coach with MEMORY. You remember the " +
      "user's profile, their recent meals, their weekly progress, and the " +
      "ongoing conversation. Reference specific data from their logs and " +
      "previous messages when relevant. Be concise, practical, and " +
      "personalized. Respond in plain text (short paragraphs or bullet " +
      "points). Never invent medical diagnoses.";

    // --- User profile context ---
    const profileSection = `USER PROFILE:
- Name: ${user.name}
- Age: ${userContext.age ?? user.age ?? "N/A"}
- Sex: ${userContext.sex ?? user.sex ?? "N/A"}
- Weight: ${userContext.weight ?? user.weight ?? "N/A"} kg
- Height: ${userContext.height ?? user.height ?? "N/A"} cm
- Step Goal: ${userContext.stepGoal ?? user.stepGoal ?? 10000}
- Exercise: ${userContext.exerciseType ?? user.exerciseType ?? "Standard"}
- Diet: ${userContext.dietPreference ?? user.dietPreference ?? "Standard Balanced"}
- Daily Target Calories: ${userContext.targetCalories ?? user.targetCalories ?? "N/A"}
- Macro Targets: Protein ${userContext.macros?.protein ?? user.macros?.protein ?? "?"}g, Carbs ${userContext.macros?.carbs ?? user.macros?.carbs ?? "?"}g, Fat ${userContext.macros?.fat ?? user.macros?.fat ?? "?"}g`;

    // --- Recent logs context (last 7 days) ---
    let logsSection = "";
    if (recentLogs.length > 0) {
      const logLines = recentLogs.map((l) => {
        const dayName = new Date(l.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });
        return `  ${dayName} ${l.date}: ${l.calories} kcal, P${l.protein}g/C${l.carbs}g/F${l.fat}g, ${l.steps} steps`;
      });
      const avgCal = Math.round(recentLogs.reduce((s, l) => s + l.calories, 0) / recentLogs.length);
      const targetCal = userContext.targetCalories ?? user.targetCalories ?? 0;
      const adherence = targetCal > 0 ? Math.round((avgCal / targetCal) * 100) : 0;
      logsSection = `\n\nRECENT PROGRESS (last ${recentLogs.length} days logged):
${logLines.join("\n")}
Average: ${avgCal} kcal/day (${adherence}% of target)`;
    }

    // --- Today's meals context ---
    let mealsSection = "";
    if (todayMeals.length > 0) {
      const mealLines = todayMeals.map(
        (m) => `  • ${m.text} (${m.calories} kcal, P${m.protein}g/C${m.carbs}g/F${m.fat}g)`
      );
      mealsSection = `\n\nMEALS LOGGED TODAY:
${mealLines.join("\n")}`;
    }

    // --- Chat history context (last 10 messages) ---
    let historySection = "";
    if (chatHistory.length > 0) {
      const historyLines = chatHistory.slice(-10).map(
        (m) => `${m.role === "user" ? "User" : "Coach"}: ${m.text.slice(0, 300)}`
      );
      historySection = `\n\nCONVERSATION HISTORY (recent):
${historyLines.join("\n")}`;
    }

    const userPrompt = `${profileSection}${logsSection}${mealsSection}${historySection}

NEW USER QUERY: "${message}"

Provide a helpful, specific answer that references their actual data, recent meals, progress, and conversation history when relevant.`;

    const reply = await aiComplete(systemPrompt, userPrompt);

    return NextResponse.json({ reply });
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 500;
    const message =
      err instanceof Error ? err.message : "AI chatbot error";
    return NextResponse.json({ error: message }, { status });
  }
}
