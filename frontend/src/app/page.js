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
  ShieldAlert, 
  Database,
  Terminal,
  Cpu,
  Layers,
  ChevronRight,
  ExternalLink
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-zinc-800 selection:text-zinc-100">
      
      {/* NAVBAR */}
      <nav className="h-16 border-b border-zinc-900 bg-zinc-950 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Meshloop Logo" className="w-7 h-7 rounded object-cover border border-zinc-900 bg-zinc-900" />
          <span className="font-bold text-sm tracking-tight text-zinc-100">Meshloop</span>
          <span className="text-[10px] text-zinc-400 font-mono px-1.5 py-0.5 rounded border border-zinc-850 bg-zinc-900/50">ARCA</span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/docs" className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
            Features & Docs
          </Link>
          <Link 
            href="/app" 
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold px-3.5 py-1.5 rounded transition-colors shadow-sm"
          >
            Launch Console
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-20 md:py-28 max-w-4xl mx-auto flex-1">
        <div className="inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-zinc-400" /> Microsoft Build AI Hackathon 2026
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight max-w-3xl">
          Fusing Database Metrics with Logs to Diagnose Outages.
        </h1>

        <p className="text-sm md:text-base text-zinc-450 max-w-2xl leading-relaxed mb-10">
          Meshloop ARCA (Autonomous Root-Cause Analyst) statistically parses database spreadsheets to identify metric drops, cross-references them with raw developer server logs, and explains operational failures.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link 
            href="/app" 
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold text-xs px-6 py-3 rounded flex items-center gap-1.5 transition-colors shadow-sm w-full sm:w-auto justify-center"
          >
            Launch Diagnostic Console <ArrowRight className="w-4 h-4 text-zinc-900" />
          </Link>
          <Link 
            href="/docs" 
            className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-zinc-300 font-semibold text-xs px-6 py-3 rounded transition-colors w-full sm:w-auto text-center"
          >
            Read Technical Docs
          </Link>
        </div>
      </section>

      {/* VALUE PROP GRID */}
      <section className="border-t border-zinc-900 bg-zinc-900/20 py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block mb-2">Capabilities</span>
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Core Forensic Agents Pipeline</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* feature 1 */}
            <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-lg flex flex-col justify-between h-48 shadow-sm">
              <div className="w-9 h-9 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                <Activity className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-200 mb-1.5 uppercase">Outlier Discovery</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Automatically flags metric drops (&gt;30%) using rolling-median regression models and standard IQR bounds.
                </p>
              </div>
            </div>

            {/* feature 2 */}
            <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-lg flex flex-col justify-between h-48 shadow-sm">
              <div className="w-9 h-9 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                <Layers className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-200 mb-1.5 uppercase">Semantic Correlation</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Embeds text chunks and maps metadata tags keys to align metric timestamps with unstructured system logs.
                </p>
              </div>
            </div>

            {/* feature 3 */}
            <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-lg flex flex-col justify-between h-48 shadow-sm">
              <div className="w-9 h-9 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                <Cpu className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-200 mb-1.5 uppercase">Semantic Kernel</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Orchestrated using Microsoft open-source SDK using GPT-4o reasoners and Phi-4 suggestions.
                </p>
              </div>
            </div>

            {/* feature 4 */}
            <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-lg flex flex-col justify-between h-48 shadow-sm">
              <div className="w-9 h-9 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                <MessageSquare className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-200 mb-1.5 uppercase">Incident Room Chat</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Thread-safe conversational RAG interface citing exact source files and generating follow-up metrics Qs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECH COMPLIANCE */}
      <section className="border-t border-zinc-900 py-16 px-6 max-w-3xl mx-auto w-full text-center">
        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Leveraging the Microsoft AI Stack</h3>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span className="text-[10px] text-zinc-400 px-3 py-1 rounded bg-zinc-900 border border-zinc-800">GitHub Models (GPT-4o)</span>
          <span className="text-[10px] text-zinc-400 px-3 py-1 rounded bg-zinc-900 border border-zinc-800">Microsoft Phi-4 API</span>
          <span className="text-[10px] text-zinc-400 px-3 py-1 rounded bg-zinc-900 border border-zinc-800">Semantic Kernel SDK</span>
          <span className="text-[10px] text-zinc-400 px-3 py-1 rounded bg-zinc-900 border border-zinc-800">Azure App Services Ready</span>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 bg-zinc-950 px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0 mt-auto">
        <div className="text-xs text-zinc-500">
          © 2026 Meshloop ARCA. All rights reserved. Fusing telemetry with logs.
        </div>

        <div className="flex items-center gap-4 text-xs">
          <Link href="/docs" className="text-zinc-500 hover:text-zinc-350 transition-colors">
            Docs
          </Link>
          <Link href="/terms" className="text-zinc-500 hover:text-zinc-350 transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-zinc-500 hover:text-zinc-350 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </footer>

    </div>
  );
}
