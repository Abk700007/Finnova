"use client";

import React, { useState, useEffect, startTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Sparkles, RefreshCw, AlertCircle, Play, ArrowRight, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { getSimulatorData, runSimulation } from "@/actions/simulator";

export default function SimulatorPage() {
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  
  // Baseline data from database
  const [baseline, setBaseline] = useState(null);

  // User input states
  const [reductions, setReductions] = useState({});
  const [cancelledIds, setCancelledIds] = useState([]);
  const [savingsTarget, setSavingsTarget] = useState("");

  // Simulation results
  const [results, setResults] = useState(null);

  const loadData = async () => {
    try {
      const res = await getSimulatorData();
      if (res.success) {
        setBaseline(res.data);
        // Initialize reductions dictionary
        const initialReductions = {};
        Object.keys(res.data.categorySpending).forEach((cat) => {
          initialReductions[cat] = 0;
        });
        setReductions(initialReductions);
      } else {
        toast.error(res.error || "Failed to load simulator data");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred loading dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSliderChange = (cat, val) => {
    setReductions((prev) => ({
      ...prev,
      [cat]: parseInt(val) || 0,
    }));
  };

  const handleSubscriptionToggle = (id) => {
    setCancelledIds((prev) =>
      prev.includes(id) ? prev.filter((subId) => subId !== id) : [...prev, id]
    );
  };

  const executeSimulation = async () => {
    setSimulating(true);
    try {
      const res = await runSimulation({
        categoryReductions: reductions,
        cancelledSubscriptionIds: cancelledIds,
        customSavingsTarget: savingsTarget,
      });

      if (res.success) {
        setResults(res.data);
        toast.success("Simulation executed successfully!");
      } else {
        toast.error(res.error || "Simulation run failed");
      }
    } catch (err) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Assembling simulator workspace...</p>
      </div>
    );
  }

  if (!baseline) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12 px-6">
        <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-lg font-bold mb-1">No Simulation Context Available</h2>
        <p className="text-sm text-muted-foreground mb-6">
          We need past transaction history to build your simulator workspace. Add transactions and accounts first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
          What-If Simulator
        </h1>
        <p className="text-sm text-muted-foreground">
          Simulate budget cuts, subscription cancellations, and savings goals to calculate the yearly financial impact.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Inputs Panel */}
        <div className="lg:col-span-7 space-y-6">
          {/* Category Reduction Card */}
          <Card className="border-white/[0.05] bg-slate-950/50 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                Reduce Category Spending
              </CardTitle>
              <CardDescription className="text-xs">
                Simulate cutting back on discretionary spending categories.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.keys(baseline.categorySpending).length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No categories detected yet.</p>
              ) : (
                Object.entries(baseline.categorySpending).map(([cat, amount]) => (
                  <div key={cat} className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold capitalize text-slate-300">{cat}</span>
                      <span className="text-muted-foreground font-medium">
                        Avg: ₹{Math.round(amount)}/mo →{" "}
                        <span className="text-violet-400 font-bold">
                          -₹{Math.round(amount * ((reductions[cat] || 0) / 100))}/mo
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={reductions[cat] || 0}
                        onChange={(e) => handleSliderChange(cat, e.target.value)}
                        className="w-full h-1.5 bg-white/[0.04] rounded-lg appearance-none cursor-pointer accent-violet-500"
                      />
                      <span className="text-xs font-semibold min-w-[30px] text-right">
                        {reductions[cat] || 0}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Subscriptions Card */}
          <Card className="border-white/[0.05] bg-slate-950/50 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Cancel Subscriptions
              </CardTitle>
              <CardDescription className="text-xs">
                Select active recurring expenses to simulate cancellation savings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {baseline.subscriptions.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No active recurring subscriptions detected. Set recurring flag on bills.
                </p>
              ) : (
                baseline.subscriptions.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id={`sub-${sub.id}`}
                        checked={cancelledIds.includes(sub.id)}
                        onCheckedChange={() => handleSubscriptionToggle(sub.id)}
                        className="border-white/20 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                      />
                      <label
                        htmlFor={`sub-${sub.id}`}
                        className="text-xs font-semibold text-slate-200 cursor-pointer capitalize"
                      >
                        {sub.description}
                        <span className="block text-[10px] text-muted-foreground lowercase">
                          {sub.interval.toLowerCase()} · {sub.category}
                        </span>
                      </label>
                    </div>
                    <span className="text-xs font-bold text-violet-400">
                      -₹{Math.round(sub.monthlyEquivalent)}/mo
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Additional Savings Card */}
          <Card className="border-white/[0.05] bg-slate-950/50 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Target Extra Savings
              </CardTitle>
              <CardDescription className="text-xs">
                Add a hypothetical monthly savings goal (e.g. transfer to savings account).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-bold">₹</span>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={savingsTarget}
                  onChange={(e) => setSavingsTarget(e.target.value)}
                  className="pl-8 bg-white/[0.02] border-white/10 rounded-xl focus-visible:ring-violet-500"
                />
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={() => startTransition(executeSimulation)}
            disabled={simulating}
            className="w-full bg-violet-600 hover:bg-violet-500 text-white font-semibold py-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-violet-500/20 text-sm transition-all"
          >
            {simulating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Recalculating Projections...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Run Simulator Engine
              </>
            )}
          </Button>
        </div>

        {/* Right Side: Projections Output Panel */}
        <div className="lg:col-span-5 space-y-6">
          {!results ? (
            <Card className="border-white/[0.05] bg-slate-950/30 border-dashed min-h-[400px] flex flex-col items-center justify-center text-center p-6">
              <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mb-4 text-violet-400">
                <RefreshCw className="w-6 h-6 animate-pulse" />
              </div>
              <h3 className="font-semibold text-sm mb-1.5 text-foreground">Waiting for Parameters</h3>
              <p className="text-xs text-muted-foreground max-w-xs">
                Adjust the sliders or cancel subscriptions on the left, then trigger the simulation engine to view outcomes.
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Savings Dashboard Cards */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border-white/[0.05] bg-slate-950/60 p-4">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Monthly Impact</p>
                  <p className="text-2xl font-black text-violet-400 mt-1.5">
                    +₹{Math.round(results.monthlySavingsDifference).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">Extra cash saved per month</p>
                </Card>
                <Card className="border-white/[0.05] bg-slate-950/60 p-4">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Yearly Impact</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1.5">
                    +₹{Math.round(results.yearlySavingsDifference).toLocaleString()}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-1">Simulated annual accumulation</p>
                </Card>
              </div>

              {/* Financial Health Score Progress */}
              <Card className="border-white/[0.05] bg-slate-950/60">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    Simulated Financial Health
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs text-muted-foreground font-semibold">Score progression</p>
                      <p className="text-xl font-bold flex items-center gap-1.5 text-foreground">
                        {baseline.baselineScore}
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                        <span className="text-emerald-400">{results.simulatedScore}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                          +{results.simulatedScore - baseline.baselineScore} pts
                        </span>
                      </p>
                    </div>
                  </div>
                  <Progress value={results.simulatedScore} className="h-2 bg-white/[0.04]" indicatorColor="bg-gradient-to-r from-violet-500 to-emerald-400" />
                </CardContent>
              </Card>

              {/* AI Recommendation Summary */}
              <Card className="border-white/[0.05] bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-xl" />
                <CardHeader className="border-b border-white/[0.05] pb-4">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                    Copilot Optimization Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 text-xs text-slate-300 leading-relaxed font-medium">
                  <div className="prose prose-invert max-w-none text-slate-300">
                    {results.aiRecommendation}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
