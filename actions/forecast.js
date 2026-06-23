"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function generateForecast() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      include: {
        accounts: true,
      },
    });

    if (!user) throw new Error("User not found");

    // 1. Calculate Current Net Worth (Sum of all account balances)
    const currentNetWorth = user.accounts.reduce(
      (sum, acc) => sum + acc.balance.toNumber(),
      0
    );

    // 2. Fetch all user transactions
    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "asc" },
    });

    if (transactions.length === 0) {
      return {
        success: false,
        error: "No transactions found to base forecast on. Add some transactions first!",
      };
    }

    // 3. Group transactions by Month-Year to compute monthly averages
    const monthlyData = {};
    transactions.forEach((tx) => {
      const date = new Date(tx.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!monthlyData[key]) {
        monthlyData[key] = { income: 0, expense: 0 };
      }

      const amount = tx.amount.toNumber();
      if (tx.type === "INCOME") {
        monthlyData[key].income += amount;
      } else {
        monthlyData[key].expense += amount;
      }
    });

    const months = Object.keys(monthlyData);
    const monthCount = months.length;

    let avgIncome = 0;
    let avgExpense = 0;
    let confidence = 85;

    if (monthCount > 0) {
      let totalIncome = 0;
      let totalExpense = 0;
      const netSavingsList = [];

      months.forEach((m) => {
        totalIncome += monthlyData[m].income;
        totalExpense += monthlyData[m].expense;
        netSavingsList.push(monthlyData[m].income - monthlyData[m].expense);
      });

      avgIncome = totalIncome / monthCount;
      avgExpense = totalExpense / monthCount;

      // Calculate confidence based on variance of monthly net savings
      const avgNetSavings = avgIncome - avgExpense;
      if (monthCount > 1) {
        const variance =
          netSavingsList.reduce((sum, net) => sum + Math.pow(net - avgNetSavings, 2), 0) /
          monthCount;
        const stdDev = Math.sqrt(variance);
        const coefficientOfVariation = stdDev / (Math.abs(avgNetSavings) || 1);
        confidence = Math.max(55, Math.min(98, 95 - coefficientOfVariation * 25));
      } else {
        confidence = 80; // Default when history is short
      }
    }

    const avgNetSavings = avgIncome - avgExpense;

    // 4. Run Projections (3M, 6M, 12M)
    const projectedSavings3M = Math.max(0, avgNetSavings * 3);
    const projectedSavings6M = Math.max(0, avgNetSavings * 6);
    const projectedSavings12M = Math.max(0, avgNetSavings * 12);

    const projectedExpenses3M = avgExpense * 3;
    const projectedExpenses6M = avgExpense * 6;
    const projectedExpenses12M = avgExpense * 12;

    const projectedNetWorth3M = currentNetWorth + avgNetSavings * 3;
    const projectedNetWorth6M = currentNetWorth + avgNetSavings * 6;
    const projectedNetWorth12M = currentNetWorth + avgNetSavings * 12;

    // 5. Call Gemini 1.5 Flash for explanation and reasoning
    let explanation = "";
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
        You are Finnova's AI Financial Copilot. Analyze the following financial data for the user:
        - Current Net Worth: $${currentNetWorth.toFixed(2)}
        - Average Monthly Income: $${avgIncome.toFixed(2)}
        - Average Monthly Expense: $${avgExpense.toFixed(2)}
        - Projected Monthly Net Savings: $${avgNetSavings.toFixed(2)}
        
        Future Projections:
        - 3-Month Savings: $${projectedSavings3M.toFixed(2)} (Net Worth: $${projectedNetWorth3M.toFixed(2)})
        - 6-Month Savings: $${projectedSavings6M.toFixed(2)} (Net Worth: $${projectedNetWorth6M.toFixed(2)})
        - 12-Month Savings: $${projectedSavings12M.toFixed(2)} (Net Worth: $${projectedNetWorth12M.toFixed(2)})
        - Forecast Confidence: ${confidence.toFixed(1)}%

        Provide a professional, actionable summary evaluating if the user is on track, where they can optimize, and what risks they should look out for. Keep it friendly, encouraging, and write in markdown under 150 words.
      `;
      const result = await model.generateContent(prompt);
      explanation = result.response.text();
    } catch (err) {
      console.error("Gemini Forecast explanation failed:", err);
      explanation = `Based on your monthly averages (Income: $${avgIncome.toFixed(
        2
      )}, Expense: $${avgExpense.toFixed(2)}), you are saving about $${avgNetSavings.toFixed(
        2
      )} per month. If you maintain this rate, you will accumulate $${projectedSavings12M.toFixed(
        2
      )} in savings over the next 12 months. Try optimizing discretionary expenses to boost your confidence rate of ${confidence.toFixed(
        1
      )}%.`;
    }

    // 6. Save/Create forecast history in the database
    const forecast = await db.forecast.create({
      data: {
        userId: user.id,
        monthlyIncome: avgIncome,
        monthlyExpense: avgExpense,
        projectedSavings3M,
        projectedSavings6M,
        projectedSavings12M,
        projectedExpenses3M,
        projectedExpenses6M,
        projectedExpenses12M,
        projectedNetWorth3M,
        projectedNetWorth6M,
        projectedNetWorth12M,
        confidence,
        explanation,
      },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: {
        ...forecast,
        monthlyIncome: forecast.monthlyIncome.toNumber(),
        monthlyExpense: forecast.monthlyExpense.toNumber(),
        projectedSavings3M: forecast.projectedSavings3M.toNumber(),
        projectedSavings6M: forecast.projectedSavings6M.toNumber(),
        projectedSavings12M: forecast.projectedSavings12M.toNumber(),
        projectedExpenses3M: forecast.projectedExpenses3M.toNumber(),
        projectedExpenses6M: forecast.projectedExpenses6M.toNumber(),
        projectedExpenses12M: forecast.projectedExpenses12M.toNumber(),
        projectedNetWorth3M: forecast.projectedNetWorth3M.toNumber(),
        projectedNetWorth6M: forecast.projectedNetWorth6M.toNumber(),
        projectedNetWorth12M: forecast.projectedNetWorth12M.toNumber(),
      },
    };
  } catch (error) {
    console.error("Failed to generate forecast:", error);
    return { success: false, error: error.message };
  }
}

export async function getLatestForecast() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const forecast = await db.forecast.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    if (!forecast) return { success: true, data: null };

    return {
      success: true,
      data: {
        ...forecast,
        monthlyIncome: forecast.monthlyIncome.toNumber(),
        monthlyExpense: forecast.monthlyExpense.toNumber(),
        projectedSavings3M: forecast.projectedSavings3M.toNumber(),
        projectedSavings6M: forecast.projectedSavings6M.toNumber(),
        projectedSavings12M: forecast.projectedSavings12M.toNumber(),
        projectedExpenses3M: forecast.projectedExpenses3M.toNumber(),
        projectedExpenses6M: forecast.projectedExpenses6M.toNumber(),
        projectedExpenses12M: forecast.projectedExpenses12M.toNumber(),
        projectedNetWorth3M: forecast.projectedNetWorth3M.toNumber(),
        projectedNetWorth6M: forecast.projectedNetWorth6M.toNumber(),
        projectedNetWorth12M: forecast.projectedNetWorth12M.toNumber(),
      },
    };
  } catch (error) {
    console.error("Failed to get forecast:", error);
    return { success: false, error: error.message };
  }
}
