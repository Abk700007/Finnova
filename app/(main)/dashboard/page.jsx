import { Suspense } from "react";
import { getUserAccounts } from "@/actions/dashboard";
import { getDashboardData } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";
import { AccountCard } from "./_components/account-card";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { BudgetProgress } from "./_components/budget-progress";
import { Plus, TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";
import { DashboardOverview } from "./_components/transaction-overview";
import { ForecastSection } from "./_components/forecast-section";
import { ReportsSection } from "./_components/reports-section";

export default async function DashboardPage() {
  const [accounts, transactions] = await Promise.all([
    getUserAccounts(),
    getDashboardData(),
  ]);

  const defaultAccount = accounts?.find((account) => account.isDefault);

  let budgetData = null;
  if (defaultAccount) {
    budgetData = await getCurrentBudget(defaultAccount.id);
  }

  // Compute summary metrics
  const totalBalance = accounts.reduce(
    (sum, acc) => sum + parseFloat(acc.balance),
    0
  );
  const currentMonthTxns = (transactions || []).filter((t) => {
    const d = new Date(t.date);
    const now = new Date();
    return (
      d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    );
  });
  const monthlyIncome = currentMonthTxns
    .filter((t) => t.type === "INCOME")
    .reduce((s, t) => s + t.amount, 0);
  const monthlyExpense = currentMonthTxns
    .filter((t) => t.type === "EXPENSE")
    .reduce((s, t) => s + t.amount, 0);
  const savingsRate =
    monthlyIncome > 0
      ? (((monthlyIncome - monthlyExpense) / monthlyIncome) * 100).toFixed(1)
      : "0.0";

  const summaryCards = [
    {
      label: "Total Balance",
      value: `$${totalBalance.toFixed(2)}`,
      icon: <Wallet className="w-5 h-5" />,
      iconClass: "icon-box-primary",
      change: null,
    },
    {
      label: "Monthly Income",
      value: `$${monthlyIncome.toFixed(2)}`,
      icon: <TrendingUp className="w-5 h-5" />,
      iconClass: "icon-box-success",
      change: "+income",
    },
    {
      label: "Monthly Expenses",
      value: `$${monthlyExpense.toFixed(2)}`,
      icon: <TrendingDown className="w-5 h-5" />,
      iconClass: "icon-box-danger",
      change: "-expense",
    },
    {
      label: "Savings Rate",
      value: `${savingsRate}%`,
      icon: <PiggyBank className="w-5 h-5" />,
      iconClass: "icon-box-blue",
      change: null,
    },
  ];

  return (
    <div className="space-y-8">
      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <div
            key={i}
            className="glass-card-hover rounded-2xl p-5 card-lift"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="stat-label">{card.label}</span>
              <div className={`${card.iconClass} w-9 h-9 rounded-xl flex items-center justify-center`}>
                {card.icon}
              </div>
            </div>
            <div className="stat-number text-foreground">{card.value}</div>
            {card.change === "+income" && monthlyIncome > 0 && (
              <p className="text-xs text-emerald-400 font-semibold mt-1">
                This month
              </p>
            )}
            {card.change === "-expense" && monthlyExpense > 0 && (
              <p className="text-xs text-rose-400 font-semibold mt-1">
                This month
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ── Budget Progress ── */}
      <BudgetProgress
        initialBudget={budgetData?.budget}
        currentExpenses={budgetData?.currentExpenses || 0}
      />

      {/* ── Dashboard Overview (Charts + Recent Transactions) ── */}
      <DashboardOverview
        accounts={accounts}
        transactions={transactions || []}
      />

      {/* ── Financial Forecast Engine ── */}
      <ForecastSection />

      {/* ── AI Financial Reports ── */}
      <ReportsSection />

      {/* ── Accounts Section ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold tracking-tight">Your Accounts</h2>
          <span className="text-xs text-muted-foreground font-medium">
            {accounts.length} account{accounts.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <CreateAccountDrawer>
            <button className="rounded-2xl border border-dashed border-white/[0.12] hover:border-violet-500/40 bg-white/[0.02] hover:bg-violet-500/[0.04] transition-all duration-300 p-5 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-violet-300 group cursor-pointer min-h-[120px]">
              <div className="w-10 h-10 rounded-xl border border-dashed border-current flex items-center justify-center group-hover:border-violet-400 transition-colors">
                <Plus className="h-5 w-5" />
              </div>
              <p className="text-sm font-semibold">Add New Account</p>
            </button>
          </CreateAccountDrawer>
          {accounts.length > 0 &&
            accounts?.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
        </div>
      </div>
    </div>
  );
}
