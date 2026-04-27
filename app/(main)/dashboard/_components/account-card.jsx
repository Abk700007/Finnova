"use client";

import { ArrowUpRight, ArrowDownRight, CreditCard, Star } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useEffect } from "react";
import useFetch from "@/hooks/use-fetch";
import Link from "next/link";
import { updateDefaultAccount } from "@/actions/account";
import { toast } from "sonner";

export function AccountCard({ account }) {
  const { name, type, balance, id, isDefault } = account;

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  const handleDefaultChange = async (event) => {
    event.preventDefault();
    if (isDefault) {
      toast.warning("You need at least 1 default account");
      return;
    }
    await updateDefaultFn(id);
  };

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
    }
  }, [updatedAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
    }
  }, [error]);

  const isChecking = type === "CURRENT";
  const accountTypeLabel =
    type.charAt(0) + type.slice(1).toLowerCase() + " Account";

  return (
    <Link href={`/account/${id}`} className="block">
      <div
        className={`relative rounded-2xl overflow-hidden card-lift cursor-pointer group border transition-colors duration-300 ${
          isDefault
            ? "border-violet-500/30 shadow-[0_4px_24px_rgba(139,92,246,0.15)]"
            : "border-white/[0.06] hover:border-white/[0.12]"
        }`}
        style={{
          background: isChecking
            ? "linear-gradient(135deg, #0f1628 0%, #131b3a 50%, #0f1628 100%)"
            : "linear-gradient(135deg, #0c1420 0%, #111a2e 50%, #0c1420 100%)",
        }}
      >
        {/* Shimmer line at top */}
        <div
          className={`absolute top-0 left-0 right-0 h-px ${
            isDefault
              ? "bg-gradient-to-r from-transparent via-violet-500/60 to-transparent"
              : "bg-gradient-to-r from-transparent via-white/10 to-transparent"
          }`}
        />

        {/* Glow for default */}
        {isDefault && (
          <div className="absolute -top-8 -right-8 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl" />
        )}

        {/* Card brand mark */}
        <div className="absolute top-4 right-4">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isDefault ? "bg-violet-500/20" : "bg-white/[0.05]"
            }`}
          >
            <CreditCard
              className={`w-4 h-4 ${isDefault ? "text-violet-400" : "text-muted-foreground"}`}
            />
          </div>
        </div>

        <div className="p-5">
          {/* Header row */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
                {accountTypeLabel}
              </p>
              <h3 className="text-base font-bold capitalize text-foreground">
                {name}
              </h3>
            </div>
            {isDefault && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/15 border border-violet-500/20 text-[10px] font-bold text-violet-300 uppercase tracking-wider mt-0.5">
                <Star className="w-2.5 h-2.5 fill-current" />
                Default
              </span>
            )}
          </div>

          {/* Balance */}
          <div className="mb-5">
            <p className="text-2xl font-extrabold tracking-tight tabular-nums text-foreground">
              ${parseFloat(balance).toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Available Balance
            </p>
          </div>

          {/* Footer */}
          <div
            className="flex items-center justify-between pt-4 border-t border-white/[0.06]"
            onClick={(e) => e.preventDefault()}
          >
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-medium text-emerald-400">Income</span>
              </div>
              <div className="flex items-center gap-1">
                <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
                <span className="font-medium text-rose-400">Expense</span>
              </div>
            </div>
            <Switch
              checked={isDefault}
              onClick={handleDefaultChange}
              disabled={updateDefaultLoading}
              className="data-[state=checked]:bg-violet-600 scale-75"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
