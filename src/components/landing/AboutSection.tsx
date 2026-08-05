"use client";

import { Target, Zap, Shield } from "lucide-react";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  TextReveal,
  Floating,
  ShimmerLine,
} from "@/components/shared/animations";

const AboutSection = () => {
  const values = [
    {
      icon: <Target className="w-6 h-6 text-rose-600" />,
      title: "Layered AI Architecture",
      description:
        "We process your biometrics through multiple distinct analytical engines, ensuring every recommendation is backed by deep, structured data.",
    },
    {
      icon: <Zap className="w-6 h-6 text-fuchsia-600" />,
      title: "Agile Adaptation",
      description:
        "Your body isn't static, and neither is our engine. Your meal blueprints and workout volumes dynamically recalculate daily based on your latest inputs.",
    },
    {
      icon: <Shield className="w-6 h-6 text-red-500" />,
      title: "Bank-Grade Privacy",
      description:
        "Your health telemetry is encrypted and anonymized. We believe your biological data belongs exclusively to you.",
    },
  ];

  return (
    <section className="py-24 lg:py-32 bg-rose-50/50 relative overflow-hidden z-10">
      {/* Stronger, warmer Crimson/Magenta Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Floating
          distance={30}
          duration={11}
          className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-rose-300/40 blur-[140px]"
        />
        <Floating
          distance={24}
          duration={9}
          delay={1}
          className="absolute bottom-[0%] -right-[10%] w-[50%] h-[50%] rounded-full bg-red-200/40 blur-[120px]"
        />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* LEFT: The Manifesto */}
          <ScrollReveal direction="left" distance={50} duration={0.8}>
            <h2 className="text-rose-600 font-bold tracking-wider uppercase text-sm mb-4">
              <TextReveal text="Our Methodology" mode="block" delay={0.05} />
            </h2>

            {/* 3-Color Blend (Slate -> Dark Rose -> Crimson) */}
            <h3 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-rose-900 to-red-700">
              <TextReveal
                text="We decode the human body."
                mode="words"
                delay={0.2}
                stagger={0.07}
              />
            </h3>

            <div className="w-20 h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-fuchsia-500 mb-8 rounded-full shadow-[0_0_15px_rgba(225,29,72,0.4)]" />

            <p className="text-slate-700 text-lg leading-relaxed mb-6">
              The fitness industry is broken. It runs on generic templates,
              guesswork, and highly marketed supplements. We founded NutriFit
              because we believe that achieving peak physical condition
              shouldn&apos;t be a guessing game—it should be a mathematical
              certainty.
            </p>
            <p className="text-slate-700 text-lg leading-relaxed mb-8">
              By treating your metabolism as a complex system of variables, our
              algorithms isolate what actually works for your specific genetic
              makeup, lifestyle, and goals.
            </p>

            <div className="max-w-xs">
              <ShimmerLine />
            </div>
          </ScrollReveal>

          {/* RIGHT: Core Values Grid */}
          <StaggerContainer
            stagger={0.15}
            delayChildren={0.1}
            className="space-y-8"
          >
            {values.map((item, idx) => (
              <StaggerItem key={idx} direction="right" distance={40}>
                <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl shadow-rose-900/5 border border-rose-100 flex gap-6 hover:shadow-2xl hover:shadow-rose-900/15 hover:-translate-y-1 transition-all duration-300">
                  <div className="shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-rose-50 to-red-50 border border-rose-200 flex items-center justify-center shadow-inner">
                    {item.icon}
                  </div>
                  <div>
                    {/* Rose-to-Red gradient on the card headers */}
                    <h4 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-700 to-red-600 mb-2">
                      {item.title}
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
