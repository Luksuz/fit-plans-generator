import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FitFuel - AI Meal Planner & Recipe Generator",
  description: "Create personalized meal plans and recipe books with AI, complete with beautiful images and PDF exports",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-brand-light">
        {children}
      </body>
    </html>
  );
}

