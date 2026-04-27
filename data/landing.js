import {
  BarChart3,
  Receipt,
  PieChart,
  CreditCard,
  Globe,
  Zap,
} from "lucide-react";

// Stats Data
export const statsData = [
  { value: "50K+", label: "Active Users" },
  { value: "$2B+", label: "Transactions Tracked" },
  { value: "99.9%", label: "Uptime" },
  { value: "4.9/5", label: "User Rating" },
];

// Features Data
export const featuresData = [
  {
    icon: <BarChart3 className="h-5 w-5 text-violet-400" />,
    title: "Advanced Analytics",
    description:
      "Understand your spending patterns with AI-powered analytics, trend detection, and actionable insights.",
  },
  {
    icon: <Receipt className="h-5 w-5 text-violet-400" />,
    title: "Smart Receipt Scanner",
    description:
      "Photograph any receipt and AI automatically extracts amount, date, and category in seconds.",
  },
  {
    icon: <PieChart className="h-5 w-5 text-violet-400" />,
    title: "Budget Planning",
    description:
      "Set monthly budgets by category with real-time progress tracking and smart overspend alerts.",
  },
  {
    icon: <CreditCard className="h-5 w-5 text-violet-400" />,
    title: "Multi-Account Support",
    description:
      "Manage checking, savings, and credit accounts from a single, unified dashboard.",
  },
  {
    icon: <Globe className="h-5 w-5 text-violet-400" />,
    title: "Multi-Currency",
    description:
      "Track finances across currencies with real-time conversion rates built in.",
  },
  {
    icon: <Zap className="h-5 w-5 text-violet-400" />,
    title: "Automated Insights",
    description:
      "Receive weekly AI reports on your spending, savings rate, and personalized recommendations.",
  },
];

// How It Works Data
export const howItWorksData = [
  {
    icon: <CreditCard className="h-7 w-7" />,
    title: "1. Create Your Account",
    description:
      "Sign up in under 60 seconds. Add your accounts and set your first monthly budget.",
  },
  {
    icon: <BarChart3 className="h-7 w-7" />,
    title: "2. Track Your Spending",
    description:
      "Log transactions manually or scan receipts. AI categorizes everything automatically.",
  },
  {
    icon: <PieChart className="h-7 w-7" />,
    title: "3. Get Smart Insights",
    description:
      "Finnova analyzes your data and delivers personalized recommendations to help you save more.",
  },
];

// Testimonials Data
export const testimonialsData = [
  {
    name: "Sarah Johnson",
    role: "Small Business Owner",
    image: "https://randomuser.me/api/portraits/women/75.jpg",
    quote:
      "Finnova transformed how I manage my business finances. The AI insights helped me find cost-saving opportunities I never knew existed.",
  },
  {
    name: "Michael Chen",
    role: "Freelancer",
    image: "https://randomuser.me/api/portraits/men/75.jpg",
    quote:
      "The receipt scanning feature saves me hours each month. I finally have a clear picture of where every dollar goes — without the manual work.",
  },
  {
    name: "Emily Rodriguez",
    role: "Financial Advisor",
    image: "https://randomuser.me/api/portraits/women/74.jpg",
    quote:
      "I recommend Finnova to all my clients. The multi-currency support and detailed analytics make it perfect for international portfolios.",
  },
];
