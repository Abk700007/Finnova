"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  Trash,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ListFilter,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { categoryColors } from "@/data/categories";
import { bulkDeleteTransactions } from "@/actions/account";
import useFetch from "@/hooks/use-fetch";
import { BarLoader } from "react-spinners";
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 10;

const RECURRING_INTERVALS = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  YEARLY: "Yearly",
};

export function TransactionTable({ transactions }) {
  const [selectedIds, setSelectedIds] = useState([]);
  const [sortConfig, setSortConfig] = useState({ field: "date", direction: "desc" });
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [recurringFilter, setRecurringFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  const filteredAndSortedTransactions = useMemo(() => {
    let result = [...transactions];
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((t) =>
        t.description?.toLowerCase().includes(searchLower)
      );
    }
    if (typeFilter) result = result.filter((t) => t.type === typeFilter);
    if (recurringFilter) {
      result = result.filter((t) =>
        recurringFilter === "recurring" ? t.isRecurring : !t.isRecurring
      );
    }
    result.sort((a, b) => {
      let comp = 0;
      switch (sortConfig.field) {
        case "date": comp = new Date(a.date) - new Date(b.date); break;
        case "amount": comp = a.amount - b.amount; break;
        case "category": comp = a.category.localeCompare(b.category); break;
        default: comp = 0;
      }
      return sortConfig.direction === "asc" ? comp : -comp;
    });
    return result;
  }, [transactions, searchTerm, typeFilter, recurringFilter, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedTransactions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAndSortedTransactions, currentPage]);

  const handleSort = (field) => {
    setSortConfig((current) => ({
      field,
      direction: current.field === field && current.direction === "asc" ? "desc" : "asc",
    }));
  };
  const handleSelect = (id) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  };
  const handleSelectAll = () => {
    setSelectedIds((current) =>
      current.length === paginatedTransactions.length ? [] : paginatedTransactions.map((t) => t.id)
    );
  };

  const { loading: deleteLoading, fn: deleteFn, data: deleted } = useFetch(bulkDeleteTransactions);

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} transactions?`)) return;
    deleteFn(selectedIds);
  };

  useEffect(() => {
    if (deleted && !deleteLoading) {
      toast.error("Transactions deleted successfully");
    }
  }, [deleted, deleteLoading]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setRecurringFilter("");
    setCurrentPage(1);
  };
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    setSelectedIds([]);
  };

  const SortIcon = ({ field }) => {
    if (sortConfig.field !== field)
      return <ChevronDown className="ml-1 h-3.5 w-3.5 opacity-30" />;
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="ml-1 h-3.5 w-3.5 text-violet-400" />
    ) : (
      <ChevronDown className="ml-1 h-3.5 w-3.5 text-violet-400" />
    );
  };

  const hasFilters = searchTerm || typeFilter || recurringFilter;

  return (
    <div className="glass-card-hover rounded-2xl overflow-hidden">
      {/* Loading bar */}
      {deleteLoading && (
        <div className="absolute top-0 left-0 right-0 z-50">
          <BarLoader width="100%" color="#7c3aed" />
        </div>
      )}

      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-white/[0.06] flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="pl-9 h-9 text-sm bg-white/[0.04] border-white/[0.08] rounded-lg focus:border-violet-500/40 focus:bg-white/[0.06]"
          />
        </div>

        {/* Filters row */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ListFilter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Filter:</span>
          </div>
          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[110px] h-9 text-xs bg-white/[0.04] border-white/[0.08] rounded-lg">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-[#0f1628] border-white/[0.08]">
              <SelectItem value="INCOME" className="text-xs">Income</SelectItem>
              <SelectItem value="EXPENSE" className="text-xs">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select value={recurringFilter} onValueChange={(v) => { setRecurringFilter(v); setCurrentPage(1); }}>
            <SelectTrigger className="w-[130px] h-9 text-xs bg-white/[0.04] border-white/[0.08] rounded-lg">
              <SelectValue placeholder="All Recurring" />
            </SelectTrigger>
            <SelectContent className="bg-[#0f1628] border-white/[0.08]">
              <SelectItem value="recurring" className="text-xs">Recurring Only</SelectItem>
              <SelectItem value="non-recurring" className="text-xs">One-time Only</SelectItem>
            </SelectContent>
          </Select>

          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="h-9 text-xs gap-1.5 bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/20"
            >
              <Trash className="h-3.5 w-3.5" />
              Delete ({selectedIds.length})
            </Button>
          )}

          {hasFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearFilters}
              className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
              title="Clear filters"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full fintech-table">
          <thead>
            <tr>
              <th className="w-10 pl-5">
                <Checkbox
                  checked={
                    selectedIds.length === paginatedTransactions.length &&
                    paginatedTransactions.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                  className="border-white/20 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                />
              </th>
              <th className="cursor-pointer" onClick={() => handleSort("date")}>
                <div className="flex items-center">
                  Date <SortIcon field="date" />
                </div>
              </th>
              <th>Description</th>
              <th className="cursor-pointer" onClick={() => handleSort("category")}>
                <div className="flex items-center">
                  Category <SortIcon field="category" />
                </div>
              </th>
              <th className="text-right cursor-pointer" onClick={() => handleSort("amount")}>
                <div className="flex items-center justify-end">
                  Amount <SortIcon field="amount" />
                </div>
              </th>
              <th>Recurring</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="text-3xl mb-3">📋</div>
                  <p className="text-sm text-muted-foreground">No transactions found</p>
                  {hasFilters && (
                    <button
                      onClick={handleClearFilters}
                      className="mt-2 text-xs text-violet-400 hover:text-violet-300 font-medium"
                    >
                      Clear filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              paginatedTransactions.map((transaction) => (
                <tr key={transaction.id} className="group">
                  <td className="pl-5">
                    <Checkbox
                      checked={selectedIds.includes(transaction.id)}
                      onCheckedChange={() => handleSelect(transaction.id)}
                      className="border-white/20 data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                    />
                  </td>
                  <td className="text-muted-foreground text-xs tabular-nums whitespace-nowrap">
                    {format(new Date(transaction.date), "MMM d, yyyy")}
                  </td>
                  <td>
                    <p className="font-medium text-foreground text-sm">
                      {transaction.description || (
                        <span className="text-muted-foreground italic">Untitled</span>
                      )}
                    </p>
                  </td>
                  <td>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
                      style={{
                        background: `${categoryColors[transaction.category]}25`,
                        color: categoryColors[transaction.category],
                        border: `1px solid ${categoryColors[transaction.category]}40`,
                      }}
                    >
                      {transaction.category}
                    </span>
                  </td>
                  <td className="text-right">
                    <div
                      className={cn(
                        "flex items-center justify-end gap-1 font-bold tabular-nums text-sm",
                        transaction.type === "EXPENSE"
                          ? "text-rose-400"
                          : "text-emerald-400"
                      )}
                    >
                      {transaction.type === "EXPENSE" ? (
                        <ArrowDownRight className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      )}
                      ${transaction.amount.toFixed(2)}
                    </div>
                  </td>
                  <td>
                    {transaction.isRecurring ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
                              <RefreshCw className="h-3 w-3" />
                              {RECURRING_INTERVALS[transaction.recurringInterval]}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="bg-[#0f1628] border-white/[0.08] text-xs">
                            <p className="font-semibold mb-1">Next Date:</p>
                            <p>{format(new Date(transaction.nextRecurringDate), "PPP")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium text-muted-foreground border border-white/[0.06]">
                        <Clock className="h-3 w-3" />
                        One-time
                      </span>
                    )}
                  </td>
                  <td>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-all"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-[#0f1628] border-white/[0.08] rounded-xl shadow-2xl text-sm"
                      >
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/transaction/create?edit=${transaction.id}`)
                          }
                          className="hover:bg-white/[0.05] rounded-lg cursor-pointer"
                        >
                          Edit Transaction
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/[0.06]" />
                        <DropdownMenuItem
                          className="text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-lg cursor-pointer"
                          onClick={() => deleteFn([transaction.id])}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.06]">
          <span className="text-xs text-muted-foreground">
            Showing{" "}
            <span className="text-foreground font-medium">
              {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredAndSortedTransactions.length)}
              –
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSortedTransactions.length)}
            </span>{" "}
            of{" "}
            <span className="text-foreground font-medium">
              {filteredAndSortedTransactions.length}
            </span>
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/[0.05] disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium text-muted-foreground px-2">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/[0.05] disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
