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
            <p>When files are uploaded or a sample run is triggered, Meshloop runs a six-stage ARCA pipeline sequentially:</p>
            <ol className="list-decimal list-inside space-y-1.5 pl-2 mt-2">
              {[
                "Ingestion — parses mixed-modal files (CSV, Excel, JSON metrics) and unstructured text logs (TXT, PDF) from ZIP archives or individual uploads",
                "Cleaning & Typing — normalizes schemas, standardizes timestamps, removes duplicate rows, and balance category counts (oversampling imbalanced groups)",
                "Anomaly Isolation — runs IQR checks for metrics outliers and isolates regional/chronological drops exceeding 30% of the rolling median",
                "Vector Storage — chunks unstructured developer logs and indexes them into an in-memory ChromaDB store with regional and chronological metadata tags",
                "Multi-Agent SRE Debate — Discovery and Validator agents debate statistical findings against log evidence, resolved by the Synthesis agent into a final verdict",
                "Reporting & Visualization — compiles a Markdown forensic report and generates custom JSON chart specifications for rendering SVG graphics",
              ].map((s, i) => <li key={i}>{s}</li>)}
            </ol>
            <p className="mt-2 text-zinc-500">All stages run within a single execution flow coordinated by <code className="text-zinc-300">pipeline.py</code>. Session data is cached in-memory in the FastAPI backend process.</p>
          </div>
        </Section>

        {/* Agent modules */}
        <Section icon={Cpu} label="Core Agent Modules">
          <div className="space-y-3">
            <Card title="1. Ingestion Agent" badge="agents/ingestion.py" badgeColor="bg-zinc-900 border-zinc-800 text-zinc-400">
              Extracts zipped files or handles single files. Tabular files (CSVs, Excel, JSON) are parsed into Pandas DataFrames, and unstructured text files (logs, readmes, PDFs via pdfminer) are processed into clean text strings for vector indexing. Metadata is compiled into a structured registry.
            </Card>
            <Card title="2. Data Cleaning Agent" badge="agents/cleaning.py" badgeColor="bg-zinc-900 border-zinc-800 text-zinc-400">
              Applies cleaning rules: imputes numeric nulls with column medians, resolves categorical nulls with modes, fixes date formats, removes duplicate rows, and balances categorical features (oversampling categories with under 70% share) for downstream machine learning.
            </Card>
            <Card title="3. Vector Store Agent" badge="utils/vector_store.py" badgeColor="bg-zinc-900 border-zinc-800 text-zinc-400">
              Splits text logs and data row profiles into chunks and indexes them in ChromaDB. Each chunk is tagged with <code>date</code>, <code>region</code>, <code>source_file</code>, and <code>session_id</code> to allow highly targeted metadata-filtered searches during correlation checks.
            </Card>
            <Card title="4. Discovery & Correlation Agent" badge="agents/discovery.py" badgeColor="bg-zinc-900 border-zinc-800 text-zinc-400">
              Pinpoints outlier metrics using Interquartile Range (IQR) and rolling daily medians. For each anomaly detected, it queries ChromaDB for logs in the matching time/region window, and prompts GPT-4o to correlate logs with the metrics drops, outputting a ranked list of insights.
            </Card>
            <Card title="5. Multi-Agent Debate Engine" badge="agents/discovery.py -> run_agent_debate()" badgeColor="bg-indigo-950 border-indigo-900 text-indigo-400">
              Uses Microsoft Semantic Kernel to orchestrate a virtual panel: the **Discovery Agent** proposes a root cause based on metrics, the **Validator Agent** challenges it by scanning secondary log timelines for inconsistencies, and the **Synthesis Agent** resolves arguments into a final verdict with a confidence rating and recovery action.
            </Card>
            <Card title="6. Reporter Agent" badge="agents/reporter.py" badgeColor="bg-zinc-900 border-zinc-800 text-zinc-400">
              Formats the Markdown forensic audit report and compiles JSON <code>chart_specs</code> containing outlier histograms, scatter points, and trend-line coordinates. This lets the Next.js frontend render interactive custom SVG charts on-the-fly without bloated library dependencies.
            </Card>
          </div>
        </Section>

        {/* Supported providers */}
        <Section icon={Zap} label="Supported AI Providers">
          <div className="space-y-3">
            {[
              { name: "GitHub Models (Default)", models: "gpt-4o, microsoft/phi-4, Meta-Llama-3.1-70B", embeddings: "text-embedding-3-small", note: "Recommended endpoint. Use your GitHub PAT token as the API key. Configured with a dual-model setup: GPT-4o for debates and Phi-4 for cleaning/preprocessing." },
              { name: "Ollama (Local)", models: "llama3.1, mistral, or any local LLM", embeddings: "nomic-embed-text, or local fallbacks", note: "Enables complete offline local inference at http://localhost:11434/v1 for strict air-gapped data compliance. No API keys are required." },
              { name: "OpenAI", models: "gpt-4o, gpt-4o-mini, gpt-3.5-turbo", embeddings: "text-embedding-3-small", note: "Standard OpenAI endpoint integration. Requires a valid sk-... API key." },
              { name: "Groq", models: "llama-3.3-70b-versatile, llama-3.1-8b-instant", embeddings: "Pseudo-embedding fallback", note: "Uses Groq's high-speed completion models. Since Groq lacks an embeddings API, Meshloop automatically falls back to local hash-based pseudo-embeddings." },
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
              { fmt: ".csv", desc: "Primary tabular metrics. Loaded into Pandas DataFrames and analyzed for chronological anomalies and outliers." },
              { fmt: ".xlsx / .xls", desc: "Excel workbooks. Multiple sheets are parsed as separate tabular metric feeds." },
              { fmt: ".json", desc: "Structured logs or metric datasets. Nested JSON records are automatically flattened." },
              { fmt: ".txt", desc: "Developer log dumps or system event files. Chunked and indexed in ChromaDB for similarity Q&A." },
              { fmt: ".pdf", desc: "PDF documentation or operations manuals. Extracted using pdfminer for semantic log correlation." },
              { fmt: ".zip", desc: "Bundled archives containing any combination of the above. Extracted and cross-correlated in a single session." },
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
              desc="Ingests files via multipart upload. Runs the full ARCA pipeline and returns the serializable session results. Supports individual files or ZIP archives."
              schema={`# Headers (required)
x-meshloop-provider: github
x-meshloop-api-key: github_pat_...
x-meshloop-base-url: https://models.github.ai/inference
x-meshloop-chat-model: gpt-4o
x-meshloop-embedding-model: text-embedding-3-small

# Response
{
  "session_id": "string",
  "data_summary": { "file_name": "string", "row_count": 1000, "column_names": [...] },
  "cleaning": { "issues_found": [...], "cleaning_reports": {} },
  "discovery": {
    "insights": [...],
    "top_insight": {},
    "summary": "string",
    "total_found": 4,
    "agent_debate": { "debate": [...], "final_verdict": {} }
  },
  "report": { "report_text": "Markdown...", "chart_specs": [...] }
}`}
            />
            <Endpoint
              method="POST" path="/api/analyze/sample"
              desc="Runs the full ARCA analysis pipeline on the prepackaged Black Friday demo ZIP file located at sample_data/arca_test_dataset.zip."
              schema={`# Request Headers: Same config headers as /api/analyze

# Response: Same session result schema as /api/analyze`}
            />
            <Endpoint
              method="POST" path="/api/chat"
              desc="Sends a query to the Incident Room RAG Chat Agent. Performs similarity searches in ChromaDB to retrieve cited log excerpts."
              schema={`# Request Body
{
  "session_id": "string",
  "question": "How did the configuration change cause the outage?",
  "data_summary": {}
}

# Response
{
  "answer": "Answer text...",
  "citations": ["deployment_log.txt [line 45]"],
  "suggestions": ["Why did the database connections spike?", "What configuration was updated?"]
}`}
            />
            <Endpoint
              method="GET" path="/api/export/cleaned"
              desc="Downloads the cleaned version of a metrics dataset in CSV format."
              schema={`# Query Parameters
session_id=string&filename=metrics.csv`}
            />
            <Endpoint
              method="GET" path="/api/export/balanced"
              desc="Downloads the oversampled category-balanced version of a metrics dataset in CSV format."
              schema={`# Query Parameters
session_id=string&filename=metrics.csv`}
            />
            <Endpoint
              method="GET" path="/api/export/report"
              desc="Downloads the compiled forensic audit report in Markdown format."
              schema={`# Query Parameters
session_id=string`}
            />
          </div>
        </Section>

        {/* Config */}
        <Section icon={Terminal} label="Environment & Configuration">
          <Card title="Settings Panel (In-App)" badge="No Local Environment Files Required">
            All LLM endpoints are configured dynamically at runtime through the settings panel. Credential headers (<code>x-meshloop-provider</code>, <code>x-meshloop-api-key</code>, <code>x-meshloop-base-url</code>, <code>x-meshloop-chat-model</code>, <code>x-meshloop-embedding-model</code>) are passed from browser memory, which are stored locally in the browser's <code>localStorage</code> under the key <code>meshloop-ai-config</code>.
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
