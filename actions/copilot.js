"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function askCopilot(query, chatHistory = []) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // 1. Fetch user context from database
    const [accounts, budgets, transactions, recurring] = await Promise.all([
      db.account.findMany({ where: { userId: user.id } }),
      db.budget.findMany({ where: { userId: user.id } }),
      db.transaction.findMany({
        where: { userId: user.id },
        orderBy: { date: "desc" },
        take: 100, // Fetch the last 100 transactions for active memory
      }),
      db.transaction.findMany({
        where: { userId: user.id, isRecurring: true },
      }),
    ]);

    // 2. Format database context into structured markdown
    const accountsContext = accounts
      .map((acc) => `- ${acc.name} (${acc.type}): $${acc.balance.toNumber()} ${acc.isDefault ? "[DEFAULT]" : ""}`)
      .join("\n");

    const budgetsContext = budgets
      .map((b) => `- Limit: $${b.amount.toNumber()} (Last Alert Sent: ${b.lastAlertSent ? new Date(b.lastAlertSent).toLocaleDateString() : "Never"})`)
      .join("\n");

    const recurringContext = recurring
      .map((r) => `- ${r.description || "Subscription"}: $${r.amount.toNumber()} per ${r.recurringInterval.toLowerCase()} (Category: ${r.category})`)
      .join("\n");

    const transactionsContext = transactions
      .map((t) => `| ${new Date(t.date).toLocaleDateString()} | ${t.type} | $${t.amount.toNumber()} | ${t.category} | ${t.description || "No description"} |`)
      .join("\n");

    const financialContext = `
# USER FINANCIAL CONTEXT DATA
Below is the real, current, and verified financial data for the authenticated user. Answer questions using ONLY this information when requested.

## Accounts
${accountsContext || "No accounts configured."}

## Budgets
${budgetsContext || "No monthly budgets set."}

## Active Subscriptions & Recurring Bills
${recurringContext || "No active recurring transactions."}

## Recent Transactions (Last 100)
| Date | Type | Amount | Category | Description |
|------|------|--------|----------|-------------|
${transactionsContext || "No transactions recorded."}
`;

    // 3. Compile system prompt and user conversation history
    const systemPrompt = `
You are Finnova's AI Financial Copilot. You are an expert financial advisor, accountant, and strategic planner.
Your goal is to answer the user's questions utilizing their real financial data provided in the context below.

Rules:
1. Always base your calculations and factual answers on the provided "USER FINANCIAL CONTEXT DATA".
2. If asked to compare or calculate, run precise calculations.
3. Be friendly, conversational, and encouraging, yet highly professional.
4. When you mention specific transactions or numbers, add a small reference note at the end (e.g. "Reference: Netflix subscription of $15/mo" or "Reference: 3 transactions in Utilities category in May").
5. If the user asks about something not in their data, politely explain that you do not see it in their records and answer based on general best practices.
6. Return responses in clean, formatted Markdown.
`;

    // Format history for Gemini API
    const contents = [
      {
        role: "user",
        parts: [{ text: `${systemPrompt}\n\n${financialContext}` }],
      },
    ];

    // Append last 10 messages of history for conversation flow
    const slicedHistory = chatHistory.slice(-10);
    slicedHistory.forEach((msg) => {
      contents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      });
    });

    // Append the new user query
    contents.push({
      role: "user",
      parts: [{ text: query }],
    });

    // 4. Invoke Gemini 2.5 Flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent({ contents });
    const response = await result.response;
    const aiMessage = response.text();

    // 5. Detect source attributions if possible (or formulate them)
    // We can extract lines that start with or contain "Reference:"
    const lines = aiMessage.split("\n");
    const references = [];
    lines.forEach((line) => {
      if (line.toLowerCase().includes("reference:")) {
        references.push(line.replace(/^[*\s-]*reference:\s*/i, "").trim());
      }
    });

    return {
      success: true,
      data: {
        reply: aiMessage,
        references: references.length > 0 ? references : ["Context retrieved from active transactions database"],
      },
    };
  } catch (error) {
    console.error("AI Copilot request failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
