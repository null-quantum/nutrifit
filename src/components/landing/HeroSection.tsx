"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Shield, Zap, Target, Brain } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const HeroSection = () => {
  const setView = useAuthStore((s) => s.setView);
  // Setup state to track mouse position for parallax
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Calculate distance from center of screen, multiply by 0.02 for a subtle parallax effect
    const x = (e.clientX - window.innerWidth / 2) * 0.02;
    const y = (e.clientY - window.innerHeight / 2) * 0.02;
    setMousePos({ x, y });
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative min-h-screen w-full flex items-center overflow-hidden bg-[#0B1120] pt-20"
    >
      {/* Parallax Wrapper - Moves smoothly opposite to the mouse */}
      <motion.div
        className="absolute inset-0 z-0 pointer-events-none"
        animate={{ x: mousePos.x, y: mousePos.y }}
        transition={{ type: "spring", stiffness: 50, damping: 20 }}
      >
        {/* The Apple Image - Floating + Glowing */}
        <motion.img
          src="/assets/backgrounds/Green-Apple.png"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            y: [0, -15, 0],
            filter: [
              "drop-shadow(0 0 10px rgba(0, 255, 209, 0.1))",
              "drop-shadow(0 0 40px rgba(0, 255, 209, 0.4))",
              "drop-shadow(0 0 10px rgba(0, 255, 209, 0.1))",
            ],
          }}
          transition={{
            opacity: { duration: 1.5 },
            y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            filter: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
          className="absolute inset-0 w-full h-full object-cover object-left lg:object-[20%_center]"
          alt="NutriFit Green Apple"
        />
      </motion.div>

      {/* Ambient Orbiting Particles placed behind the text for depth */}
      <motion.div
        className="absolute top-[20%] right-[30%] w-64 h-64 bg-[#00FFD1]/5 rounded-full blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0B1120]/60 to-[#0B1120]/95 z-0 pointer-events-none" />

      {/* MAIN CONTENT CONTAINER */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-8 flex justify-end">
        {/* Text Reveal */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="w-full lg:w-[55%] flex flex-col justify-center"
        >
          <h1 className="font-montserrat text-6xl md:text-[5rem] font-extrabold leading-[1.05] tracking-tight mb-6 hero-text-glow">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFD1] via-[#00E5FF] to-[#22C55E]">
              Advancing Nutrition,
            </span>
            <br />
            <span className="text-white">Transforming Lives.</span>
          </h1>

          <p className="text-[1.2rem] text-white/85 leading-[1.8] max-w-[650px] mb-10 font-medium">
            Modern medical science and AI are redefining the future of
            nutrition. Through personalized health insights, advanced
            nutritional analysis, and evidence-based recommendations,
            individuals can optimize energy, strengthen immunity, improve
            fitness performance, and build long-term wellness.
          </p>

          <div className="flex flex-wrap gap-4 mb-16">
            <button
              type="button"
              onClick={() => setView("auth")}
              className="px-8 py-4 bg-gradient-to-r from-[#14B8A6] to-[#22C55E] hover:from-[#00FFD1] hover:to-[#14B8A6] text-slate-950 rounded-full font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-emerald-500/30 cursor-pointer"
            >
              Get Started
            </button>

            <a
              href="#features"
              className="px-8 py-4 bg-transparent border-2 border-[#00E5FF] hover:bg-[#00E5FF]/10 text-white rounded-full font-bold text-lg transition-all cursor-pointer text-center"
            >
              Learn More
            </a>
          </div>

          <div className="grid grid-cols-5 gap-3 w-full max-w-[650px]">
            {[
              { icon: Brain, label: "AI Core" },
              { icon: Activity, label: "Metrics" },
              { icon: Target, label: "Goals" },
              { icon: Zap, label: "Energy" },
              { icon: Shield, label: "Immunity" },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + idx * 0.1 }}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-colors"
              >
                <feature.icon className="w-6 h-6 text-[#00FFD1] mb-2" />
                <span className="text-xs font-bold text-white/80">
                  {feature.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
