"use client";

import { useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const DATE_RANGES = {
  "7D": { label: "Last 7 Days", days: 7 },
  "1M": { label: "Last Month", days: 30 },
  "3M": { label: "Last 3 Months", days: 90 },
  "6M": { label: "Last 6 Months", days: 180 },
  ALL: { label: "All Time", days: null },
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-xl px-4 py-3 shadow-xl border border-white/[0.08] text-sm">
        <p className="font-semibold text-foreground mb-2">{label}</p>
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-6">
            <div className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ background: p.fill }}
              />
              <span className="text-muted-foreground capitalize">{p.name}</span>
            </div>
            <span className="font-bold text-foreground tabular-nums">
              ₹{p.value.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function AccountChart({ transactions }) {
  const [dateRange, setDateRange] = useState("1M");

  const filteredData = useMemo(() => {
    const range = DATE_RANGES[dateRange];
    const now = new Date();
    const startDate = range.days
      ? startOfDay(subDays(now, range.days))
      : startOfDay(new Date(0));

    const filtered = transactions.filter(
      (t) =>
        new Date(t.date) >= startDate && new Date(t.date) <= endOfDay(now)
    );

    const grouped = filtered.reduce((acc, transaction) => {
      const date = format(new Date(transaction.date), "MMM dd");
      if (!acc[date]) {
        acc[date] = { date, income: 0, expense: 0 };
      }
      if (transaction.type === "INCOME") {
        acc[date].income += transaction.amount;
      } else {
        acc[date].expense += transaction.amount;
      }
      return acc;
    }, {});

    return Object.values(grouped).sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
  }, [transactions, dateRange]);

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, day) => ({
        income: acc.income + day.income,
        expense: acc.expense + day.expense,
      }),
      { income: 0, expense: 0 }
    );
  }, [filteredData]);

  const net = totals.income - totals.expense;

  return (
    <div className="glass-card-hover rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
        <div>
          <h3 className="text-sm font-bold">Transaction Overview</h3>
          <p className="text-xs text-muted-foreground">Income vs Expenses</p>
        </div>
        <Select defaultValue={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[130px] h-8 text-xs bg-white/[0.04] border-white/[0.08] rounded-lg">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent className="bg-[#0f1628] border-white/[0.08]">
            {Object.entries(DATE_RANGES).map(([key, { label }]) => (
              <SelectItem key={key} value={key} className="text-xs">
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-3 divide-x divide-white/[0.06] border-b border-white/[0.06]">
        <div className="px-5 py-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-muted-foreground">Income</span>
          </div>
          <p className="text-base font-bold text-emerald-400 tabular-nums">
            ₹{totals.income.toFixed(2)}
          </p>
        </div>
        <div className="px-5 py-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-xs text-muted-foreground">Expenses</span>
          </div>
          <p className="text-base font-bold text-rose-400 tabular-nums">
            ₹{totals.expense.toFixed(2)}
          </p>
        </div>
        <div className="px-5 py-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Minus className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-xs text-muted-foreground">Net</span>
          </div>
          <p
            className={`text-base font-bold tabular-nums ${
              net >= 0 ? "text-violet-400" : "text-rose-400"
            }`}
          >
            {net >= 0 ? "+" : ""}₹{net.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-5">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{ top: 4, right: 4, left: -16, bottom: 0 }}
              barGap={4}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="date"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "hsl(215 16% 57%)" }}
                interval="preserveStartEnd"
              />
              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value}`}
                tick={{ fill: "hsl(215 16% 57%)" }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)", radius: 6 }} />
              <Legend
                formatter={(value) => (
                  <span className="text-xs text-muted-foreground capitalize">
                    {value}
                  </span>
                )}
              />
              <Bar
                dataKey="income"
                name="Income"
                fill="#10b981"
                radius={[5, 5, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="expense"
                name="Expense"
                fill="#7c3aed"
                radius={[5, 5, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
