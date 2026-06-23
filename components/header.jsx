import React from "react";
import { Button } from "./ui/button";
import { PenBox, LayoutDashboard, TrendingUp, Brain, Calculator } from "lucide-react";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { checkUser } from "@/lib/checkUser";

const Header = async () => {
  await checkUser();

  return (
    <header className="fixed top-0 w-full z-50 border-b border-white/[0.05]"
      style={{ background: "rgba(10, 14, 30, 0.85)", backdropFilter: "blur(20px)" }}>
      <nav className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-all duration-300">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">
            Fin<span className="text-violet-400">nova</span>
          </span>
        </Link>

        {/* Navigation Links - Different for signed in/out users */}
        <div className="hidden md:flex items-center gap-8">
          <SignedOut>
            <a href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium">
              Features
            </a>
            <a href="#testimonials"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium">
              Testimonials
            </a>
            <a href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium">
              How It Works
            </a>
          </SignedOut>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <SignedIn>
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-white/[0.06] gap-2 text-sm font-medium transition-all"
              >
                <LayoutDashboard size={16} />
                <span className="hidden md:inline">Dashboard</span>
              </Button>
            </Link>
            <Link href="/copilot">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-white/[0.06] gap-2 text-sm font-medium transition-all"
              >
                <Brain size={16} />
                <span className="hidden md:inline">AI Copilot</span>
              </Button>
            </Link>
            <Link href="/simulator">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-white/[0.06] gap-2 text-sm font-medium transition-all"
              >
                <Calculator size={16} />
                <span className="hidden md:inline">Simulator</span>
              </Button>
            </Link>
            <Link href="/transaction/create">
              <Button
                size="sm"
                className="gap-2 bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-200 font-semibold text-sm px-4"
              >
                <PenBox size={15} />
                <span className="hidden md:inline">Add Transaction</span>
              </Button>
            </Link>
          </SignedIn>
          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground hover:bg-white/[0.06] font-medium text-sm"
              >
                Sign In
              </Button>
            </SignInButton>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button
                size="sm"
                className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm px-5 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-200"
              >
                Get Started
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox:
                    "w-8 h-8 border border-white/10 hover:border-violet-500/40 transition-colors ring-2 ring-transparent hover:ring-violet-500/20",
                },
              }}
            />
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
