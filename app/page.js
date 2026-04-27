import React from "react";
import { Button } from "@/components/ui/button";
import {
  featuresData,
  howItWorksData,
  statsData,
  testimonialsData,
} from "@/data/landing";
import HeroSection from "@/components/hero";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star, CheckCircle2 } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Global ambient background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] h-[60vh] bg-gradient-to-b from-violet-950/40 via-indigo-950/20 to-transparent" />
      </div>

      {/* Hero Section */}
      <HeroSection />

      {/* ═══ STATS SECTION ═══ */}
      <section className="py-16 border-y border-white/[0.05] relative z-10">
        <div className="absolute inset-0 bg-white/[0.01]" />
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-white/[0.08]">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center px-6 group">
                <div className="text-4xl md:text-5xl font-extrabold gradient-title mb-1.5 transition-transform duration-300 group-hover:scale-105">
                  {stat.value}
                </div>
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES SECTION ═══ */}
      <section id="features" className="py-28 relative z-10">
        <div className="container mx-auto px-6">
          {/* Section header */}
          <div className="text-center mb-16">
            <p className="section-eyebrow mb-4">Platform Features</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Everything you need to{" "}
              <span className="gradient-title">own your finances</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
              Powerful tools designed for modern financial management — from
              solo savers to ambitious investors.
            </p>
          </div>

          {/* Feature cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {featuresData.map((feature, index) => (
              <div
                key={index}
                className="glass-card-hover rounded-2xl p-6 card-lift group relative overflow-hidden"
              >
                {/* Hover shimmer */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-blue-500/5" />
                </div>

                <div className="relative z-10">
                  <div className="icon-box-primary mb-4 w-11 h-11 rounded-xl">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold tracking-tight mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section
        id="how-it-works"
        className="py-28 relative z-10 border-y border-white/[0.05]"
      >
        <div className="absolute inset-0 bg-white/[0.01]" />
        <div className="container mx-auto px-6 relative">
          <div className="text-center mb-16">
            <p className="section-eyebrow mb-4">Simple Process</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Up and running in{" "}
              <span className="gradient-title">3 steps</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
            {howItWorksData.map((step, index) => (
              <div
                key={index}
                className="text-center relative group"
              >
                {/* Connector line */}
                {index < howItWorksData.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-violet-500/30 to-transparent -z-10 translate-x-4" />
                )}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-900/60 to-indigo-900/60 border border-violet-500/20 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-violet-500/10 group-hover:shadow-violet-500/25 group-hover:border-violet-500/40 transition-all duration-300 group-hover:-translate-y-1">
                  <span className="text-violet-400 [&>svg]:w-7 [&>svg]:h-7">
                    {step.icon}
                  </span>
                </div>
                <div className="text-xs font-bold text-violet-400 uppercase tracking-widest mb-2">
                  Step {index + 1}
                </div>
                <h3 className="text-lg font-bold mb-2">{step.title.replace(/^\d+\.\s/, "")}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section id="testimonials" className="py-28 relative z-10">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <p className="section-eyebrow mb-4">What Users Say</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Loved by <span className="gradient-title">thousands</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {testimonialsData.map((testimonial, index) => (
              <div
                key={index}
                className="glass-card-hover rounded-2xl p-6 card-lift flex flex-col gap-5"
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-2 border-t border-white/[0.06]">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-violet-500/20">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="text-sm font-bold">{testimonial.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="py-28 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/60 via-indigo-950/40 to-background" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-violet-600/10 rounded-full blur-[100px]" />
        <div className="dot-grid absolute inset-0 opacity-20" />

        <div className="container mx-auto px-6 text-center relative z-10">
          <p className="section-eyebrow mb-5">Ready to start?</p>
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Take control of your
            <br />
            <span className="gradient-title">financial future</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto leading-relaxed">
            Join over 50,000 users who trust Finnova to manage, track, and
            grow their wealth.
          </p>

          {/* Trust checklist */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 text-sm text-muted-foreground">
            {["Free to start", "No credit card required", "Cancel anytime"].map(
              (item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{item}</span>
                </div>
              )
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="px-10 py-6 text-base font-bold bg-violet-600 hover:bg-violet-500 text-white rounded-full shadow-2xl shadow-violet-500/30 hover:shadow-violet-500/50 transition-all duration-300 hover:-translate-y-0.5 gap-2"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
