"use client";

import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock, Eye, Server, Key, Database, Trash2, Globe } from "lucide-react";
import { Header } from "../../components/ui/header-2";

const Section = ({ icon: Icon, label, color, children }: any) => (
  <div className="space-y-4">
    <h2 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b border-zinc-900/60 pb-2 ${color || "text-indigo-400"}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </h2>
    {children}
  </div>
);

const Clause = ({ num, title, icon: Icon, children }: any) => (
  <div className="glass-card p-5 rounded-xl border border-zinc-900/80 space-y-2">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
      <h3 className="font-extrabold text-zinc-200 text-[11px] uppercase tracking-wide">
        {num}. {title}
      </h3>
    </div>
    <div className="text-zinc-400 text-[11px] leading-relaxed space-y-2">{children}</div>
  </div>
);

const DataRow = ({ label, value, highlight }: any) => (
  <div className="flex gap-3 py-2 border-b border-zinc-900/40 last:border-0">
    <span className="text-zinc-500 text-[10px] w-36 shrink-0 font-mono">{label}</span>
    <span className={`text-[10px] ${highlight ? "text-emerald-400 font-semibold" : "text-zinc-400"}`}>{value}</span>
  </div>
);

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen bg-[#030307] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-100 bg-dot-grid flex flex-col antialiased">
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] ambient-glow -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] ambient-glow translate-y-1/3 opacity-50" />

      <Header />

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-10 space-y-12 z-10 animate-fade-in-up">

        <Link href="/" className="inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors font-medium">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>

        {/* Title */}
        <div className="border-b border-zinc-900/60 pb-6">
          <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2.5">
            <ShieldCheck className="w-4 h-4" /> Compliance
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mt-1">Privacy Policy</h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-[9px] text-zinc-500 font-mono">Effective: June 2, 2026</span>
            <span className="text-[9px] text-zinc-700">·</span>
            <span className="text-[9px] text-zinc-500 font-mono">Version 1.1</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-3 leading-relaxed max-w-xl">
            Meshloop ARCA is a local-first, self-hosted platform. This policy explains exactly what data flows where, what we collect (very little), and how your information is handled.
          </p>
        </div>

        {/* At a glance summary */}
        <Section icon={Eye} label="At a Glance — Data Summary">
          <div className="glass-card rounded-xl border border-zinc-900/80 overflow-hidden">
            <div className="px-5 py-3 bg-zinc-950/60 border-b border-zinc-900/60">
              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">What we collect & where it goes</span>
            </div>
            <div className="px-5 py-3 space-y-0">
              <DataRow label="Uploaded files" value="Sent only to your local FastAPI backend. Never to Meshloop servers." highlight />
              <DataRow label="API keys" value="Transmitted as request headers. Saved locally in your browser's localStorage." highlight />
              <DataRow label="Analysis results" value="Stored in-memory only. Cleared on backend restart." highlight />
              <DataRow label="LLM prompt data" value="Sent to your configured provider (GitHub, OpenAI, Groq, etc.) or processed locally via Ollama." />
              <DataRow label="Browser data" value="No cookies. Settings and keys cached in local browser storage." highlight />
              <DataRow label="IP addresses" value="Not logged by Meshloop. Your local backend may log localhost requests." />
              <DataRow label="Account data" value="No accounts, no registration, no personal profiles." highlight />
            </div>
          </div>
        </Section>

        {/* Full policy sections */}
        <Section icon={Lock} label="Full Privacy Policy">
          <div className="space-y-3">

            <Clause num="1" title="Overview" icon={ShieldCheck}>
              <p>Meshloop ARCA is designed to be private by architecture. The application runs entirely within infrastructure you control — your local machine or a server you administer. We have no central backend, no user accounts, and no telemetry collection.</p>
              <p>This policy describes: (a) what data the application processes during normal operation; (b) what, if anything, is transmitted externally; (c) your rights and controls over that data.</p>
            </Clause>

            <Clause num="2" title="Data You Upload for Analysis" icon={Database}>
              <p>When you upload files (CSV, ZIP, PDF, TXT, Excel) through the Meshloop ARCA console, those files are transmitted via HTTPS (or HTTP on localhost) to your locally running FastAPI backend process on port 8000.</p>
              <p><strong className="text-zinc-300">The files are not sent to any Meshloop-operated service.</strong> They are processed entirely within your local runtime:</p>
              <ul className="list-disc list-inside pl-2 space-y-1">
                <li>Parsed into Pandas DataFrames or text strings in memory</li>
                <li>Indexed into an in-memory ChromaDB vector store (no external network calls)</li>
                <li>Analyzed statistically by local Python code</li>
                <li>Discarded from memory when the backend process is restarted or the session is cleared</li>
              </ul>
              <p>No uploaded file is written to a persistent disk location by default unless you have explicitly configured <code className="text-zinc-300">CHROMA_PERSIST_DIR</code> in your environment.</p>
            </Clause>

            <Clause num="3" title="LLM API Calls — What's Sent to Third Parties" icon={Globe}>
              <p>To generate root-cause explanations, answer chat queries, and create analysis summaries, Meshloop sends prompts to your configured LLM provider. The content of these prompts includes:</p>
              <ul className="list-disc list-inside pl-2 space-y-1">
                <li><strong className="text-zinc-300">Statistical summaries</strong> — e.g., "Write latency spiked 410% on 2026-06-04 in East region (actual: 8400.0, expected: 220.0)"</li>
                <li><strong className="text-zinc-300">Extracted text snippets</strong> from log files relevant to the anomaly date/region (retrieved from ChromaDB)</li>
                <li><strong className="text-zinc-300">System instructions</strong> — fixed prompt templates describing the analyst role</li>
              </ul>
              <p>Raw uploaded file contents are <strong className="text-zinc-300">not</strong> sent to the LLM in bulk — only targeted excerpts retrieved by semantic similarity. You can inspect the exact prompt construction in <code className="text-zinc-300">agents/discovery.py</code> and <code className="text-zinc-300">agents/chat.py</code>.</p>
              <p><strong className="text-zinc-300">Local Inference Option (Ollama):</strong> If you configure a local offline model (such as Ollama on <code className="text-zinc-300">http://localhost:11434</code>), all model inference, embeddings, and chat Q&A are executed completely on your local machine. In this scenario, absolutely no telemetry, prompt data, or log snippets are sent to any external server or third-party API.</p>
              <p>For cloud providers, data sent to your LLM provider is governed by that provider's own privacy policy and data processing terms. We recommend reviewing:</p>
              <ul className="list-disc list-inside pl-2 space-y-1">
                <li>GitHub Models: <span className="text-indigo-400">docs.github.com/en/site-policy</span></li>
                <li>OpenAI: <span className="text-indigo-400">platform.openai.com/privacy</span></li>
                <li>Groq: <span className="text-indigo-400">groq.com/privacy</span></li>
              </ul>
            </Clause>

            <Clause num="4" title="API Keys & Credentials" icon={Key}>
              <p>Your LLM API key and configuration settings are entered in the settings panel and are transmitted with each analysis request as an HTTP header (<code className="text-zinc-300">x-meshloop-api-key</code>) from your browser to your local FastAPI backend.</p>
              <p><strong className="text-zinc-300">Browser local storage:</strong> To prevent you from having to re-enter your credentials and model preferences on every page reload, these settings (including the API key) are saved locally in your browser's <code className="text-zinc-300">localStorage</code> under the key <code className="text-zinc-300">meshloop-ai-config</code>. They are never transmitted to Meshloop-operated databases or central servers.</p>
              <p>You can clear these saved credentials at any time by clicking the <strong className="text-zinc-300">Reset Settings</strong> or <strong className="text-zinc-300">New Session</strong> buttons, which will remove the entry from your browser's storage.</p>
            </Clause>

            <Clause num="5" title="Embeddings & Vector Storage" icon={Server}>
              <p>When data is indexed into ChromaDB, each chunk is converted to a vector embedding. If you are using a provider with embedding support (e.g., OpenAI with <code className="text-zinc-300">text-embedding-3-small</code> or local Ollama embeddings), the text chunk is sent to that provider's Embeddings API.</p>
              <p>If you are using <strong className="text-zinc-300">Groq</strong> — which does not offer an Embeddings API — Meshloop automatically falls back to pseudo-embeddings: deterministic, hash-based vectors generated locally with no external API call. This means no embedding data is transmitted to any third party when using Groq.</p>
              <p>ChromaDB stores vectors in memory only by default. No vector data is transmitted to Meshloop or any analytics service.</p>
            </Clause>

            <Clause num="6" title="Cookies, Analytics & Tracking" icon={Eye}>
              <p>Meshloop ARCA uses <strong className="text-zinc-300">no cookies</strong> and <strong className="text-zinc-300">no third-party tracking or behavioral analytics</strong> (no Google Analytics, no Mixpanel, no Sentry, no Datadog).</p>
              <p>The application uses your browser's <code className="text-zinc-300">localStorage</code> solely to save your local server base URL and API keys for persistence across tab reloads (stored under <code className="text-zinc-300">meshloop-ai-config</code>). No behavioral data, page views, or telemetry is captured or transmitted anywhere by Meshloop.</p>
            </Clause>

            <Clause num="7" title="Data Retention & Deletion" icon={Trash2}>
              <p>Since Meshloop operates no central server, there is no user data stored in any Meshloop-operated database to delete.</p>
              <p>Session data in your local backend is automatically cleared when the backend process is restarted. To explicitly clear a session, click <strong className="text-zinc-300">New Session</strong> in the console (which resets the frontend state) and restart the uvicorn process.</p>
              <p>If you have configured <code className="text-zinc-300">CHROMA_PERSIST_DIR</code>, deleting that directory removes all persisted vector data from your local machine.</p>
            </Clause>

            <Clause num="8" title="Children's Privacy">
              <p>Meshloop ARCA is a developer and data analyst tool not intended for use by children under 13 (or equivalent minimum age in your jurisdiction). We do not knowingly collect any personal information from children.</p>
            </Clause>

            <Clause num="9" title="Changes to This Policy">
              <p>We may update this Privacy Policy as the application evolves. The effective date at the top of this page indicates when the current version was published. We encourage you to review this page periodically. Continued use of Meshloop ARCA after any update constitutes your acceptance of the revised policy.</p>
            </Clause>

            <Clause num="10" title="Contact">
              <p>If you have questions about this Privacy Policy or the data practices of Meshloop ARCA, please open an issue in the project repository or contact the maintainers via the GitHub Discussions page.</p>
            </Clause>

          </div>
        </Section>

      </main>

      <footer className="border-t border-zinc-900/60 bg-[#030307]/90 px-8 py-8 flex items-center justify-between shrink-0 z-10 mt-auto">
        <span className="text-xs text-zinc-500 font-medium">© 2026 Meshloop ARCA. Privacy policy v1.1.</span>
        <div className="flex gap-4 text-xs font-semibold">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">Home</Link>
          <Link href="/docs" className="text-zinc-500 hover:text-zinc-300 transition-colors">Docs</Link>
          <Link href="/terms" className="text-zinc-500 hover:text-zinc-300 transition-colors">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
