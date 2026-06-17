"use client";

import { Check, Sparkles } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";

const PricingSection = () => {
  const setView = useAuthStore((s) => s.setView);

  const pricingPlans = [
    {
      name: "Free",
      price: "0",
      description: "Essential tracking for fitness beginners.",
      features: [
        "Manual calorie logging",
        "Basic BMI calculator",
        "Standard workout templates",
        "Community forum access",
      ],
      isPopular: false,
      buttonText: "Get Started Free",
      buttonStyle:
        "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700",
    },
    {
      name: "Plus",
      price: "19",
      description: "AI-powered insights for serious progress.",
      features: [
        "Everything in Free",
        "AI personalized meal blueprints",
        "Dynamic workout adjustments",
        "Macro & micronutrient tracking",
        "Priority email support",
      ],
      isPopular: true,
      buttonText: "Start 14-Day Trial",
      buttonStyle:
        "bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-bold shadow-[0_0_20px_rgba(16,185,129,0.3)]",
    },
    {
      name: "Premium",
      price: "49",
      description: "Complete biometric analysis & coaching.",
      features: [
        "Everything in Plus",
        "Wearable device integration",
        "Cellular recovery & sleep analysis",
        "1-on-1 AI nutritionist chat",
        "Predictive health forecasting",
      ],
      isPopular: false,
      buttonText: "Upgrade to Premium",
      buttonStyle:
        "bg-slate-800 text-white hover:bg-slate-700 border border-slate-700",
    },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="py-24 lg:py-32 bg-[#0B1120] relative overflow-hidden">
      {/* Background Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <h2 className="text-emerald-400 font-bold tracking-wider uppercase text-sm mb-4">
            Pricing Plans
          </h2>
          <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
            Invest in Your Health.
          </h3>
          <p className="text-slate-400 text-lg">
            Choose the perfect plan for your fitness journey. Upgrade,
            downgrade, or cancel at any time.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center"
        >
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              className={`relative rounded-3xl p-8 lg:p-10 transition-all duration-300 ${
                plan.isPopular
                  ? "bg-slate-900 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10 lg:-translate-y-4"
                  : "bg-slate-900/50 border border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* 'Most Popular' Badge */}
              {plan.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full text-xs font-bold text-slate-950 uppercase tracking-wide flex items-center gap-1 shadow-lg shadow-emerald-500/30">
                  <Sparkles className="w-3 h-3" />
                  Most Popular
                </div>
              )}

              {/* Plan Name & Price */}
              <div className="mb-8">
                <h4 className="text-xl font-bold text-white mb-2">
                  {plan.name}
                </h4>
                <p className="text-slate-400 text-sm mb-6 h-10">
                  {plan.description}
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">$</span>
                  <span className="text-5xl font-extrabold text-white tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-slate-400 font-medium ml-1">/mo</span>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setView("auth")}
                className={`w-full py-4 rounded-xl transition-all duration-200 mb-8 cursor-pointer ${plan.buttonStyle}`}
              >
                {plan.buttonText}
              </button>

              {/* Feature List */}
              <div className="space-y-4">
                <p className="text-sm font-semibold text-white mb-4">
                  What&apos;s included:
                </p>
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check
                      className={`w-5 h-5 shrink-0 ${plan.isPopular ? "text-emerald-400" : "text-slate-500"}`}
                      strokeWidth={2.5}
                    />
                    <span className="text-slate-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
