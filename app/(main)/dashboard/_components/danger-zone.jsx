"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteUserAccount } from "@/actions/dashboard";
import useFetch from "@/hooks/use-fetch";

export function DangerZone() {
  const router = useRouter();
  const { data, loading, fn: deleteFn } = useFetch(deleteUserAccount);

  useEffect(() => {
    if (data?.success) {
      toast.success("Your account and all associated data have been permanently deleted.");
      router.push("/");
      router.refresh();
    } else if (data?.success === false) {
      toast.error(data.error || "Failed to delete account.");
    }
  }, [data, router]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you absolutely sure you want to delete your Finnova account? This will permanently delete your bank accounts, all transaction histories, budgets, forecasts, and AI reports. This action cannot be undone."
    );
    if (!confirmDelete) return;

    const secondConfirm = window.confirm(
      "This is your last warning. Type 'DELETE' in the next prompt if you are sure."
    );
    if (!secondConfirm) return;

    const typedText = window.prompt("Type 'DELETE' to confirm account destruction:");
    if (typedText !== "DELETE") {
      toast.error("Account deletion aborted. Confirmation text did not match.");
      return;
    }

    deleteFn();
  };

  return (
    <Card className="border-rose-500/20 bg-rose-500/[0.01] backdrop-blur-md">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2.5 text-rose-400">
          <AlertTriangle className="w-5 h-5" />
          <CardTitle className="text-lg font-bold text-rose-400">Danger Zone</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground mt-1">
          Permanently delete your Finnova account and all of your personal and financial data.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-0">
        <p className="text-xs text-muted-foreground max-w-xl">
          Deleting your account is irreversible. All of your synced bank accounts, historical ledgers, budgets, forecasts, and reports will be completely scrubbed from our systems.
        </p>
        <Button
          variant="destructive"
          onClick={handleDelete}
          disabled={loading}
          className="bg-rose-600 hover:bg-rose-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-rose-950/20 hover:shadow-rose-900/40 transition-all cursor-pointer whitespace-nowrap sm:self-center"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              Delete Account
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
