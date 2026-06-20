import ZAI from "z-ai-web-dev-sdk";

/**
 * Shared AI helper for NutriFit.
 *
 * Uses Grok (xAI) — OpenAI-compatible API at api.x.ai/v1.
 * Falls back to z-ai-web-dev-sdk in the sandbox.
 *
 * Env vars:
 *   XAI_API_KEY  — your Grok API key (starts with "xai-")
 *   XAI_MODEL    — model name (default: "grok-3-mini")
 *
 * This module is server-only — never import from client code.
 */

const XAI_BASE_URL = "https://api.x.ai/v1";

function getXaiKey(): string | null {
  const key = process.env.XAI_API_KEY;
  if (!key) {
    console.error("[AI] XAI_API_KEY is not set in environment variables.");
    return null;
  }
  return key.trim();
}

function getXaiModel(): string {
  const model = process.env.XAI_MODEL || "grok-3-mini";
  console.log("[AI] Using Grok model:", model);
  return model;
}

// --- z-ai SDK (sandbox fallback) ---
let zaiPromise: Promise<ZAI> | null = null;

async function getZAI(): Promise<ZAI> {
  if (!zaiPromise) {
    zaiPromise = ZAI.create();
  }
  return zaiPromise;
}

async function isSandboxAIAvailable(): Promise<boolean> {
  try {
    await getZAI();
    return true;
  } catch {
    return false;
  }
}

function noAIProviderError(): Error {
  return new Error(
    "AI features require an xAI (Grok) API key. Set XAI_API_KEY in your " +
    "environment variables (Vercel → Settings → Environment Variables). " +
    "Get a key at https://console.x.ai"
  );
}

/**
 * Run a single text completion via Grok (xAI).
 * Returns the raw text response.
 */
export async function aiComplete(
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const key = getXaiKey();

  if (key) {
    try {
      const res = await fetch(`${XAI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: getXaiModel(),
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error("[AI] Grok API error:", res.status, errBody);
        throw new Error(
          `Grok API error (${res.status}): ${errBody.slice(0, 200)}` +
          `. Check XAI_API_KEY and XAI_MODEL env vars.`
        );
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content ?? "";
      if (content.trim()) return content.trim();
    } catch (err) {
      // Re-throw if it's already our formatted error
      if (err instanceof Error && err.message.startsWith("Grok API error")) {
        throw err;
      }
      console.error("[AI] Grok request failed:", err);
      throw new Error(
        "Grok request failed: " +
        (err instanceof Error ? err.message : "Unknown error")
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
 * Analyze a meal photo with Grok Vision.
 * Grok supports image_url with base64 data URLs (OpenAI-compatible format).
 */
export async function aiAnalyzeImage(
  imageBase64: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  const key = getXaiKey();

  if (key) {
    try {
      const dataUrl = `data:${mimeType};base64,${imageBase64}`;

      const res = await fetch(`${XAI_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          model: getXaiModel(),
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: dataUrl } },
              ],
            },
          ],
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        console.error("[AI] Grok Vision error:", res.status, errBody);
        throw new Error(
          `Grok Vision error (${res.status}): ${errBody.slice(0, 200)}` +
          `. Check XAI_API_KEY env var.`
        );
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content ?? "";
      if (content.trim()) return content.trim();
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("Grok Vision error")) {
        throw err;
      }
      console.error("[AI] Grok Vision request failed:", err);
      throw new Error(
        "Grok Vision request failed: " +
        (err instanceof Error ? err.message : "Unknown error")
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
