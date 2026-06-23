"use client";

import React, { useState, useEffect, startTransition } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Sparkles, Plus, Clock, Archive } from "lucide-react";
import { toast } from "sonner";
import { generateReportAction, getUserReports } from "@/actions/reports";

export function ReportsSection() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(null); // 'WEEKLY' or 'MONTHLY' or null

  const loadReports = async () => {
    try {
      const res = await getUserReports();
      if (res.success) {
        setReports(res.data);
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleGenerate = async (type) => {
    setGenerating(type);
    try {
      const res = await generateReportAction(type);
      if (res.success) {
        toast.success(`${type.toLowerCase()} report generated successfully!`);
        // Refresh list
        setReports((prev) => [res.data, ...prev]);
      } else {
        toast.error(res.error || "Failed to generate report");
      }
    } catch (err) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setGenerating(null);
    }
  };

  return (
    <Card className="border-white/[0.05] bg-gradient-to-b from-slate-950 to-slate-900 shadow-xl overflow-hidden mt-8">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6 border-b border-white/[0.05] px-6 py-5">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Archive className="w-5 h-5 text-violet-400" />
            AI Financial Reports
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Generate and download comprehensive PDF financial reports with Gemini-powered narratives
          </CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => startTransition(() => handleGenerate("WEEKLY"))}
            disabled={generating !== null}
            variant="outline"
            size="sm"
            className="border-white/10 hover:bg-white/[0.04] text-xs font-semibold gap-1 px-3.5 h-9"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            {generating === "WEEKLY" ? "Compiling..." : "Generate Weekly"}
          </Button>
          <Button
            onClick={() => startTransition(() => handleGenerate("MONTHLY"))}
            disabled={generating !== null}
            size="sm"
            className="bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs gap-1 px-3.5 h-9 shadow-lg shadow-violet-500/25 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            {generating === "MONTHLY" ? "Compiling..." : "Generate Monthly"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-muted-foreground">Loading report archive...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12 border border-dashed border-white/[0.06] rounded-xl bg-white/[0.01]">
            <FileText className="w-10 h-10 text-muted-foreground/60 mb-3" />
            <h4 className="font-semibold text-sm mb-1">No reports in archive</h4>
            <p className="text-xs text-muted-foreground max-w-xs mb-4">
              You haven&apos;t generated any weekly or monthly reports yet. Click a button above to generate one now.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.03] hover:border-violet-500/25 transition-all"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-violet-600/10 flex items-center justify-center text-violet-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200 capitalize">{report.name}</h4>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      Generated {new Date(report.createdAt).toLocaleString()} · {report.type.toLowerCase()}
                    </span>
                  </div>
                </div>

                <a
                  href={`/api/reports/${report.id}`}
                  download
                  className="flex items-center gap-1.5 bg-white/[0.04] hover:bg-violet-600/10 hover:text-violet-300 border border-white/5 hover:border-violet-500/20 text-xs font-semibold px-3 py-2 rounded-xl transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </a>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
