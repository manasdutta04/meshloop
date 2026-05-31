import { Geist, Instrument_Serif } from "next/font/google";
import "./globals.css";
import React from "react";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Meshloop ARCA — Autonomous Root-Cause Analyst",
  description: "Fusing structured database metrics with unstructured logs to autonomously diagnose operational failures.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${geistSans.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground flex flex-col font-serif-ui">
        {children}
      </body>
    </html>
  );
}
