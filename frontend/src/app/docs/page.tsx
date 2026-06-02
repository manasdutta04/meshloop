"use client";

import Link from "next/link";
import {
  ArrowLeft, BookOpen, Cpu, Server, Database, Layers,
  FileText, Zap, ShieldCheck, Terminal, Code, GitBranch,
  AlertTriangle, CheckCircle2, ChevronRight
} from "lucide-react";
import { Header } from "../../components/ui/header-2";

const Section = ({ icon: Icon, color, label, children }: any) => (
  <div className="space-y-4">
    <h2 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b border-zinc-900/60 pb-2 ${color || "text-indigo-400"}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </h2>
    {children}
  </div>
);

const Card = ({ title, badge, badgeColor, children }: any) => (
  <div className="glass-card p-5 rounded-xl border border-zinc-900/80 space-y-2">
    <div className="flex items-center gap-2">
      <h3 className="font-extrabold text-zinc-200 text-[11px] uppercase tracking-wide">{title}</h3>
      {badge && <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full border ${badgeColor || "bg-indigo-950/60 border-indigo-900/50 text-indigo-400"}`}>{badge}</span>}
    </div>
    <div className="text-zinc-400 text-[11px] leading-relaxed">{children}</div>
  </div>
);

const Endpoint = ({ method, path, desc, schema }: any) => (
  <div className="glass-card p-5 rounded-xl border border-zinc-900/80 space-y-3 font-mono">
    <div className="flex items-center gap-2">
      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
        method === "POST" ? "bg-emerald-950/80 border-emerald-900/50 text-emerald-400" :
        method === "GET"  ? "bg-sky-950/80 border-sky-900/50 text-sky-400" :
                           "bg-zinc-900 border-zinc-800 text-zinc-400"
      }`}>{method}</span>
      <span className="text-zinc-200 font-bold text-xs">{path}</span>
    </div>
    <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">{desc}</p>
    {schema && (
      <pre className="text-[10px] text-zinc-400 bg-zinc-950/80 border border-zinc-900 rounded-lg p-4 overflow-x-auto leading-relaxed">
        {schema}
      </pre>
    )}
  </div>
);

