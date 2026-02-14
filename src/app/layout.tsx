import type { Metadata } from "next";
import "./globals.css";

// Google Fonts (Inter + Oswald) will be loaded via next/font/google
// when deploying to Vercel. For local dev, the CSS @theme fallback
// stacks (system-ui, sans-serif) are used automatically.
//
// To enable Google Fonts, uncomment the imports in this file and
// add the className variables to <html>. See:
// https://nextjs.org/docs/app/building-your-application/optimizing/fonts

export const metadata: Metadata = {
  title: "Jammy",
  description: "Shared jam tracker for bass + drums",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
