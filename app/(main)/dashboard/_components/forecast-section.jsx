"use client";

import React, { useState, useEffect, startTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Sparkles, Brain, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { generateForecast, getLatestForecast } from "@/actions/forecast";

export function ForecastSection() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadForecast = async () => {
    try {
      const res = await getLatestForecast();
      if (res.success && res.data) {
        setForecast(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForecast();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await generateForecast();
      if (res.success) {
        setForecast(res.data);
        toast.success("Financial twin forecast generated successfully!");
      } else {
        toast.error(res.error || "Failed to generate forecast");
      }
    } catch (err) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-white/[0.05] bg-slate-900/40 backdrop-blur-md">
        <CardContent className="p-8 flex flex-col items-center justify-center min-h-[200px] gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <p className="text-sm text-muted-foreground">Analyzing spending habits...</p>
        </CardContent>
      </Card>
    );
  }

  // Generate chart data based on forecast averages
  const getChartData = () => {
    if (!forecast) return [];
    
    const data = [];
    const monthlyNetSavings = forecast.monthlyIncome - forecast.monthlyExpense;
    let currentWorth = forecast.projectedNetWorth3M - monthlyNetSavings * 3; // backtrack to starting point

    // Starting Month
    data.push({
      month: "Now",
      "Net Worth": Math.round(currentWorth),
      Savings: 0,
      Expenses: 0,
    });

    // Projections per Month up to 12 Months
    for (let i = 1; i <= 12; i++) {
      currentWorth += monthlyNetSavings;
      data.push({
        month: `Month ${i}`,
        "Net Worth": Math.round(currentWorth),
        Savings: Math.round(Math.max(0, monthlyNetSavings * i)),
        Expenses: Math.round(forecast.monthlyExpense * i),
      });
    }

    return data;
  };

  const chartData = getChartData();

  return (
    <Card className="border-white/[0.05] bg-gradient-to-b from-slate-950 to-slate-900 shadow-xl overflow-hidden mt-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-white/[0.05] px-6 py-5">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-400" />
            AI Financial Digital Twin
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Machine learning forecast of your future net worth and savings rate
          </CardDescription>
        </div>
        <Button
          onClick={() => startTransition(handleGenerate)}
          disabled={generating}
          size="sm"
          className="bg-violet-600 hover:bg-violet-500 text-white font-semibold gap-1.5 shadow-lg shadow-violet-500/20 px-4 h-9 rounded-lg transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          {generating ? "Syncing Twin..." : forecast ? "Refresh Forecast" : "Initialize Twin"}
        </Button>
      </CardHeader>

      {!forecast ? (
        <CardContent className="p-8 flex flex-col items-center justify-center text-center min-h-[280px]">
          <div className="w-12 h-12 rounded-full bg-violet-500/10 flex items-center justify-center mb-4 text-violet-400">
            <TrendingUp className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-base mb-1.5 text-foreground">Forecast Model Uninitialized</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Generate your digital twin forecasting model to project your savings, expenses, and net worth.
          </p>
          <Button onClick={() => startTransition(handleGenerate)} disabled={generating} className="bg-violet-600 hover:bg-violet-500">
            Generate Forecast
          </Button>
        </CardContent>
      ) : (
        <CardContent className="p-6">
          {/* Forecast Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {/* 3 Month Card */}
            <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-colors" />
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold mb-3">
                <Calendar className="w-4 h-4 text-violet-400" />
                3-Month Horizon
              </div>
              <div className="space-y-2.5">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Projected Savings</p>
                  <p className="text-xl font-bold text-violet-400">₹{forecast.projectedSavings3M.toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.04]">
                  <div>
                    <p className="text-[9px] text-muted-foreground">Expenses</p>
                    <p className="text-xs font-semibold">₹{forecast.projectedExpenses3M.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">Net Worth</p>
                    <p className="text-xs font-semibold text-emerald-400">₹{forecast.projectedNetWorth3M.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 6 Month Card */}
            <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold mb-3">
                <Calendar className="w-4 h-4 text-blue-400" />
                6-Month Horizon
              </div>
              <div className="space-y-2.5">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Projected Savings</p>
                  <p className="text-xl font-bold text-blue-400">₹{forecast.projectedSavings6M.toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.04]">
                  <div>
                    <p className="text-[9px] text-muted-foreground">Expenses</p>
                    <p className="text-xs font-semibold">₹{forecast.projectedExpenses6M.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">Net Worth</p>
                    <p className="text-xs font-semibold text-emerald-400">₹{forecast.projectedNetWorth6M.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 12 Month Card */}
            <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
              <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold mb-3">
                <Calendar className="w-4 h-4 text-emerald-400" />
                12-Month Horizon
              </div>
              <div className="space-y-2.5">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Projected Savings</p>
                  <p className="text-xl font-bold text-emerald-400">₹{forecast.projectedSavings12M.toLocaleString()}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.04]">
                  <div>
                    <p className="text-[9px] text-muted-foreground">Expenses</p>
                    <p className="text-xs font-semibold">₹{forecast.projectedExpenses12M.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-muted-foreground">Net Worth</p>
                    <p className="text-xs font-semibold text-emerald-400">₹{forecast.projectedNetWorth12M.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart Area */}
            <div className="lg:col-span-2 rounded-xl border border-white/[0.05] bg-white/[0.01] p-5 min-h-[300px]">
              <h4 className="text-sm font-semibold mb-4 text-muted-foreground">12-Month Projection Trend</h4>
              <div className="w-full h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} width={45} />
                    <Tooltip
                      contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px" }}
                      labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                    />
                    <Legend verticalAlign="top" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                    <Line type="monotone" dataKey="Net Worth" stroke="#10b981" strokeWidth={2.5} activeDot={{ r: 6 }} dot={false} />
                    <Line type="monotone" dataKey="Savings" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* AI Reasoning Panel */}
            <div className="flex flex-col justify-between rounded-xl border border-white/[0.05] bg-white/[0.01] p-5 relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-white/[0.05]">
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                  <h4 className="text-sm font-bold text-foreground">AI Copilot Analysis</h4>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed max-h-[200px] overflow-y-auto pr-1">
                  {forecast.explanation}
                </div>
              </div>

              {/* Confidence Rating */}
              <div className="mt-6 pt-4 border-t border-white/[0.05]">
                <div className="flex items-center justify-between text-xs mb-1.5 font-semibold text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
                    Forecast Accuracy Confidence
                  </span>
                  <span>{forecast.confidence.toFixed(1)}%</span>
                </div>
                <Progress value={forecast.confidence} className="h-1.5 bg-white/[0.04]" indicatorColor="bg-violet-600" />
                <p className="text-[10px] text-muted-foreground mt-2">
                  Calculated based on volatility and savings consistency over your history.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
