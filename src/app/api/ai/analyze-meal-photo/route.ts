import { NextResponse } from "next/server";
import { getSession, AuthError } from "@/lib/auth";
import { aiAnalyzeImage, extractJSON } from "@/lib/ai";
import type { MealEstimate } from "@/lib/types";

/**
 * POST /api/ai/analyze-meal-photo
 *
 * Analyzes a meal photo using AI vision (Gemini Vision or z-ai SDK) and
 * returns estimated calories, macros, identified items, and a nutrition tip.
 *
 * Accepts:
 *  - image: base64-encoded image data (no data: prefix)
 *  - mimeType: e.g. "image/jpeg", "image/png"
 *
 * Returns:
 *  - analysis: { calories, protein, carbs, fat, items[], tip }
 */
export async function POST(request: Request) {
  try {
    const user = await getSession();
    if (!user) {
      throw new AuthError("Not authenticated", 401);
    }

    const body = await request.json().catch(() => ({}));
    const image = String(body?.image ?? "");
    const mimeType = String(body?.mimeType ?? "image/jpeg");

    if (!image) {
      throw new AuthError("Image data is required", 400);
    }
    if (image.length > 5_000_000) {
      throw new AuthError("Image is too large (max 5MB base64)", 400);
    }

    const prompt = `You are an expert nutritionist. Analyze this meal photo and estimate the nutritional content.

Return STRICTLY a JSON object with exactly these keys:
{
  "calories": <estimated total calories in kcal>,
  "protein": <grams of protein>,
  "carbs": <grams of carbohydrates>,
  "fat": <grams of fat>,
  "items": ["array of short strings naming the food items you see"],
  "tip": "<one practical nutrition tip about this meal>"
}

Be realistic with estimates based on standard portion sizes. Respond with ONLY the JSON object.`;

    const raw = await aiAnalyzeImage(image, mimeType, prompt);
    const analysis = extractJSON<MealEstimate>(raw);

    if (
      typeof analysis?.calories !== "number" ||
      typeof analysis.protein !== "number" ||
      typeof analysis.carbs !== "number" ||
      typeof analysis.fat !== "number"
    ) {
      throw new AuthError("Could not analyze this photo. Please try again.", 502);
    }

    return NextResponse.json({ analysis });
  } catch (err) {
    const status = err instanceof AuthError ? err.status : 500;
    const message =
      err instanceof Error ? err.message : "Photo analysis failed";
    return NextResponse.json({ error: message }, { status });
  }
}
