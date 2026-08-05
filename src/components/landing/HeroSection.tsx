"use client";

import { motion } from "framer-motion";
import { Activity, Shield, Zap, Target, Brain } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  TextReveal,
  MagneticCard,
  Floating,
  EASE,
} from "@/components/shared/animations";

const HeroSection = () => {
  const setView = useAuthStore((s) => s.setView);

  return (
    <section className="relative min-h-screen w-full flex items-center overflow-hidden bg-[#0B1120] pt-20">
      {/* Hero background image — fills the full screen, apple on the left */}
      <motion.img
        src="/assets/hero-apple.png"
        alt="NutriFit AI Health Platform"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: EASE.out }}
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* Floating glow behind the apple — adds depth */}
      <Floating
        distance={20}
        duration={6}
        className="absolute top-[30%] left-[15%] w-72 h-72 bg-[#00FFD1]/8 rounded-full blur-3xl pointer-events-none z-0"
      />

      {/* Gradient overlay — left transparent (shows apple), right dark (for text) */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0B1120]/30 via-[#0B1120]/70 to-[#0B1120] z-[1] pointer-events-none" />

      {/* MAIN CONTENT — right side */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 flex justify-end">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: EASE.out, delay: 0.2 }}
          className="w-full lg:w-[55%] flex flex-col justify-center"
        >
          <h1 className="font-montserrat text-5xl md:text-6xl lg:text-[5rem] font-extrabold leading-[1.05] tracking-tight mb-6 hero-text-glow">
            <TextReveal
              text="Advancing Nutrition,"
              mode="words"
              delay={0.4}
              stagger={0.08}
              className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFD1] via-[#00E5FF] to-[#22C55E]"
            />
            <br />
            <TextReveal
              text="Transforming Lives."
              mode="words"
              delay={0.9}
              stagger={0.08}
              className="text-white"
            />
          </h1>

          <ScrollReveal direction="up" distance={30} delay={1.2} duration={0.8}>
            <p className="text-base md:text-lg text-white/85 leading-[1.8] max-w-[600px] mb-10 font-medium">
              Modern medical science and AI are redefining the future of
              nutrition. Through personalized health insights, advanced
              nutritional analysis, and evidence-based recommendations,
              individuals can optimize energy, strengthen immunity, improve
              fitness performance, and build long-term wellness.
            </p>
          </ScrollReveal>

          <StaggerContainer
            stagger={0.12}
            delayChildren={1.6}
            className="flex flex-wrap gap-4 mb-16"
          >
            <StaggerItem direction="up" distance={24}>
              <button
                type="button"
                onClick={() => setView("auth")}
                className="px-8 py-4 bg-gradient-to-r from-[#14B8A6] to-[#22C55E] hover:from-[#00FFD1] hover:to-[#14B8A6] text-slate-950 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/30 cursor-pointer"
              >
                Get Started
              </button>
            </StaggerItem>

            <StaggerItem direction="up" distance={24}>
              <a
                href="#features"
                className="px-8 py-4 bg-transparent border-2 border-[#00E5FF] hover:bg-[#00E5FF]/10 text-white rounded-full font-bold text-lg transition-all cursor-pointer text-center inline-block"
              >
                Learn More
              </a>
            </StaggerItem>
          </StaggerContainer>

          <StaggerContainer
            stagger={0.1}
            delayChildren={2}
            className="grid grid-cols-5 gap-3 w-full max-w-[600px]"
          >
            {[
              { icon: Brain, label: "AI Core" },
              { icon: Activity, label: "Metrics" },
              { icon: Target, label: "Goals" },
              { icon: Zap, label: "Energy" },
              { icon: Shield, label: "Immunity" },
            ].map((feature, idx) => (
              <StaggerItem key={idx} direction="up" distance={20}>
                <MagneticCard
                  strength={10}
                  lift={6}
                  className="h-full flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <feature.icon className="w-6 h-6 text-[#00FFD1] mb-2" />
                  <span className="text-xs font-bold text-white/80">
                    {feature.label}
                  </span>
                </MagneticCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
