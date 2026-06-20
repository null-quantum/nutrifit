import ZAI from "z-ai-web-dev-sdk";
import { GoogleGenAI } from "@google/genai";

/**
 * Shared AI helper for NutriFit.
 *
 * Uses the NEW @google/genai SDK (supports Gemini 3.x models including
 * gemini-3.1-flash-lite). Falls back to z-ai-web-dev-sdk in the sandbox.
 *
 * This module is server-only — never import from client code.
 */

// --- Gemini (production) ---
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (geminiClient) return geminiClient;
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  geminiClient = new GoogleGenAI({ apiKey: key });
  return geminiClient;
}

function getGeminiModel(): string {
  return process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
}

// --- z-ai SDK (sandbox fallback) ---
let zaiPromise: Promise<ZAI> | null = null;

async function getZAI(): Promise<ZAI> {
  if (!zaiPromise) {
    zaiPromise = ZAI.create();
  }
  return zaiPromise;
}

/**
 * Check if the z-ai SDK is available (sandbox only).
 */
async function isSandboxAIAvailable(): Promise<boolean> {
  try {
    await getZAI();
    return true;
  } catch {
    return false;
  }
}

/** Clear error thrown when no AI provider is available. */
function noAIProviderError(): Error {
  return new Error(
    "AI features require a Gemini API key. Set GEMINI_API_KEY in your " +
    "environment variables (Vercel → Settings → Environment Variables). " +
    "Get a free key at https://aistudio.google.com/app/apikey"
  );
}

/**
 * Run a single completion turn and return the raw text content.
 */
export async function aiComplete(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  // Prefer Gemini in production.
  const client = getGeminiClient();
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: getGeminiModel(),
        contents: `${systemPrompt}\n\n${userPrompt}`,
      });
      const text = response.text;
      if (text && text.trim()) return text.trim();
    } catch (err) {
      console.error("Gemini completion failed:", err);
      throw new Error(
        "Gemini API error: " +
        (err instanceof Error ? err.message : "Unknown error") +
        `. Check GEMINI_API_KEY and GEMINI_MODEL (${getGeminiModel()}) env vars.`
      );
    }
  }

  // Sandbox fallback (z-ai-web-dev-sdk).
  if (await isSandboxAIAvailable()) {
    const zai = await getZAI();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "assistant", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      thinking: { type: "disabled" },
    });
    const content = completion.choices?.[0]?.message?.content ?? "";
    return content.trim();
  }

  throw noAIProviderError();
}

/**
 * Extract a JSON value from an LLM response that may be wrapped in
 * ```json ... ``` fences or contain stray prose.
 */
export function extractJSON<T = unknown>(raw: string): T {
  if (!raw) throw new Error("Empty AI response");

  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenceMatch ? fenceMatch[1] : raw;

  try {
    return JSON.parse(candidate.trim()) as T;
  } catch {
    // Fall through to bracket scanning.
  }

  const arrayStart = candidate.indexOf("[");
  const objStart = candidate.indexOf("{");
  let start = -1;
  let openChar = "{";
  let closeChar = "}";

  if (objStart === -1 || (arrayStart !== -1 && arrayStart < objStart)) {
    start = arrayStart;
    openChar = "[";
    closeChar = "]";
  } else {
    start = objStart;
  }

  if (start === -1) throw new Error("No JSON found in AI response");

  const end = candidate.lastIndexOf(closeChar);
  if (end === -1 || end < start) throw new Error("Malformed JSON in AI response");

  const slice = candidate.slice(start, end + 1);
  return JSON.parse(slice) as T;
}

/**
 * Analyze a meal photo with AI vision and return structured nutrition data.
 *
 * Uses Gemini Vision (inline image part) when GEMINI_API_KEY is set,
 * otherwise falls back to the z-ai-web-dev-sdk vision endpoint (sandbox).
 */
export async function aiAnalyzeImage(
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  // --- Gemini Vision (production) ---
  const client = getGeminiClient();
  if (client) {
    try {
      const response = await client.models.generateContent({
        model: getGeminiModel(),
        contents: [
          { text: prompt },
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
        ],
      });
      const text = response.text;
      if (text && text.trim()) return text.trim();
    } catch (err) {
      console.error("Gemini Vision failed:", err);
      throw new Error(
        "Gemini Vision error: " +
        (err instanceof Error ? err.message : "Unknown error") +
        `. Check GEMINI_API_KEY env var.`
      );
    }
  }

  // --- z-ai SDK vision fallback (sandbox only) ---
  if (await isSandboxAIAvailable()) {
    const zai = await getZAI();
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;
    const completion = await zai.chat.completions.createVision({
      model: "glm-4.6v",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
      thinking: { type: "disabled" },
    });
    const content = completion.choices?.[0]?.message?.content ?? "";
    return content.trim();
  }

  throw noAIProviderError();
}
