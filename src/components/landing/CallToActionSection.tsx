"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  ScrollReveal,
  TextReveal,
  Floating,
  GradientText,
  ShimmerLine,
} from "@/components/shared/animations";

const CallToActionSection = () => {
  const setView = useAuthStore((s) => s.setView);

  return (
    <section className="relative py-24 overflow-hidden bg-[#05070D] border-t border-rose-900/30">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-rose-950/20" />
      <Floating
        distance={24}
        duration={9}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-64 bg-red-600/10 blur-[100px] rounded-full pointer-events-none"
      />

      <div className="max-w-4xl mx-auto px-6 lg:px-8 relative z-10 text-center">
        <ScrollReveal direction="up" distance={20} duration={0.6}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-bold tracking-wide uppercase mb-8">
            <Sparkles className="w-4 h-4" />
            Final Step
          </div>
        </ScrollReveal>

        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
          <TextReveal
            text="Ready to Transform"
            mode="words"
            delay={0.2}
            stagger={0.07}
          />
          <br />
          <TextReveal
            text="Your Health Journey?"
            mode="words"
            delay={0.6}
            stagger={0.07}
          />
        </h2>

        <ScrollReveal direction="up" distance={24} delay={1}>
          <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            Get AI-powered nutrition and fitness guidance tailored specifically to
            your biometric data. Stop guessing. Start tracking.
          </p>
        </ScrollReveal>

        <ScrollReveal direction="up" distance={30} delay={1.2}>
          <button
            type="button"
            onClick={() => setView("auth")}
            className="w-max px-8 py-4 rounded-xl font-bold text-white shadow-[0_0_40px_rgba(225,29,72,0.3)] bg-gradient-to-r from-red-600 via-rose-500 to-fuchsia-600 hover:from-red-500 hover:via-rose-400 hover:to-fuchsia-500 transition-all duration-300 flex items-center justify-center gap-3 mx-auto group cursor-pointer"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </ScrollReveal>

        <div className="mt-16 max-w-sm mx-auto">
          <ShimmerLine />
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;
