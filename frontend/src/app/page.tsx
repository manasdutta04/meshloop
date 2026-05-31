"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bot,
  Brain,
  CheckCircle,
  Database,
  FileText,
  Layers,
  MessageSquare,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  Terminal,
  Workflow,
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
  { id: 8, icon: Brain, className: "top-[40%] left-[14%]" },
  { id: 9, icon: Terminal, className: "top-[72%] right-[24%]" },
];

const stats = [
  { label: "Signals unified", value: "3 data types" },
  { label: "Root-cause speed", value: "Minutes, not hours" },
  { label: "Best for", value: "Ops, analytics, support" },
];

const features = [
  {
    icon: Database,
    title: "Bring in messy data",
    description:
      "CSV, Excel, JSON, and logs flow through one pipeline so teams stop context-switching between tools.",
  },
  {
    icon: Layers,
    title: "Clean the signal",
    description:
      "The app normalizes timestamps, metrics, and tags before any analysis is run.",
  },
  {
    icon: MessageSquare,
    title: "Explain the why",
    description:
      "ARCA turns anomalies into a plain-English incident brief with follow-up questions built in.",
  },
];

const steps = [
  {
    step: "01",
    title: "Upload evidence",
    text: "Drop in datasets and logs from an incident or a sample run.",
  },
  {
    step: "02",
    title: "Find the anomaly",
    text: "The pipeline detects spikes, drops, and suspicious patterns.",
  },
  {
    step: "03",
    title: "Link the cause",
    text: "Relevant log lines and metadata are matched to the time window.",
  },
  {
    step: "04",
    title: "Ship the answer",
    text: "The final report is written clearly enough for operators and leadership.",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground antialiased selection:bg-zinc-800 selection:text-zinc-100 bg-dot-grid">
      <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]" />
      <div className="absolute top-[-120px] left-[-120px] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,_rgba(129,140,248,0.18),_transparent_70%)] blur-3xl" />
      <div className="absolute bottom-[-140px] right-[-90px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,_rgba(244,244,245,0.10),_transparent_65%)] blur-3xl" />

      <header className="sticky top-0 z-50 border-b border-white/6 bg-[#030307]/72 backdrop-blur-xl font-ui">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-white/40 via-white/10 to-transparent blur-sm" />
              <img
                src="/logo.png"
                alt="Meshloop Logo"
                className="relative h-9 w-9 rounded-xl border border-white/10 object-cover"
              />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-[0.22em] text-white uppercase">Meshloop</div>
              <div className="text-[10px] tracking-[0.28em] text-zinc-500 uppercase">Autonomous Root-Cause Analyst</div>
            </div>
          </Link>

          <div className="flex items-center gap-3 text-xs font-medium tracking-[0.18em] uppercase">
            <Link href="/docs" className="text-zinc-400 transition-colors hover:text-white">
              Docs
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white px-4 py-2 text-[11px] font-semibold text-zinc-950 transition-transform duration-300 hover:-translate-y-0.5"
            >
              Launch Console <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="relative overflow-hidden border-b border-white/6">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.035),transparent_32%)]" />
          <FloatingIconsHero
            title="From noisy files to a clear root cause."
            subtitle="Meshloop ARCA blends metrics, logs, and conversational analysis into a single product experience for operators who need answers fast."
            ctaText="Try the Console"
            ctaHref="/app"
            icons={heroIcons}
            className="min-h-[780px]"
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
        </section>

        <section className="border-b border-white/6 px-6 py-8 font-ui md:px-10">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/8 bg-white/3 p-5 backdrop-blur-sm">
                <div className="text-[10px] uppercase tracking-[0.28em] text-zinc-500">{stat.label}</div>
                <div className="mt-2 text-sm font-semibold text-white">{stat.value}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 py-20 md:px-10">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-400 font-ui">
                <Sparkles className="h-3.5 w-3.5 text-white" /> Built for incident response
              </div>
              <h2 className="mt-6 max-w-2xl font-serif-ui text-4xl leading-[0.95] tracking-[-0.03em] text-white md:text-6xl">
                A startup-grade operating layer for messy operational data.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 font-ui">
                The homepage is now positioned like a real product: a single clear promise, a fast path to the console, and enough proof to make the value obvious in seconds.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 font-ui">
                {[
                  "Metric anomaly detection",
                  "Log correlation",
                  "RAG chat follow-ups",
                  "Forensic reporting",
                ].map((pill) => (
                  <span
                    key={pill}
                    className="rounded-full border border-white/8 bg-white/4 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-300"
                  >
                    {pill}
                  </span>
                ))}
              </div>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row font-ui">
                <Link
                  href="/app"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-950 transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Launch Console <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/docs"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/4 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-white/8"
                >
                  Read the system
                </Link>
              </div>
            </div>

            <div className="grid gap-4 self-start rounded-[32px] border border-white/8 bg-white/4 p-5 backdrop-blur-xl md:p-6">
              <div className="rounded-[28px] border border-white/8 bg-[#080b12] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.26em] text-zinc-500 font-ui">
                  <span>Live incident brief</span>
                  <span>Session 048x</span>
                </div>
                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-rose-500/15 bg-rose-500/6 p-4">
                    <Activity className="h-4 w-4 text-rose-400" />
                    <div>
                      <div className="text-sm text-white font-ui">Write latency spiked 410%</div>
                      <div className="text-xs text-zinc-500 font-ui">Detected across the East region at 14:02 UTC</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-indigo-500/15 bg-indigo-500/6 p-4">
                    <Search className="h-4 w-4 text-indigo-300" />
                    <div>
                      <div className="text-sm text-white font-ui">Matched to pool exhaustion logs</div>
                      <div className="text-xs text-zinc-500 font-ui">Exact timestamp overlap, same deployment window</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/15 bg-emerald-500/6 p-4">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <div>
                      <div className="text-sm text-white font-ui">Root cause explained clearly</div>
                      <div className="text-xs text-zinc-500 font-ui">Incident summary is ready for leadership and ops</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[24px] border border-white/8 bg-[#0b0f16] p-4">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-ui">Confidence</div>
                  <div className="mt-2 text-2xl font-semibold text-white font-serif-ui">98.4%</div>
                </div>
                <div className="rounded-[24px] border border-white/8 bg-[#0b0f16] p-4">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-ui">Cleanup</div>
                  <div className="mt-2 text-2xl font-semibold text-white font-serif-ui">12 fixes</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/6 bg-white/[0.02] px-6 py-20 md:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-zinc-500 font-ui">What ships</div>
              <h2 className="mt-4 font-serif-ui text-3xl leading-[0.98] tracking-[-0.03em] text-white md:text-5xl">
                Everything a startup needs to turn raw telemetry into a repeatable product.
              </h2>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {features.map((feature) => (
                <article
                  key={feature.title}
                  className="rounded-[28px] border border-white/8 bg-[#070b12] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition-transform duration-300 hover:-translate-y-1"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-white/5 text-white">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-serif-ui text-2xl tracking-[-0.02em] text-white">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400 font-ui">{feature.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 py-20 md:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-zinc-500 font-ui">How it works</div>
                <h2 className="mt-4 font-serif-ui text-3xl leading-[0.98] tracking-[-0.03em] text-white md:text-5xl">
                  A simple path from upload to answer.
                </h2>
              </div>
              <p className="max-w-lg text-sm leading-7 text-zinc-400 font-ui">
                The interface now behaves like a real startup homepage: clear promise, clear proof, and a clear next step.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {steps.map((step) => (
                <div key={step.step} className="rounded-[24px] border border-white/8 bg-white/4 p-5 font-ui">
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-zinc-500">
                    <span>{step.step}</span>
                    <Workflow className="h-4 w-4 text-white/70" />
                  </div>
                  <h3 className="mt-5 font-semibold uppercase tracking-[0.18em] text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 pb-24 md:px-10">
          <div className="mx-auto max-w-7xl rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-zinc-500 font-ui">Designed for teams</div>
                <h2 className="mt-4 font-serif-ui text-3xl leading-[0.98] tracking-[-0.03em] text-white md:text-5xl">
                  The message is simple: upload the mess, get the answer.
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400 font-ui">
                  This page now speaks like a startup product instead of a lab prototype. The copy is tighter, the hierarchy is stronger, and the visuals focus on confidence and clarity.
                </p>
              </div>

              <div className="grid gap-3 font-ui">
                {[
                  "Metric anomaly detection",
                  "Log correlation across time windows",
                  "Chat follow-up with citations",
                  "Forensic report export",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-[#0b0f16] p-4">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm text-white">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/6 px-6 py-20 md:px-10 font-ui">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-[32px] border border-white/8 bg-white/4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-zinc-500">Ready to launch</div>
              <h2 className="mt-3 font-serif-ui text-3xl tracking-[-0.03em] text-white md:text-4xl">
                Start with the console, then read the docs.
              </h2>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-zinc-950 transition-transform duration-300 hover:-translate-y-0.5"
              >
                Launch Console <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/4 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:bg-white/8"
              >
                Read Technical Docs
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/6 bg-[#020306] px-6 py-8 font-ui md:px-10 lg:py-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[1.35fr_0.7fr_0.7fr_0.85fr] lg:gap-10">
            <div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-br from-white/25 to-transparent blur-sm" />
                  <img
                    src="/logo.png"
                    alt="Meshloop Logo"
                    className="relative h-10 w-10 rounded-xl border border-white/10 object-cover"
                  />
                </div>
                <div>
                  <div className="text-sm font-semibold tracking-[0.22em] text-white uppercase">Meshloop</div>
                  <div className="text-[10px] tracking-[0.28em] text-zinc-500 uppercase">Incident intelligence for modern teams</div>
                </div>
              </div>

              <p className="mt-5 max-w-md text-sm leading-7 text-zinc-400">
                Meshloop turns noisy metrics and logs into one clear incident narrative, so teams can move from detection to decision without leaving the console.
              </p>

            </div>

            <div className="pt-1">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white">Company</h3>
              <div className="mt-4 flex flex-col gap-2.5 text-sm text-zinc-400">
                <Link href="/" className="transition-colors hover:text-white">Home</Link>
                <Link href="/docs" className="transition-colors hover:text-white">Docs</Link>
                <Link href="/app" className="transition-colors hover:text-white">Console</Link>
                <Link href="/privacy" className="transition-colors hover:text-white">Privacy</Link>
              </div>
            </div>

            <div className="pt-1">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white">Platform</h3>
              <div className="mt-4 flex flex-col gap-2.5 text-sm text-zinc-400">
                <span>Metric analysis</span>
                <span>Log correlation</span>
                <span>Incident briefs</span>
                <span>Chat follow-ups</span>
              </div>
            </div>

            <div className="pt-1">
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white">Resources</h3>
              <div className="mt-4 flex flex-col gap-2.5 text-sm text-zinc-400">
                <Link href="/terms" className="transition-colors hover:text-white">Terms</Link>
                <Link href="/docs" className="transition-colors hover:text-white">Architecture</Link>
                <Link href="/app" className="transition-colors hover:text-white">Launch App</Link>
                <span>Support: ops@meshloop.local</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-white/6 pt-5 text-[10px] uppercase tracking-[0.24em] text-zinc-500 md:flex-row md:items-center md:justify-between">
            <span>© 2026 Meshloop ARCA. Built for teams that need answers fast.</span>
            <span>Autonomous root-cause analysis for metrics, logs, and incident response.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}