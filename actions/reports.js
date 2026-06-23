"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateReportPDF } from "@/lib/pdf-generator";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateReportAction(type) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // 1. Establish date range based on Weekly or Monthly report type
    const endDate = new Date();
    const startDate = new Date();
    if (type === "WEEKLY") {
      startDate.setDate(endDate.getDate() - 7);
    } else {
      startDate.setMonth(endDate.getMonth() - 1);
    }

    // 2. Fetch transactions within range
    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // 3. Compute stats
    const stats = {
      totalIncome: 0,
      totalExpenses: 0,
      byCategory: {},
    };

    transactions.forEach((tx) => {
      const amount = tx.amount.toNumber();
      if (tx.type === "INCOME") {
        stats.totalIncome += amount;
      } else {
        stats.totalExpenses += amount;
        stats.byCategory[tx.category] = (stats.byCategory[tx.category] || 0) + amount;
      }
    });

    // 4. Generate AI Insights Narrative using Gemini
    let insights = "";
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        You are Finnova's AI Financial Copilot. Generate a professional and concise executive analysis of the user's finances for the past ${type === "WEEKLY" ? "week" : "month"}.
        
        Summary Stats:
        - Total Money Earned (Income): $${stats.totalIncome.toFixed(2)}
        - Total Money Spent (Expenses): $${stats.totalExpenses.toFixed(2)}
        - Net Savings Rate: $${(stats.totalIncome - stats.totalExpenses).toFixed(2)}
        - Breakdown by Categories: ${Object.entries(stats.byCategory)
          .map(([cat, val]) => `${cat}: $${val.toFixed(2)}`)
          .join(", ") || "No expenses logged."}

        Provide 3-4 bullet-pointed financial recommendations, highlight any overspending patterns, subscription risks, and provide actionable tips. Do NOT include markdown styling tags (like hashes or bold tags) in your final output, just clean text separated by standard line breaks. Write under 150 words.
      `;
      const result = await model.generateContent(prompt);
      insights = result.response.text();
    } catch (err) {
      console.error("Gemini Report generation narrative failed:", err);
      insights = `During this period, you earned $${stats.totalIncome.toFixed(
        2
      )} and spent $${stats.totalExpenses.toFixed(
        2
      )}. Your net savings is $${(stats.totalIncome - stats.totalExpenses).toFixed(
        2
      )}. Continue tracking your expense categories to find savings opportunities.`;
    }

    // 5. Generate PDF base64 string
    const reportName = `${type === "WEEKLY" ? "Weekly" : "Monthly"} Report - ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`;
    const pdfBase64 = generateReportPDF({
      userName: user.name || "Finnova User",
      reportName,
      type,
      stats,
      insights,
    });

    // 6. Write record to DB
    const report = await db.report.create({
      data: {
        userId: user.id,
        name: reportName,
        type,
        pdfData: pdfBase64,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        id: report.id,
        name: report.name,
        type: report.type,
        createdAt: report.createdAt,
      },
    };
  } catch (error) {
    console.error("Failed to generate report:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserReports() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Fetch reports archive excluding large base64 string to optimize query performance
    const reports = await db.report.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        type: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: reports };
  } catch (error) {
    console.error("Failed to fetch reports:", error);
    return { success: false, error: error.message };
  }
}
