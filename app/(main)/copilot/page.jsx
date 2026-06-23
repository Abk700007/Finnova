"use client";

import React, { useState, useRef, useEffect, startTransition } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Brain, Send, Sparkles, MessageSquare, BookOpen, User, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { askCopilot } from "@/actions/copilot";

export default function CopilotPage() {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "Hello! I am your AI Financial Copilot. I have analyzed your accounts, transactions, budgets, and subscriptions. Ask me anything about your finances!",
      references: ["Active connection established to database"],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollAreaRef = useRef(null);

  const suggestionChips = [
    "Compare my spending this month vs last month",
    "List my active subscriptions and cancellation potential",
    "Where is most of my money going?",
    "How much did I save recently?",
  ];

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      text: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    // Format chat history for backend action
    const chatHistory = messages.map((m) => ({
      role: m.role,
      text: m.text,
    }));

    try {
      const res = await askCopilot(textToSend, chatHistory);
      if (res.success) {
        const assistantMsg = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: res.data.reply,
          references: res.data.references,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        toast.error(res.error || "Failed to get reply from Copilot");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to bottom of chat area when messages list updates
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, loading]);

  return (
    <div className="max-w-4xl mx-auto px-4 space-y-6">
      {/* Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-2xl font-black tracking-tight bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
            Financial AI Copilot
          </h1>
          <p className="text-xs text-muted-foreground">
            Ask contextual questions based on your financial statements and transaction history.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Suggestion Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <Card className="border-white/[0.05] bg-slate-950/40 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-violet-400" />
                Quick Queries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 flex flex-col gap-2">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  disabled={loading}
                  className="text-left text-xs font-semibold text-slate-300 hover:text-white p-3 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:bg-violet-600/10 hover:border-violet-500/30 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
                >
                  {chip}
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat Console */}
        <Card className="md:col-span-3 border-white/[0.05] bg-slate-950/50 backdrop-blur-md flex flex-col min-h-[500px] max-h-[600px] overflow-hidden">
          {/* Header */}
          <CardHeader className="border-b border-white/[0.05] py-4 px-6 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-200">Active RAG Memory Core</span>
            </div>
            <span className="text-[10px] text-muted-foreground bg-white/[0.04] px-2 py-0.5 rounded-full border border-white/[0.02]">
              Gemini 1.5 Flash
            </span>
          </CardHeader>

          {/* Messages Area */}
          <div ref={scrollAreaRef} className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6 pb-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
                >
                  {/* Icon */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-md ${
                      msg.role === "user"
                        ? "bg-violet-600 text-white"
                        : "bg-gradient-to-br from-indigo-500 to-purple-600 text-white"
                    }`}
                  >
                    {msg.role === "user" ? <User className="w-3.5 h-3.5" /> : <Brain className="w-3.5 h-3.5" />}
                  </div>

                  {/* Message Bubble */}
                  <div className="space-y-2">
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed font-medium ${
                        msg.role === "user"
                          ? "bg-violet-600/90 text-white rounded-tr-none"
                          : "bg-white/[0.03] text-slate-200 border border-white/[0.05] rounded-tl-none"
                      }`}
                    >
                      <div className="prose prose-invert max-w-none text-inherit break-words">
                        {msg.text}
                      </div>
                    </div>

                    {/* Source References */}
                    {msg.role === "assistant" && msg.references && msg.references.length > 0 && (
                      <div className="flex items-start gap-1 text-[10px] text-muted-foreground bg-white/[0.01] border border-white/[0.03] p-2 rounded-lg pl-2.5">
                        <BookOpen className="w-3 h-3 text-slate-500 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          {msg.references.map((ref, idx) => (
                            <span key={idx} className="block italic text-[9px]">
                              {ref}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loader */}
              {loading && (
                <div className="flex gap-3 max-w-[80%]">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shrink-0">
                    <Brain className="w-3.5 h-3.5 animate-pulse" />
                  </div>
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] rounded-tl-none flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Input */}
          <CardFooter className="border-t border-white/[0.05] p-4 bg-slate-950/20">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage(inputValue);
              }}
              className="flex w-full gap-2 items-center"
            >
              <Input
                placeholder="Ask about subscriptions, May expenses, or balance trends..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={loading}
                className="bg-white/[0.02] border-white/15 focus-visible:ring-violet-600 focus-visible:border-violet-600 rounded-xl h-11"
              />
              <Button
                type="submit"
                disabled={loading || !inputValue.trim()}
                className="bg-violet-600 hover:bg-violet-500 text-white rounded-xl h-11 px-4"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
