"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Target, HeartPulse, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  TextReveal,
  ParallaxLayer,
  MagneticCard,
  Floating,
  GradientText,
  EASE,
} from "@/components/shared/animations";

const BMIShowcaseSection = () => {
  const setView = useAuthStore((s) => s.setView);

  const features = [
    { title: "Know Your Risk", icon: ShieldAlert },
    { title: "Set Smart Goals", icon: Target },
    { title: "Prevent Diseases", icon: HeartPulse },
    { title: "Live Your Best Life", icon: Sparkles },
  ];

  return (
    <section className="relative w-full py-24 bg-white overflow-hidden z-10">
      {/* Section Background - Radial Gradient mapped to Tailwind */}
      <div className="absolute top-0 left-0 w-full h-[800px] bg-[radial-gradient(circle_at_top_left,#E0F2FE,transparent_45%)] pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8 flex flex-col gap-16">
        {/* TOP ROW: Text Content & Illustration */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          {/* LEFT SIDE: Content */}
          <ScrollReveal
            direction="left"
            distance={60}
            duration={0.9}
            className="w-full lg:w-5/12 flex flex-col justify-center"
          >
            {/* Main Title with Vertical Gradient */}
            <h1 className="font-montserrat text-6xl md:text-[6rem] font-extrabold leading-[0.9] tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-b from-[#7DD3FC] via-[#38BDF8] to-[#1E40AF]">
              <TextReveal
                text="BODY MASS INDEX"
                mode="block"
                delay={0.1}
              />
            </h1>

            <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] leading-tight mb-6">
              <TextReveal
                text="Know Your Number, Shape Your Health."
                mode="words"
                delay={0.3}
                stagger={0.05}
              />
            </h2>

            <ScrollReveal direction="up" distance={24} delay={0.5}>
              <p className="text-[1.2rem] text-[#475569] leading-[1.9] mb-10 max-w-[500px]">
                BMI is a simple screening tool that helps estimate body fat and
                assess potential health risks. Let AI guide you to your optimal
                range.
              </p>
            </ScrollReveal>

            <ScrollReveal direction="up" distance={24} delay={0.65}>
              <div>
                <button
                  type="button"
                  onClick={() => setView("auth")}
                  className="bg-gradient-to-r from-[#60A5FA] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#1E40AF] text-white px-8 py-4 rounded-[50px] font-bold text-lg transition-all transform hover:scale-105 shadow-xl shadow-blue-500/20 cursor-pointer"
                >
                  Check Today, Live Better Tomorrow
                </button>
              </div>
            </ScrollReveal>
          </ScrollReveal>

          {/* RIGHT SIDE: Illustration */}
          <ScrollReveal
            direction="right"
            distance={60}
            duration={0.9}
            delay={0.2}
            className="w-full lg:w-7/12 relative flex justify-center lg:justify-end"
          >
            {/* Floating Gauge Animation with Scroll Parallax */}
            <ParallaxLayer speed={0.25} className="w-full flex justify-center lg:justify-end">
              <Floating distance={20} duration={5}>
                <motion.img
                  src="/assets/backgrounds/BMI.png"
                  alt="BMI 3D Illustration"
                  className="w-full max-w-[700px] h-auto object-contain drop-shadow-2xl"
                  initial={{ opacity: 0, scale: 0.92 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.9, ease: EASE.out }}
                />
              </Floating>
            </ParallaxLayer>
          </ScrollReveal>
        </div>

        {/* BOTTOM ROW: Feature Cards */}
        <StaggerContainer
          stagger={0.12}
          delayChildren={0.1}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full"
        >
          {features.map((feature, idx) => (
            <StaggerItem key={idx} direction="up" distance={36}>
              <MagneticCard
                strength={8}
                lift={8}
                className="h-full bg-white/70 backdrop-blur-[15px] border border-white p-6 rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] transition-shadow flex flex-col items-center justify-center text-center group cursor-default"
              >
                <motion.div
                  whileHover={{ scale: 1.15, y: -5 }}
                  transition={{ duration: 0.3, ease: EASE.out }}
                  className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-[#38BDF8] group-hover:bg-blue-500 group-hover:text-white transition-colors"
                >
                  <feature.icon size={28} />
                </motion.div>
                <h3 className="text-lg font-bold text-slate-800">
                  {feature.title}
                </h3>
              </MagneticCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
};

export default BMIShowcaseSection;
