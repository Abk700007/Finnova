import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { TrendingUp, Twitter, Github, Linkedin } from "lucide-react";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata = {
  title: "Finnova — Intelligent Personal Finance",
  description:
    "The modern finance platform to track, analyze, and grow your wealth with AI-powered insights.",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          <link rel="icon" href="/logo-sm.png" sizes="any" />
        </head>
        <body className={`${inter.className} min-h-screen antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Header />
            <main className="min-h-screen">{children}</main>
            <Toaster richColors theme="dark" position="bottom-right" />

            {/* Premium Footer */}
            <footer className="border-t border-white/[0.05] bg-white/[0.01] backdrop-blur-sm mt-16">
              <div className="container mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                  {/* Brand */}
                  <div>
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center">
                        <TrendingUp className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-base font-bold tracking-tight">
                        Fin<span className="text-violet-400">nova</span>
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                      AI-powered finance management. Track smarter, save faster,
                      grow wealthier.
                    </p>
                  </div>

                  {/* Links */}
                  <div className="flex flex-col sm:flex-row gap-6 sm:gap-12 text-sm text-muted-foreground">
                    <div className="space-y-2.5">
                      <p className="text-xs font-semibold uppercase tracking-widest text-foreground mb-3">
                        Product
                      </p>
                      <a href="#features" className="block hover:text-foreground transition-colors">Features</a>
                      <a href="#how-it-works" className="block hover:text-foreground transition-colors">How It Works</a>
                      <a href="#testimonials" className="block hover:text-foreground transition-colors">Testimonials</a>
                    </div>
                    <div className="space-y-2.5">
                      <p className="text-xs font-semibold uppercase tracking-widest text-foreground mb-3">
                        Legal
                      </p>
                      <a href="#" className="block hover:text-foreground transition-colors">Privacy Policy</a>
                      <a href="#" className="block hover:text-foreground transition-colors">Terms of Service</a>
                    </div>
                  </div>
                </div>

                <div className="border-t border-white/[0.05] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-muted-foreground">
                    © 2025 Finnova. Built with care.
                  </p>
                  <div className="flex items-center gap-3">
                    {[
                      { icon: Twitter, label: "Twitter" },
                      { icon: Github, label: "GitHub" },
                      { icon: Linkedin, label: "LinkedIn" },
                    ].map(({ icon: Icon, label }) => (
                      <a
                        key={label}
                        href="#"
                        aria-label={label}
                        className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/[0.08] hover:border-white/[0.14] transition-all"
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </footer>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
