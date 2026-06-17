import { NextResponse } from "next/server";
import { getSession, AuthError } from "@/lib/auth";
import { aiComplete, extractJSON } from "@/lib/ai";
import type { MealEstimate } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const user = await getSession();
    if (!user) {
      throw new AuthError("Unauthorized — please sign in.", 401);
    }

    const body = await request.json().catch(() => ({}));
    // Accept both `mealDescription` (original Express shape) and `meal`.
    const meal = String(body?.mealDescription ?? body?.meal ?? "").trim();

    if (meal.length < 2) {
      throw new AuthError("Please describe your meal in a few words.", 400);
    }
    if (meal.length > 1000) {
      throw new AuthError("Meal description is too long.", 400);
    }

    const systemPrompt =
      "You are NutriFit AI, a registered dietitian and nutrition scientist. " +
      "You estimate the macronutrient content of meals from text descriptions using standard food databases. " +
      "You ALWAYS respond with strictly valid JSON — no markdown, no commentary.";

    const userPrompt = `Estimate the nutritional content of this meal:
"${meal}"

Return STRICTLY a JSON object with exactly these keys:
- "calories": estimated total calories (number, kcal)
- "protein": grams of protein (number)
- "carbs": grams of carbohydrates (number)
- "fat": grams of fat (number)
- "items": an array of short strings naming the main food items identified (max 8 items)
- "notes": one short sentence with a useful nutrition tip about this meal (string)

Respond with ONLY the JSON object. Do not wrap it in markdown fences.`;

    const raw = await aiComplete(systemPrompt, userPrompt);
    const estimate = extractJSON<MealEstimate>(raw);

    if (
      typeof estimate?.calories !== "number" ||
      typeof estimate.protein !== "number" ||
      typeof estimate.carbs !== "number" ||
      typeof estimate.fat !== "number"
    ) {
      throw new AuthError("Could not analyze this meal. Please try again.", 502);
    }

    // `analysis` matches the original Express shape; `estimate` is kept for
    // backwards compatibility. Normalize `tip`/`notes` so both keys exist.
    const analysis = {
      calories: estimate.calories,
      protein: estimate.protein,
      carbs: estimate.carbs,
      fat: estimate.fat,
      tip: estimate.tip ?? estimate.notes ?? "",
      items: estimate.items ?? [],
    };
    return NextResponse.json({ analysis, estimate: analysis });
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 500;
    const message =
      err instanceof Error ? err.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status });
  }
}
