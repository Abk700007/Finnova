"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createAccount } from "@/actions/dashboard";
import { accountSchema } from "@/app/lib/schema";

export function CreateAccountDrawer({ children }) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "CURRENT",
      balance: "",
      isDefault: false,
    },
  });

  const {
    loading: createAccountLoading,
    fn: createAccountFn,
    error,
    data: newAccount,
  } = useFetch(createAccount);

  const onSubmit = async (data) => {
    await createAccountFn(data);
  };

  useEffect(() => {
    if (newAccount) {
      toast.success("Account created successfully");
      reset();
      setOpen(false);
    }
  }, [newAccount, reset]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to create account");
    }
  }, [error]);

  const inputClass =
    "h-11 bg-white/[0.04] border-white/[0.08] rounded-xl text-sm focus:border-violet-500/50 focus:bg-white/[0.06] transition-all placeholder:text-muted-foreground/60";

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="bg-[#0a0e1e] border-t border-white/[0.08] rounded-t-3xl">
        <div className="mx-auto w-10 h-1 bg-white/20 rounded-full mt-3 mb-6" />
        <DrawerHeader className="px-6 pb-0">
          <div className="flex items-center justify-between">
            <DrawerTitle className="text-xl font-bold">
              Create New Account
            </DrawerTitle>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/[0.05] rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Add a new account to track your finances.
          </p>
        </DrawerHeader>

        <div className="px-6 pb-8 pt-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Account Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2"
              >
                Account Name
              </label>
              <Input
                id="name"
                placeholder="e.g., Main Checking, Savings"
                {...register("name")}
                className={inputClass}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-rose-400">{errors.name.message}</p>
              )}
            </div>

            {/* Account Type */}
            <div>
              <label
                htmlFor="type"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2"
              >
                Account Type
              </label>
              <Select
                onValueChange={(value) => setValue("type", value)}
                defaultValue={watch("type")}
              >
                <SelectTrigger
                  id="type"
                  className="h-11 bg-white/[0.04] border-white/[0.08] rounded-xl text-sm"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f1628] border-white/[0.08] rounded-xl">
                  <SelectItem value="CURRENT" className="text-sm">Current Account</SelectItem>
                  <SelectItem value="SAVINGS" className="text-sm">Savings Account</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="mt-1.5 text-xs text-rose-400">{errors.type.message}</p>
              )}
            </div>

            {/* Initial Balance */}
            <div>
              <label
                htmlFor="balance"
                className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2"
              >
                Initial Balance
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold text-sm">
                  $
                </span>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("balance")}
                  className={`${inputClass} pl-7`}
                />
              </div>
              {errors.balance && (
                <p className="mt-1.5 text-xs text-rose-400">{errors.balance.message}</p>
              )}
            </div>

            {/* Default Toggle */}
            <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
              <div>
                <label
                  htmlFor="isDefault"
                  className="text-sm font-semibold cursor-pointer"
                >
                  Set as Default
                </label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Used by default for new transactions
                </p>
              </div>
              <Switch
                id="isDefault"
                checked={watch("isDefault")}
                onCheckedChange={(checked) => setValue("isDefault", checked)}
                className="data-[state=checked]:bg-violet-600"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <DrawerClose asChild>
                <Button
                  type="button"
                  variant="ghost"
                  className="flex-1 h-12 rounded-xl border border-white/[0.08] text-muted-foreground hover:text-foreground hover:bg-white/[0.05] font-semibold"
                >
                  Cancel
                </Button>
              </DrawerClose>
              <Button
                type="submit"
                className="flex-1 h-12 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold shadow-lg shadow-violet-500/25 transition-all"
                disabled={createAccountLoading}
              >
                {createAccountLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
