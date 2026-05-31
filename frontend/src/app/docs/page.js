"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Terminal, Code, Cpu, Database, Server } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-zinc-800 selection:text-zinc-100">
      
      {/* NAVBAR */}
      <nav className="h-16 border-b border-zinc-900 bg-zinc-950 px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity">
            <img src="/logo.png" alt="Meshloop Logo" className="w-7 h-7 rounded object-cover border border-zinc-900 bg-zinc-900" />
            <span className="font-bold text-sm tracking-tight text-zinc-100">Meshloop</span>
          </Link>
          <span className="text-[10px] text-zinc-400 font-mono px-1.5 py-0.5 rounded border border-zinc-850 bg-zinc-900/50">ARCA Docs</span>
        </div>

        <div>
          <Link 
            href="/app" 
            className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold px-3.5 py-1.5 rounded transition-colors shadow-sm"
          >
            Launch Console
          </Link>
        </div>
      </nav>

      {/* CONTENT AREA */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-10 space-y-10">
        
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Title */}
        <div className="border-b border-zinc-900 pb-6">
          <div className="inline-flex items-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-4 h-4" /> Technical Documentation
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">
            Meshloop ARCA Engine Architecture
          </h1>
          <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
            Developer guidelines, pipeline workflow steps, and backend API schemas for the Autonomous Root-Cause Analyst.
          </p>
        </div>

        {/* Pipeline details */}
        <div className="space-y-6">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-2">
            <Cpu className="w-4.5 h-4.5 text-indigo-400" /> Core Agent Modules
          </h2>
          
          <div className="space-y-4 text-xs text-zinc-400 leading-relaxed">
            <div>
              <h3 className="font-bold text-zinc-200 text-xs mb-1">1. Ingestion Agent</h3>
              <p>
                Extracts raw single files or zipped archives containing mixed modal data. Structured dataframes (CSVs, Excel sheets, tabular JSONs) are compiled separately from unstructured server reports (PDF outlines, text output streams).
              </p>
            </div>
            <div>
              <h3 className="font-bold text-zinc-200 text-xs mb-1">2. Data Cleaning Agent</h3>
              <p>
                Executes cleaning checks including standardizing timestamp formats, replacing null values in critical dimensions, parsing raw currency strings, and balancing metric variables.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-zinc-200 text-xs mb-1">3. Vector Tag Ingestion</h3>
              <p>
                Indexes logs and tabular data blocks inside an in-memory ChromaDB vector store. Elements are annotated with matching <code>date</code> and <code>region</code> tags to enable cross-modal semantic searches.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-zinc-200 text-xs mb-1">4. Statistical Pattern Discovery</h3>
              <p>
                Autonomously searches metric timelines to flag outliers and chronological drops (drops &gt;30% relative to rolling median). For each anomaly date/region, it queries ChromaDB for relevant developer outage logs and asks the GPT-4o reasoner to explain the root cause.
              </p>
            </div>
          </div>
        </div>

        {/* API specifications */}
        <div className="space-y-6">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-900 pb-2">
            <Server className="w-4.5 h-4.5 text-indigo-400" /> Backend REST Schema
          </h2>
          
          <div className="space-y-4 font-mono text-xs">
            {/* API 1 */}
            <div className="bg-zinc-900/40 border border-zinc-900 rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">POST</span>
                <span className="text-zinc-200 font-bold">/api/analyze</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-sans leading-relaxed mb-3">
                Accepts multipart uploads containing datasets (ZIP, CSV, PDF). Automatically triggers the pipeline and generates session results.
              </p>
              <pre className="text-[10px] text-zinc-500 bg-zinc-950 p-2.5 rounded overflow-x-auto">
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
            <div className="bg-zinc-900/40 border border-zinc-900 rounded p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-emerald-950 border border-emerald-800 text-emerald-400 px-1.5 py-0.5 rounded text-[10px] font-bold">POST</span>
                <span className="text-zinc-200 font-bold">/api/chat</span>
              </div>
              <p className="text-[11px] text-zinc-500 font-sans leading-relaxed mb-3">
                Accepts a user question alongside a session identifier, performs RAG context searches in ChromaDB, and returns citations and suggestion chips.
              </p>
              <pre className="text-[10px] text-zinc-500 bg-zinc-950 p-2.5 rounded overflow-x-auto">
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
      <footer className="border-t border-zinc-900 bg-zinc-950 px-8 py-8 flex items-center justify-between shrink-0">
        <span className="text-xs text-zinc-500">© 2026 Meshloop ARCA. Operations Forensics guide.</span>
        <div className="flex gap-4 text-xs">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300">Home</Link>
          <Link href="/terms" className="text-zinc-500 hover:text-zinc-300">Terms</Link>
        </div>
      </footer>

    </div>
  );
}
