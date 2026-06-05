import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LearnXPlan - AI Academic Performance Prediction & habit Insights",
  description: "Leverage LightGBM machine learning models, SHAP explainable AI, and context-aware LLM mentoring to optimize academic pathways.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="antialiased selection:bg-indigo-500 selection:text-white bg-slate-950 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}

