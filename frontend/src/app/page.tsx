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
import { Header } from "../components/ui/header-2";

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
  { label: "AI Orchestration", value: "Semantic Kernel" },
  { label: "Root-cause speed", value: "Seconds, not hours" },
  { label: "Model Router", value: "Cloud or Local LLMs" },
];

const features = [
  {
    icon: Database,
    title: "Zero-Overhead Ingestion",
    description:
      "Upload raw metrics CSVs, developer log TXT/PDF dumps, customer support tickets, or a single unified ZIP archive.",
  },
  {
    icon: Layers,
    title: "Telemetry Sanitization",
    description:
      "The engine normalizes timestamp formats, handles null-value imputation, cleans categories, and balances imbalanced categories for downstream ML.",
  },
  {
    icon: Bot,
    title: "Agent Debate Consensus",
    description:
      "Orchestrates a collaborative panel of virtual SREs (Discovery, Validator, Synthesis) to challenge assumptions and isolate root causes.",
  },
];

const steps = [
  {
    step: "01",
    title: "Upload Telemetry",
    text: "Drop in incident metrics, logs, configuration files, or run our automated Black Friday generator zip.",
  },
  {
    step: "02",
    title: "Outlier Isolation",
    text: "Runs IQR outlier detection and chronological drop checks to identify service degradation windows.",
  },
  {
    step: "03",
    title: "Temporal Correlation",
    text: "Queries ChromaDB vector store for log entries matching the exact timeframe and region metadata.",
  },
  {
    step: "04",
    title: "SRE Agent Debate",
    text: "Discovery and Validator agents debate findings, and the Synthesis agent compiles a certified forensic verdict.",
  },
];

const userGroups = [
  {
    title: "SRE & Platform Teams",
    pain: "Downtime operational context is scattered across metrics, developer logs, and support ticket queues during outages.",
    value: "Meshloop unifies structured telemetry and unstructured logs into a single forensic timeline with traceable citations.",
  },
  {
    title: "AI & Data Engineers",
    pain: "Metric and log datasets have inconsistent schemas, timestamp formats, and high class imbalances, halting model training.",
    value: "ARCA auto-sanitizes operational feeds and exports perfectly balanced, clean datasets for predictive ML models.",
  },
  {
    title: "Security & Operations Leaders",
    pain: "Sending sensitive production telemetry and access logs to external cloud APIs violates strict enterprise compliance.",
    value: "With Zero-Trust browser-side credential routing and full offline Ollama support, operational data never leaves your environment.",
  },
];

const securityPoints = [
  "Zero-Trust: API credentials stored securely in browser local storage only",
  "Air-Gapped: Full offline local inference via local Ollama models",
  "Audited Results: Traceable source citations pointing to exact log files",
];

