"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarIcon, Loader2, DollarSign, FileText, Tag, CreditCard, Repeat } from "lucide-react";
import { format } from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CreateAccountDrawer } from "@/components/create-account-drawer";
import { cn } from "@/lib/utils";
import { createTransaction, updateTransaction } from "@/actions/transaction";
import { transactionSchema } from "@/app/lib/schema";
import { ReceiptScanner } from "./recipt-scanner";

function FieldLabel({ icon: Icon, label, required }) {
  return (
    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
      {Icon && <Icon className="w-3.5 h-3.5 text-violet-400" />}
      {label}
      {required && <span className="text-rose-400">*</span>}
    </label>
  );
}

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1.5 text-xs text-rose-400 font-medium">{message}</p>;
}

export function AddTransactionForm({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialData.description,
            accountId: initialData.accountId,
            category: initialData.category,
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring,
            ...(initialData.recurringInterval && {
              recurringInterval: initialData.recurringInterval,
            }),
          }
        : {
            type: "EXPENSE",
            amount: "",
            description: "",
            accountId: accounts.find((ac) => ac.isDefault)?.id,
            date: new Date(),
            isRecurring: false,
          },
  });

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(editMode ? updateTransaction : createTransaction);

  const onSubmit = (data) => {
    const formData = { ...data, amount: parseFloat(data.amount) };
    if (editMode) {
      transactionFn(editId, formData);
    } else {
      transactionFn(formData);
    }
  };

  const handleScanComplete = (scannedData) => {
    if (scannedData) {
      setValue("amount", scannedData.amount.toString());
      setValue("date", new Date(scannedData.date));
      if (scannedData.description) setValue("description", scannedData.description);
      if (scannedData.category) setValue("category", scannedData.category);
      toast.success("Receipt scanned successfully");
    }
  };

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success(
        editMode ? "Transaction updated successfully" : "Transaction created successfully"
      );
      reset();
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [transactionResult, transactionLoading, editMode]);

  const type = watch("type");
  const isRecurring = watch("isRecurring");
  const date = watch("date");
  const filteredCategories = categories.filter((c) => c.type === type);

  const inputClass =
    "h-11 bg-white/[0.04] border-white/[0.08] rounded-xl text-sm focus:border-violet-500/50 focus:bg-white/[0.06] transition-all placeholder:text-muted-foreground/60";

  const selectTriggerClass =
    "h-11 bg-white/[0.04] border-white/[0.08] rounded-xl text-sm focus:border-violet-500/50 data-[state=open]:border-violet-500/50 transition-all";

  return (
    <div className="glass-card-hover rounded-2xl overflow-hidden">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Receipt Scanner Banner – only in create mode */}
        {!editMode && (
          <div className="p-5 border-b border-white/[0.06] bg-gradient-to-r from-violet-950/40 via-indigo-950/30 to-blue-950/40">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <p className="text-sm font-bold text-foreground mb-0.5">
                  ✨ Scan Receipt with AI
                </p>
                <p className="text-xs text-muted-foreground">
                  Upload a photo and let AI extract amount, date, and category automatically.
                </p>
              </div>
            </div>
            <div className="mt-3">
              <ReceiptScanner onScanComplete={handleScanComplete} />
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">
          {/* Transaction Type Toggle */}
          <div>
            <FieldLabel label="Transaction Type" required />
            <div className="flex rounded-xl overflow-hidden border border-white/[0.08] p-1 gap-1 bg-white/[0.02]">
              {["EXPENSE", "INCOME"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setValue("type", t)}
                  className={cn(
                    "flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200",
                    type === t
                      ? t === "EXPENSE"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.04]"
                  )}
                >
                  {t === "EXPENSE" ? "💸 Expense" : "💰 Income"}
                </button>
              ))}
            </div>
            <FieldError message={errors.type?.message} />
          </div>

          {/* Amount + Account */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel icon={DollarSign} label="Amount" required />
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">
                  $
                </span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("amount")}
                  className={cn(inputClass, "pl-7")}
                />
              </div>
              <FieldError message={errors.amount?.message} />
            </div>

            <div>
              <FieldLabel icon={CreditCard} label="Account" required />
              <Select
                onValueChange={(v) => setValue("accountId", v)}
                defaultValue={getValues("accountId")}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Select account" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f1628] border-white/[0.08] rounded-xl">
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id} className="text-sm">
                      {account.name} (${parseFloat(account.balance).toFixed(2)})
                    </SelectItem>
                  ))}
                  <CreateAccountDrawer>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-sm text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 font-medium px-2 py-1.5 mt-1"
                    >
                      + Create New Account
                    </Button>
                  </CreateAccountDrawer>
                </SelectContent>
              </Select>
              <FieldError message={errors.accountId?.message} />
            </div>
          </div>

          {/* Category */}
          <div>
            <FieldLabel icon={Tag} label="Category" required />
            <Select
              onValueChange={(v) => setValue("category", v)}
              defaultValue={getValues("category")}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-[#0f1628] border-white/[0.08] rounded-xl max-h-60">
                {filteredCategories.map((category) => (
                  <SelectItem key={category.id} value={category.id} className="text-sm">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError message={errors.category?.message} />
          </div>

          {/* Date + Description */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <FieldLabel icon={CalendarIcon} label="Date" required />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-11 pl-3.5 text-left font-normal text-sm rounded-xl bg-white/[0.04] border-white/[0.08] hover:bg-white/[0.06] hover:border-white/[0.14] transition-all",
                      !date && "text-muted-foreground"
                    )}
                  >
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-40" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 bg-[#0f1628] border-white/[0.08] rounded-xl shadow-2xl"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => setValue("date", date)}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FieldError message={errors.date?.message} />
            </div>

            <div>
              <FieldLabel icon={FileText} label="Description" />
              <Input
                placeholder="What was this for?"
                {...register("description")}
                className={inputClass}
              />
              <FieldError message={errors.description?.message} />
            </div>
          </div>

          {/* Recurring Toggle */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                  <Repeat className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Recurring Transaction</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Auto-record on a set schedule
                  </p>
                </div>
              </div>
              <Switch
                checked={isRecurring}
                onCheckedChange={(checked) => setValue("isRecurring", checked)}
                className="data-[state=checked]:bg-violet-600"
              />
            </div>

            {/* Recurring Interval (conditional) */}
            {isRecurring && (
              <div className="mt-4 pt-4 border-t border-white/[0.06]">
                <FieldLabel label="Repeat Every" />
                <Select
                  onValueChange={(v) => setValue("recurringInterval", v)}
                  defaultValue={getValues("recurringInterval")}
                >
                  <SelectTrigger className={selectTriggerClass}>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f1628] border-white/[0.08] rounded-xl">
                    <SelectItem value="DAILY" className="text-sm">Daily</SelectItem>
                    <SelectItem value="WEEKLY" className="text-sm">Weekly</SelectItem>
                    <SelectItem value="MONTHLY" className="text-sm">Monthly</SelectItem>
                    <SelectItem value="YEARLY" className="text-sm">Yearly</SelectItem>
                  </SelectContent>
                </Select>
                <FieldError message={errors.recurringInterval?.message} />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="flex-1 h-12 rounded-xl border border-white/[0.08] text-muted-foreground hover:text-foreground hover:bg-white/[0.05] font-semibold"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-12 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-200"
              disabled={transactionLoading}
            >
              {transactionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {editMode ? "Updating..." : "Creating..."}
                </>
              ) : editMode ? (
                "Update Transaction"
              ) : (
                "Create Transaction"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
