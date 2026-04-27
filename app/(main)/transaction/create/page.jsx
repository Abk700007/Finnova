import { getUserAccounts } from "@/actions/dashboard";
import { defaultCategories } from "@/data/categories";
import { AddTransactionForm } from "../_components/transaction-form";
import { getTransaction } from "@/actions/transaction";
import { PenBox, Pencil } from "lucide-react";

export default async function AddTransactionPage({ searchParams }) {
  const accounts = await getUserAccounts();
  const resolvedParams = await searchParams;
  const editId = resolvedParams?.edit;

  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Page header */}
      <div className="border-b border-white/[0.05] bg-white/[0.01] mb-8">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center">
              {editId ? (
                <Pencil className="w-3.5 h-3.5 text-violet-400" />
              ) : (
                <PenBox className="w-3.5 h-3.5 text-violet-400" />
              )}
            </div>
            <p className="section-eyebrow">
              {editId ? "Edit Transaction" : "New Transaction"}
            </p>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {editId ? "Update Transaction" : "Add Transaction"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {editId
              ? "Modify the details of your existing transaction."
              : "Record your income or expense with full details."}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          <AddTransactionForm
            accounts={accounts}
            categories={defaultCategories}
            editMode={!!editId}
            initialData={initialData}
          />
        </div>
      </div>
    </div>
  );
}
