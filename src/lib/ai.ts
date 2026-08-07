import { GoogleGenAI } from "@google/genai";
import { env } from "@/lib/env";

/**
 * Shared, server-only Gemini helper for NutriFit.
 *
 * This module deliberately exposes the same three functions as the previous
 * implementation: `aiComplete`, `aiAnalyzeImage`, and `extractJSON`.
 * Keeping that public API stable means callers do not need to change when the
 * AI provider implementation changes.
 *
 * Required environment variable:
 *   GEMINI_API_KEY — Gemini Developer API key.
 *
 * Optional environment variable:
 *   GEMINI_MODEL — preferred model. When omitted, Flash-Lite is used.
 *
 * Do not import this module from client components: it reads a server secret.
 */

/**
 * Flash-Lite is the safe default for this app: it is fast, supports text and
 * image inputs, and is available on the Gemini Developer API free tier within
 * Google's current quota limits.
 */
const DEFAULT_MODEL = "gemini-2.5-flash-lite";

/**
 * A secondary model is tried only when the first model is unavailable (for
 * example, a retired model name or an account without access). Do not add
 * preview model names here: preview models can be shut down without notice.
 */
const FALLBACK_MODELS = ["gemini-2.5-flash"] as const;

/** A single client is reused for the life of the server process. */
let geminiClient: GoogleGenAI | null = null;

/**
 * Create the SDK client lazily so module import itself never fails during a
 * build. The key is trimmed because copied environment values occasionally
 * contain accidental surrounding whitespace.
 */
function getGeminiClient(): GoogleGenAI {
  if (geminiClient) return geminiClient;

  const apiKey = env.geminiApiKey?.trim();
  if (!apiKey) {
    throw new Error(
      "AI features require GEMINI_API_KEY. Add it to your server environment " +
        "variables (https://aistudio.google.com/app/apikey)."
    );
  }

  geminiClient = new GoogleGenAI({ apiKey });
  return geminiClient;
}

/**
 * Build an ordered, duplicate-free list for each request. GEMINI_MODEL takes
 * priority, but the stable default is still attempted if that override is
 * invalid or has been retired.
 */
function getModelCandidates(): string[] {
  const configuredModel = env.geminiModel?.trim();

  return [configuredModel, DEFAULT_MODEL, ...FALLBACK_MODELS].filter(
    (model): model is string => Boolean(model)
  ).filter((model, index, models) => models.indexOf(model) === index);
}

/** Convert unknown SDK errors to a safe, readable string for server logs. */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

/**
 * Fallback is intentionally narrow. Retrying another model will not repair an
 * invalid API key, a malformed request, or an account-wide outage; it can only
 * help when a particular model is unavailable to this project.
 */
function shouldTryNextModel(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();

  return (
    message.includes("not_found") ||
    message.includes("not found") ||
    message.includes("no longer available") ||
    message.includes("model is unavailable") ||
    message.includes("model not available") ||
    message.includes("unsupported model") ||
    message.includes("does not exist")
  );
}

/**
 * Call Gemini with each eligible model in order. The SDK response type is
 * inferred here, which avoids tying this helper to internal SDK type exports.
 */
async function generateWithFallback(
  contents: Parameters<GoogleGenAI["models"]["generateContent"]>[0]["contents"]
) {
  const client = getGeminiClient();
  const models = getModelCandidates();
  let lastError: unknown;

  for (const model of models) {
    try {
      const response = await client.models.generateContent({ model, contents });
      const text = response.text?.trim();

      // A successful request without text is not useful to any current caller.
      if (!text) {
        throw new Error("Gemini returned an empty response.");
      }

      return text;
    } catch (error) {
      lastError = error;
      const message = getErrorMessage(error);

      // Log the model and error for diagnosis, never the prompt, image, or key.
      console.warn(`[AI] Gemini model "${model}" failed: ${message}`);

      if (!shouldTryNextModel(error)) break;
    }
  }

  console.error("[AI] Gemini request failed after model selection.", lastError);
  throw new Error(
    "The AI service is temporarily unavailable. Please try again in a moment."
  );
}

/**
 * Run one text completion. The prompts are combined to preserve the behavior
 * of the previous helper, which sent both values as one Gemini text request.
 */
export async function aiComplete(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  if (!systemPrompt?.trim() || !userPrompt?.trim()) {
    throw new Error("Both systemPrompt and userPrompt are required for AI completion.");
  }

  return generateWithFallback(`${systemPrompt}\n\n${userPrompt}`);
}

/**
 * Extract a JSON value from an LLM response. Models often wrap JSON in a
 * Markdown fence or add a short introduction; both are accepted here.
 */
export function extractJSON<T = unknown>(raw: string): T {
  if (!raw?.trim()) throw new Error("Empty AI response");

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = (fenced ?? raw).trim();

  // Fast path for an already-clean object or array.
  try {
    return JSON.parse(candidate) as T;
  } catch {
    // Continue with balanced-bracket extraction below.
  }

  const objectStart = candidate.indexOf("{");
  const arrayStart = candidate.indexOf("[");
  const start =
    objectStart === -1
      ? arrayStart
      : arrayStart === -1
        ? objectStart
        : Math.min(objectStart, arrayStart);

  if (start === -1) throw new Error("No JSON found in AI response");

  // Find the matching final bracket while respecting quoted strings and escapes.
  const opening = candidate[start];
  const closing = opening === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < candidate.length; index += 1) {
    const character = candidate[index];

    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }

    if (character === '"') inString = true;
    else if (character === opening) depth += 1;
    else if (character === closing) {
      depth -= 1;
      if (depth === 0) {
        return JSON.parse(candidate.slice(start, index + 1)) as T;
      }
    }
  }

  throw new Error("Malformed JSON in AI response");
}

/**
 * Analyze a meal image with Gemini's multimodal input support. Accept both raw
 * base64 and a data URL so callers cannot accidentally send the prefix twice.
 */
export async function aiAnalyzeImage(
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  if (!imageBase64?.trim()) throw new Error("An image is required for AI analysis.");
  if (!mimeType?.trim()) throw new Error("An image MIME type is required for AI analysis.");
  if (!prompt?.trim()) throw new Error("An analysis prompt is required.");

  const base64 = imageBase64
    .trim()
    .replace(/^data:[^;]+;base64,/i, "");

  return generateWithFallback([
    { text: prompt },
    {
      inlineData: {
        mimeType: mimeType.trim(),
        data: base64,
      },
    },
  ]);
}
