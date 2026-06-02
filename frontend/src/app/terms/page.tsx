"use client";

import Link from "next/link";
import { ArrowLeft, Shield, CheckCircle2, AlertTriangle, Scale } from "lucide-react";
import { Header } from "../../components/ui/header-2";

const Section = ({ icon: Icon, label, color, children }: any) => (
  <div className="space-y-4">
    <h2 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border-b border-zinc-900/60 pb-2 ${color || "text-indigo-400"}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </h2>
    {children}
  </div>
);

const Clause = ({ num, title, children }: any) => (
  <div className="glass-card p-5 rounded-xl border border-zinc-900/80 space-y-2">
    <h3 className="font-extrabold text-zinc-200 text-[11px] uppercase tracking-wide">
      {num}. {title}
    </h3>
    <div className="text-zinc-400 text-[11px] leading-relaxed space-y-2">{children}</div>
  </div>
);

export default function TermsPage() {
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
            <Scale className="w-4 h-4" /> Legal
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white mt-1">Terms of Service</h1>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-[9px] text-zinc-500 font-mono">Effective: June 2, 2026</span>
            <span className="text-[9px] text-zinc-700">·</span>
            <span className="text-[9px] text-zinc-500 font-mono">Version 1.1</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-3 leading-relaxed max-w-xl">
            These Terms of Service govern your use of the Meshloop ARCA (Autonomous Root-Cause Analyst) diagnostic console, including all associated APIs, frontend interfaces, and pipeline tooling. Please read them carefully.
          </p>
        </div>

        {/* Core terms */}
        <Section icon={Shield} label="Terms & Conditions">
          <div className="space-y-3">

            <Clause num="1" title="Acceptance of Terms">
              <p>By accessing or using the Meshloop ARCA console — including uploading files for analysis, using the forensic chat interface, or calling any backend API endpoint — you agree to be bound by these Terms of Service in full.</p>
              <p>If you are using Meshloop ARCA on behalf of an organization, you represent that you have authority to bind that organization to these terms. If you do not agree with any part of these terms, you must not use the application.</p>
            </Clause>

            <Clause num="2" title="Nature of the Service">
              <p>Meshloop ARCA is a local-first, self-hosted forensic analytics engine. The core pipeline (ingestion, cleaning, vector storage, discovery, and reporting) runs on your own infrastructure — either your local machine or a server you control.</p>
              <p>The application itself does not operate any centralized cloud service. There is no Meshloop cloud backend. All data processing occurs within your own runtime environment. The frontend is a user interface connecting to your locally running FastAPI backend on <code className="text-zinc-300">localhost:8000</code>.</p>
            </Clause>

            <Clause num="3" title="Use of Third-Party AI APIs">
              <p>Meshloop ARCA is a Bring-Your-Own-Key (BYOK) platform. To enable LLM-powered analysis (root-cause explanations, semantic chat), you must supply your own API credentials from a supported provider such as OpenAI, Groq, GitHub Models, or any OpenAI-compatible local server.</p>
              <p>Your API key is transmitted directly from your browser to your local FastAPI backend as an HTTP header per request. <strong className="text-zinc-300">It is never stored by Meshloop</strong> — on disk, in a database, or on any third-party server operated by Meshloop.</p>
              <p>By providing an API key, you agree to comply with the terms of service of the respective provider. You are solely responsible for any costs incurred through your API usage, including token consumption during analysis and chat sessions.</p>
            </Clause>

            <Clause num="4" title="Data You Upload">
              <p>Files you upload (CSV, ZIP, PDF, TXT, Excel) are sent to your local FastAPI backend and held in memory for the duration of the session. <strong className="text-zinc-300">No uploaded file or session data is transmitted to any Meshloop-operated server.</strong></p>
              <p>During discovery, statistical summaries and text snippets extracted from your data may be sent to your configured LLM provider (e.g., OpenAI) as part of analysis prompts. You are responsible for ensuring that data you submit does not include:</p>
              <ul className="list-disc list-inside pl-2 space-y-1">
                <li>Unredacted personally identifiable information (PII) beyond what is necessary for operational analysis</li>
                <li>Protected health information (PHI) subject to HIPAA or equivalent regulations</li>
                <li>Data subject to export controls or legal holds without appropriate authorization</li>
                <li>Any data whose processing would violate applicable data protection laws in your jurisdiction</li>
              </ul>
            </Clause>

            <Clause num="5" title="Accuracy of AI-Generated Analysis">
              <p>The anomaly reports, root-cause explanations, and forensic summaries generated by the ARCA pipeline are produced by statistical algorithms and large language models. They are provided for <strong className="text-zinc-300">informational and investigative support purposes only</strong> and should not be treated as definitive conclusions.</p>
              <p>You must independently verify any finding before taking operational, financial, or infrastructure action based on it. Meshloop expressly disclaims liability for decisions made in reliance on AI-generated outputs.</p>
            </Clause>

            <Clause num="6" title="Intellectual Property">
              <p>All source code, design components, pipeline logic, and documentation comprising the Meshloop ARCA platform are the intellectual property of the Meshloop project contributors and are distributed under the applicable open-source license (see the repository <code className="text-zinc-300">LICENSE</code> file).</p>
              <p>You retain full ownership of all data you upload, and all analysis outputs (reports, exports, charts) derived from your data. Meshloop claims no ownership over your data or its derivatives.</p>
            </Clause>

            <Clause num="7" title="Prohibited Uses">
              <p>You may not use Meshloop ARCA to:</p>
              <ul className="list-disc list-inside pl-2 space-y-1">
                <li>Process data for which you do not have lawful authority</li>
                <li>Circumvent rate limits or terms of service of third-party LLM providers</li>
                <li>Build a competing commercial service that substantially reproduces the Meshloop pipeline without attribution</li>
                <li>Upload malicious files intended to exploit the backend parser or vector store</li>
              </ul>
            </Clause>

            <Clause num="8" title="Disclaimer of Warranties">
              <p>The service is provided <strong className="text-zinc-300">"as is" and "as available"</strong> without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.</p>
              <p>We do not warrant that: (a) the pipeline will be uninterrupted or error-free; (b) anomalies detected are exhaustive or accurate; (c) the LLM-generated explanations are factually correct; (d) the service will meet your specific operational requirements.</p>
            </Clause>

            <Clause num="9" title="Limitation of Liability">
              <p>To the maximum extent permitted by applicable law, Meshloop and its contributors shall not be liable for any indirect, incidental, special, consequential, or punitive damages — including but not limited to loss of revenue, data loss, or business interruption — arising from your use of or reliance on this application, even if advised of the possibility of such damages.</p>
            </Clause>

            <Clause num="10" title="Modifications to These Terms">
              <p>We reserve the right to update these Terms of Service at any time. The effective date displayed at the top of this page indicates when the current version took effect. Continued use of the application after any update constitutes acceptance of the revised terms.</p>
            </Clause>

          </div>
        </Section>

      </main>

      <footer className="border-t border-zinc-900/60 bg-[#030307]/90 px-8 py-8 flex items-center justify-between shrink-0 z-10 mt-auto">
        <span className="text-xs text-zinc-500 font-medium">© 2026 Meshloop ARCA. Legal terms v1.1.</span>
        <div className="flex gap-4 text-xs font-semibold">
          <Link href="/" className="text-zinc-500 hover:text-zinc-300 transition-colors">Home</Link>
          <Link href="/docs" className="text-zinc-500 hover:text-zinc-300 transition-colors">Docs</Link>
          <Link href="/privacy" className="text-zinc-500 hover:text-zinc-300 transition-colors">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
