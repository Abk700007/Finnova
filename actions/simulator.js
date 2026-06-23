"use server";

import { db } from "@/lib/prisma";
import { checkUser } from "@/lib/checkUser";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function getSimulatorData() {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    

    // 1. Fetch user transactions to aggregate by category
    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
    });

    // 2. Fetch recurring transactions representing subscriptions
    const recurringTxns = await db.transaction.findMany({
      where: {
        userId: user.id,
        isRecurring: true,
        type: "EXPENSE",
        status: "COMPLETED",
      },
    });

    // Compute monthly income and category expenses
    const categorySpending = {};
    let totalMonthlyIncome = 0;
    let totalMonthlyExpense = 0;

    // Group items by month to find monthly averages
    const monthlyData = {};
    transactions.forEach((tx) => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0, categories: {} };
      }

      const amount = tx.amount.toNumber();
      if (tx.type === "INCOME") {
        monthlyData[monthKey].income += amount;
      } else {
        monthlyData[monthKey].expense += amount;
        const cat = tx.category;
        monthlyData[monthKey].categories[cat] =
          (monthlyData[monthKey].categories[cat] || 0) + amount;
      }
    });

    const months = Object.keys(monthlyData);
    const monthCount = months.length || 1;

    // Sum and average
    let sumIncome = 0;
    let sumExpense = 0;
    months.forEach((m) => {
      sumIncome += monthlyData[m].income;
      sumExpense += monthlyData[m].expense;
      Object.keys(monthlyData[m].categories).forEach((cat) => {
        categorySpending[cat] = (categorySpending[cat] || 0) + monthlyData[m].categories[cat];
      });
    });

    const avgMonthlyIncome = sumIncome / monthCount;
    const avgMonthlyExpense = sumExpense / monthCount;

    // Calculate average spending per category
    Object.keys(categorySpending).forEach((cat) => {
      categorySpending[cat] = categorySpending[cat] / monthCount;
    });

    // Map subscriptions representing active recurring items
    const subscriptions = recurringTxns.map((tx) => {
      // Calculate monthly equivalent amount
      let monthlyAmount = tx.amount.toNumber();
      if (tx.recurringInterval === "DAILY") {
        monthlyAmount *= 30;
      } else if (tx.recurringInterval === "WEEKLY") {
        monthlyAmount *= 4.33;
      } else if (tx.recurringInterval === "YEARLY") {
        monthlyAmount /= 12;
      }
      return {
        id: tx.id,
        description: tx.description || "Recurring Subscription",
        amount: tx.amount.toNumber(),
        interval: tx.recurringInterval,
        monthlyEquivalent: monthlyAmount,
        category: tx.category,
      };
    });

    // Calculate baseline Financial Health Score
    // Formula: Based on Savings Rate (avg net income / avg total income)
    const netSavings = avgMonthlyIncome - avgMonthlyExpense;
    const savingsRate = avgMonthlyIncome > 0 ? netSavings / avgMonthlyIncome : 0;
    const baselineScore = Math.max(0, Math.min(100, Math.round(savingsRate * 100 + 40))); // offset of 40 for starting score

    return {
      success: true,
      data: {
        avgMonthlyIncome,
        avgMonthlyExpense,
        categorySpending,
        subscriptions,
        baselineScore,
      },
    };
  } catch (error) {
    console.error("Failed to load simulator data:", error);
    return { success: false, error: error.message };
  }
}

