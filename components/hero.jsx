"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const HeroSection = () => {
  const imageRef = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="pt-40 pb-20 px-4 relative">
      <div className="absolute inset-0 -z-10 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
      
      <div className="container mx-auto text-center relative z-10">
        <h1 className="text-5xl md:text-8xl lg:text-[105px] pb-6 gradient-title drop-shadow-sm font-extrabold tracking-tight">
          Manage Your Finances <br /> with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Intelligence</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
          An AI-powered financial management platform that helps you track,
          analyze, and optimize your spending with real-time insights.
        </p>
        <div className="flex justify-center space-x-6">
          <Link href="/dashboard">
            <Button size="lg" className="px-8 py-6 text-lg rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1">
              Get Started Free
            </Button>
          </Link>
          <Link href="https://www.youtube.com/roadsidecoder">
            <Button size="lg" variant="outline" className="px-8 py-6 text-lg rounded-full border-primary/20 hover:bg-primary/5 hover:border-primary/50 transition-all">
              Watch Demo
            </Button>
          </Link>
        </div>
        
        <div className="hero-image-wrapper mt-16 md:mt-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10 bottom-0 top-1/2 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 bg-primary/20 blur-[100px] -z-10 rounded-full" />
          
          <div ref={imageRef} className="hero-image relative z-0">
            <Image
              src="/banner.jpeg"
              width={1280}
              height={720}
              alt="Dashboard Preview"
              className="rounded-2xl shadow-2xl border border-white/10 mx-auto w-full max-w-[1280px]"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
