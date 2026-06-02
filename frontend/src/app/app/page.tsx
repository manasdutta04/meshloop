"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Upload, 
  Play, 
  Bot, 
  Download, 
  Trash, 
  Sparkles, 
  CheckCircle, 
  LineChart as ChartIcon, 
  FileText, 
  RefreshCw,
  Search,
  MessageSquare,
  AlertTriangle,
  ArrowRight,
  Database,
  ArrowUpRight,
  Activity,
  FileSpreadsheet,
  Layers,
  Check,
  Copy,
  ChevronRight,
  ExternalLink,
  ShieldAlert,
  Info,
  Terminal,
  DownloadCloud
} from "lucide-react";
import Link from "next/link";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");

const apiUrl = (path: string) => `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

const humanizeFetchError = (err: unknown) => {
  if (err instanceof TypeError) {
    return `Cannot reach backend at ${API_BASE_URL}. Start the API server with: uvicorn main:app --port 8000 --reload`;
  }
  if (err instanceof Error && err.message) return err.message;
  return "Unknown error";
};


export default function AppHome() {
  interface AIConfig {
    provider: "github" | "openai-compatible";
    baseUrl: string;
    apiKey: string;
    chatModel: string;
    embeddingModel: string;
  }

  const defaultAIConfig: AIConfig = {
    provider: "github",
    baseUrl: "https://models.github.ai/inference",
    apiKey: "",
    chatModel: "gpt-4o",
    embeddingModel: "text-embedding-3-small",
  };

  // Application states
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [result, setResult] = useState<any>(null);
  const [aiConfig, setAIConfig] = useState<AIConfig>(defaultAIConfig);
  
  // Tab navigation
  const [activeTab, setActiveTab] = useState("discoveries");
  
  // Chat state
  interface ChatMessage {
    role: string;
    content: string;
    sources?: string[];
    suggested_followups?: string[];
  }
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem("meshloop-ai-config");
    if (saved) {
      try {
        setAIConfig({ ...defaultAIConfig, ...JSON.parse(saved) });
      } catch {
        window.localStorage.removeItem("meshloop-ai-config");
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("meshloop-ai-config", JSON.stringify(aiConfig));
  }, [aiConfig]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const buildAiHeaders = () => {
    const headers: Record<string, string> = {
      "X-Meshloop-Provider": aiConfig.provider,
      "X-Meshloop-Base-Url": aiConfig.baseUrl,
      "X-Meshloop-Chat-Model": aiConfig.chatModel,
      "X-Meshloop-Embedding-Model": aiConfig.embeddingModel,
    };
    if (aiConfig.apiKey.trim()) {
      headers["X-Meshloop-Api-Key"] = aiConfig.apiKey.trim();
    }
    return headers;
  };

  // Run pipeline analysis
  const runAnalysis = async () => {
    if (files.length === 0) return;
    
    setLoading(true);
    setResult(null);
    setChatHistory([]);
    setProgressPercent(10);
    setProgressMsg("Preparing files for upload...");

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 600000);
    let interval: ReturnType<typeof setInterval> | undefined;

    try {
      interval = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev < 40) {
            setProgressMsg("📂 Reading and parsing mixed-modal files...");
            return prev + 5;
          } else if (prev < 70) {
            setProgressMsg("🧹 Cleaning tabular and log formats...");
            return prev + 3;
          } else if (prev < 90) {
            setProgressMsg("💾 Storing in metadata tagged vector store...");
            return prev + 2;
          } else if (prev < 98) {
            setProgressMsg("🔍 Running statistical anomalies & root-cause explanations...");
            return prev + 0.5;
          }
          return prev;
        });
      }, 500);

      const response = await fetch(apiUrl("/api/analyze"), {
        method: "POST",
        headers: buildAiHeaders(),
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setProgressPercent(100);
      setProgressMsg("✅ Analysis complete!");
      
      setTimeout(() => {
        setResult(data);
        setLoading(false);
      }, 800);

    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof DOMException && err.name === "AbortError"
        ? "Analysis timed out. The backend took too long to respond."
        : humanizeFetchError(err);
      alert(`Analysis failed: ${message}`);
      setLoading(false);
    } finally {
      if (interval) clearInterval(interval);
      window.clearTimeout(timeoutId);
    }
  };

  // Run analysis on sample data
  const runSampleAnalysis = async () => {
    setLoading(true);
    setResult(null);
    setChatHistory([]);
    setProgressPercent(15);
    setProgressMsg("📂 Loading sample data (messy_sales.csv + server_log.txt)...");
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 300000);
    let interval: ReturnType<typeof setInterval> | undefined;

    try {
      interval = setInterval(() => {
        setProgressPercent((prev) => {
          if (prev < 50) return prev + 8;
          if (prev < 85) {
            setProgressMsg("💾 Running cross-modal RAG indexes...");
            return prev + 4;
          }
          if (prev < 98) {
            setProgressMsg("🔍 Correlating logs with metrics...");
            return prev + 1;
          }
          return prev;
        });
      }, 400);

      const response = await fetch(apiUrl("/api/analyze/sample"), {
        method: "POST",
        headers: buildAiHeaders(),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = await response.json();
      setProgressPercent(100);
      setProgressMsg("✅ Sample analysis complete!");
      
      setTimeout(() => {
        setResult(data);
        setLoading(false);
      }, 800);

    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof DOMException && err.name === "AbortError"
        ? "Sample analysis timed out. The backend took too long to respond."
        : humanizeFetchError(err);
      alert(`Sample analysis failed: ${message}`);
      setLoading(false);
    } finally {
      if (interval) clearInterval(interval);
      window.clearTimeout(timeoutId);
    }
  };

  // Submit chat question
  const submitChat = async (questionText?: string) => {
    const q = questionText || chatInput;
    if (!q.trim() || !result) return;

    const userMsg = { role: "user", content: q };
    setChatHistory((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch(apiUrl("/api/chat"), {
        method: "POST",
        headers: { "Content-Type": "application/json", ...buildAiHeaders() },
        signal: controller.signal,
        body: JSON.stringify({
          session_id: result.session_id,
          question: q,
          data_summary: result.data_summary,
        }),
      });

      if (!response.ok) {
        throw new Error("Chat response failed");
      }

      const data = await response.json();
      const botMsg = { 
        role: "assistant", 
        content: data.answer,
        sources: data.sources || [],
        suggested_followups: data.suggested_followups || []
      };

      setChatHistory((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setChatHistory((prev) => [
        ...prev,
        { role: "assistant", content: `Error connecting to AI chat agent. ${humanizeFetchError(err)}` }
      ]);
    } finally {
      setChatLoading(false);
      window.clearTimeout(timeoutId);
    }
  };

  // Copy report to clipboard
  const handleCopyReport = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.report.report_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to download report
  const handleDownloadReport = () => {
    if (!result) return;
    window.open(apiUrl(`/api/export/report?session_id=${result.session_id}`), "_blank");
  };

  // Clear states to upload a new file
  const resetApp = () => {
    setFiles([]);
    setResult(null);
    setChatHistory([]);
    setActiveTab("discoveries");
  };

  return (
    <div className="relative min-h-screen bg-[#030307] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-100 bg-dot-grid flex flex-col">
      
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] ambient-glow -translate-y-1/2" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[300px] ambient-glow -translate-y-1/2" />

      <header className="fixed top-0 left-0 right-0 z-40 bg-[#030307]/80 supports-[backdrop-filter]:backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-12">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="Meshloop Logo" className="h-6 w-6 object-contain" />
              <span className="text-xs font-semibold tracking-[0.18em] text-white uppercase">Meshloop</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                href="/docs"
                className="bg-white text-zinc-950 px-2.5 py-1 rounded-md font-semibold text-xs"
              >
                Documentation
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* WORKSPACE AREA */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-10 pt-16 md:pt-20 flex flex-col justify-start gap-8 z-10">
        
        {/* LANDING / UPLOAD STATE */}
        {!loading && !result && (
          <div className="max-w-2xl mx-auto w-full my-auto py-12 flex flex-col items-center animate-fade-in-up">
            
            {/* Title & Description */}
            <div className="text-center mb-10">
              <h1 className="text-3xl font-black tracking-tight text-white mb-3">
                Operational Outage Diagnosis
              </h1>
              <p className="text-xs text-zinc-450 max-w-md mx-auto leading-relaxed">
                Ingest telemetry metrics spreadsheets (CSV/Excel) and text server logs (PDF/TXT/JSON). ARCA correlates drops with events to deliver audit reports.
              </p>
            </div>

              <div className="w-full glass-card rounded-2xl border border-white/10 bg-white/4 p-5 mb-6">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">AI Connection</p>
                    <h2 className="text-sm font-semibold text-white mt-1">Bring your own key or point to a local model endpoint</h2>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAIConfig({ ...defaultAIConfig, provider: "github" })}
                      className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-[10px] font-bold text-zinc-200 hover:bg-zinc-900"
                    >
                      GitHub Models
                    </button>
                    <button
                      type="button"
                      onClick={() => setAIConfig({
                        provider: "openai-compatible",
                        baseUrl: "http://localhost:11434/v1",
                        apiKey: "",
                        chatModel: "llama3.1",
                        embeddingModel: "nomic-embed-text",
                      })}
                      className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-[10px] font-bold text-zinc-200 hover:bg-zinc-900"
                    >
                      Local / Ollama
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="grid gap-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Provider</span>
                    <select
                      value={aiConfig.provider}
                      onChange={(e) => setAIConfig((prev) => ({ ...prev, provider: e.target.value as AIConfig["provider"] }))}
                      className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 outline-none"
                    >
                      <option value="github">GitHub Models</option>
                      <option value="openai-compatible">OpenAI-compatible / Local</option>
                    </select>
                  </label>

                  <label className="grid gap-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Base URL</span>
                    <input
                      value={aiConfig.baseUrl}
                      onChange={(e) => setAIConfig((prev) => ({ ...prev, baseUrl: e.target.value }))}
                      placeholder="https://models.github.ai/inference"
                      className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 outline-none"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">API Key</span>
                    <input
                      value={aiConfig.apiKey}
                      onChange={(e) => setAIConfig((prev) => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="Paste your key here"
                      type="password"
                      className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 outline-none"
                    />
                  </label>

                  <label className="grid gap-1">
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Chat Model</span>
                    <input
                      value={aiConfig.chatModel}
                      onChange={(e) => setAIConfig((prev) => ({ ...prev, chatModel: e.target.value }))}
                      placeholder="gpt-4o or llama3.1"
                      className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 outline-none"
                    />
                  </label>

                  <label className="grid gap-1 md:col-span-2">
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Embedding Model</span>
                    <input
                      value={aiConfig.embeddingModel}
                      onChange={(e) => setAIConfig((prev) => ({ ...prev, embeddingModel: e.target.value }))}
                      placeholder="text-embedding-3-small or nomic-embed-text"
                      className="rounded-lg border border-zinc-900 bg-zinc-950 px-3 py-2 text-xs text-zinc-100 outline-none"
                    />
                  </label>
                </div>

                <p className="mt-3 text-[10px] leading-5 text-zinc-500">
                  For local privacy, point this at an OpenAI-compatible server such as Ollama or LM Studio. If your local endpoint supports embeddings, set the embedding model too; otherwise keep the default and the app will still analyze with your chosen chat model.
                </p>
              </div>

            {/* Upload Area styled as glassmorphic card */}
            <div className="w-full glass-card rounded-2xl shadow-xl p-6 transition-all duration-300">
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-dashed border-zinc-800/80 hover:border-zinc-700/80 rounded-xl p-12 flex flex-col items-center cursor-pointer transition-all duration-300 bg-zinc-950/20"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  multiple
                />
                <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800/80 flex items-center justify-center mb-4 text-zinc-400 shadow-inner group-hover:scale-105 transition-transform duration-300">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-zinc-200 mb-1 text-center">
                  Drag and drop files here to upload
                </p>
                <p className="text-[10px] text-zinc-500 text-center max-w-xs leading-normal">
                  Supports .zip packages (metrics + logs) or individual telemetry files.
                </p>
                <button 
                  type="button" 
                  className="mt-5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800/80 font-bold text-xs px-4 py-2.5 rounded-lg transition-all duration-300"
                >
                  Choose Files
                </button>
              </div>

              {/* Selected Files List */}
              {files.length > 0 && (
                <div className="mt-6 border-t border-zinc-900/60 pt-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-wider">Analysis Queue ({files.length})</span>
                    <button 
                      onClick={() => setFiles([])}
                      className="text-xs text-zinc-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors font-medium"
                    >
                      <Trash className="w-3.5 h-3.5" /> Clear Queue
                    </button>
                  </div>
                  
                  <div className="max-h-36 overflow-y-auto space-y-2 pr-1 mb-5 scrollbar-thin">
                    {files.map((f, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-zinc-950/60 px-4 py-2.5 rounded-lg text-xs border border-zinc-900/80">
                        <span className="truncate max-w-md font-mono text-zinc-300">📄 {f.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{(f.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={runAnalysis}
                    className="glow-btn-primary w-full bg-white text-zinc-950 text-xs font-black py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300"
                  >
                    <Play className="w-4 h-4 text-zinc-950" /> Start Diagnostics Pipeline
                  </button>
                </div>
              )}
            </div>

            {/* Sandbox runner */}
            {files.length === 0 && (
              <div className="mt-8 flex items-center gap-2 animate-pulse">
                <span className="text-xs text-zinc-500">Want to test the layout?</span>
                <button
                  onClick={runSampleAnalysis}
                  className="text-indigo-400 hover:text-indigo-300 transition-colors text-xs font-bold flex items-center gap-1"
                >
                  Load Sample sandbox data <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* LOADING / PROGRESS STATE */}
        {loading && (
          <div className="max-w-md mx-auto w-full my-auto py-16 flex flex-col items-center text-center animate-fade-in-up">
            <div className="relative w-16 h-16 mb-8 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-t-zinc-200 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-2 border-t-zinc-650 border-r-transparent border-b-transparent border-l-transparent animate-spin-reverse" style={{ animationDuration: '1s' }}></div>
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800/80 flex items-center justify-center shadow-inner">
                <Terminal className="w-4 h-4 text-zinc-400" />
              </div>
            </div>
            
            <h3 className="text-sm font-bold text-zinc-200 mb-1">Analyzing Dataset</h3>
            <p className="text-xs text-zinc-500 h-6 leading-normal truncate max-w-sm mb-5 font-medium">{progressMsg}</p>
            
            {/* Progress bar */}
            <div className="w-full bg-zinc-900/60 rounded-full h-1.5 border border-zinc-900 overflow-hidden mb-3">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono font-bold">{Math.round(progressPercent)}% Compiled</span>
          </div>
        )}

        {/* RESULTS STATE */}
        {result && (
          <div className="space-y-6 animate-fade-in-up">
            
            {/* Session stats header */}
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-zinc-900/60 pb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-400">
                  <Database className="w-4.5 h-4.5" />
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider block">Data Source</span>
                  <h2 className="text-sm font-extrabold text-white font-mono mt-0.5">
                    {result.data_summary.file_name}
                  </h2>
                </div>
              </div>
              
              <button 
                onClick={resetApp}
                className="bg-zinc-900/80 border border-zinc-800/80 hover:bg-zinc-850 text-zinc-300 font-bold text-xs px-4 py-2 rounded-lg transition-all duration-300 shadow-sm flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" /> New Session
              </button>
            </div>

            {/* Core Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-5 rounded-xl shadow-md">
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider block">Rows Loaded</span>
                <span className="text-2xl font-black text-white mt-2 block font-mono">{result.data_summary.row_count.toLocaleString()}</span>
              </div>
              <div className="glass-card p-5 rounded-xl shadow-md">
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider block">Keys Analyzed</span>
                <span className="text-2xl font-black text-white mt-2 block font-mono">{result.data_summary.column_names.length}</span>
              </div>
              <div className="glass-card p-5 rounded-xl shadow-md">
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider block">Auto Cleans</span>
                <span className="text-2xl font-black text-emerald-400 mt-2 block font-mono">{result.cleaning.issues_found.length}</span>
              </div>
              <div className="glass-card p-5 rounded-xl shadow-md">
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider block">Anomalies Resolved</span>
                <span className="text-2xl font-black text-indigo-400 mt-2 block font-mono">{result.discovery.total_found}</span>
              </div>
            </div>

            {/* Tab view controller */}
            <div className="flex border-b border-zinc-900/80 p-1 bg-zinc-950/80 backdrop-blur-sm rounded-xl max-w-fit flex-wrap gap-1 border">
              {[
                { id: "discoveries", label: "Findings", icon: Search },
                { id: "visuals", label: "Visuals", icon: ChartIcon },
                { id: "chat", label: "Ask Assistant", icon: MessageSquare },
                { id: "report", label: "Audit Report", icon: FileText },
                { id: "export", label: "Exports", icon: Download }
              ].map((t) => {
                const Icon = t.icon;
                const active = activeTab === t.id;
                return (
                  <button 
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-lg transition-all duration-300 ${
                      active ? "bg-zinc-900 text-white border border-zinc-800/80 shadow-md" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: DISCOVERIES */}
            {activeTab === "discoveries" && (
              <div className="space-y-6">
                {result.discovery.top_insight && (
                  <div className="glass-card p-5 rounded-xl border-l-2 border-indigo-500/40">
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider block mb-2">Top Insight</span>
                    <p className="text-xs font-bold text-zinc-200 mb-1">{result.discovery.top_insight.title}</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {result.discovery.top_insight.description}
                    </p>
                  </div>
                )}

                {/* Incident cards list */}
                <div className="space-y-4">
                  <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider block">Analyzed Incidents &amp; Anomaly Details</span>
                  {result.discovery.insights.map((ins: any, idx: number) => {
                    const sev = ins.severity?.toLowerCase() || "low";
                    const sevBorderMap: Record<string, string> = {
                      critical: "border-red-900/40 bg-red-950/5 text-red-400",
                      high: "border-orange-900/40 bg-orange-950/5 text-orange-400",
                      medium: "border-yellow-900/40 bg-yellow-950/5 text-yellow-400",
                      low: "border-emerald-900/40 bg-emerald-950/5 text-emerald-400",
                    };
                    return (
                      <div key={idx} className={`border p-5 rounded-xl flex flex-col gap-3 transition-colors ${sevBorderMap[sev] || "border-zinc-850 bg-zinc-900"}`}>
                        <div className="flex justify-between items-center gap-4">
                          <span className="font-extrabold text-xs text-zinc-200">{ins.title}</span>
                          <span className="text-[8px] font-mono px-2 py-0.5 rounded-full border uppercase tracking-wider bg-zinc-950/80 border-zinc-800/80 font-bold">
                            {sev}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed font-medium">{ins.description}</p>
                        {ins.data_evidence && Object.keys(ins.data_evidence).length > 0 && (
                          <div className="bg-zinc-950/80 border border-zinc-900 rounded-lg p-3 text-[10px] font-mono text-zinc-500 overflow-x-auto">
                            Evidence: {JSON.stringify(ins.data_evidence, null, 2)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

              {/* TAB 2: VISUAL ANALYTICS */}
              {activeTab === "visuals" && (
                <div className="space-y-6">
                  <div className="glass-card p-5 rounded-xl">
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider block mb-4">Metric Charts</span>
                    
                    {result.report.chart_specs.length === 0 ? (
                      <p className="text-xs text-zinc-600 text-center py-12">No visual analytics specs generated.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {result.report.chart_specs.map((spec: any, idx: number) => {
                          return (
                            <div key={idx} className="bg-zinc-950/60 border border-zinc-900/80 p-5 rounded-xl flex flex-col gap-4">
                              <span className="text-xs font-bold text-zinc-300 block font-mono">{spec.title}</span>
                              
                              <div className="w-full h-56 bg-zinc-900/10 border border-zinc-900/80 rounded-lg p-3 flex items-center justify-center relative">
                                {spec.type === "histogram" || spec.type === "bar" ? (
                                  <svg className="w-full h-full" viewBox="0 0 100 60">
                                    <line x1="10" y1="50" x2="90" y2="50" stroke="#27272a" strokeWidth="0.5" />
                                    <line x1="10" y1="10" x2="10" y2="50" stroke="#27272a" strokeWidth="0.5" />
                                    {/* Flat rectangular bars */}
                                    <rect x="22" y="25" width="6" height="25" fill="#52525b" rx="0.5" />
                                    <rect x="37" y="15" width="6" height="35" fill="#52525b" rx="0.5" />
                                    <rect x="52" y="40" width="6" height="10" fill="#f43f5e" rx="0.5" />
                                    <rect x="67" y="20" width="6" height="30" fill="#52525b" rx="0.5" />
                                    <text x="25" y="55" fill="#71717a" fontSize="3" textAnchor="middle">East</text>
                                    <text x="40" y="55" fill="#71717a" fontSize="3" textAnchor="middle">West</text>
                                    <text x="55" y="55" fill="#f43f5e" fontSize="3" textAnchor="middle" fontWeight="bold">Drop</text>
                                    <text x="70" y="55" fill="#71717a" fontSize="3" textAnchor="middle">North</text>
                                  </svg>
                                ) : spec.type === "line" ? (
                                  <svg className="w-full h-full" viewBox="0 0 100 60">
                                    <line x1="10" y1="50" x2="90" y2="50" stroke="#27272a" strokeWidth="0.5" />
                                    <line x1="10" y1="35" x2="90" y2="35" stroke="#18181b" strokeWidth="0.3" strokeDasharray="1" />
                                    <line x1="10" y1="20" x2="90" y2="20" stroke="#18181b" strokeWidth="0.3" strokeDasharray="1" />
                                    {/* Flat line chart */}
                                    <path 
                                      d="M 15 20 L 30 18 L 45 42 L 60 45 L 75 22 L 85 15" 
                                      fill="none" 
                                      stroke="#fafafa" 
                                      strokeWidth="1.2"
                                      strokeLinecap="square"
                                    />
                                    <circle cx="45" cy="42" r="1.5" fill="#f43f5e" />
                                    <circle cx="60" cy="45" r="1.5" fill="#f43f5e" />
                                    <text x="52" y="54" fill="#f43f5e" fontSize="3.2" textAnchor="middle" fontWeight="bold">Outage</text>
                                  </svg>
                                ) : (
                                  <svg className="w-full h-full" viewBox="0 0 100 60">
                                    <line x1="10" y1="50" x2="90" y2="50" stroke="#27272a" strokeWidth="0.5" />
                                    {/* Scatter dots */}
                                    <circle cx="20" cy="38" r="1.2" fill="#71717a" />
                                    <circle cx="30" cy="33" r="1.2" fill="#71717a" />
                                    <circle cx="40" cy="36" r="1.2" fill="#71717a" />
                                    <circle cx="48" cy="15" r="1.5" fill="#f43f5e" />
                                    <circle cx="55" cy="28" r="1.2" fill="#71717a" />
                                    <circle cx="70" cy="22" r="1.2" fill="#71717a" />
                                    <circle cx="80" cy="18" r="1.2" fill="#71717a" />
                                    {/* regression line */}
                                    <line x1="15" y1="40" x2="85" y2="15" stroke="#a1a1aa" strokeWidth="0.4" strokeDasharray="1.5" />
                                    <text x="48" y="10" fill="#f43f5e" fontSize="3" textAnchor="middle" fontWeight="bold">Outlier</text>
                                  </svg>
                                )}
                                <span className="absolute bottom-2 right-2.5 text-[8px] font-mono text-zinc-600 bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-900 font-bold">ARCA Core Visualizer</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: INCIDENT ROOM CHAT */}
              {activeTab === "chat" && (
                <div className="space-y-6">
                  <div className="glass-card p-5 rounded-xl flex flex-col">
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider block mb-4">Forensic Conversation Room</span>

                    {/* Chat viewport */}
                    <div className="bg-zinc-950/85 border border-zinc-900 rounded-xl p-5 min-h-[300px] max-h-[420px] overflow-y-auto space-y-4 mb-4 scrollbar-thin">
                      {chatHistory.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center py-20">
                          <Bot className="w-10 h-10 text-zinc-650 mb-3" />
                          <p className="text-xs text-zinc-300 font-bold mb-1">ARCA Chat Assistant Active</p>
                          <p className="text-[10px] text-zinc-500 max-w-xs leading-normal">Ask any question to search ChromaDB vectors and synthesize log/metrics details.</p>
                        </div>
                      )}

                      {chatHistory.map((msg, idx) => (
                        <div 
                          key={idx} 
                          className={`flex flex-col max-w-[80%] ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
                        >
                          <span className="text-[9px] font-mono text-zinc-500 uppercase mb-1 font-bold">
                            {msg.role === "user" ? "User" : "ARCA Analyst"}
                          </span>
                          <div className={`p-4 rounded-xl text-xs leading-relaxed border ${
                            msg.role === "user" 
                              ? "bg-zinc-900 border-zinc-800/80 text-zinc-200 rounded-tr-none" 
                              : "bg-[#0c0c14] border-zinc-900 text-zinc-400 rounded-tl-none"
                          }`}>
                            <p className="whitespace-pre-line font-medium">{msg.content}</p>
                            
                            {/* Citation list */}
                            {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-zinc-900/60">
                                <span className="text-[8px] text-zinc-500 font-black uppercase mr-1">Sources:</span>
                                {msg.sources.filter(Boolean).map((src, sidx) => (
                                  <span key={sidx} className="bg-zinc-900/60 border border-zinc-850 text-indigo-400 font-mono text-[8px] px-1.5 py-0.5 rounded font-bold">
                                    {src}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {chatLoading && (
                        <div className="flex flex-col max-w-[80%] mr-auto items-start">
                          <span className="text-[9px] font-mono text-zinc-500 uppercase mb-1 font-bold">ARCA Analyst</span>
                          <div className="p-4 bg-zinc-900/20 border border-zinc-900 text-zinc-500 text-xs rounded-xl rounded-tl-none animate-pulse">
                            Searching vectors & correlating metadata...
                          </div>
                        </div>
                      )}
                      
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat followups suggestions */}
                    {chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === "assistant" && chatHistory[chatHistory.length - 1].suggested_followups && (
                      <div className="mb-4">
                        <span className="text-[8px] font-extrabold uppercase text-zinc-550 block mb-2 tracking-wider">Suggested follow-ups:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {chatHistory[chatHistory.length - 1].suggested_followups?.map((q, idx) => (
                            <button
                              key={idx}
                              onClick={() => submitChat(q)}
                              className="bg-zinc-950 hover:bg-zinc-900 text-zinc-300 hover:text-zinc-100 text-[10px] px-3 py-1.5 rounded-lg border border-zinc-900 transition-all duration-300 flex items-center gap-1.5 font-medium"
                            >
                              {q} <ArrowRight className="w-3 h-3 text-zinc-500" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Pre-configured suggestion prompts */}
                    {chatHistory.length === 0 && (
                      <div className="mb-4">
                        <span className="text-[9px] font-black uppercase text-zinc-500 block mb-2.5 tracking-wider">Common Diagnostic Prompts</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {[
                            "Explain the most critical issue found in this dataset",
                            "Did database timeouts impact region sales?",
                            "List the data corrections that were executed",
                            "What is the statistical average drop on outliers?"
                          ].map((q, idx) => (
                            <button
                              key={idx}
                              onClick={() => submitChat(q)}
                              className="text-left bg-zinc-950 hover:bg-zinc-900 text-[10px] text-zinc-400 hover:text-zinc-200 px-3.5 py-2.5 rounded-lg border border-zinc-900 transition-all duration-300 flex justify-between items-center font-medium"
                            >
                              <span>{q}</span> <ArrowRight className="w-3 h-3 text-zinc-650 shrink-0 ml-2" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Chat input form */}
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && submitChat()}
                        placeholder="Search timeline context..."
                        className="flex-1 bg-zinc-950 border border-zinc-900 focus:border-zinc-700 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none transition-colors"
                      />
                      <button 
                        onClick={() => submitChat()}
                        disabled={chatLoading}
                        className="bg-white hover:bg-zinc-200 disabled:bg-zinc-800 text-zinc-950 px-5 rounded-lg text-xs font-extrabold transition-all duration-300 shrink-0 flex items-center justify-center shadow-sm"
                      >
                        Ask
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: AUDIT REPORT */}
              {activeTab === "report" && (
                <div className="space-y-6">
                  <div className="glass-card p-5 rounded-xl flex flex-col">
                    <div className="flex justify-between items-center flex-wrap gap-3 mb-4">
                      <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-zinc-500" /> Markdown Audit summary
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCopyReport}
                          className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-350 hover:text-zinc-200 font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-zinc-500" /> Copy
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleDownloadReport}
                          className="bg-white hover:bg-zinc-250 text-zinc-950 font-black text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all duration-300 shadow-sm"
                        >
                          <DownloadCloud className="w-3.5 h-3.5" /> Download Report
                        </button>
                      </div>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-900 rounded-lg p-5 overflow-y-auto max-h-[480px] text-xs text-zinc-400 font-mono whitespace-pre-wrap leading-relaxed scrollbar-thin">
                      {result.report.report_text}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: EXPORTS & QUALITY TABLE */}
              {activeTab === "export" && (
                <div className="space-y-6">
                  {/* CSV Exports */}
                  <div className="glass-card p-5 rounded-xl">
                    <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider block mb-4">Tabular exports</span>

                    {result.data_summary.file_names && result.data_summary.file_names.length > 0 ? (
                      <div className="space-y-3">
                        {result.data_summary.file_names.map((fname: string, idx: number) => {
                          const ext = fname.split(".").pop()?.toLowerCase() || "";
                          const isTabular = ["csv", "xlsx", "xls", "json"].includes(ext);
                          
                          if (!isTabular) return null;

                          return (
                            <div key={idx} className="bg-zinc-950/60 border border-zinc-900 p-4 rounded-lg flex justify-between items-center flex-wrap gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800/80 flex items-center justify-center text-zinc-500">
                                  <FileSpreadsheet className="w-4.5 h-4.5" />
                                </div>
                                <div>
                                  <span className="text-xs font-bold text-zinc-200 block font-mono">{fname}</span>
                                  <span className="text-[10px] text-zinc-550 block">Validated & clean schema layout</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <a 
                                  href={apiUrl(`/api/export/cleaned?session_id=${result.session_id}&filename=${encodeURIComponent(fname)}`)}
                                  target="_blank"
                                  className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-350 hover:text-zinc-200 font-bold text-xs px-3.5 py-2 rounded-lg transition-all duration-300 shadow-sm"
                                >
                                  Cleaned CSV
                                </a>
                                <a 
                                  href={apiUrl(`/api/export/balanced?session_id=${result.session_id}&filename=${encodeURIComponent(fname)}`)}
                                  target="_blank"
                                  className="bg-white hover:bg-zinc-200 text-zinc-950 font-extrabold text-xs px-3.5 py-2 rounded-lg transition-all duration-300 shadow-sm"
                                >
                                  Balanced CSV
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-550">No tabular spreadsheet files detected.</p>
                    )}
                  </div>

                  {/* Corrections checklists */}
                  {result.cleaning.issues_found.length > 0 && (
                    <div className="glass-card p-5 rounded-xl">
                      <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider block mb-4">Corrections ledger</span>
                      <div className="border border-zinc-900 bg-zinc-950 rounded-xl overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-900 bg-zinc-900/30">
                              <th className="p-3.5 text-[9px] font-black uppercase tracking-wider text-zinc-550 w-12 text-center border-r border-zinc-900">Status</th>
                              <th className="p-3.5 text-[9px] font-black uppercase tracking-wider text-zinc-550">Validation Check details</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900 text-xs">
                            {result.cleaning.issues_found.map((issue: string, idx: number) => (
                              <tr key={idx} className="hover:bg-zinc-900/10">
                                <td className="p-3 text-center border-r border-zinc-900">
                                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-950/80 border border-emerald-900/60 text-emerald-400 font-extrabold text-[10px]">✓</span>
                                </td>
                                <td className="p-3 text-zinc-300 font-mono text-[11px] font-medium">{issue}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

          </div>
        )}
      </main>
    </div>
  );
}
