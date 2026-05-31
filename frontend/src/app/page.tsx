"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bot,
  Brain,
  CheckCircle,
  Cpu,
  Database,
  FileText,
  Layers,
  LineChart as ChartIcon,
  MessageSquare,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";

import { FloatingIconsHero, type FloatingIconsHeroProps } from "../components/ui/floating-icons-hero-section";

const heroIcons: FloatingIconsHeroProps["icons"] = [
  { id: 1, icon: Database, className: "top-[10%] left-[8%]" },
  { id: 2, icon: ShieldCheck, className: "top-[18%] right-[10%]" },
  { id: 3, icon: Activity, className: "top-[76%] left-[11%]" },
  { id: 4, icon: Search, className: "bottom-[12%] right-[12%]" },
  { id: 5, icon: FileText, className: "top-[5%] left-[28%]" },
  { id: 6, icon: MessageSquare, className: "top-[7%] right-[28%]" },
  { id: 7, icon: Sparkles, className: "bottom-[8%] left-[25%]" },
  { id: 8, icon: Cpu, className: "top-[40%] left-[14%]" },
  { id: 9, icon: Terminal, className: "top-[72%] right-[24%]" },
  { id: 10, icon: ChartIcon, className: "top-[25%] right-[18%]" },
  { id: 11, icon: Bot, className: "top-[54%] left-[6%]" },
  { id: 12, icon: Brain, className: "top-[58%] right-[6%]" },
];

const capabilityCards = [
  {
    icon: Database,
    title: "Ingest any mix of files",
    description:
      "CSV sheets, text logs, and structured exports land in one pipeline so analysts do not have to normalize data by hand.",
  },
  {
    icon: Layers,
    title: "Clean and align signals",
    description:
      "Timestamp repair, null handling, and tag normalization prepare every dataset for accurate correlation across sources.",
  },
  {
    icon: MessageSquare,
    title: "Explain the root cause",
    description:
      "ARCA turns statistical anomalies into plain-English findings, then follows up with a chat interface for investigation.",
  },
];

