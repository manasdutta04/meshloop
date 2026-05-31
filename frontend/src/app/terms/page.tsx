"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="relative min-h-screen bg-[#030307] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-100 bg-dot-grid flex flex-col antialiased">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] ambient-glow -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] ambient-glow translate-y-1/3" style={{ opacity: 0.5 }} />

      {/* NAVBAR */}
      <nav className="h-16 border-b border-zinc-900/60 bg-[#030307]/75 backdrop-blur-md px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded blur opacity-20 group-hover:opacity-50 transition duration-300"></div>
              <img 
                src="/logo.png" 
                alt="Meshloop Logo" 
                className="relative w-8 h-8 rounded-lg object-cover border border-zinc-800/80 bg-zinc-950" 
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm tracking-tight text-white leading-none">Meshloop</span>
              <span className="text-[9px] text-zinc-500 font-mono mt-0.5">Terms</span>
            </div>
          </Link>
        </div>
      </nav>

      {/* CONTENT AREA */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-6 md:p-10 space-y-8 z-10 animate-fade-in-up">
        
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        <div className="border-b border-zinc-900/60 pb-5">
          <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2.5">
            <Shield className="w-4 h-4" /> Legal
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mt-1">
            Terms of Service
          </h1>
          <span className="text-[9px] text-zinc-500 font-mono block mt-2">Last Updated: May 31, 2026</span>
        </div>

        <div className="space-y-6 text-xs text-zinc-400 leading-relaxed font-medium">
          <div className="glass-card p-5 rounded-xl border border-zinc-900/80">
            <h3 className="font-extrabold text-zinc-200 text-xs mb-1.5 uppercase tracking-wide">1. Acceptance of Terms</h3>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              By accessing the Meshloop ARCA diagnostic console, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
            </p>
          </div>
          
          <div className="glass-card p-5 rounded-xl border border-zinc-900/80">
            <h3 className="font-extrabold text-zinc-200 text-xs mb-1.5 uppercase tracking-wide">2. Use of Service & Data Processing</h3>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Meshloop ARCA runs in-memory statistical and semantic analysis pipelines. Uploaded metrics sheets and server log outlines are processed solely within the context of your browser session and backend instance. You are responsible for ensuring that uploaded files do not contain unencrypted personally identifiable information (PII) or violated data access rights.
            </p>
          </div>
          
          <div className="glass-card p-5 rounded-xl border border-zinc-900/80">
            <h3 className="font-extrabold text-zinc-200 text-xs mb-1.5 uppercase tracking-wide">3. Intellectual Property</h3>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              All software, layout components, design configurations, and algorithms associated with the Meshloop analysis engine are the property of Meshloop or its licensors and are protected under copyright regulations.
            </p>
          </div>
          
          <div className="glass-card p-5 rounded-xl border border-zinc-900/80">
            <h3 className="font-extrabold text-zinc-200 text-xs mb-1.5 uppercase tracking-wide">4. Disclaimer of Warranties</h3>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              The service is provided "as is" and "as available". We do not warrant that results compiled by the AI agents (including anomaly reports and root cause interpretations) will be entirely error-free, accurate, or fail-safe. Double-verify diagnostics before modifying infrastructure.
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900/60 bg-[#030307]/90 px-8 py-8 flex items-center justify-between shrink-0 z-10 mt-auto">
        <span className="text-xs text-zinc-500 font-medium">© 2026 Meshloop. Legal specifications.</span>
        <div className="flex gap-4 text-xs font-semibold">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300">Home</Link>
          <Link href="/privacy" className="text-zinc-500 hover:text-zinc-300">Privacy Policy</Link>
        </div>
      </footer>

    </div>
  );
}
