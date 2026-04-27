"use client";

import { useRef, useEffect } from "react";
import { Camera, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";
import { scanReceipt } from "@/actions/transaction";

export function ReceiptScanner({ onScanComplete }) {
  const fileInputRef = useRef(null);

  const {
    loading: scanReceiptLoading,
    fn: scanReceiptFn,
    data: scannedData,
  } = useFetch(scanReceipt);

  const handleReceiptScan = async (file) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }
    await scanReceiptFn(file);
  };

  useEffect(() => {
    if (scannedData && !scanReceiptLoading) {
      onScanComplete(scannedData);
      toast.success("Receipt scanned successfully");
    }
  }, [scanReceiptLoading, scannedData]);

  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleReceiptScan(file);
        }}
      />
      <Button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={scanReceiptLoading}
        className="w-full h-11 rounded-xl font-semibold text-sm gap-2.5 transition-all duration-300 relative overflow-hidden"
        style={{
          background: scanReceiptLoading
            ? "rgba(139, 92, 246, 0.2)"
            : "linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #3b82f6 100%)",
          color: "#ffffff",
          border: "1px solid rgba(139, 92, 246, 0.4)",
          boxShadow: scanReceiptLoading
            ? "none"
            : "0 4px 20px rgba(139, 92, 246, 0.35)",
        }}
      >
        {/* Shimmer overlay */}
        {!scanReceiptLoading && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer-slow pointer-events-none" />
        )}

        {scanReceiptLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Scanning Receipt...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Scan Receipt with AI</span>
            <Camera className="w-4 h-4 opacity-70" />
          </>
        )}
      </Button>
      {!scanReceiptLoading && (
        <p className="text-xs text-muted-foreground text-center mt-2">
          Supports JPG, PNG, WEBP · Max 5MB
        </p>
      )}
    </div>
  );
}