export async function runSimulation(inputs) {
  try {
    const user = await checkUser();
    if (!user) throw new Error("Unauthorized");

    const { categoryReductions, cancelledSubscriptionIds, customSavingsTarget } = inputs;

    // Load original data
    const dataRes = await getSimulatorData();
    if (!dataRes.success) throw new Error(dataRes.error);
    const { avgMonthlyIncome, avgMonthlyExpense, categorySpending, subscriptions } = dataRes.data;

    // 1. Calculate savings from category reductions
    let monthlyCategorySavings = 0;
    Object.keys(categoryReductions).forEach((cat) => {
      const reductionPercent = categoryReductions[cat] || 0; // e.g. 20 for 20%
      const currentSpend = categorySpending[cat] || 0;
      monthlyCategorySavings += currentSpend * (reductionPercent / 100);
    });

    // 2. Calculate savings from cancelled subscriptions
    let monthlySubscriptionSavings = 0;
    subscriptions.forEach((sub) => {
      if (cancelledSubscriptionIds.includes(sub.id)) {
        monthlySubscriptionSavings += sub.monthlyEquivalent;
      }
    });

    // 3. Custom savings target
    const addedMonthlySavings = parseFloat(customSavingsTarget) || 0;

    // Total monthly and annual impact
    const totalMonthlySavingsDiff = monthlyCategorySavings + monthlySubscriptionSavings + addedMonthlySavings;
    const totalYearlySavingsDiff = totalMonthlySavingsDiff * 12;

    const simulatedMonthlyExpense = Math.max(0, avgMonthlyExpense - (monthlyCategorySavings + monthlySubscriptionSavings));
    const simulatedNetSavings = avgMonthlyIncome - simulatedMonthlyExpense + addedMonthlySavings;

    // Updated Financial Health Score
    const simulatedSavingsRate = avgMonthlyIncome > 0 ? simulatedNetSavings / avgMonthlyIncome : 0;
    const simulatedScore = Math.max(0, Math.min(100, Math.round(simulatedSavingsRate * 100 + 40)));

    // 4. Generate AI recommendations using Gemini
    let aiRecommendation = "";
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `
        You are Finnova's AI Financial Copilot. The user is simulating a "What-If" scenario to optimize their budget.
        
        Current Financial Stats:
        - Monthly Income: $${avgMonthlyIncome.toFixed(2)}
        - Monthly Expense: $${avgMonthlyExpense.toFixed(2)}
        - Baseline Financial Health Score: ${dataRes.data.baselineScore}/100
        
        Simulated Optimizations:
        - Category Spending Reductions: ${Object.entries(categoryReductions)
          .map(([cat, val]) => `${cat} by ${val}%`)
          .join(", ") || "None"}
        - Subscriptions Cancelled: ${subscriptions
          .filter((s) => cancelledSubscriptionIds.includes(s.id))
          .map((s) => s.description)
          .join(", ") || "None"}
        - Additional Monthly Savings Target: $${addedMonthlySavings.toFixed(2)}
        
        Simulation Outcomes:
        - Monthly Savings Increase: +$${totalMonthlySavingsDiff.toFixed(2)}
        - Yearly Savings Increase: +$${totalYearlySavingsDiff.toFixed(2)}
        - Updated Simulated Financial Health Score: ${simulatedScore}/100

        Provide brief, actionable feedback on this plan. Evaluate how feasible it is (e.g. is reducing spending too aggressive?), suggest if they should cancel these specific subscriptions, and provide 3 highly-actionable, bullet-pointed tips. Write in clean markdown under 150 words.
      `;
      const result = await model.generateContent(prompt);
      aiRecommendation = result.response.text();
    } catch (err) {
      console.error("Gemini Simulator recommendation failed:", err);
      aiRecommendation = `Your simulated changes will save you **$${totalMonthlySavingsDiff.toFixed(
        2
      )}** per month, totaling **$${totalYearlySavingsDiff.toFixed(
        2
      )}** annually. Your Financial Health Score improves to **${simulatedScore}/100**. This is a great step! Focus on maintaining these spending reductions in the targeted categories.`;
    }

    return {
      success: true,
      data: {
        monthlySavingsDifference: totalMonthlySavingsDiff,
        yearlySavingsDifference: totalYearlySavingsDiff,
        simulatedScore,
        aiRecommendation,
      },
    };
  } catch (error) {
    console.error("Failed to run simulation:", error);
    return { success: false, error: error.message };
  }
}
