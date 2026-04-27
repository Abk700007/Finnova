"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X, Target } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateBudget } from "@/actions/budget";

export function BudgetProgress({ initialBudget, currentExpenses }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(
    initialBudget?.amount?.toString() || ""
  );

  const {
    loading: isLoading,
    fn: updateBudgetFn,
    data: updatedBudget,
    error,
  } = useFetch(updateBudget);

  const percentUsed = initialBudget
    ? Math.min((currentExpenses / initialBudget.amount) * 100, 100)
    : 0;

  const getStatusColor = () => {
    if (percentUsed >= 90) return { bar: "progress-rose", text: "text-rose-400", label: "Critical" };
    if (percentUsed >= 75) return { bar: "progress-amber", text: "text-amber-400", label: "Warning" };
    return { bar: "progress-emerald", text: "text-emerald-400", label: "On Track" };
  };
  const status = getStatusColor();

  const handleUpdateBudget = async () => {
    const amount = parseFloat(newBudget);
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    await updateBudgetFn(amount);
  };

  const handleCancel = () => {
    setNewBudget(initialBudget?.amount?.toString() || "");
    setIsEditing(false);
  };

  useEffect(() => {
    if (updatedBudget?.success) {
      setIsEditing(false);
      toast.success("Budget updated successfully");
    }
  }, [updatedBudget]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update budget");
    }
  }, [error]);

  return (
    <div className="glass-card-hover rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="icon-box-amber w-9 h-9 rounded-xl flex items-center justify-center">
            <Target className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Monthly Budget</h3>
            <p className="text-xs text-muted-foreground">Default Account</p>
          </div>
        </div>

        {/* Edit / Status */}
        <div className="flex items-center gap-3">
          {initialBudget && !isEditing && (
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/[0.05] ${status.text}`}>
              {status.label}
            </span>
          )}
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="w-28 h-8 text-sm bg-white/[0.05] border-white/[0.10] rounded-lg focus:border-violet-500/50"
                placeholder="Amount"
                autoFocus
                disabled={isLoading}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUpdateBudget}
                disabled={isLoading}
                className="h-8 w-8 hover:bg-emerald-500/10"
              >
                <Check className="h-4 w-4 text-emerald-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                disabled={isLoading}
                className="h-8 w-8 hover:bg-rose-500/10"
              >
                <X className="h-4 w-4 text-rose-400" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {initialBudget ? (
        <div className="space-y-3">
          {/* Progress bar */}
          <div className={`${status.bar} h-2 rounded-full overflow-hidden bg-white/[0.06]`}>
            <Progress value={percentUsed} className="h-full" />
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              <span className="text-foreground font-semibold tabular-nums">
                ${currentExpenses.toFixed(2)}
              </span>{" "}
              spent of{" "}
              <span className="text-foreground font-semibold tabular-nums">
                ${initialBudget.amount.toFixed(2)}
              </span>
            </span>
            <span className={`font-bold tabular-nums ${status.text}`}>
              {percentUsed.toFixed(1)}% used
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between py-1">
          <p className="text-sm text-muted-foreground">No budget set for this month</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 text-xs font-semibold"
          >
            Set Budget
          </Button>
        </div>
      )}
    </div>
  );
}
