"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
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
              <span className="text-[9px] text-zinc-500 font-mono mt-0.5">Privacy</span>
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
            <ShieldCheck className="w-4 h-4" /> Compliance
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mt-1">
            Privacy Policy
          </h1>
          <span className="text-[9px] text-zinc-500 font-mono block mt-2">Last Updated: May 31, 2026</span>
        </div>

        <div className="space-y-6 text-xs text-zinc-400 leading-relaxed font-medium">
          <div className="glass-card p-5 rounded-xl border border-zinc-900/80">
            <h3 className="font-extrabold text-zinc-200 text-xs mb-1.5 uppercase tracking-wide">1. Overview of Data Practices</h3>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Meshloop ARCA respects your privacy. We build local, private-by-design operational forensics tools. This privacy policy describes what information we process and how we handle data security.
            </p>
          </div>
          
          <div className="glass-card p-5 rounded-xl border border-zinc-900/80">
            <h3 className="font-extrabold text-zinc-200 text-xs mb-1.5 uppercase tracking-wide">2. Files and Analytics Data</h3>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              When you upload files (ZIP, CSV, PDF, TXT) to the analysis console, the data is transmitted to your local or designated FastAPI backend wrapper instance. Data is loaded into temporary memory for statistical cleaning, indexing, and vector similarity Q&A. The files are not stored permanently on third-party servers. All session records are wiped upon reloading the backend server.
            </p>
          </div>
          
          <div className="glass-card p-5 rounded-xl border border-zinc-900/80">
            <h3 className="font-extrabold text-zinc-200 text-xs mb-1.5 uppercase tracking-wide">3. LLM API Connections</h3>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              To compile anomalies explanations and answer chatbot queries, prompt text snippets are sent via the GitHub Models API or your configured OpenAI endpoint. These calls are subject to standard developer data protection compliance. We utilize local caching to ensure similar prompts do not transmit data repeatedly.
            </p>
          </div>
          
          <div className="glass-card p-5 rounded-xl border border-zinc-900/80">
            <h3 className="font-extrabold text-zinc-200 text-xs mb-1.5 uppercase tracking-wide">4. Security Measures</h3>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              We implement industry-standard CORS headers on the API backend to restrict cross-origin access to local ports. You remain responsible for maintaining the privacy of your local environment secrets (like the <code>GITHUB_TOKEN</code> API key).
            </p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900/60 bg-[#030307]/90 px-8 py-8 flex items-center justify-between shrink-0 z-10 mt-auto">
        <span className="text-xs text-zinc-500 font-medium">© 2026 Meshloop. Privacy guidelines.</span>
        <div className="flex gap-4 text-xs font-semibold">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300">Home</Link>
          <Link href="/terms" className="text-zinc-500 hover:text-zinc-300">Terms of Service</Link>
        </div>
      </footer>

    </div>
  );
}
