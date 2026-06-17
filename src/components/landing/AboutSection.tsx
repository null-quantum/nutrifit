"use client";

import { Target, Zap, Shield } from "lucide-react";
import { motion, type Variants } from "framer-motion";

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

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="py-24 lg:py-32 bg-rose-50/50 relative overflow-hidden z-10">
      {/* Stronger, warmer Crimson/Magenta Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-rose-300/40 blur-[140px]" />
        <div className="absolute bottom-[0%] -right-[10%] w-[50%] h-[50%] rounded-full bg-red-200/40 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* LEFT: The Manifesto */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h2 className="text-rose-600 font-bold tracking-wider uppercase text-sm mb-4">
              Our Methodology
            </h2>

            {/* 3-Color Blend (Slate -> Dark Rose -> Crimson) */}
            <h3 className="text-4xl md:text-5xl font-extrabold mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-rose-900 to-red-700">
              We decode the human body.
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
          </motion.div>

          {/* RIGHT: Core Values Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-8"
          >
            {values.map((item, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl shadow-rose-900/5 border border-rose-100 flex gap-6 hover:shadow-2xl hover:shadow-rose-900/15 hover:-translate-y-1 transition-all duration-300"
              >
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
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
