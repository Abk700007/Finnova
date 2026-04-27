import { Suspense } from "react";
import { getAccountWithTransactions } from "@/actions/account";
import { BarLoader } from "react-spinners";
import { TransactionTable } from "../_components/transaction-table";
import { notFound } from "next/navigation";
import { AccountChart } from "../_components/account-chart";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

export default async function AccountPage({ params }) {
  const { id } = await params;
  const accountData = await getAccountWithTransactions(id);

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;

  // Compute totals
  const totalIncome = transactions
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);
  const netFlow = totalIncome - totalExpense;

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Page header */}
      <div className="border-b border-white/[0.05] bg-white/[0.01] mb-8">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <p className="section-eyebrow">Account Details</p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight capitalize">
                {account.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {account.type.charAt(0) + account.type.slice(1).toLowerCase()}{" "}
                Account &mdash;{" "}
                <span className="text-foreground font-medium">
                  {account._count.transactions} transactions
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                Current Balance
              </p>
              <p className="text-3xl font-extrabold tracking-tight tabular-nums text-foreground">
                ${parseFloat(account.balance).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Quick stat chips */}
          <div className="flex flex-wrap gap-3 mt-5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-emerald-400 tabular-nums">
                +${totalIncome.toFixed(2)} income
              </span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20">
              <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-xs font-semibold text-rose-400 tabular-nums">
                -${totalExpense.toFixed(2)} expenses
              </span>
            </div>
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                netFlow >= 0
                  ? "bg-violet-500/10 border-violet-500/20"
                  : "bg-rose-500/10 border-rose-500/20"
              }`}
            >
              <span
                className={`text-xs font-semibold tabular-nums ${
                  netFlow >= 0 ? "text-violet-400" : "text-rose-400"
                }`}
              >
                {netFlow >= 0 ? "+" : ""}${netFlow.toFixed(2)} net
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 space-y-6">
        {/* Chart */}
        <Suspense
          fallback={
            <div className="h-64 rounded-2xl bg-white/[0.02] border border-white/[0.06] animate-pulse" />
          }
        >
          <AccountChart transactions={transactions} />
        </Suspense>

        {/* Transactions Table */}
        <Suspense
          fallback={
            <div className="h-48 rounded-2xl bg-white/[0.02] border border-white/[0.06] animate-pulse" />
          }
        >
          <TransactionTable transactions={transactions} />
        </Suspense>
      </div>
    </div>
  );
}
