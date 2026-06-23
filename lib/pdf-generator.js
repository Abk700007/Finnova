import { jsPDF } from "jspdf";

export function generateReportPDF({ userName, reportName, type, stats, insights }) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Color Palette: Deep slate/dark background styles but clean light-printable PDF layout
  const primaryColor = [124, 58, 237]; // Violet 600
  const darkTextColor = [15, 23, 42]; // Slate 900
  const lightTextColor = [100, 116, 139]; // Slate 500
  const borderCol = [226, 232, 240]; // Slate 200

  // Margins & Dimensions
  const marginX = 20;
  let currentY = 25;

  // Header Title
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text("FINNOVA", marginX, currentY);

  // Report Type badge
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text(`${type} FINANCIAL DIGEST`, 140, currentY - 1);

  currentY += 6;
  doc.setFontSize(12);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text(reportName, marginX, currentY);

  // Line separator
  currentY += 5;
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(0.8);
  doc.line(marginX, currentY, 190, currentY);

  // Metadata block (Date range, user)
  currentY += 10;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text(`Generated For: ${userName}`, marginX, currentY);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, currentY);

  // 1. Key Metrics Section
  currentY += 10;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text("Executive Summary Metrics", marginX, currentY);

  currentY += 6;
  // Draw metric boxes (Income, Expenses, Net Savings)
  const boxWidth = 50;
  const boxHeight = 22;

  // Card 1: Total Income
  doc.setDrawColor(borderCol[0], borderCol[1], borderCol[2]);
  doc.setFillColor(248, 250, 252); // soft grey
  doc.rect(marginX, currentY, boxWidth, boxHeight, "FD");
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text("TOTAL INCOME", marginX + 4, currentY + 6);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(16, 185, 129); // Emerald 500
  doc.text(`$${stats.totalIncome.toFixed(2)}`, marginX + 4, currentY + 14);

  // Card 2: Total Expenses
  doc.rect(marginX + 55, currentY, boxWidth, boxHeight, "FD");
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text("TOTAL EXPENSES", marginX + 59, currentY + 6);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(239, 68, 68); // Red 500
  doc.text(`$${stats.totalExpenses.toFixed(2)}`, marginX + 59, currentY + 14);

  // Card 3: Net Savings
  doc.rect(marginX + 110, currentY, boxWidth, boxHeight, "FD");
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
  doc.text("NET SAVINGS", marginX + 114, currentY + 6);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  const netSavings = stats.totalIncome - stats.totalExpenses;
  if (netSavings >= 0) {
    doc.setTextColor(16, 185, 129);
  } else {
    doc.setTextColor(239, 68, 68);
  }
  doc.text(`$${netSavings.toFixed(2)}`, marginX + 114, currentY + 14);

  // 2. Spending Category Breakdown (Vector Graphic Charts)
  currentY += boxHeight + 15;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text("Category Breakdown", marginX, currentY);

  currentY += 6;
  const categories = Object.entries(stats.byCategory || {});
  if (categories.length === 0) {
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    doc.text("No category expense logs recorded during this period.", marginX, currentY);
    currentY += 10;
  } else {
    // Find maximum amount for relative scaling of bars
    const maxAmount = Math.max(...categories.map(([_, amt]) => amt)) || 1;
    const maxBarWidth = 70; // 70mm

    categories.forEach(([cat, amt]) => {
      // Draw category text
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
      const catLabel = cat.charAt(0).toUpperCase() + cat.slice(1);
      doc.text(catLabel, marginX, currentY + 5);

      // Draw background bar track
      doc.setFillColor(241, 245, 249);
      doc.rect(marginX + 35, currentY + 1, maxBarWidth, 5, "F");

      // Draw filled bar based on proportion
      const activeWidth = (amt / maxAmount) * maxBarWidth;
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(marginX + 35, currentY + 1, activeWidth, 5, "F");

      // Draw amount label
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
      doc.text(`$${amt.toFixed(2)}`, marginX + 112, currentY + 5);

      currentY += 8;
      
      // Page break check
      if (currentY > 260) {
        doc.addPage();
        currentY = 25;
      }
    });
  }

  // 3. AI Insights section
  currentY += 10;
  if (currentY > 240) {
    doc.addPage();
    currentY = 25;
  }

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);
  doc.text("AI Copilot Insights & Recommendations", marginX, currentY);

  currentY += 6;
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(darkTextColor[0], darkTextColor[1], darkTextColor[2]);

  // Clean raw markdown notation if present in Gemini output
  const cleanInsights = insights
    .replace(/[#*`_-]/g, " ") // replace markdown styling marks with spaces/nothing
    .trim();

  const splitInsights = doc.splitTextToSize(cleanInsights, 150); // wrap text width to 150mm
  splitInsights.forEach((line) => {
    doc.text(line, marginX, currentY);
    currentY += 5;
    if (currentY > 275) {
      doc.addPage();
      currentY = 25;
    }
  });

  // Footer page numbering
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(lightTextColor[0], lightTextColor[1], lightTextColor[2]);
    doc.text(`Page ${i} of ${pageCount}`, marginX, 285);
    doc.text("Finnova intelligent report generator", 125, 285);
  }

  return doc.output("datauristring").split(",")[1]; // Return raw Base64 string
}
