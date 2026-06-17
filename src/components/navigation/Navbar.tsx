"use client";

import { useState, useEffect } from "react";
import { Menu, X, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { isAuthenticated, logout, setView } = useAuthStore();

  // Adds a sleek shadow and glass blur when the user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Features", href: "#features" },
    { name: "BMI Analysis", href: "#bmi" },
    { name: "Pricing", href: "#pricing" },
    { name: "About Us", href: "#about" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isScrolled
          ? "bg-slate-900/80 backdrop-blur-md border-white/10 shadow-lg"
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* LOGO */}
          <div
            className="flex-shrink-0 cursor-pointer"
            onClick={() => {
              setView("landing");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <span className="text-2xl font-extrabold text-white tracking-tight">
              NutriFit<span className="text-rose-500">.</span>
            </span>
          </div>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>

          {/* DYNAMIC DESKTOP CTA BUTTONS */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-6">
              <button
                type="button"
                onClick={() => {
                  void logout();
                }}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Sign Out
              </button>
              <button
                type="button"
                onClick={() => setView("dashboard")}
                className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all shadow-[0_0_15px_rgba(225,29,72,0.3)] flex items-center gap-2 group cursor-pointer"
              >
                Dashboard
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-6">
              <button
                type="button"
                onClick={() => setView("auth")}
                className="text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setView("auth")}
                className="px-5 py-2.5 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 transition-all shadow-[0_0_15px_rgba(225,29,72,0.3)] flex items-center gap-2 group cursor-pointer"
              >
                Get Started
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-300 hover:text-white focus:outline-none cursor-pointer"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      <div
        className={`md:hidden absolute top-20 left-0 w-full bg-slate-900 border-b border-white/10 transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen
            ? "max-h-96 opacity-100 py-4"
            : "max-h-0 opacity-0 py-0"
        }`}
      >
        <div className="flex flex-col px-6 space-y-4">
          {navLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-medium text-slate-300 hover:text-rose-400 transition-colors"
            >
              {link.name}
            </a>
          ))}

          {/* DYNAMIC MOBILE MENU CTA BUTTONS */}
          <div className="pt-4 border-t border-white/10 flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setView("dashboard");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-5 py-3 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Dashboard <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-5 py-3 rounded-lg text-sm font-bold text-slate-300 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setView("auth");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-5 py-3 rounded-lg text-sm font-bold text-slate-300 bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center cursor-pointer"
                >
                  Log In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setView("auth");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full px-5 py-3 rounded-lg text-sm font-bold text-white bg-gradient-to-r from-red-600 to-rose-600 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
