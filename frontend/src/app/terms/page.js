"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-zinc-800 selection:text-zinc-100">
      
      {/* NAVBAR */}
      <nav className="h-16 border-b border-zinc-900 bg-zinc-950 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
            <img src="/logo.png" alt="Meshloop Logo" className="w-7 h-7 rounded object-cover border border-zinc-900 bg-zinc-900" />
            <span className="font-bold text-sm tracking-tight text-zinc-100">Meshloop</span>
          </Link>
          <span className="text-[10px] text-zinc-400 font-mono px-1.5 py-0.5 rounded border border-zinc-850 bg-zinc-900/50">Terms</span>
        </div>
      </nav>

      {/* CONTENT AREA */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-6 md:p-10 space-y-8">
        
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        <div className="border-b border-zinc-900 pb-5">
          <div className="inline-flex items-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Shield className="w-4 h-4" /> Legal
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white mt-1">
            Terms of Service
          </h1>
          <span className="text-[10px] text-zinc-500 font-mono block mt-1.5">Last Updated: May 31, 2026</span>
        </div>

        <div className="space-y-6 text-xs text-zinc-400 leading-relaxed">
          <div>
            <h3 className="font-bold text-zinc-200 text-xs mb-1.5 uppercase">1. Acceptance of Terms</h3>
            <p>
              By accessing the Meshloop ARCA diagnostic console, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use the application.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-zinc-200 text-xs mb-1.5 uppercase">2. Use of Service & Data Processing</h3>
            <p>
              Meshloop ARCA runs in-memory statistical and semantic analysis pipelines. Uploaded metrics sheets and server log outlines are processed solely within the context of your browser session and backend instance. You are responsible for ensuring that uploaded files do not contain unencrypted personally identifiable information (PII) or violated data access rights.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-zinc-200 text-xs mb-1.5 uppercase">3. Intellectual Property</h3>
            <p>
              All software, layout components, design configurations, and algorithms associated with the Meshloop analysis engine are the property of Meshloop or its licensors and are protected under copyright regulations.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-zinc-200 text-xs mb-1.5 uppercase">4. Disclaimer of Warranties</h3>
            <p>
              The service is provided "as is" and "as available". We do not warrant that results compiled by the AI agents (including anomaly reports and root cause interpretations) will be entirely error-free, accurate, or fail-safe. Double-verify diagnostics before modifying infrastructure.
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 bg-zinc-950 px-8 py-8 flex items-center justify-between shrink-0 mt-auto">
        <span className="text-xs text-zinc-500">© 2026 Meshloop. Legal specifications.</span>
        <div className="flex gap-4 text-xs">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300">Home</Link>
          <Link href="/privacy" className="text-zinc-500 hover:text-zinc-300">Privacy Policy</Link>
        </div>
      </footer>

    </div>
  );
}
