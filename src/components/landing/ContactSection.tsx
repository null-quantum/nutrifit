"use client";

import { Send, Mail, MapPin, ArrowRight } from "lucide-react";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  TextReveal,
  Floating,
  GradientText,
  EASE,
} from "@/components/shared/animations";

const ContactSection = () => {
  return (
    <section className="py-24 lg:py-32 bg-[#05070D] relative overflow-hidden">
      {/* Intense Crimson/Magenta Digital Lighting */}
      <Floating
        distance={30}
        duration={12}
        className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-rose-600/20 blur-[150px] rounded-full pointer-events-none"
      />
      <Floating
        distance={24}
        duration={10}
        delay={1}
        className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-fuchsia-600/15 blur-[150px] rounded-full pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* LEFT: Immersive Typography */}
          <ScrollReveal direction="left" distance={50} duration={0.8}>
            <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 leading-tight tracking-tight">
              <TextReveal
                text="Let's build your"
                mode="words"
                delay={0.1}
                stagger={0.07}
              />
              <br />
              <GradientText
                colors={["#f43f5e", "#ec4899", "#d946ef", "#f43f5e"]}
                duration={6}
              >
                <TextReveal text="blueprint." mode="block" delay={0.5} />
              </GradientText>
            </h2>
            <p className="text-slate-400 text-lg leading-relaxed mb-12 max-w-lg">
              Whether you are ready to integrate our API, need custom enterprise
              pricing, or have a question about our biometrics engine, we are
              here to help.
            </p>

            <StaggerContainer
              stagger={0.15}
              delayChildren={0.2}
              className="space-y-8"
            >
              <StaggerItem direction="up" distance={24}>
                <div className="flex items-center gap-6 group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-rose-500 group-hover:bg-rose-500/10 group-hover:border-rose-500/30 transition-all duration-300">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      Direct Outreach
                    </p>
                    <p className="font-semibold text-white text-lg">
                      support@nutrifit-ai.com
                    </p>
                  </div>
                </div>
              </StaggerItem>

              <StaggerItem direction="up" distance={24}>
                <div className="flex items-center gap-6 group cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-fuchsia-500 group-hover:bg-fuchsia-500/10 group-hover:border-fuchsia-500/30 transition-all duration-300">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">
                      Global Headquarters
                    </p>
                    <p className="font-semibold text-white text-lg">
                      San Francisco, CA
                    </p>
                  </div>
                </div>
              </StaggerItem>
            </StaggerContainer>
          </ScrollReveal>

          {/* RIGHT: Modern Glassmorphism Form */}
          <ScrollReveal direction="right" distance={50} duration={0.8} delay={0.2}>
            <div className="relative">
              {/* Glass panel */}
              <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl shadow-rose-900/20" />

              <form className="relative p-8 lg:p-12 space-y-6">
                <h3 className="text-2xl font-bold text-white mb-8">
                  <TextReveal text="Send a Message" mode="block" delay={0.3} />
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      First Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500 focus:bg-white/10 transition-all"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Last Name
                    </label>
                    <input
                      type="text"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500 focus:bg-white/10 transition-all"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500 focus:bg-white/10 transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500 focus:bg-white/10 transition-all resize-none"
                    placeholder="How can we help you?"
                  />
                </div>

                <button
                  type="button"
                  className="w-full mt-4 py-4 rounded-xl font-bold text-white shadow-[0_0_40px_rgba(225,29,72,0.4)] bg-gradient-to-r from-red-600 via-rose-500 to-fuchsia-600 hover:from-red-500 hover:via-rose-400 hover:to-fuchsia-500 transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer"
                >
                  Send Secure Message
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
