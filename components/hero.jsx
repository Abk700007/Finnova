"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Play, ShieldCheck, Zap, BarChart3, TrendingUp, Sparkles } from "lucide-react";

const HeroSection = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 100) {
        imageElement?.classList.add("scrolled");
      } else {
        imageElement?.classList.remove("scrolled");
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="relative pt-36 pb-24 px-4 overflow-hidden mesh-bg">
      {/* Dot grid background */}
      <div className="absolute inset-0 dot-grid opacity-40 -z-10" />

      {/* Ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-600/8 rounded-full blur-[100px] -z-10" />

      <div className="container mx-auto text-center relative z-10">
        {/* App Logo/Name tag */}
        <div className="flex items-center justify-center gap-4 mb-8 animate-fade-in-up">
          <div className="bg-violet-600 rounded-2xl p-3 flex items-center justify-center shadow-[0_0_40px_rgba(124,58,237,0.4)]">
            <TrendingUp className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-blue-300">
            Finnova
          </span>
        </div>

        {/* Main headline */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 animate-fade-in-up" style={{ animationDelay: "0.08s", opacity: 0, animationFillMode: "forwards" }}>
          <span className="text-foreground">Your Money,</span>
          <br />
          <span className="gradient-title">Smarter.</span>
        </h1>

        {/* Supporting copy */}
        <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed font-medium animate-fade-in-up" style={{ animationDelay: "0.16s", opacity: 0, animationFillMode: "forwards" }}>
          Track every dollar, analyze every trend, and grow every account — all from one beautifully designed dashboard.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 animate-fade-in-up" style={{ animationDelay: "0.24s", opacity: 0, animationFillMode: "forwards" }}>
          <Link href="/dashboard">
            <Button
              size="lg"
              className="px-8 py-6 text-base font-semibold bg-violet-600 hover:bg-violet-500 text-white rounded-full shadow-xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-300 hover:-translate-y-0.5 gap-2"
            >
              Start for Free
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="#features">
            <Button
              size="lg"
              variant="ghost"
              className="px-8 py-6 text-base font-medium rounded-full border border-white/10 hover:bg-white/[0.05] hover:border-white/20 text-muted-foreground hover:text-foreground transition-all duration-300 gap-2"
            >
              <Play className="w-4 h-4" />
              See How It Works
            </Button>
          </Link>
        </div>

        {/* Trust badges */}
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground mb-16 animate-fade-in-up" style={{ animationDelay: "0.32s", opacity: 0, animationFillMode: "forwards" }}>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Bank-level encryption</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Real-time sync</span>
          </div>
          <div className="w-px h-3 bg-white/10" />
          <div className="flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
            <span>AI insights</span>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="hero-image-wrapper relative mx-auto max-w-5xl">
          {/* Fade gradient at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#0a0e1e] to-transparent z-20 pointer-events-none" />

          {/* Side glows */}
          <div className="absolute -inset-x-8 top-1/2 -translate-y-1/2 h-40 bg-violet-600/10 blur-[60px] -z-10" />

          {/* Floating mini cards */}
          <div className="absolute -left-8 top-16 z-30 hidden lg:block animate-float">
            <div className="glass-card rounded-2xl p-4 w-44 shadow-2xl border border-white/[0.08]">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="icon-box-success w-8 h-8 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground">Net Worth</span>
              </div>
              <div className="text-xl font-bold text-foreground">₹124,850</div>
              <div className="text-xs text-emerald-400 font-semibold mt-0.5">↑ +12.4% this month</div>
            </div>
          </div>

          <div className="absolute -right-8 top-24 z-30 hidden lg:block animate-float" style={{ animationDelay: "1.5s" }}>
            <div className="glass-card rounded-2xl p-4 w-44 shadow-2xl border border-white/[0.08]">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="icon-box-primary w-8 h-8 rounded-lg bg-violet-500/15">
                  <BarChart3 className="w-4 h-4 text-violet-400" />
                </div>
                <span className="text-xs font-semibold text-muted-foreground">Savings Rate</span>
              </div>
              <div className="text-xl font-bold text-foreground">34.2%</div>
              <div className="text-xs text-violet-400 font-semibold mt-0.5">↑ +5% vs last month</div>
            </div>
          </div>

          <div ref={imageRef} className="hero-image">
            {/* Stylized Dashboard Preview */}
            <div className="rounded-2xl border border-white/[0.08] bg-[#0a0e1e] shadow-[0_40px_120px_rgba(0,0,0,0.8)] overflow-hidden">
              {/* Dashboard top bar */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.02]">
                <div className="w-3 h-3 rounded-full bg-red-500/60" />
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                <div className="flex-1 mx-4 bg-white/[0.04] rounded-md h-5 flex items-center px-3">
                  <span className="text-[10px] text-muted-foreground">app.finnova.io/dashboard</span>
                </div>
              </div>

              {/* Dashboard body mock */}
              <div className="p-6 space-y-5">
                {/* Stat cards row */}
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Total Balance", value: "₹48,294", change: "+8.2%", color: "text-emerald-400" },
                    { label: "Monthly Income", value: "₹6,800", change: "+2.1%", color: "text-emerald-400" },
                    { label: "Expenses", value: "₹4,232", change: "-3.4%", color: "text-rose-400" },
                    { label: "Savings Rate", value: "37.8%", change: "+5%", color: "text-violet-400" },
                  ].map((stat, i) => (
                    <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-3">
                      <p className="text-[10px] text-muted-foreground mb-1.5">{stat.label}</p>
                      <p className="text-base font-bold text-foreground">{stat.value}</p>
                      <p className={`text-[10px] font-semibold mt-0.5 ${stat.color}`}>{stat.change}</p>
                    </div>
                  ))}
                </div>

                {/* Chart area */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 h-32 flex items-end gap-1.5">
                  {[45, 72, 38, 88, 55, 92, 67, 78, 44, 96, 61, 84].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <div className="w-full rounded-t-sm opacity-40" style={{ height: `${h * 0.5}%`, background: "linear-gradient(180deg, #7c3aed, #4f46e5)" }} />
                      <div className="w-full rounded-t-sm" style={{ height: `${(100 - h) * 0.25}%`, background: "linear-gradient(180deg, #10b981, #34d399)" }} />
                    </div>
                  ))}
                </div>

                {/* Transaction list mock */}
                <div className="space-y-2">
                  {[
                    { icon: "🛍️", name: "Shopping", cat: "Retail", amount: "-₹128.50", color: "text-rose-400" },
                    { icon: "💼", name: "Salary Deposit", cat: "Income", amount: "+₹3,400.00", color: "text-emerald-400" },
                    { icon: "🍕", name: "Dining Out", cat: "Food", amount: "-₹45.20", color: "text-rose-400" },
                  ].map((tx, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-3 py-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">{tx.icon}</span>
                        <div>
                          <p className="text-xs font-medium text-foreground">{tx.name}</p>
                          <p className="text-[10px] text-muted-foreground">{tx.cat}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold ${tx.color}`}>{tx.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