const pipelineSteps = [
  {
    step: "01",
    icon: Database,
    title: "Upload evidence",
    description: "Drop in messy operational files, sample data, or archived incident logs.",
  },
  {
    step: "02",
    icon: Search,
    title: "Correlate patterns",
    description: "Statistical checks and semantic search narrow the probable failure window.",
  },
  {
    step: "03",
    icon: Cpu,
    title: "Generate findings",
    description: "The assistant summarizes anomalies, probable causes, and recommended next actions.",
  },
  {
    step: "04",
    icon: MessageSquare,
    title: "Iterate with chat",
    description: "Teams can ask follow-up questions and trace supporting evidence from the session.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground font-sans antialiased selection:bg-zinc-800 selection:text-zinc-100 bg-dot-grid">
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] ambient-glow -translate-y-1/2" />
      <div className="absolute top-[40%] right-1/4 w-[800px] h-[500px] ambient-glow" style={{ opacity: 0.7 }} />
      <div className="absolute bottom-0 left-1/3 w-[700px] h-[400px] ambient-glow translate-y-1/3" />

      <header className="sticky top-0 z-50 w-full border-b border-zinc-900/60 bg-[#030307]/75 backdrop-blur-md px-6 md:px-12 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded blur opacity-30 group-hover:opacity-60 transition duration-300"></div>
            <img
              src="/logo.png"
              alt="Meshloop Logo"
              className="relative w-8 h-8 rounded-lg object-cover border border-zinc-800/80 bg-zinc-950"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-tight text-white leading-none">Meshloop</span>
            <span className="text-[9px] text-zinc-500 font-mono mt-0.5">ARCA Platform</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/docs" className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors font-medium">
            Docs
          </Link>
          <Link
            href="/app"
            className="glow-btn-primary bg-white text-zinc-950 text-xs font-bold px-4 py-2 rounded-full transition-all duration-300"
          >
            Launch Console
          </Link>
        </div>
      </header>

      <main className="relative z-10">
        <FloatingIconsHero
          title="Fusing database metrics with server logs to diagnose outages."
          subtitle="Meshloop ARCA statistically parses sheets, correlates anomalies with unstructured logs, and explains infrastructure failures in plain English."
          ctaText="Launch Diagnostic Console"
          ctaHref="/app"
          icons={heroIcons}
        />

        <section className="relative border-t border-zinc-900/80 bg-zinc-900/10 px-6 py-20 md:px-12">
          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-3">
            {capabilityCards.map((card) => (
              <div
                key={card.title}
                className="glass-card rounded-2xl border border-zinc-900/80 p-6 transition-all duration-300 hover:border-white/15"
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-indigo-300">
                  <card.icon className="h-5 w-5" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wide text-white">{card.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">{card.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="relative border-t border-zinc-900/80 px-6 py-24 md:px-12">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 max-w-2xl">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">How it works</span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
                A compact pipeline for incident triage.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-zinc-400">
                The landing page now mirrors the product flow: gather evidence, clean it, correlate it, then explain the incident with a chat-ready summary.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {pipelineSteps.map((step) => (
                <div key={step.step} className="glass-card rounded-2xl border border-zinc-900/80 p-6">
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-zinc-500">
                    <span>{step.step}</span>
                    <step.icon className="h-4 w-4 text-indigo-300" />
                  </div>
                  <h3 className="mt-6 text-sm font-bold uppercase tracking-wide text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-400">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative border-t border-zinc-900/80 bg-zinc-950/40 px-6 py-24 md:px-12">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1.25fr_0.75fr]">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Built for the stack</span>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">
                The UI is shaped for review, not just display.
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-zinc-400">
                The remaining sections keep the same dark diagnostic tone, but shift from a dashboard mock to a clearer product narrative with modular cards and direct calls to action.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  "GitHub Models API",
                  "Microsoft Phi-4",
                  "Semantic Kernel SDK",
                  "FastAPI backend",
                  "Tailwind CSS + TypeScript",
                ].map((label) => (
                  <span
                    key={label}
                    className="rounded-full border border-zinc-900 bg-zinc-950 px-4 py-1.5 text-[10px] font-semibold text-zinc-400"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-3xl border border-zinc-900/80 p-6 md:p-8">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Radar className="h-4 w-4 text-emerald-400" />
                <span>Product summary</span>
              </div>
              <div className="mt-6 space-y-4 text-sm text-zinc-400">
                <div className="flex items-start gap-3 rounded-2xl border border-zinc-900/80 bg-zinc-950/80 p-4">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400" />
                  <p>Upload noisy files and let the pipeline normalize them automatically.</p>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-zinc-900/80 bg-zinc-950/80 p-4">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400" />
                  <p>Compare metrics and logs inside a single forensic workspace.</p>
                </div>
                <div className="flex items-start gap-3 rounded-2xl border border-zinc-900/80 bg-zinc-950/80 p-4">
                  <CheckCircle className="mt-0.5 h-4 w-4 text-emerald-400" />
                  <p>Ask follow-up questions and trace the root cause without leaving the session.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative border-t border-zinc-900/60 px-6 py-20 md:px-12">
          <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-8 rounded-3xl border border-zinc-900/80 bg-zinc-950/60 p-8 md:flex-row md:items-center md:p-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">Ready to inspect an incident</p>
              <h2 className="mt-3 text-2xl font-black tracking-tight text-white md:text-3xl">
                Jump into the console or read the docs.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/app"
                className="glow-btn-primary inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-zinc-950 transition-all duration-300"
              >
                Launch Console <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs"
                className="glow-btn-secondary inline-flex items-center justify-center rounded-full border border-zinc-800 bg-zinc-900/60 px-6 py-3 text-sm font-semibold text-zinc-300 transition-all duration-300"
              >
                Read Technical Docs
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-zinc-900/60 bg-[#030307]/90 px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-6 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">
            © 2026 Meshloop ARCA. All rights reserved. Automated operations forensics.
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs font-medium">
          <Link href="/docs" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            Docs
          </Link>
          <Link href="/terms" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-zinc-500 hover:text-zinc-300 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </footer>
    </div>
  );
}