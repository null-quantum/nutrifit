"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import type { SafeUser } from "@/lib/types";
import { springSoft } from "./motion";
import { Bot, Send, Sparkles, User } from "lucide-react";

type Message = { role: "assistant" | "user"; text: string };

const quickTemplates = [
  { label: "📋 Compile Meal Plan", prompt: "Compile a customized meal plan based on my macros." },
  { label: "🏋️ Workout Analysis", prompt: "Analyze my target workout routine and suggest optimal recovery meals." },
];

export default function AICopilotTab({ user }: { user: SafeUser | null }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Greetings, Operator. I am your NutriFit AI Health Companion. Choose a template or ask a custom question below to compute optimized nutrition plans.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (customPrompt?: string) => {
    const messageText = customPrompt || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: "user", text: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const userContext = {
        age: user?.age,
        weight: user?.weight,
        height: user?.height,
        stepGoal: user?.stepGoal,
        exerciseType: user?.exerciseType,
        dietPreference: user?.dietPreference,
      };

      const response = await api.chat({
        message: messageText,
        userContext,
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: response.reply },
      ]);
    } catch (err) {
      console.error("AI node response processing fault:", err);
      const text =
        err instanceof Error && err.message
          ? err.message
          : "Critical system connection timeout error. Check your server configurations.";
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="nf-premium nf-aurora-border rounded-3xl h-[36rem] flex flex-col overflow-hidden relative"
    >
      {/* HEADER — live-pulse dot + aurora border */}
      <div className="px-6 py-4 flex items-center justify-between shrink-0 border-b border-white/40 bg-white/40 backdrop-blur-xl relative">
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-teal-400/50 to-transparent" />
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="p-2 bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-xl shadow-md shadow-teal-500/20">
              <Bot size={18} />
            </div>
            {/* live-pulse dot */}
            <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 tracking-tight">
              Gemini Flash Inference Core
            </h3>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
              Context: Active Profile Anchored
            </p>
          </div>
        </div>
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles size={16} className="text-teal-500" />
        </motion.div>
      </div>

      {/* MESSAGE STREAM */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-linear-to-b from-emerald-50/20 to-transparent nf-scroll">
        <AnimatePresence initial={false}>
          {messages.map((msg, idx) => {
            const isAi = msg.role === "assistant";
            return (
              <motion.div
                key={idx}
                layout
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 320, damping: 28 }}
                className={`flex gap-3 max-w-3xl ${
                  isAi
                    ? "text-left mr-auto"
                    : "flex-row-reverse text-right ml-auto"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`p-2.5 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center border shadow-sm ${
                    isAi
                      ? "bg-linear-to-br from-emerald-500/15 to-teal-500/10 border-white/50 text-emerald-600"
                      : "bg-linear-to-br from-slate-800 to-slate-900 text-white border-transparent"
                  } ${isAi ? "nf-ring-glow" : ""}`}
                >
                  {isAi ? <Bot size={18} /> : <User size={18} />}
                </div>
                {/* Bubble */}
                <div
                  className={`p-4 rounded-2xl text-sm font-semibold leading-relaxed border max-w-[80%] ${
                    isAi
                      ? "nf-glass border-white/50 text-slate-700"
                      : "bg-slate-900 text-slate-100 border-slate-900 shadow-lg shadow-slate-900/20"
                  }`}
                >
                  {isAi ? (
                    msg.text
                  ) : (
                    <span className="nf-text-aurora font-bold">
                      {msg.text}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing indicator — 3 bouncing dots */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 320, damping: 28 }}
              className="flex gap-3 text-left mr-auto max-w-3xl"
            >
              <div className="p-2.5 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center border shadow-sm bg-linear-to-br from-emerald-500/15 to-teal-500/10 border-white/50 text-emerald-600 nf-ring-glow">
                <Bot size={18} />
              </div>
              <div className="nf-glass border border-white/50 p-4 rounded-2xl flex items-center gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 rounded-full bg-linear-to-r from-emerald-500 to-teal-500"
                    animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.14,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={scrollRef}></div>
      </div>

      {/* QUICK TEMPLATES */}
      <div className="px-6 py-2 bg-white/30 backdrop-blur-xl border-t border-white/40 flex gap-2 overflow-x-auto shrink-0 nf-scroll">
        {quickTemplates.map((t) => (
          <motion.button
            key={t.label}
            type="button"
            onClick={() => handleSendMessage(t.prompt)}
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={springSoft}
            className="nf-glass-soft text-[11px] font-bold tracking-wide text-emerald-700 px-3 py-1.5 rounded-lg border border-white/50 whitespace-nowrap cursor-pointer"
          >
            {t.label}
          </motion.button>
        ))}
      </div>

      {/* INPUT BAR */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void handleSendMessage();
        }}
        className="p-4 bg-white/50 backdrop-blur-xl border-t border-white/40 flex gap-3 items-center shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Query AI platform..."
          className="flex-1 bg-white/70 border border-white/60 rounded-xl px-4 py-3.5 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/40 text-slate-800 transition-all"
          required
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.06, y: -1 }}
          whileTap={{ scale: 0.94 }}
          transition={springSoft}
          className={`nf-btn-gradient p-3.5 rounded-xl text-white flex justify-center items-center cursor-pointer ${
            input.trim() ? "nf-glow" : ""
          }`}
          aria-label="Send message"
        >
          <Send size={16} />
        </motion.button>
      </form>
    </motion.div>
  );
}
