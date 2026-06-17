"use client";

import { ArrowDown } from "lucide-react";

const AlternatingFeaturesSection = () => {
  return (
    <section className="bg-slate-50 border-t border-slate-200/60 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side: The 4 Steps */}
          <div className="space-y-8 relative z-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                How NutriFit Works
              </h2>
              <p className="mt-4 text-base md:text-lg text-slate-600 font-medium max-w-md">
                From raw biometric data to a fully actionable daily plan in
                seconds.
              </p>
            </div>

            <div className="space-y-4 max-w-sm">
              {/* Step 1 */}
              <div className="flex items-center gap-5 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-cyan-200">
                <div className="w-12 h-12 shrink-0 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center font-black text-lg">
                  1
                </div>
                <p className="font-bold text-slate-800">Input Biometrics</p>
              </div>

              <ArrowDown className="w-6 h-6 text-slate-300 mx-auto" />

              {/* Step 2 */}
              <div className="flex items-center gap-5 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-teal-200">
                <div className="w-12 h-12 shrink-0 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-black text-lg">
                  2
                </div>
                <p className="font-bold text-slate-800">AI Analysis</p>
              </div>

              <ArrowDown className="w-6 h-6 text-slate-300 mx-auto" />

              {/* Step 3 */}
              <div className="flex items-center gap-5 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:border-emerald-200">
                <div className="w-12 h-12 shrink-0 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-black text-lg">
                  3
                </div>
                <p className="font-bold text-slate-800">Nutrition Profile</p>
              </div>

              <ArrowDown className="w-6 h-6 text-slate-300 mx-auto" />

              {/* Step 4 */}
              <div className="flex items-center gap-5 bg-gradient-to-r from-cyan-500 to-teal-400 p-4 rounded-2xl shadow-lg shadow-cyan-500/20 transform hover:-translate-y-1 transition-all">
                <div className="w-12 h-12 shrink-0 rounded-full bg-white text-cyan-600 flex items-center justify-center font-black text-lg shadow-sm">
                  4
                </div>
                <p className="font-bold text-white text-lg tracking-wide">
                  Personalized Plan
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: The Vitamin Image */}
          <div className="relative flex justify-center items-center">
            {/* Decorative background shape */}
            <div className="absolute w-[85%] h-[85%] bg-cyan-100/50 rounded-full blur-3xl z-0"></div>

            <img
              src="/assets/vitamin-capsule.png"
              alt="Vitamins and Nutrition"
              className="relative z-10 w-full max-w-[500px] h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AlternatingFeaturesSection;
