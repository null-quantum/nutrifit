"use client";

import { Check } from "lucide-react";
import { motion, type Variants } from "framer-motion";

const CoreFeaturesSection = () => {
  const coreFeatures = [
    {
      id: 1,
      title: "Personalized Nutrition",
      description:
        "Receive AI-powered meal plans tailored to your BMI, goals, activity level and preferences.",
      image: "/assets/features/feature-nutrition.jpg",
      bullets: ["Smart Meal Plans", "Macro Tracking", "Dietary Insights"],
      titleGradient: "from-green-600 to-emerald-400",
      paragraphTint: "text-emerald-50/90",
      checkmarkColor: "text-emerald-400",
    },
    {
      id: 2,
      title: "BMI Analysis",
      description:
        "Accurately estimate body composition and assess potential health risks with our advanced diagnostic tools.",
      image: "/assets/features/feature-bmi.jpg",
      bullets: ["Risk Assessment", "Health Forecasting", "Smart Targets"],
      titleGradient: "from-blue-600 to-sky-400",
      paragraphTint: "text-sky-50/90",
      checkmarkColor: "text-sky-400",
    },
    {
      id: 3,
      title: "Calorie Tracking",
      description:
        "Monitor your daily intake with precision using our comprehensive food and nutrition analytics engine.",
      image: "/assets/features/feature-calorie.jpg",
      bullets: ["Real-Time Logging", "Nutrient Breakdown", "Energy Mapping"],
      titleGradient: "from-purple-600 to-violet-400",
      paragraphTint: "text-violet-50/90",
      checkmarkColor: "text-violet-400",
    },
    {
      id: 4,
      title: "Fitness Planning",
      description:
        "Adaptive workout routines generated in real-time based on your daily fatigue and available equipment.",
      image: "/assets/features/feature-fitness.jpg",
      bullets: ["Equipment-Aware", "Dynamic Scaling", "Form Guidance"],
      titleGradient: "from-orange-600 to-amber-400",
      paragraphTint: "text-amber-50/90",
      checkmarkColor: "text-amber-400",
    },
    {
      id: 5,
      title: "AI Recommendations",
      description:
        "Let our neural engine analyze your biometric data to suggest optimal lifestyle and dietary shifts.",
      image: "/assets/features/feature-ai.jpg",
      bullets: ["Predictive Health", "Behavioral Nudges", "Longevity Focus"],
      titleGradient: "from-yellow-400 to-amber-200",
      paragraphTint: "text-yellow-50/90",
      checkmarkColor: "text-yellow-400",
    },
    {
      id: 6,
      title: "Progress Monitoring",
      description:
        "Visualize your fitness journey through intuitive charts, dynamic dashboards, and deep analytical reports.",
      image: "/assets/features/feature-progress.jpg",
      bullets: ["Trend Analysis", "Milestone Tracking", "Exportable Data"],
      titleGradient: "from-cyan-600 to-teal-400",
      paragraphTint: "text-teal-50/90",
      checkmarkColor: "text-teal-400",
    },
  ];

  // Framer Motion variants for the staggered roll-in effect
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 50, damping: 15 },
    },
  };

  return (
    <section className="py-32 bg-slate-50 flex items-center justify-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="mb-16">
          <h2 className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-2">
            Core Features
          </h2>
          <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900">
            What Our AI Can Analyze
          </h3>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16"
        >
          {coreFeatures.map((feature) => (
            <motion.div
              variants={itemVariants}
              key={feature.id}
              className="group relative w-full h-[400px] rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 cursor-pointer transform-gpu transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-3 hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] will-change-transform"
            >
              <div className="absolute inset-0 z-0">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="w-full h-full object-cover object-center transform-gpu transition-transform duration-700 ease-out group-hover:scale-[1.05] will-change-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120] via-[#0B1120]/40 to-transparent opacity-80" />
              </div>

              <div className="absolute bottom-6 left-6 z-10 transition-opacity duration-300 group-hover:opacity-0 pr-6">
                <h4 className="text-2xl font-bold text-white drop-shadow-lg">
                  {feature.title}
                </h4>
              </div>

              <div className="absolute inset-0 bg-[#0B1120]/90 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 p-8 flex flex-col justify-center will-change-opacity">
                <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500 ease-out will-change-transform">
                  <h4
                    className={`text-2xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r ${feature.titleGradient}`}
                  >
                    {feature.title}
                  </h4>

                  <p
                    className={`text-sm leading-relaxed mb-6 font-medium ${feature.paragraphTint}`}
                  >
                    {feature.description}
                  </p>

                  <div className="space-y-3 mb-8">
                    {feature.bullets.map((bullet, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-3 text-sm font-medium ${feature.paragraphTint}`}
                      >
                        <Check
                          className={`w-4 h-4 ${feature.checkmarkColor}`}
                          strokeWidth={3}
                        />
                        {bullet}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CoreFeaturesSection;