export default function DocsPage() {
  return (
    <div className="relative min-h-screen bg-[#030307] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-100 bg-dot-grid flex flex-col antialiased">
      <div className="absolute top-0 left-1/4 w-[600px] h-[350px] ambient-glow -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] ambient-glow translate-y-1/3 opacity-60" />

      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-10 space-y-12 z-10 animate-fade-in-up">

        <Link href="/" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Title */}
        <div className="border-b border-zinc-900/60 pb-6">
          <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2.5">
            <BookOpen className="w-4 h-4" /> Technical Documentation
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mt-1">
            Meshloop ARCA Engine
          </h1>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed max-w-xl">
            Complete developer reference for the Autonomous Root-Cause Analyst pipeline — ingestion, cleaning, vector storage, pattern discovery, and forensic reporting.
          </p>
          <div className="flex gap-3 mt-4 flex-wrap">
            {["BYO API Key", "Groq / OpenAI / Local LLM", "ChromaDB Vector Store", "FastAPI Backend", "Next.js Frontend"].map(t => (
              <span key={t} className="text-[9px] bg-zinc-900/80 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full font-mono">{t}</span>
            ))}
          </div>
        </div>

        {/* How it works */}
        <Section icon={GitBranch} label="Pipeline Overview">
          <div className="bg-zinc-950/60 border border-zinc-900/80 rounded-xl p-5 text-[11px] text-zinc-400 leading-relaxed space-y-2">
            <p>When you upload a file or ZIP archive, Meshloop runs a five-stage ARCA pipeline sequentially:</p>
            <ol className="list-decimal list-inside space-y-1.5 pl-2 mt-2">
              {[
                "Ingestion — parse structured (CSV, Excel, JSON) and unstructured (TXT, PDF logs) files",
                "Cleaning — fix nulls, normalize casing, standardize timestamps, balance metrics",
                "Vector Storage — chunk and embed rows into ChromaDB with date+region metadata tags",
                "Discovery — detect statistical anomalies, query vector store for correlated logs, generate root-cause explanations via LLM",
                "Reporting — compile Markdown audit report and embed real chart data for the Visuals tab",
              ].map((s, i) => <li key={i}>{s}</li>)}
            </ol>
            <p className="mt-2 text-zinc-500">All stages run within a single <code className="text-zinc-300">run_pipeline()</code> call in <code className="text-zinc-300">pipeline.py</code>. Session data lives in-memory and is cleared on server restart.</p>
          </div>
        </Section>

        {/* Agent modules */}
        <Section icon={Cpu} label="Core Agent Modules">
          <div className="space-y-3">
            <Card title="1. Ingestion Agent" badge="agents/ingestion.py" badgeColor="bg-zinc-900 border-zinc-800 text-zinc-400">
              Extracts and parses files from uploaded ZIPs or single uploads. Structured tabular files (CSV, XLSX, JSON) are loaded into Pandas DataFrames keyed by filename. Unstructured logs (TXT, PDF) are extracted as raw text and stored separately for vector indexing. Metadata including <code>file_name</code>, <code>files_contained</code>, <code>file_type</code>, and column names is compiled into the ingestion result dict.
            </Card>
            <Card title="2. Data Cleaning Agent" badge="agents/cleaning.py" badgeColor="bg-zinc-900 border-zinc-800 text-zinc-400">
              Applies a battery of deterministic cleaning rules per DataFrame: null-value imputation (numeric columns filled with median, categorical columns filled with mode), timestamp format normalization, duplicate row removal, currency string parsing, and case standardization for categorical columns like Product names. Each fix is logged as a human-readable string in <code>issues_found</code>.
            </Card>
            <Card title="3. Vector Store Agent" badge="utils/vector_store.py" badgeColor="bg-zinc-900 border-zinc-800 text-zinc-400">
              Chunks both tabular rows and log text into segments and indexes them into an in-memory ChromaDB collection. Each chunk is annotated with metadata tags (<code>date</code>, <code>region</code>, <code>source_file</code>, <code>session_id</code>) to enable precise filtered semantic retrieval during the discovery stage. Embeddings are generated via your configured LLM provider, or via pseudo-embeddings (deterministic hash-based vectors) when using Groq, which does not support an Embeddings API.
            </Card>
            <Card title="4. Discovery Agent" badge="agents/discovery.py" badgeColor="bg-zinc-900 border-zinc-800 text-zinc-400">
              Runs two detection passes per numeric column: (a) IQR-based extreme outlier detection, flagging values outside 1.5× the interquartile range; (b) rolling-median metric drop detection, flagging any single row value that falls more than 30% below the local rolling median grouped by region. For each incident, the agent queries ChromaDB for correlated log entries matching the same date and region, then sends a structured prompt to the LLM to generate a natural-language root-cause explanation. Results are returned as a ranked <code>insights</code> list with severity labels.
            </Card>
            <Card title="5. Reporter Agent" badge="agents/reporter.py" badgeColor="bg-zinc-900 border-zinc-800 text-zinc-400">
              Compiles a Markdown forensic audit report from the discovery output and generates <code>chart_specs</code> — JSON objects embedding real computed data (histogram bin counts, per-category aggregations, sampled scatter points, time-series values) so the frontend Visuals tab renders fully data-driven SVG charts without a charting library dependency.
            </Card>
          </div>
        </Section>

        {/* Supported providers */}
        <Section icon={Zap} label="Supported AI Providers">
          <div className="space-y-3">
            {[
              { name: "OpenAI", models: "gpt-4o, gpt-4o-mini, gpt-3.5-turbo", embeddings: "text-embedding-3-small, text-embedding-ada-002", note: "Full support including embeddings." },
              { name: "Groq", models: "llama-3.3-70b-versatile, llama-3.1-8b-instant, mixtral-8x7b", embeddings: "Pseudo-embedding fallback (no Groq embedding API)", note: "Groq does not offer an embeddings endpoint. Meshloop automatically falls back to deterministic hash-based pseudo-embeddings at EMBEDDING_DIM=1536." },
              { name: "Local / OpenAI-compatible", models: "Any model served on a local endpoint", embeddings: "Depends on the server", note: "Set the Base URL to your local server (e.g. http://localhost:11434/v1 for Ollama). API key can be set to any non-empty string." },
              { name: "GitHub Models", models: "gpt-4o, Meta-Llama-3.1-70B, Mistral-large", embeddings: "text-embedding-3-small", note: "Use your GitHub personal access token as the API key. Base URL: https://models.inference.ai.azure.com" },
            ].map(p => (
              <div key={p.name} className="glass-card p-5 rounded-xl border border-zinc-900/80 space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-zinc-200 text-[11px] uppercase tracking-wide">{p.name}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[10px] text-zinc-500 font-mono">
                  <div><span className="text-zinc-600 uppercase text-[8px] block mb-0.5">Chat Models</span>{p.models}</div>
                  <div><span className="text-zinc-600 uppercase text-[8px] block mb-0.5">Embeddings</span>{p.embeddings}</div>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{p.note}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* File format support */}
        <Section icon={FileText} label="Supported File Formats">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { fmt: ".csv", desc: "Primary tabular format. Loaded directly into a Pandas DataFrame." },
              { fmt: ".xlsx / .xls", desc: "Excel workbooks. All sheets are loaded as separate DataFrames." },
              { fmt: ".json", desc: "Array-of-objects JSON loaded as a DataFrame. Nested structures are flattened." },
              { fmt: ".txt", desc: "Plain-text server logs or reports. Chunked and indexed into the vector store." },
              { fmt: ".pdf", desc: "PDF reports (text extraction via pdfminer). Indexed as unstructured log data." },
              { fmt: ".zip", desc: "ZIP archives containing any mix of the above. All files are extracted and processed together as a single session." },
            ].map(f => (
              <div key={f.fmt} className="glass-card p-4 rounded-xl border border-zinc-900/80 flex gap-3 items-start">
                <code className="text-indigo-400 font-mono text-[10px] font-black shrink-0 pt-0.5">{f.fmt}</code>
                <p className="text-zinc-400 text-[11px] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Backend API */}
        <Section icon={Server} label="Backend REST API — FastAPI on :8000">
          <div className="space-y-4">
            <Endpoint
              method="POST" path="/api/analyze"
              desc="Accepts multipart file uploads. Runs the full 5-stage ARCA pipeline and returns a session result. Accepts single files or ZIP archives."
              schema={`# Headers (required)
X-AI-Base-URL: https://api.openai.com/v1
X-AI-API-Key: sk-...
X-AI-Model: gpt-4o
X-AI-Embedding-Model: text-embedding-3-small

# Response
{
  "session_id": "string",
  "data_summary": {
    "file_name": "string",
    "file_names": ["string"],
    "row_count": 1000,
    "column_names": ["Date","Region","Sales"],
    "file_type": "zip"
  },
  "cleaning": {
    "issues_found": ["string"],
    "cleaning_reports": {}
  },
  "discovery": {
    "insights": [ { "title": "...", "severity": "high", "description": "...", "data_evidence": {} } ],
    "top_insight": {},
    "summary": "string",
    "total_found": 42
  },
  "report": {
    "report_text": "# Meshloop Forensic Audit Report ...",
    "chart_specs": [ { "type": "histogram", "col": "Sales", "bins": [...], "mean": 512.3 } ]
  }
}`}
            />
            <Endpoint
              method="POST" path="/api/chat"
              desc="Accepts a natural-language question and a session_id. Performs RAG retrieval from ChromaDB and returns an AI answer with supporting evidence."
              schema={`# Request
{
  "session_id": "string",
  "question": "Why did Sales drop on 2024-01-10?",
  "data_summary": {}
}

# Response
{
  "answer": "string",
  "citations": ["string"],
  "suggestions": ["string"]
}`}
            />
            <Endpoint
              method="GET" path="/api/session/{session_id}"
              desc="Retrieves a cached session result by ID. Sessions are stored in-memory and cleared when the backend process restarts."
              schema={`# Response: same shape as /api/analyze response`}
            />
            <Endpoint
              method="GET" path="/api/export/{session_id}/{format}"
              desc="Exports the session result in the specified format. Supported formats: json, csv, markdown."
              schema={`# Formats
json     → Full session result as JSON
csv      → Insights list as a CSV table
markdown → Audit report as a .md download`}
            />
            <Endpoint
              method="GET" path="/health"
              desc="Health check endpoint. Returns service status and current session count."
              schema={`{ "status": "ok", "sessions": 3 }`}
            />
          </div>
        </Section>

        {/* Config */}
        <Section icon={Terminal} label="Environment & Configuration">
          <Card title="Settings Panel (In-App)" badge="No .env Required">
            All AI configuration is done at runtime through the Settings panel in the top navigation bar. Your API key, base URL, chat model, and embedding model are sent as request headers (<code>X-AI-*</code>) with each analysis call — they are never stored server-side. You can switch providers between sessions without restarting the backend.
          </Card>
          <Card title="Backend Environment Variables" badge="Optional">
            <div className="space-y-2">
              {[
                { key: "HOST", default: "0.0.0.0", desc: "Bind address for the uvicorn server." },
                { key: "PORT", default: "8000", desc: "Port to listen on." },
                { key: "EMBEDDING_DIM", default: "1536", desc: "Vector dimension for ChromaDB. Must match your embedding model's output size." },
                { key: "CHROMA_PERSIST_DIR", default: "(in-memory)", desc: "If set, persists the ChromaDB collection to disk across restarts." },
              ].map(e => (
                <div key={e.key} className="flex gap-3 text-[10px]">
                  <code className="text-amber-400 font-mono shrink-0 w-36">{e.key}</code>
                  <span className="text-zinc-600 shrink-0 w-20">{e.default}</span>
                  <span className="text-zinc-400">{e.desc}</span>
                </div>
              ))}
            </div>
          </Card>
        </Section>

        {/* Known limitations */}
        <Section icon={AlertTriangle} color="text-amber-400" label="Known Limitations">
          <div className="space-y-2">
            {[
              "Groq does not support embeddings — Meshloop uses pseudo-embeddings as a fallback. Semantic chat retrieval accuracy may be lower than with real embeddings.",
              "Sessions are in-memory only and are lost when the backend restarts. Use /api/export to save results before stopping the server.",
              "Very large files (>50 MB) may cause slow pipeline execution due to in-memory processing. Consider splitting data by time period.",
              "The discovery agent requires at least one numeric column and at least 5 rows per region to produce meaningful statistical alerts.",
              "PDF text extraction depends on pdfminer and may be inaccurate for scanned or image-based PDFs.",
            ].map((l, i) => (
              <div key={i} className="flex gap-2.5 items-start glass-card p-3.5 rounded-xl border border-zinc-900/80">
                <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-[11px] text-zinc-400 leading-relaxed">{l}</p>
              </div>
            ))}
          </div>
        </Section>

      </main>

      <footer className="border-t border-zinc-900/60 bg-[#030307]/90 px-8 py-8 flex items-center justify-between shrink-0 z-10 mt-auto">
        <span className="text-xs text-zinc-500 font-medium">© 2026 Meshloop ARCA. Technical documentation.</span>
        <div className="flex gap-4 text-xs font-semibold">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">Home</Link>
          <Link href="/terms" className="text-zinc-500 hover:text-zinc-300 transition-colors">Terms</Link>
          <Link href="/privacy" className="text-zinc-500 hover:text-zinc-300 transition-colors">Privacy</Link>
        </div>
      </footer>
    </div>
  );
}
