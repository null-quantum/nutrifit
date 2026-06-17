"use client";

import { Github, Linkedin, Mail, ArrowUp, Check } from "lucide-react";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#05070D] border-t border-white/5 pt-20 pb-10 overflow-hidden mt-auto">
      {/* Textured Park Background */}
      <div
        className="absolute inset-0 z-0 opacity-10 mix-blend-luminosity grayscale"
        style={{
          backgroundImage: `url("/assets/backgrounds/park.png")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      {/* Dark gradient overlay to ensure text readability */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-[#05070D] via-[#05070D]/95 to-[#05070D]/80" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        {/* TOP ROW: Trust Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20 pb-12 border-b border-white/10">
          {[
            { value: "10K+", label: "Health Analyses" },
            { value: "95%", label: "Recommendation Accuracy" },
            { value: "24/7", label: "AI Assistance" },
            { value: "100+", label: "Nutrition Insights" },
          ].map((metric, i) => (
            <div key={i} className="text-center md:text-left">
              <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-red-500 mb-1">
                {metric.value}
              </p>
              <p className="text-sm font-medium text-slate-400">
                {metric.label}
              </p>
            </div>
          ))}
        </div>

        {/* MIDDLE ROW: Main Content Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Column 1: Brand & Feature Badges */}
          <div>
            <h4 className="text-2xl font-bold text-white mb-6">
              NutriFit<span className="text-rose-500">.</span>
            </h4>
            <div className="space-y-3">
              {[
                "AI Nutrition",
                "BMI Analysis",
                "Fitness Planning",
                "Progress Tracking",
              ].map((badge, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-sm text-slate-400"
                >
                  <Check className="w-4 h-4 text-rose-500" />
                  {badge}
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div>
            <h5 className="text-white font-bold mb-6 tracking-wide">
              Platform
            </h5>
            <ul className="space-y-4">
              {[
                { name: "Features", href: "#features" },
                { name: "How It Works", href: "#features" },
                { name: "Pricing", href: "#pricing" },
                { name: "About Us", href: "#about" },
                { name: "Contact", href: "#contact" },
              ].map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    className="text-sm text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Social/Portfolio */}
          <div>
            <h5 className="text-white font-bold mb-6 tracking-wide">Connect</h5>
            <div className="flex flex-col space-y-4">
              <a
                href="#"
                className="flex items-center gap-3 text-sm text-slate-400 hover:text-white group transition-colors"
              >
                <Github className="w-5 h-5 group-hover:text-fuchsia-500 transition-colors" />{" "}
                GitHub
              </a>
              <a
                href="#"
                className="flex items-center gap-3 text-sm text-slate-400 hover:text-white group transition-colors"
              >
                <Linkedin className="w-5 h-5 group-hover:text-rose-500 transition-colors" />{" "}
                LinkedIn
              </a>
              <a
                href="#"
                className="flex items-center gap-3 text-sm text-slate-400 hover:text-white group transition-colors"
              >
                <Mail className="w-5 h-5 group-hover:text-red-500 transition-colors" />{" "}
                Portfolio
              </a>
            </div>
          </div>

          {/* Column 4: Glassmorphism Newsletter */}
          <div>
            <h5 className="text-white font-bold mb-6 tracking-wide">
              Weekly Health Insights
            </h5>
            <p className="text-sm text-slate-400 mb-4 leading-relaxed">
              Receive personalized nutrition tips, fitness guidance and wellness
              updates.
            </p>
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl blur opacity-30 group-focus-within:opacity-60 transition duration-500"></div>
              <div className="relative flex bg-[#05070D] rounded-xl border border-white/10 overflow-hidden">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full bg-transparent text-sm text-white px-4 py-3 focus:outline-none placeholder:text-slate-600"
                />
                <button
                  type="button"
                  className="px-4 text-sm font-bold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  Join
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: Copyright & Tech Stack */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-slate-500 text-sm mb-1">
              © 2026 NutriFit. All Rights Reserved.
            </p>
            {/* Tailored for a portfolio project */}
            <p className="text-slate-600 text-xs font-mono">
              Built with React • Node • MongoDB • Gemini AI
            </p>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-300 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-slate-300 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-slate-300 transition-colors">
              Cookies
            </a>
          </div>

          {/* Animated Back to Top */}
          <button
            type="button"
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_rgba(225,29,72,0.5)] group hover:-translate-y-1 cursor-pointer"
          >
            <ArrowUp className="w-5 h-5 group-hover:animate-bounce" />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
