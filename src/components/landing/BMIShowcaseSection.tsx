"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Target, HeartPulse, Sparkles } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const BMIShowcaseSection = () => {
  const setView = useAuthStore((s) => s.setView);

  const features = [
    { title: "Know Your Risk", icon: ShieldAlert, delay: 0.2 },
    { title: "Set Smart Goals", icon: Target, delay: 0.3 },
    { title: "Prevent Diseases", icon: HeartPulse, delay: 0.4 },
    { title: "Live Your Best Life", icon: Sparkles, delay: 0.5 },
  ];

  return (
    <section className="relative w-full py-24 bg-white overflow-hidden z-10">
      {/* Section Background - Radial Gradient mapped to Tailwind */}
      <div className="absolute top-0 left-0 w-full h-[800px] bg-[radial-gradient(circle_at_top_left,#E0F2FE,transparent_45%)] pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-8 flex flex-col gap-16">
        {/* TOP ROW: Text Content & Illustration */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-20">
          {/* LEFT SIDE: Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full lg:w-5/12 flex flex-col justify-center"
          >
            {/* Main Title with Vertical Gradient */}
            <h1 className="font-montserrat text-6xl md:text-[6rem] font-extrabold leading-[0.9] tracking-tight mb-6 text-transparent bg-clip-text bg-gradient-to-b from-[#7DD3FC] via-[#38BDF8] to-[#1E40AF]">
              BODY MASS INDEX
            </h1>

            <h2 className="text-3xl md:text-4xl font-bold text-[#0F172A] leading-tight mb-6">
              Know Your Number, <br /> Shape Your Health.
            </h2>

            <p className="text-[1.2rem] text-[#475569] leading-[1.9] mb-10 max-w-[500px]">
              BMI is a simple screening tool that helps estimate body fat and
              assess potential health risks. Let AI guide you to your optimal
              range.
            </p>

            <div>
              <button
                type="button"
                onClick={() => setView("auth")}
                className="bg-gradient-to-r from-[#60A5FA] to-[#3B82F6] hover:from-[#3B82F6] hover:to-[#1E40AF] text-white px-8 py-4 rounded-[50px] font-bold text-lg transition-all transform hover:scale-105 shadow-xl shadow-blue-500/20 cursor-pointer"
              >
                Check Today, Live Better Tomorrow
              </button>
            </div>
          </motion.div>

          {/* RIGHT SIDE: Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full lg:w-7/12 relative flex justify-center lg:justify-end"
          >
            {/* Floating Gauge Animation */}
            <motion.img
              src="/assets/backgrounds/BMI.png"
              alt="BMI 3D Illustration"
              className="w-full max-w-[700px] h-auto object-contain drop-shadow-2xl"
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>

        {/* BOTTOM ROW: Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: feature.delay }}
              className="bg-white/70 backdrop-blur-[15px] border border-white p-6 rounded-[20px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] transition-all flex flex-col items-center justify-center text-center group cursor-default"
            >
              <motion.div
                whileHover={{ scale: 1.15, y: -5 }}
                className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-[#38BDF8] group-hover:bg-blue-500 group-hover:text-white transition-colors"
              >
                <feature.icon size={28} />
              </motion.div>
              <h3 className="text-lg font-bold text-slate-800">
                {feature.title}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BMIShowcaseSection;
