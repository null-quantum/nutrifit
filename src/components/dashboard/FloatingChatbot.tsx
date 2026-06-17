"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { springSoft } from "./motion";
import { Send, X, Sparkles, MessageSquare } from "lucide-react";

type Message = { role: "assistant" | "user"; text: string };

const quickTemplates = [
  {
    label: "📋 Meal Plan",
    prompt: "Compile a customized meal plan based on my macros.",
  },
  {
    label: "🏋️ Workout Tips",
    prompt:
      "Analyze my target workout routine and suggest optimal recovery meals.",
  },
  {
    label: "💧 Hydration",
    prompt: "How much water should I drink based on my weight and activity?",
  },
];

/**
 * FloatingChatbot — a persistent, closable AI assistant widget.
 *
 * - Renders a floating launcher button (bottom-right) using the uploaded
 *   chatbot icon on every dashboard tab.
 * - Clicking opens a glass chat panel with the full Copilot logic
 *   (api.chat + userContext + quick templates + typing indicator).
 * - Close button (X) in the header + Escape key + backdrop click all
 *   dismiss the panel, so users can never get "stuck".
 * - Conversation persists while the dashboard is mounted (switching tabs
 *   doesn't lose the chat).
 */
export function FloatingChatbot() {
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);

  // Allow any other component (e.g. the Overview "Ask AI Copilot" button)
  // to open the chatbot by dispatching a `nutrifit:open-chat` event.
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("nutrifit:open-chat", onOpen);
    return () => window.removeEventListener("nutrifit:open-chat", onOpen);
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hi! I'm your NutriFit AI companion. Ask me anything about your nutrition, workouts, or recovery — or tap a suggestion below.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      // Focus the input shortly after the panel mounts.
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, open]);

  // Escape to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleSendMessage = async (customPrompt?: string) => {
    const messageText = customPrompt || input;
    if (!messageText.trim() || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", text: messageText }]);
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
        targetCalories: user?.targetCalories,
        macros: user?.macros,
      };
      const response = await api.chat({ message: messageText, userContext });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: response.reply },
      ]);
    } catch (err) {
      const text =
        err instanceof Error && err.message
          ? err.message
          : "I couldn't reach the AI service. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", text }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ===== Floating launcher button (always visible on dashboard) ===== */}
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.4 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        aria-label="Open AI chat assistant"
        className={`fixed bottom-5 right-5 z-50 size-16 rounded-full shadow-2xl shadow-cyan-500/30 flex items-center justify-center transition-opacity ${
          open ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Pulsing gradient halo behind the button */}
        <motion.span
          className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-teal-400 to-emerald-400"
          animate={{ scale: [1, 1.12, 1], opacity: [0.55, 0.85, 0.55] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* White inner disc — holds the icon, fills the circle */}
        <span className="absolute inset-[3px] rounded-full bg-white/95 backdrop-blur-sm flex items-center justify-center overflow-hidden">
          <motion.img
            src="/chatbot-icon.png"
            alt=""
            // Fill the disc edge-to-edge; the wide 4:3 icon crops nicely.
            className="w-[140%] h-[140%] object-cover"
            animate={{
              y: [0, -2.5, 0],
              rotate: [-3, 3, -3],
              scale: [1, 1.06, 1],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
        {/* live-pulse ping */}
        <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white" />
        </span>
      </motion.button>

      {/* ===== Chat panel ===== */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop (mobile only — click to close) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-slate-900/20 backdrop-blur-[2px] lg:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.94 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="fixed z-50 flex flex-col overflow-hidden rounded-3xl nf-premium nf-aurora-border
                         bottom-0 right-0 left-0 top-auto h-[85vh] sm:h-[36rem]
                         sm:bottom-5 sm:right-5 sm:left-auto sm:top-auto sm:w-[26rem] sm:max-w-[calc(100vw-2.5rem)]"
            >
              {/* HEADER — close button */}
              <div className="px-4 py-3 flex items-center justify-between shrink-0 border-b border-white/40 bg-white/50 backdrop-blur-xl relative">
                <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-teal-400/50 to-transparent" />
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="size-9 rounded-xl overflow-hidden bg-gradient-to-br from-cyan-100 to-emerald-100 flex items-center justify-center border border-white/60">
                      <motion.img
                        src="/chatbot-icon.png"
                        alt=""
                        className="w-[130%] h-[130%] object-cover"
                        animate={{
                          y: [0, -1.5, 0],
                          rotate: [-2, 2, -2],
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </div>
                    <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 border border-white" />
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
                      NutriFit AI
                      <Sparkles size={12} className="text-teal-500" />
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                      <MessageSquare size={9} /> Online · knows your profile
                    </p>
                  </div>
                </div>
                <motion.button
                  type="button"
                  onClick={() => setOpen(false)}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={springSoft}
                  aria-label="Close chat"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-colors"
                >
                  <X size={18} />
                </motion.button>
              </div>

              {/* MESSAGE STREAM */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-linear-to-b from-emerald-50/20 to-transparent nf-scroll">
                <AnimatePresence initial={false}>
                  {messages.map((msg, idx) => {
                    const isAi = msg.role === "assistant";
                    return (
                      <motion.div
                        key={idx}
                        layout
                        initial={{ opacity: 0, y: 10, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                        className={`flex gap-2.5 ${
                          isAi ? "text-left" : "flex-row-reverse text-right"
                        }`}
                      >
                        <div
                          className={`shrink-0 size-8 rounded-lg flex items-center justify-center overflow-hidden border ${
                            isAi
                              ? "bg-linear-to-br from-cyan-100 to-emerald-100 border-white/60"
                              : "bg-linear-to-br from-slate-800 to-slate-900 border-transparent text-white"
                          }`}
                        >
                          {isAi ? (
                            <img
                              src="/chatbot-icon.png"
                              alt=""
                              className="w-[120%] h-[120%] object-cover"
                            />
                          ) : (
                            <span className="text-[10px] font-black uppercase">
                              {user?.name?.[0] ?? "U"}
                            </span>
                          )}
                        </div>
                        <div
                          className={`p-3 rounded-2xl text-[13px] font-semibold leading-relaxed border max-w-[78%] ${
                            isAi
                              ? "nf-glass border-white/50 text-slate-700 rounded-tl-sm"
                              : "bg-slate-900 text-slate-100 border-slate-900 rounded-tr-sm"
                          }`}
                        >
                          {isAi ? (
                            <span className="whitespace-pre-wrap">{msg.text}</span>
                          ) : (
                            <span className="nf-text-aurora font-bold whitespace-pre-wrap">
                              {msg.text}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* Typing indicator */}
                <AnimatePresence>
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                      className="flex gap-2.5 text-left"
                    >
                      <div className="shrink-0 size-8 rounded-lg flex items-center justify-center overflow-hidden bg-linear-to-br from-cyan-100 to-emerald-100 border border-white/60">
                        <motion.img
                          src="/chatbot-icon.png"
                          alt=""
                          className="w-[120%] h-[120%] object-cover"
                          animate={{ rotate: [-2, 2, -2] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        />
                      </div>
                      <div className="nf-glass border border-white/50 p-3.5 rounded-2xl rounded-tl-sm flex items-center gap-1.5">
                        {[0, 1, 2].map((i) => (
                          <motion.span
                            key={i}
                            className="w-1.5 h-1.5 rounded-full bg-linear-to-r from-emerald-500 to-teal-500"
                            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
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
                <div ref={scrollRef} />
              </div>

              {/* QUICK TEMPLATES */}
              <div className="px-3 py-2 bg-white/30 backdrop-blur-xl border-t border-white/40 flex gap-1.5 overflow-x-auto shrink-0 nf-scroll">
                {quickTemplates.map((t) => (
                  <motion.button
                    key={t.label}
                    type="button"
                    onClick={() => handleSendMessage(t.prompt)}
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    transition={springSoft}
                    className="nf-glass-soft text-[10px] font-bold tracking-wide text-emerald-700 px-2.5 py-1.5 rounded-lg border border-white/50 whitespace-nowrap cursor-pointer"
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
                className="p-3 bg-white/50 backdrop-blur-xl border-t border-white/40 flex gap-2 items-center shrink-0"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything…"
                  className="flex-1 bg-white/80 border border-white/60 rounded-xl px-3.5 py-3 text-sm font-semibold outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/40 text-slate-800 transition-all"
                  required
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.06, y: -1 }}
                  whileTap={{ scale: 0.94 }}
                  transition={springSoft}
                  className={`nf-btn-gradient p-3 rounded-xl text-white flex justify-center items-center ${
                    input.trim() ? "nf-glow" : ""
                  }`}
                  aria-label="Send message"
                >
                  <Send size={15} />
                </motion.button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
