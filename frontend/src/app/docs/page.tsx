"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Terminal, Code, Cpu, Database, Server } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="relative min-h-screen bg-[#030307] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-100 bg-dot-grid flex flex-col antialiased">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] ambient-glow -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[300px] ambient-glow translate-y-1/3" style={{ opacity: 0.6 }} />

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
              <span className="text-[9px] text-zinc-500 font-mono mt-0.5">Docs Console</span>
            </div>
          </Link>
        </div>

        <div>
          <Link 
            href="/app" 
            className="glow-btn-primary bg-white text-zinc-950 text-xs font-bold px-4 py-2 rounded-full transition-all duration-300"
          >
            Launch Console
          </Link>
        </div>
      </nav>

      {/* CONTENT AREA */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-10 space-y-10 z-10 animate-fade-in-up">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Title */}
        <div className="border-b border-zinc-900/60 pb-6">
          <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2.5">
            <BookOpen className="w-4 h-4" /> Technical Documentation
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mt-1">
            ARCA Engine Architecture
          </h1>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Developer guidelines, pipeline workflow steps, and backend API schemas for the Autonomous Root-Cause Analyst.
          </p>
        </div>

        {/* Pipeline details */}
        <div className="space-y-6">
          <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900/60 pb-2">
            <Cpu className="w-4.5 h-4.5 text-indigo-400" /> Core Agent Modules
          </h2>
          
          <div className="space-y-4 text-xs text-zinc-400 leading-relaxed font-medium">
            <div className="glass-card p-5 rounded-xl border border-zinc-900/80">
              <h3 className="font-extrabold text-zinc-200 text-xs mb-1.5 uppercase tracking-wide">1. Ingestion Agent</h3>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Extracts raw single files or zipped archives containing mixed modal data. Structured dataframes (CSVs, Excel sheets, tabular JSONs) are compiled separately from unstructured server reports (PDF outlines, text output streams).
              </p>
            </div>
            <div className="glass-card p-5 rounded-xl border border-zinc-900/80">
              <h3 className="font-extrabold text-zinc-200 text-xs mb-1.5 uppercase tracking-wide">2. Data Cleaning Agent</h3>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Executes cleaning checks including standardizing timestamp formats, replacing null values in critical dimensions, parsing raw currency strings, and balancing metric variables.
              </p>
            </div>
            <div className="glass-card p-5 rounded-xl border border-zinc-900/80">
              <h3 className="font-extrabold text-zinc-200 text-xs mb-1.5 uppercase tracking-wide">3. Vector Tag Ingestion</h3>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Indexes logs and tabular data blocks inside an in-memory ChromaDB vector store. Elements are annotated with matching <code>date</code> and <code>region</code> tags to enable cross-modal semantic searches.
              </p>
            </div>
            <div className="glass-card p-5 rounded-xl border border-zinc-900/80">
              <h3 className="font-extrabold text-zinc-200 text-xs mb-1.5 uppercase tracking-wide">4. Statistical Pattern Discovery</h3>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                Autonomously searches metric timelines to flag outliers and chronological drops (drops &gt;30% relative to rolling median). For each anomaly date/region, it queries ChromaDB for relevant developer outage logs and asks the GPT-4o reasoner to explain the root cause.
              </p>
            </div>
          </div>
        </div>

        {/* API specifications */}
        <div className="space-y-6">
          <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900/60 pb-2">
            <Server className="w-4.5 h-4.5 text-indigo-400" /> Backend REST Schema
          </h2>
          
          <div className="space-y-5 font-mono text-xs">
            {/* API 1 */}
            <div className="glass-card p-5 rounded-xl border border-zinc-900/80">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-emerald-950/80 border border-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide">POST</span>
                <span className="text-zinc-200 font-bold text-xs">/api/analyze</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed mb-4">
                Accepts multipart uploads containing datasets (ZIP, CSV, PDF). Automatically triggers the pipeline and generates session results.
              </p>
              <pre className="text-[10px] text-zinc-400 bg-zinc-950/80 border border-zinc-900 rounded-lg p-4 overflow-x-auto leading-relaxed scrollbar-thin">
{`Response Schema:
{
  "session_id": "string",
  "data_summary": { "file_name": "string", "row_count": 0, "column_names": [] },
  "cleaning": { "issues_found": [] },
  "discovery": { "insights": [], "summary": "string" },
  "report": { "report_text": "string", "chart_specs": [] }
}`}
              </pre>
            </div>

            {/* API 2 */}
            <div className="glass-card p-5 rounded-xl border border-zinc-900/80">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-emerald-950/80 border border-emerald-900/50 text-emerald-400 px-2 py-0.5 rounded-full text-[9px] font-black tracking-wide">POST</span>
                <span className="text-zinc-200 font-bold text-xs">/api/chat</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-sans leading-relaxed mb-4">
                Accepts a user question alongside a session identifier, performs RAG context searches in ChromaDB, and returns citations and suggestion chips.
              </p>
              <pre className="text-[10px] text-zinc-400 bg-zinc-950/80 border border-zinc-900 rounded-lg p-4 overflow-x-auto leading-relaxed scrollbar-thin">
{`Request Schema:
{
  "session_id": "string",
  "question": "string",
  "data_summary": {}
}`}
              </pre>
            </div>
          </div>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-900/60 bg-[#030307]/90 px-8 py-8 flex items-center justify-between shrink-0 z-10 mt-auto">
        <span className="text-xs text-zinc-500 font-medium">© 2026 Meshloop ARCA. Operations Forensics guide.</span>
        <div className="flex gap-4 text-xs font-semibold">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300">Home</Link>
          <Link href="/terms" className="text-zinc-500 hover:text-zinc-300">Terms</Link>
        </div>
      </footer>

    </div>
  );
}
