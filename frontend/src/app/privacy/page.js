"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-zinc-800 selection:text-zinc-100">
      
      {/* NAVBAR */}
      <nav className="h-16 border-b border-zinc-900 bg-zinc-950 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
            <img src="/logo.png" alt="Meshloop Logo" className="w-7 h-7 rounded object-cover border border-zinc-900 bg-zinc-900" />
            <span className="font-bold text-sm tracking-tight text-zinc-100">Meshloop</span>
          </Link>
          <span className="text-[10px] text-zinc-400 font-mono px-1.5 py-0.5 rounded border border-zinc-850 bg-zinc-900/50">Privacy</span>
        </div>
      </nav>

      {/* CONTENT AREA */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-6 md:p-10 space-y-8">
        
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        <div className="border-b border-zinc-900 pb-5">
          <div className="inline-flex items-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" /> Compliance
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white mt-1">
            Privacy Policy
          </h1>
          <span className="text-[10px] text-zinc-500 font-mono block mt-1.5">Last Updated: May 31, 2026</span>
        </div>

        <div className="space-y-6 text-xs text-zinc-400 leading-relaxed">
          <div>
            <h3 className="font-bold text-zinc-200 text-xs mb-1.5 uppercase">1. Overview of Data Practices</h3>
            <p>
              Meshloop ARCA respects your privacy. We build local, private-by-design operational forensics tools. This privacy policy describes what information we process and how we handle data security.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-zinc-200 text-xs mb-1.5 uppercase">2. Files and Analytics Data</h3>
            <p>
              When you upload files (ZIP, CSV, PDF, TXT) to the analysis console, the data is transmitted to your local or designated FastAPI backend wrapper instance. Data is loaded into temporary memory for statistical cleaning, indexing, and vector similarity Q&A. The files are not stored permanently on third-party servers. All session records are wiped upon reloading the backend server.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-zinc-200 text-xs mb-1.5 uppercase">3. LLM API Connections</h3>
            <p>
              To compile anomalies explanations and answer chatbot queries, prompt text snippets are sent via the GitHub Models API or your configured OpenAI endpoint. These calls are subject to standard developer data protection compliance. We utilize local caching to ensure similar prompts do not transmit data repeatedly.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-zinc-200 text-xs mb-1.5 uppercase">4. Security Measures</h3>
            <p>
              We implement industry-standard CORS headers on the API backend to restrict cross-origin access to local ports. You remain responsible for maintaining the privacy of your local environment secrets (like the <code>GITHUB_TOKEN</code> API key).
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900 bg-zinc-950 px-8 py-8 flex items-center justify-between shrink-0 mt-auto">
        <span className="text-xs text-zinc-500">© 2026 Meshloop. Privacy guidelines.</span>
        <div className="flex gap-4 text-xs">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300">Home</Link>
          <Link href="/terms" className="text-zinc-500 hover:text-zinc-300">Terms of Service</Link>
        </div>
      </footer>

    </div>
  );
}
