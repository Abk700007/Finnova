"use client";

import { useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { ArrowUpRight, ArrowDownRight, LayoutGrid } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const COLORS = [
  "#7c3aed",
  "#4f46e5",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ec4899",
  "#6366f1",
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-xl px-4 py-3 text-sm shadow-xl border border-white/[0.08]">
        <p className="font-semibold text-foreground mb-1">{payload[0].name}</p>
        <p className="text-violet-300 font-bold">
          ${payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload }) => (
  <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-3">
    {payload.map((entry, i) => (
      <div key={i} className="flex items-center gap-1.5">
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: entry.color }}
        />
        <span className="text-xs text-muted-foreground">{entry.value}</span>
      </div>
    ))}
  </div>
);

export function DashboardOverview({ accounts, transactions }) {
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id
  );

  const accountTransactions = transactions.filter(
    (t) => t.accountId === selectedAccountId
  );

  const recentTransactions = accountTransactions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 6);

  const currentDate = new Date();
  const currentMonthExpenses = accountTransactions.filter((t) => {
    const transactionDate = new Date(t.date);
    return (
      t.type === "EXPENSE" &&
      transactionDate.getMonth() === currentDate.getMonth() &&
      transactionDate.getFullYear() === currentDate.getFullYear()
    );
  });

  const expensesByCategory = currentMonthExpenses.reduce(
    (acc, transaction) => {
      const category = transaction.category;
      if (!acc[category]) acc[category] = 0;
      acc[category] += transaction.amount;
      return acc;
    },
    {}
  );

  const pieChartData = Object.entries(expensesByCategory).map(
    ([category, amount]) => ({ name: category, value: amount })
  );

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* ── Recent Transactions ── */}
      <div className="glass-card-hover rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="icon-box-primary w-8 h-8 rounded-lg flex items-center justify-center bg-violet-500/15">
              <LayoutGrid className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Recent Transactions</h3>
              <p className="text-xs text-muted-foreground">Last 6 entries</p>
            </div>
          </div>
          <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
            <SelectTrigger className="w-[130px] h-8 text-xs bg-white/[0.04] border-white/[0.08] rounded-lg">
              <SelectValue placeholder="Select account" />
            </SelectTrigger>
            <SelectContent className="bg-[#0f1628] border-white/[0.08]">
              {accounts.map((account) => (
                <SelectItem
                  key={account.id}
                  value={account.id}
                  className="text-xs"
                >
                  {account.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="divide-y divide-white/[0.04]">
          {recentTransactions.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <div className="text-2xl mb-2">📋</div>
              No transactions yet
            </div>
          ) : (
            recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0",
                      transaction.type === "EXPENSE"
                        ? "bg-rose-500/10"
                        : "bg-emerald-500/10"
                    )}
                  >
                    {transaction.type === "EXPENSE" ? (
                      <ArrowDownRight className="w-4 h-4 text-rose-400" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground leading-tight">
                      {transaction.description || "Untitled Transaction"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {format(new Date(transaction.date), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
                <div
                  className={cn(
                    "text-sm font-bold tabular-nums",
                    transaction.type === "EXPENSE"
                      ? "text-rose-400"
                      : "text-emerald-400"
                  )}
                >
                  {transaction.type === "EXPENSE" ? "-" : "+"}$
                  {transaction.amount.toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Expense Breakdown ── */}
      <div className="glass-card-hover rounded-2xl overflow-hidden">
        <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/15 flex items-center justify-center">
            <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold">Expense Breakdown</h3>
            <p className="text-xs text-muted-foreground">Current month by category</p>
          </div>
        </div>

        <div className="p-5">
          {pieChartData.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              <div className="text-2xl mb-2">📊</div>
              No expenses this month
            </div>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend content={<CustomLegend />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
