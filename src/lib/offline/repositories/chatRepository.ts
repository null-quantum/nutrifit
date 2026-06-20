import { db, type ChatMessage } from "../db";

/**
 * Chat repository — persists AI Copilot conversation history (Dexie).
 * The chat survives tab switches AND full reloads.
 */

export async function getChatHistory(): Promise<ChatMessage[]> {
  const d = db();
  if (!d) return [];
  return d.chatHistory.orderBy("createdAt").toArray();
}

export async function addChatMessage(
  role: ChatMessage["role"],
  text: string
): Promise<ChatMessage> {
  const d = db();
  if (!d) throw new Error("Database unavailable");
  const msg: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    text,
    createdAt: Date.now(),
  };
  await d.chatHistory.add(msg);
  return msg;
}

export async function clearChatHistory(): Promise<void> {
  const d = db();
  if (!d) return;
  await d.chatHistory.clear();
}