const plans = [
  {
    name: "Community",
    price: "$0",
    detail: "For evaluation, developers, and hackathon judges",
    features: ["Local/Cloud AI endpoints", "Agent debate logs", "Black Friday sandbox", "Forensic Q&A room"],
    cta: "Start Free",
  },
  {
    name: "Enterprise",
    price: "Custom",
    detail: "For production platforms and incident compliance",
    features: ["Dedicated local agents", "Continuous telemetry parsing", "Auto-mitigation playbooks"],
    cta: "Contact Team",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground antialiased selection:bg-zinc-800 selection:text-zinc-100 bg-dot-grid">
      <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]" />
      <div className="absolute top-[-120px] left-[-120px] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,_rgba(129,140,248,0.18),_transparent_70%)] blur-3xl" />
      <div className="absolute bottom-[-140px] right-[-90px] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,_rgba(244,244,245,0.10),_transparent_65%)] blur-3xl" />

      <Header />

      <main className="relative z-10">
        <section className="relative overflow-hidden border-b border-white/6">
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.035),transparent_32%)]" />
          <FloatingIconsHero
            title="From noisy files to a clear root cause."
            subtitle="An AI-native engine fusing telemetry metrics and system logs via Microsoft Semantic Kernel to diagnose outages in seconds."
            ctaText="Try the Console"
            ctaHref="/app"
            icons={heroIcons}
            className="min-h-[780px]"
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
        </section>

        <section className="border-b border-white/6 px-6 py-14 md:px-10">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div className="font-ui">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-300">
                Daily Operations Layer
              </span>
              <h2 className="mt-5 font-serif-ui text-3xl leading-[1.02] tracking-[-0.03em] text-white md:text-5xl">
                What teams do in Meshloop after every alert.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400">
                Instead of jumping across disconnected telemetry dashboards and log viewers, responders drop raw incident data into ARCA to automatically clean, correlate, and debate the cause.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Input</p>
                  <p className="mt-2 text-sm font-semibold text-white">ZIP or Raw Logs</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Analysis</p>
                  <p className="mt-2 text-sm font-semibold text-white">Multi-Agent Debate</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Output</p>
                  <p className="mt-2 text-sm font-semibold text-white">Certified Root Cause</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 font-ui md:grid-cols-2">
              <article className="rounded-3xl border border-emerald-500/25 bg-emerald-500/8 p-5 md:col-span-2">
                <p className="text-[10px] uppercase tracking-[0.22em] text-emerald-300">Detect</p>
                <h3 className="mt-2 text-lg font-semibold text-white">Isolate chronological anomalies</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-200/90">Auto-discovery identifies statistical outliers (IQR) and rolling median drops over 30% in metrics.</p>
              </article>
              <article className="rounded-3xl border border-indigo-500/25 bg-indigo-500/8 p-5">
                <p className="text-[10px] uppercase tracking-[0.22em] text-indigo-300">Correlate</p>
                <h3 className="mt-2 text-base font-semibold text-white">Filter logs by region</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-200/90">Queries ChromaDB for logs matching the exact anomaly timeframe and regional tags.</p>
              </article>
              <article className="rounded-3xl border border-white/15 bg-white/6 p-5">
                <p className="text-[10px] uppercase tracking-[0.22em] text-zinc-300">Debate</p>
                <h3 className="mt-2 text-base font-semibold text-white">Challenge assumptions</h3>
                <p className="mt-2 text-sm leading-7 text-zinc-200/90">Virtual agents debate timing gaps to rule out false correlations and hallucinations.</p>
              </article>
            </div>
          </div>
        </section>

        <section id="product" className="px-6 py-20 md:px-10">
          <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-zinc-400 font-ui">
                <Sparkles className="h-3.5 w-3.5 text-white" /> Built for modern DevOps & SRE
              </div>
              <h2 className="mt-6 max-w-2xl font-serif-ui text-4xl leading-[0.95] tracking-[-0.03em] text-white md:text-6xl">
                An enterprise-grade operating layer for messy operational telemetry.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-7 text-zinc-400 font-ui">
                Ingest CSVs, logs, configs, and ticket queues into a unified console. Powered by Microsoft's Semantic Kernel, ARCA detects outlier windows, runs an SRE debate loop, and drafts interactive postmortem reports.
              </p>

              <div className="mt-8 flex flex-wrap gap-3 font-ui">
                {[
                  "Semantic Kernel Orchestration",
                  "Multi-Agent SRE Debate",
                  "ChromaDB Vector Storage",
                  "Chronological Drop Detection",
                  "BYO-Key Model Router",
                  "Ollama Local Inference",
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
                  Read Technical Docs
                </Link>
              </div>
            </div>

            <div className="grid gap-4 self-start rounded-[32px] border border-white/8 bg-white/4 p-5 backdrop-blur-xl md:p-6">
              <div className="rounded-[28px] border border-white/8 bg-[#080b12] p-5 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.26em] text-zinc-500 font-ui">
                  <span>Live incident brief</span>
                  <span>Session Black-Friday-Sandbox</span>
                </div>
                <div className="mt-5 space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl border border-rose-500/15 bg-rose-500/6 p-4">
                    <Activity className="h-4 w-4 text-rose-400" />
                    <div>
                      <div className="text-sm text-white font-ui">Checkout Latency spiked to 8400ms</div>
                      <div className="text-xs text-zinc-500 font-ui">Detected in East region at 02:11 UTC</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-indigo-500/15 bg-indigo-500/6 p-4">
                    <Search className="h-4 w-4 text-indigo-300" />
                    <div>
                      <div className="text-sm text-white font-ui">Matched db_error_logs & deployment_log</div>
                      <div className="text-xs text-zinc-500 font-ui">Replication reserve error & database connection slot exhaustion</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/15 bg-emerald-500/6 p-4">
                    <CheckCircle className="h-4 w-4 text-emerald-400" />
                    <div>
                      <div className="text-sm text-white font-ui">SRE Agent Consensus Verdict compiled</div>
                      <div className="text-xs text-zinc-500 font-ui">Synthesis Agent: database connection pool expansion storm detected</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[24px] border border-white/8 bg-[#0b0f16] p-4">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-ui">Confidence Score</div>
                  <div className="mt-2 text-2xl font-semibold text-white font-serif-ui">91.0%</div>
                </div>
                <div className="rounded-[24px] border border-white/8 bg-[#0b0f16] p-4">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-zinc-500 font-ui">Forensic Artifacts</div>
                  <div className="mt-2 text-2xl font-semibold text-white font-serif-ui">5 compiled</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="border-y border-white/6 bg-white/[0.02] px-6 py-20 md:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-zinc-500 font-ui">Core features</div>
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
                Four clear stages keep teams aligned, from raw evidence to a shareable decision-ready summary.
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

        <section id="security" className="px-6 py-12 md:px-10">
          <div className="mx-auto max-w-7xl rounded-[32px] border border-white/8 bg-[#070b12] p-6 md:p-8">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-zinc-500 font-ui">Security and governance</div>
                <h2 className="mt-4 font-serif-ui text-3xl leading-[0.98] tracking-[-0.03em] text-white md:text-5xl">
                  Built for accountable incident operations.
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400 font-ui">
                  Every generated answer can be traced to sources, exported, and reviewed by engineering, support, and leadership.
                </p>
              </div>

              <div className="grid gap-3 font-ui">
                {securityPoints.map((item) => (
                  <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/8 bg-[#0b0f16] p-4">
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span className="text-sm text-white">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="users" className="px-6 py-14 md:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-zinc-500 font-ui">Users</div>
              <h2 className="mt-4 font-serif-ui text-3xl leading-[0.98] tracking-[-0.03em] text-white md:text-5xl">
                Built for teams that own uptime and incident outcomes.
              </h2>
            </div>
            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {userGroups.map((item) => (
                <article key={item.title} className="rounded-[28px] border border-white/8 bg-white/4 p-6">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.24em] text-zinc-500 font-ui">{item.title}</div>
                  <p className="mt-4 text-sm leading-7 text-zinc-400 font-ui">{item.pain}</p>
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-emerald-300 font-ui">Outcome</div>
                    <p className="mt-2 text-sm leading-7 text-zinc-200 font-ui">{item.value}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="px-6 pb-24 md:px-10">
          <div className="mx-auto max-w-7xl rounded-[32px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-6 md:p-10">
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.32em] text-zinc-500 font-ui">Pricing</div>
                <h2 className="mt-4 font-serif-ui text-3xl leading-[0.98] tracking-[-0.03em] text-white md:text-5xl">
                  Plans that scale from pilot to production.
                </h2>
                <p className="mt-5 max-w-xl text-sm leading-7 text-zinc-400 font-ui">
                  Start with the free experience, then move to team workflows with collaboration and support.
                </p>
              </div>

              <div className="grid gap-3 font-ui md:grid-cols-2">
                {plans.map((plan) => (
                  <article key={plan.name} className="rounded-2xl border border-white/8 bg-[#0b0f16] p-5">
                    <div className="text-xs uppercase tracking-[0.24em] text-zinc-500">{plan.name}</div>
                    <div className="mt-2 font-serif-ui text-3xl text-white">{plan.price}</div>
                    <p className="mt-2 text-sm text-zinc-400">{plan.detail}</p>
                    <div className="mt-4 space-y-2 text-sm text-zinc-300">
                      {plan.features.map((f) => (
                        <div key={f} className="flex items-center gap-2">
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                    <button className="mt-5 w-full rounded-full border border-white/15 bg-white/6 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/12">
                      {plan.cta}
                    </button>
                  </article>
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
                <img src="/logo.png" alt="Meshloop Logo" className="h-10 w-10 object-contain" />
                <div>
                  <div className="font-serif-ui text-xl tracking-[-0.01em] text-white">Meshloop</div>
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
                <span>Support: meshloop@example.com</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 border-t border-white/6 pt-5 md:flex-row md:items-center md:justify-between">
            <span className="text-[10px] uppercase tracking-[0.24em] text-zinc-500">© 2026 Meshloop</span>

            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-zinc-500">
              <span>Cooked by</span>

              <a
                href="https://github.com/manasdutta04"
                target="_blank"
                rel="noreferrer"
                className="group relative flex h-8 w-8 items-center justify-center"
                aria-label="manas dutta on GitHub"
              >
                <img
                  src="https://avatars.githubusercontent.com/u/122201926?v=4"
                  alt="manas dutta"
                  className="h-8 w-8 rounded-full border border-white/10 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="pointer-events-none absolute -top-11 left-1/2 z-20 w-max -translate-x-1/2 rounded-full border border-white/10 bg-[#05070c] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                  manas
                </span>
              </a>

              <a
                href="https://github.com/priya369-ps"
                target="_blank"
                rel="noreferrer"
                className="group relative flex h-8 w-8 items-center justify-center"
                aria-label="priya on GitHub"
              >
                <img
                  src="https://avatars.githubusercontent.com/u/253213951?v=4"
                  alt="priya"
                  className="h-8 w-8 rounded-full border border-white/10 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <span className="pointer-events-none absolute -top-11 left-1/2 z-20 w-max -translate-x-1/2 rounded-full border border-white/10 bg-[#05070c] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                  priya
                </span>
              </a>

              <span>&</span>

              <span className="group relative flex h-8 w-8 items-center justify-center" aria-label="Claude">
                <img
                  src="/claude-color.webp"
                  alt="Claude"
                  className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <span className="pointer-events-none absolute -top-11 left-1/2 z-20 w-max -translate-x-1/2 rounded-full border border-white/10 bg-[#05070c] px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
                  Claude
                </span>
              </span>
            </div>

            
          </div>
        </div>
      </footer>
    </div>
  );
}