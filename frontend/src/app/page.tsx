"use client";

import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  Search, 
  LineChart as ChartIcon, 
  MessageSquare, 
  FileText, 
  Activity, 
  Layers,
  Cpu,
  Terminal,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  Database
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#030307] text-zinc-100 font-sans antialiased selection:bg-zinc-800 selection:text-zinc-100 bg-dot-grid">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] ambient-glow -translate-y-1/2" />
      <div className="absolute top-[40%] right-1/4 w-[800px] h-[500px] ambient-glow" style={{ opacity: 0.7 }} />
      <div className="absolute bottom-0 left-1/3 w-[700px] h-[400px] ambient-glow translate-y-1/3" />

      {/* NAVBAR */}
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

      {/* HERO SECTION */}
      <section className="relative max-w-5xl mx-auto px-6 pt-24 pb-20 md:pt-32 md:pb-28 text-center flex flex-col items-center z-10 animate-fade-in-up">
        
        {/* Microsoft Build Badge */}
        <div className="inline-flex items-center gap-2 bg-zinc-900/80 border border-zinc-800/60 px-4 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider text-indigo-300 mb-8 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" /> Microsoft Build AI Hackathon 2026
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-[1.1] max-w-4xl">
          Fusing Database Metrics with <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Server Logs</span> to Diagnose Outages.
        </h1>

        {/* Description */}
        <p className="text-sm md:text-base text-zinc-400 max-w-2xl leading-relaxed mb-10">
          Meshloop ARCA (Autonomous Root-Cause Analyst) statistically parses database sheets, correlates performance drops with unstructured developer logs, and explains infrastructure failures in plain English.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
          <Link 
            href="/app" 
            className="glow-btn-primary w-full sm:w-auto bg-white text-zinc-950 font-bold text-xs px-8 py-3.5 rounded-full flex items-center justify-center gap-2 transition-all duration-300"
          >
            Launch Diagnostic Console <ArrowRight className="w-4 h-4 text-zinc-950" />
          </Link>
          <Link 
            href="/docs" 
            className="glow-btn-secondary w-full sm:w-auto bg-zinc-900/60 border border-zinc-800/80 text-zinc-300 font-semibold text-xs px-8 py-3.5 rounded-full transition-all duration-300 text-center"
          >
            Read Technical Docs
          </Link>
        </div>

        {/* Interactive dashboard mock preview */}
        <div className="w-full mt-16 p-2 rounded-2xl border border-zinc-900 bg-zinc-950/20 backdrop-blur-md shadow-2xl relative">
          <div className="absolute -inset-0.5 bg-gradient-to-b from-zinc-800 to-zinc-950 rounded-2xl blur opacity-10"></div>
          <div className="relative rounded-xl border border-zinc-800/80 bg-zinc-950/90 overflow-hidden">
            <div className="h-10 border-b border-zinc-900 bg-zinc-950 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
                <span className="text-[10px] text-zinc-600 font-mono ml-2">arca-diagnostic-session_048x.log</span>
              </div>
              <span className="text-[10px] text-zinc-600 font-mono">http://localhost:3000/app</span>
            </div>
            
            <div className="p-6 md:p-8 text-left grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Activity className="w-4 h-4 text-rose-500" />
                  <span>Outage Analysis Result: Anomaly detected on 2026-05-28</span>
                </div>
                <div className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-900 font-mono text-[11px] text-zinc-400 space-y-2 leading-relaxed">
                  <p className="text-rose-400 font-bold">&gt;&gt; STATISTICAL ANOMALY DETECTED</p>
                  <p>• Region: us-east-1 | Metric: WriteLatency | Change: +410% spikes</p>
                  <p className="text-indigo-400 font-bold">&gt;&gt; SERVER LOG CO-RELATION</p>
                  <p>• Timestamp: 14:02:18 UTC | [DB_POOL] Error: Connection pool exhausted (max 100/100 limit hit)</p>
                  <p className="text-emerald-400 font-bold">&gt;&gt; ROOT CAUSE INTERPRETATION</p>
                  <p>• Analysis: Peak analytical queries deployed at 14:00 did not release connections due to missing context timeouts, triggering write timeouts.</p>
                </div>
              </div>
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Diagnostics Status</span>
                <div className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-900 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Auto Cleans Applied</span>
                    <span className="text-emerald-400 font-semibold font-mono">12 Fixed</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Correlated Logs</span>
                    <span className="text-zinc-300 font-semibold font-mono">2,490 Rows</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Confidence Match</span>
                    <span className="text-indigo-400 font-semibold font-mono">98.4%</span>
                  </div>
                  <div className="w-full bg-emerald-500/10 text-emerald-400 text-[10px] py-1 px-2.5 rounded border border-emerald-950 font-medium text-center">
                    Reliability Score: High
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* VALUE PROP GRID */}
      <section className="relative border-t border-zinc-900/80 bg-zinc-900/10 py-24 px-6 md:px-12 z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] text-indigo-400 font-black uppercase tracking-wider block mb-3">Core Modules</span>
            <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Autonomous Telemetry Pipelines
            </h2>
            <p className="text-xs text-zinc-500 mt-2 max-w-md mx-auto">
              Our specialized agent pipeline combines statistical checks with vector semantic databases to automate forensic audits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="glass-card p-6 rounded-xl flex flex-col justify-between h-52 transition-all duration-300 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                <Activity className="w-5 h-5" />
              </div>
              <div className="mt-4">
                <h3 className="text-xs font-bold text-zinc-200 mb-1.5 uppercase tracking-wide">Outlier Discovery</h3>
                <p className="text-[11px] text-zinc-550 leading-relaxed">
                  Uses rolling-median regression models and IQR calculations to flag key metrics dropouts above 30%.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-6 rounded-xl flex flex-col justify-between h-52 transition-all duration-300 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Layers className="w-5 h-5" />
              </div>
              <div className="mt-4">
                <h3 className="text-xs font-bold text-zinc-200 mb-1.5 uppercase tracking-wide">Semantic Mapping</h3>
                <p className="text-[11px] text-zinc-550 leading-relaxed">
                  Indexes and vectorizes logs locally, mapping metadata timestamps to correlate metrics directly with stdout events.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-6 rounded-xl flex flex-col justify-between h-52 transition-all duration-300 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="mt-4">
                <h3 className="text-xs font-bold text-zinc-200 mb-1.5 uppercase tracking-wide">AI Reasoning</h3>
                <p className="text-[11px] text-zinc-550 leading-relaxed">
                  Powered by Microsoft Semantic Kernel with GPT-4o reasoners to deliver comprehensive outage reports.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="glass-card p-6 rounded-xl flex flex-col justify-between h-52 transition-all duration-300 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="mt-4">
                <h3 className="text-xs font-bold text-zinc-200 mb-1.5 uppercase tracking-wide">Forensic Chat</h3>
                <p className="text-[11px] text-zinc-550 leading-relaxed">
                  A real-time assistant room referencing source records and providing interactive suggestions.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* TECH COMPLIANCE */}
      <section className="relative border-t border-zinc-900/60 py-20 px-6 z-10 text-center max-w-3xl mx-auto w-full">
        <h3 className="text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-6">Built For the Modern Cloud Stack</h3>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-[10px] text-zinc-400 font-semibold px-4 py-1.5 rounded-full bg-zinc-950 border border-zinc-900">GitHub Models API</span>
          <span className="text-[10px] text-zinc-400 font-semibold px-4 py-1.5 rounded-full bg-zinc-950 border border-zinc-900">Microsoft Phi-4</span>
          <span className="text-[10px] text-zinc-400 font-semibold px-4 py-1.5 rounded-full bg-zinc-950 border border-zinc-900">Semantic Kernel SDK</span>
          <span className="text-[10px] text-zinc-400 font-semibold px-4 py-1.5 rounded-full bg-zinc-950 border border-zinc-900">FastAPI backend</span>
          <span className="text-[10px] text-zinc-400 font-semibold px-4 py-1.5 rounded-full bg-zinc-950 border border-zinc-900">Tailwind CSS & TS</span>
        </div>
      </section>

      {/* FOOTER */}
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
