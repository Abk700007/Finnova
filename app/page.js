import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import {
  featuresData,
  howItWorksData,
  statsData,
  testimonialsData,
} from "@/data/landing";
import HeroSection from "@/components/hero";
import Link from "next/link";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background to-background -z-10" />

      {/* Hero Section */}
      <HeroSection />

      {/* Stats Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {statsData.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400 mb-2 drop-shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-all group-hover:scale-110">
                  {stat.value}
                </div>
                <div className="text-muted-foreground font-medium uppercase tracking-wider text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 tracking-tight">
            Everything you need for <span className="gradient-title">financial freedom</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature, index) => (
              <Card className="glass-card hover:neon-border transition-all duration-300 transform hover:-translate-y-2 p-6 overflow-hidden relative group" key={index}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="space-y-4 pt-4 relative z-10">
                  <div className="text-primary p-3 bg-primary/10 rounded-xl inline-block mb-2">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold tracking-tight">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative z-10 bg-black/20 backdrop-blur-sm border-y border-white/5">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 tracking-tight">
            How <span className="gradient-title">It Works</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {howItWorksData.map((step, index) => (
              <div key={index} className="text-center relative group">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-8 neon-border transition-all group-hover:scale-110 group-hover:rotate-3 shadow-xl">
                  {React.cloneElement(step.icon, { className: 'w-10 h-10 text-primary' })}
                </div>
                <h3 className="text-2xl font-bold mb-4 tracking-tight">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 tracking-tight">
            Trusted by <span className="text-primary font-serif italic">thousands</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonialsData.map((testimonial, index) => (
              <Card key={index} className="glass-card p-8 group hover:-translate-y-1 transition-all duration-300">
                <CardContent className="pt-4 p-0">
                  <div className="flex items-center mb-6">
                    <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-primary/30 p-0.5">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="rounded-full object-cover"
                      />
                    </div>
                    <div className="ml-4 text-left">
                      <div className="font-bold text-lg">{testimonial.name}</div>
                      <div className="text-sm font-medium text-primary/80">
                        {testimonial.role}
                      </div>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-lg leading-relaxed italic">"{testimonial.quote}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 gradient animate-gradient opacity-90" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 drop-shadow-lg tracking-tight">
            Elevate Your Wealth Management
          </h2>
          <p className="text-white/90 text-xl font-medium mb-10 max-w-2xl mx-auto drop-shadow">
            Join the modern era of finance. Precision tracking, intelligent insights, and unparalleled control.
          </p>
          <Link href="/dashboard">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-100 hover:scale-105 transition-all shadow-2xl text-lg px-8 py-6 rounded-full font-bold"
            >
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
