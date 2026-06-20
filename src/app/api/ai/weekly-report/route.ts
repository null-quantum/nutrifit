import { NextResponse } from "next/server";
import { getSession, toSafeUser, AuthError } from "@/lib/auth";
import { aiComplete, extractJSON } from "@/lib/ai";
import type { SafeUser } from "@/lib/types";

/**
 * POST /api/ai/weekly-report
 *
 * Generates an AI-powered weekly nutrition report from the user's last 7
 * days of daily logs. Returns:
 *  - summary: a 2-3 sentence overview of the week
 *  - insights: array of specific observations (e.g. "protein was low on 3 days")
 *  - recommendations: array of actionable suggestions for next week
 *  - adherenceScore: 0-100 how well they stuck to their targets
 */
type LogEntry = {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  steps: number;
};

type WeeklyReport = {
  summary: string;
  insights: string[];
  recommendations: string[];
  adherenceScore: number;
};

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      throw new AuthError("Not authenticated", 401);
    }
    const user = toSafeUser(session);

    const body = await request.json().catch(() => ({}));
    const userContext = (body?.userContext ?? {}) as Partial<SafeUser>;
    const recentLogs = (body?.recentLogs ?? []) as LogEntry[];

    if (recentLogs.length === 0) {
      return NextResponse.json({
        summary:
          "No logs recorded this week yet. Start logging your meals and steps to get a personalized weekly report!",
        insights: ["No data to analyze yet."],
        recommendations: [
          "Log at least one meal today to begin building your weekly report.",
          "Set a daily step goal in Settings to track your activity.",
        ],
        adherenceScore: 0,
      });
    }

    // Compute stats for the prompt.
    const targetCal = userContext.targetCalories ?? user.targetCalories ?? 2000;
    const targetProtein = userContext.macros?.protein ?? user.macros?.protein ?? 150;
    const avgCal = Math.round(
      recentLogs.reduce((s, l) => s + l.calories, 0) / recentLogs.length
    );
    const avgProtein = Math.round(
      recentLogs.reduce((s, l) => s + l.protein, 0) / recentLogs.length
    );
    const avgSteps = Math.round(
      recentLogs.reduce((s, l) => s + l.steps, 0) / recentLogs.length
    );
    const daysLogged = recentLogs.length;

    const systemPrompt =
      "You are the NutriFit AI Nutrition Coach. Generate a weekly nutrition " +
      "report based on the user's logged data. Be encouraging but honest. " +
      "Respond with STRICTLY valid JSON — no markdown, no commentary.";

    const userPrompt = `Generate a weekly nutrition report for this user.

USER: ${user.name}, ${userContext.age ?? user.age ?? "?"}yo ${userContext.sex ?? user.sex ?? "?"}, ${userContext.weight ?? user.weight ?? "?"}kg
TARGETS: ${targetCal} kcal/day, ${targetProtein}g protein/day, ${userContext.stepGoal ?? user.stepGoal ?? 10000} steps/day

WEEK'S DATA (${daysLogged} days logged):
${recentLogs
  .map((l) => {
    const day = new Date(l.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });
    return `${day}: ${l.calories} kcal, P${l.protein}g, C${l.carbs}g, F${l.fat}g, ${l.steps} steps`;
  })
  .join("\n")}

AVERAGES: ${avgCal} kcal/day, ${avgProtein}g protein/day, ${avgSteps} steps/day

Return STRICTLY a JSON object with exactly these keys:
{
  "summary": "2-3 sentence overview of the week (tone: encouraging but honest)",
  "insights": ["3-5 specific observations about their patterns, e.g. 'Protein was below target on 3 days' or 'Step count increased toward the end of the week'"],
  "recommendations": ["3-4 actionable suggestions for next week, specific to their data"],
  "adherenceScore": <number 0-100 representing how well they stuck to their calorie + macro targets>
}

Respond with ONLY the JSON object. Do not wrap it in markdown fences.`;

    const raw = await aiComplete(systemPrompt, userPrompt);
    const report = extractJSON<WeeklyReport>(raw);

    // Validate the shape.
    if (
      typeof report.summary !== "string" ||
      !Array.isArray(report.insights) ||
      !Array.isArray(report.recommendations) ||
      typeof report.adherenceScore !== "number"
    ) {
      throw new AuthError("Could not generate the weekly report. Please try again.", 502);
    }

    return NextResponse.json(report);
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 500;
    const message =
      err instanceof Error ? err.message : "Weekly report error";
    return NextResponse.json({ error: message }, { status });
  }
}
