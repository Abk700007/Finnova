import DashboardPage from "./page";
import { BarLoader } from "react-spinners";
import { Suspense } from "react";
import { TrendingUp } from "lucide-react";

export default function Layout() {
  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Page header */}
      <div className="border-b border-white/[0.05] bg-white/[0.01] mb-8">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <p className="section-eyebrow">Overview</p>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Your financial snapshot — updated in real time.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <Suspense
          fallback={
            <div className="space-y-3">
              <BarLoader className="mt-4" width={"100%"} color="#7c3aed" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-28 rounded-2xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
                ))}
              </div>
            </div>
          }
        >
          <DashboardPage />
        </Suspense>
      </div>
    </div>
  );
}
