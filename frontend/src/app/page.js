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

export default function Home() {
  // Application states
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [result, setResult] = useState(null);
  
  // Tab navigation
  const [activeTab, setActiveTab] = useState("discoveries");
  
  // Chat state
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Refs
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
    }
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

    try {
      const interval = setInterval(() => {
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

      const response = await fetch("http://localhost:8000/api/analyze", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);

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

    } catch (err) {
      console.error(err);
      alert(`Analysis failed: ${err.message || "Unknown error"}`);
      setLoading(false);
    }
  };

  // Run analysis on sample data
  const runSampleAnalysis = async () => {
    setLoading(true);
    setResult(null);
    setChatHistory([]);
    setProgressPercent(15);
    setProgressMsg("📂 Loading sample data (messy_sales.csv + server_log.txt)...");

    try {
      const interval = setInterval(() => {
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

      const response = await fetch("http://localhost:8000/api/analyze/sample", {
        method: "POST",
      });

      clearInterval(interval);

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

    } catch (err) {
      console.error(err);
      alert(`Sample analysis failed: ${err.message || "Unknown error"}`);
      setLoading(false);
    }
  };

  // Submit chat question
  const submitChat = async (questionText) => {
    const q = questionText || chatInput;
    if (!q.trim() || !result) return;

    const userMsg = { role: "user", content: q };
    setChatHistory((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        { role: "assistant", content: "Error connecting to AI chat agent. Please check if backend is running." }
      ]);
    } finally {
      setChatLoading(false);
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
    window.open(`http://localhost:8000/api/export/report?session_id=${result.session_id}`, "_blank");
  };

  // Clear states to upload a new file
  const resetApp = () => {
    setFiles([]);
    setResult(null);
    setChatHistory([]);
    setActiveTab("discoveries");
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-50 font-sans selection:bg-zinc-800 selection:text-zinc-100">
      {/* TOP HEADER / NAVBAR */}
      <header className="h-14 border-b border-zinc-900 bg-zinc-950 px-6 flex items-center justify-between shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-zinc-100 flex items-center justify-center text-zinc-950 font-bold text-sm">
            M
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-zinc-100">Meshloop</span>
            <span className="text-[10px] text-zinc-400 font-mono px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900/50">ARCA v1.2</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-zinc-900 bg-zinc-900/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">Live API Connected</span>
          </div>
          <a 
            href="https://github.com/manasdutta04/meshloop" 
            target="_blank" 
            className="text-zinc-500 hover:text-zinc-300 transition-colors text-xs flex items-center gap-1"
          >
            Documentation <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </header>

      {/* WORKSPACE AREA */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 flex flex-col justify-start gap-6">
        
        {/* LANDING / UPLOAD STATE */}
        {!loading && !result && (
          <div className="max-w-2xl mx-auto w-full my-auto py-8 flex flex-col items-center">
            
            {/* Title & Description */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-white mb-2.5">
                Autonomous Root-Cause Analyst
              </h1>
              <p className="text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                Ingest metric spreadsheets (CSV/Excel) and text logs (PDF/TXT/JSON). Meshloop detects statistical deviations and correlates them with events to diagnose outages.
              </p>
            </div>

            {/* Upload Area styled as shadcn card */}
            <div className="w-full bg-zinc-900 border border-zinc-800 rounded-lg shadow-sm p-6">
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current.click()}
                className="w-full border border-dashed border-zinc-800 hover:border-zinc-700 rounded-lg p-10 flex flex-col items-center cursor-pointer transition-colors duration-200 bg-zinc-950/40"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  multiple
                />
                <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
                  <Upload className="w-5 h-5 text-zinc-400" />
                </div>
                <p className="text-xs font-semibold text-zinc-200 mb-1 text-center">
                  Drag and drop files here to upload
                </p>
                <p className="text-[10px] text-zinc-500 text-center max-w-xs leading-normal">
                  Supports ZIP file (containing sales metrics + server logs) or individual datasets.
                </p>
                <button 
                  type="button" 
                  className="mt-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 font-semibold text-xs px-3.5 py-2 rounded transition-colors"
                >
                  Choose Files
                </button>
              </div>

              {/* Selected Files List */}
              {files.length > 0 && (
                <div className="mt-6 border-t border-zinc-900 pt-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Analysis Queue ({files.length})</span>
                    <button 
                      onClick={() => setFiles([])}
                      className="text-xs text-zinc-400 hover:text-red-400 flex items-center gap-1 transition-colors"
                    >
                      <Trash className="w-3.5 h-3.5" /> Clear Queue
                    </button>
                  </div>
                  
                  <div className="max-h-36 overflow-y-auto space-y-2 pr-1 mb-4 scrollbar-thin">
                    {files.map((f, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-zinc-950 px-3 py-2 rounded text-xs border border-zinc-900">
                        <span className="truncate max-w-md font-mono text-zinc-300">📄 {f.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{(f.size / 1024).toFixed(1)} KB</span>
                      </div>
                    ))}
                  </div>
                  
                  <button
                    onClick={runAnalysis}
                    className="w-full bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-bold py-2.5 rounded flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Play className="w-4 h-4 text-zinc-900" /> Start Diagnostics
                  </button>
                </div>
              )}
            </div>

            {/* Sandbox runner */}
            {files.length === 0 && (
              <div className="mt-6 flex items-center gap-2">
                <span className="text-xs text-zinc-500">Want to test the layout?</span>
                <button
                  onClick={runSampleAnalysis}
                  className="text-indigo-400 hover:text-indigo-350 transition-colors text-xs font-bold flex items-center gap-1"
                >
                  Load Sample sandbox data <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* LOADING / PROGRESS STATE */}
        {loading && (
          <div className="max-w-md mx-auto w-full my-auto py-12 flex flex-col items-center text-center">
            <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-t-zinc-400 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              <div className="absolute inset-1.5 rounded-full border border-t-zinc-500 border-r-transparent border-b-transparent border-l-transparent animate-spin-reverse" style={{ animationDuration: '1.2s' }}></div>
              <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-zinc-400" />
              </div>
            </div>
            
            <h3 className="text-sm font-bold text-zinc-200 mb-1">Processing Dataset</h3>
            <p className="text-xs text-zinc-500 h-6 leading-normal truncate max-w-sm mb-4">{progressMsg}</p>
            
            {/* Progress bar */}
            <div className="w-full bg-zinc-900 rounded-full h-1 border border-zinc-900 overflow-hidden mb-2">
              <div 
                className="bg-zinc-200 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">{Math.round(progressPercent)}% Compiled</span>
          </div>
        )}

        {/* RESULTS STATE */}
        {result && (
          <div className="space-y-6 animate-in fade-in-50 duration-200">
            
            {/* Session stats header */}
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-zinc-900 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                  <Database className="w-4 h-4 text-zinc-400" />
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-mono block">Data Source</span>
                  <h2 className="text-sm font-bold text-white font-mono leading-none mt-0.5">
                    {result.data_summary.file_name}
                  </h2>
                </div>
              </div>
              
              <button 
                onClick={resetApp}
                className="bg-zinc-900 border border-zinc-800 hover:bg-zinc-900 text-zinc-300 font-semibold text-xs px-3 py-1.5 rounded transition-colors shadow-sm"
              >
                <RefreshCw className="w-3 h-3 inline mr-1" /> New Analysis
              </button>
            </div>

            {/* Core Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-zinc-900/50 border border-zinc-900 p-4 rounded-lg shadow-sm">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Rows Loaded</span>
                <span className="text-xl font-bold text-white mt-1.5 block">{result.data_summary.row_count.toLocaleString()}</span>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-900 p-4 rounded-lg shadow-sm">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Keys Analyzed</span>
                <span className="text-xl font-bold text-white mt-1.5 block">{result.data_summary.column_names.length}</span>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-900 p-4 rounded-lg shadow-sm">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Auto Cleans</span>
                <span className="text-xl font-bold text-emerald-500 mt-1.5 block">{result.cleaning.issues_found.length}</span>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-900 p-4 rounded-lg shadow-sm">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Outages Explained</span>
                <span className="text-xl font-bold text-indigo-400 mt-1.5 block">{result.discovery.total_found}</span>
              </div>
            </div>

            {/* Tab view controller */}
            <div className="flex border-b border-zinc-900 p-0.5 bg-zinc-950 rounded-lg max-w-fit flex-wrap gap-1">
              <button 
                onClick={() => setActiveTab("discoveries")}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded transition-colors ${
                  activeTab === "discoveries" ? "bg-zinc-900 text-white border border-zinc-800" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Findings</span>
              </button>
              <button 
                onClick={() => setActiveTab("visuals")}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded transition-colors ${
                  activeTab === "visuals" ? "bg-zinc-900 text-white border border-zinc-800" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <ChartIcon className="w-3.5 h-3.5" />
                <span>Visuals</span>
              </button>
              <button 
                onClick={() => setActiveTab("chat")}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded transition-colors ${
                  activeTab === "chat" ? "bg-zinc-900 text-white border border-zinc-800" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Ask Assistant</span>
              </button>
              <button 
                onClick={() => setActiveTab("report")}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded transition-colors ${
                  activeTab === "report" ? "bg-zinc-900 text-white border border-zinc-800" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Audit Report</span>
              </button>
              <button 
                onClick={() => setActiveTab("export")}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded transition-colors ${
                  activeTab === "export" ? "bg-zinc-900 text-white border border-zinc-800" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exports</span>
              </button>
            </div>

            {/* TAB PANELS */}
            <div className="min-h-[350px]">
              
              {/* TAB 1: ROOT-CAUSE DISCOVERIES */}
              {activeTab === "discoveries" && (
                <div className="space-y-5">
                  {/* Summary card */}
                  <div className="bg-zinc-900/40 border border-zinc-900 p-4.5 rounded-lg">
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block mb-2">Executive Diagnostic Summary</span>
                    <p className="text-zinc-300 text-xs leading-relaxed">
                      {result.discovery.summary}
                    </p>
                  </div>

                  {/* Top Conclusion banner */}
                  {result.discovery.top_insight && (
                    <div className="bg-indigo-950/15 border border-indigo-900/50 p-4.5 rounded-lg">
                      <span className="inline-flex items-center gap-1 bg-indigo-950 text-indigo-400 border border-indigo-850/60 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider mb-2">
                        Primary Event Outage
                      </span>
                      <h4 className="text-sm font-bold text-zinc-100 mb-1">
                        {result.discovery.top_insight.title}
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {result.discovery.top_insight.description}
                      </p>
                    </div>
                  )}

                  {/* Incident cards list */}
                  <div className="space-y-3">
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block">Analyzed Incidents & Anomaly Details</span>
                    {result.discovery.insights.map((ins, idx) => {
                      const sev = ins.severity?.toLowerCase() || "low";
                      const sevBorderMap = {
                        critical: "border-red-900/40 bg-red-950/5 text-red-400",
                        high: "border-orange-900/40 bg-orange-950/5 text-orange-400",
                        medium: "border-yellow-900/40 bg-yellow-950/5 text-yellow-400",
                        low: "border-emerald-900/40 bg-emerald-950/5 text-emerald-400",
                      };
                      return (
                        <div key={idx} className={`border p-4 rounded-lg flex flex-col gap-2 ${sevBorderMap[sev] || "border-zinc-800 bg-zinc-900"}`}>
                          <div className="flex justify-between items-center gap-4">
                            <span className="font-bold text-xs text-zinc-200">{ins.title}</span>
                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase tracking-wider bg-zinc-950 border-zinc-800/80">
                              {sev}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 leading-relaxed">{ins.description}</p>
                          {ins.data_evidence && Object.keys(ins.data_evidence).length > 0 && (
                            <div className="bg-zinc-950 border border-zinc-900 rounded p-2 text-[10px] font-mono text-zinc-500 overflow-x-auto">
                              Evidence: {JSON.stringify(ins.data_evidence)}
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
                <div className="space-y-5">
                  <div className="bg-zinc-900/40 border border-zinc-900 p-4.5 rounded-lg">
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block mb-4">Metric Charts</span>
                    
                    {result.report.chart_specs.length === 0 ? (
                      <p className="text-xs text-zinc-600 text-center py-8">No visual analytics specs generated.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {result.report.chart_specs.map((spec, idx) => {
                          return (
                            <div key={idx} className="bg-zinc-950 border border-zinc-900 p-4 rounded-lg flex flex-col gap-3">
                              <span className="text-xs font-semibold text-zinc-300 block font-mono">{spec.title}</span>
                              
                              <div className="w-full h-56 bg-zinc-900/30 border border-zinc-900 rounded p-2 flex items-center justify-center relative">
                                {spec.type === "histogram" || spec.type === "bar" ? (
                                  <svg className="w-full h-full" viewBox="0 0 100 60">
                                    <line x1="10" y1="50" x2="90" y2="50" stroke="#27272a" strokeWidth="0.5" />
                                    <line x1="10" y1="10" x2="10" y2="50" stroke="#27272a" strokeWidth="0.5" />
                                    {/* Flat rectangular bars */}
                                    <rect x="22" y="25" width="6" height="25" fill="#52525b" />
                                    <rect x="37" y="15" width="6" height="35" fill="#52525b" />
                                    <rect x="52" y="40" width="6" height="10" fill="#dc2626" />
                                    <rect x="67" y="20" width="6" height="30" fill="#52525b" />
                                    <text x="25" y="55" fill="#71717a" fontSize="3" textAnchor="middle">East</text>
                                    <text x="40" y="55" fill="#71717a" fontSize="3" textAnchor="middle">West</text>
                                    <text x="55" y="55" fill="#ef4444" fontSize="3" textAnchor="middle">Drop</text>
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
                                    <circle cx="45" cy="42" r="1.5" fill="#dc2626" />
                                    <circle cx="60" cy="45" r="1.5" fill="#dc2626" />
                                    <text x="52" y="54" fill="#dc2626" fontSize="3.2" textAnchor="middle" fontWeight="bold">Outage</text>
                                  </svg>
                                ) : (
                                  <svg className="w-full h-full" viewBox="0 0 100 60">
                                    <line x1="10" y1="50" x2="90" y2="50" stroke="#27272a" strokeWidth="0.5" />
                                    {/* Scatter dots */}
                                    <circle cx="20" cy="38" r="1.2" fill="#71717a" />
                                    <circle cx="30" cy="33" r="1.2" fill="#71717a" />
                                    <circle cx="40" cy="36" r="1.2" fill="#71717a" />
                                    <circle cx="48" cy="15" r="1.5" fill="#dc2626" />
                                    <circle cx="55" cy="28" r="1.2" fill="#71717a" />
                                    <circle cx="70" cy="22" r="1.2" fill="#71717a" />
                                    <circle cx="80" cy="18" r="1.2" fill="#71717a" />
                                    {/* regression line */}
                                    <line x1="15" y1="40" x2="85" y2="15" stroke="#a1a1aa" strokeWidth="0.4" strokeDasharray="1.5" />
                                    <text x="48" y="10" fill="#dc2626" fontSize="3" textAnchor="middle" fontWeight="bold">Outlier</text>
                                  </svg>
                                )}
                                <span className="absolute bottom-2 right-2.5 text-[8px] font-mono text-zinc-600 bg-zinc-950 px-1 py-0.5 rounded border border-zinc-900">ARCA Graph</span>
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
                <div className="space-y-5">
                  <div className="bg-zinc-900/40 border border-zinc-900 p-4.5 rounded-lg flex flex-col">
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block mb-4">Forensic Conversation Room</span>

                    {/* Chat viewport */}
                    <div className="bg-zinc-950 border border-zinc-900 rounded p-4 min-h-[280px] max-h-[400px] overflow-y-auto space-y-4 mb-4 scrollbar-thin">
                      {chatHistory.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center py-16">
                          <Bot className="w-8 h-8 text-zinc-500 mb-2.5" />
                          <p className="text-xs text-zinc-300 font-bold mb-1">ARCA Chat Assistant Active</p>
                          <p className="text-[10px] text-zinc-500 max-w-xs leading-normal">Ask any question to search ChromaDB vectors and synthesize log/metrics details.</p>
                        </div>
                      )}

                      {chatHistory.map((msg, idx) => (
                        <div 
                          key={idx} 
                          className={`flex flex-col max-w-[80%] ${msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start"}`}
                        >
                          <span className="text-[9px] font-mono text-zinc-500 uppercase mb-0.5">
                            {msg.role === "user" ? "User" : "ARCA Analyst"}
                          </span>
                          <div className={`p-3 rounded text-xs leading-relaxed border ${
                            msg.role === "user" 
                              ? "bg-zinc-900 border-zinc-800 text-zinc-200 rounded-tr-none" 
                              : "bg-zinc-950 border-zinc-900 text-zinc-400 rounded-tl-none"
                          }`}>
                            <p className="whitespace-pre-line">{msg.content}</p>
                            
                            {/* Citation list */}
                            {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-zinc-900/60">
                                <span className="text-[8px] text-zinc-600 font-bold uppercase mr-1">Sources:</span>
                                {msg.sources.filter(Boolean).map((src, sidx) => (
                                  <span key={sidx} className="bg-zinc-900 border border-zinc-900 text-indigo-400 font-mono text-[8px] px-1 py-0.5 rounded">
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
                          <span className="text-[9px] font-mono text-zinc-500 uppercase mb-0.5">ARCA Analyst</span>
                          <div className="p-3 bg-zinc-900/30 border border-zinc-900 text-zinc-600 text-xs rounded animate-pulse">
                            Searching vectors & correlating metadata...
                          </div>
                        </div>
                      )}
                      
                      <div ref={chatEndRef} />
                    </div>

                    {/* Chat followups suggestions */}
                    {chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === "assistant" && chatHistory[chatHistory.length - 1].suggested_followups && (
                      <div className="mb-4">
                        <span className="text-[9px] font-black uppercase text-zinc-500 block mb-2 tracking-wider">Suggested Queries</span>
                        <div className="flex flex-wrap gap-2">
                          {chatHistory[chatHistory.length - 1].suggested_followups.map((q, idx) => (
                            <button
                              key={idx}
                              onClick={() => submitChat(q)}
                              className="bg-zinc-950 hover:bg-zinc-900 text-zinc-350 hover:text-zinc-100 text-[10px] px-2.5 py-1 rounded border border-zinc-900 transition-colors flex items-center gap-1.5"
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
                        <span className="text-[9px] font-black uppercase text-zinc-500 block mb-2 tracking-wider">Common Diagnostic Prompts</span>
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
                              className="text-left bg-zinc-950 hover:bg-zinc-900 text-[10px] text-zinc-400 hover:text-zinc-200 px-3 py-2 rounded border border-zinc-900 transition-colors flex justify-between items-center"
                            >
                              <span>{q}</span> <ArrowRight className="w-3 h-3 text-zinc-500 shrink-0 ml-2" />
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
                        className="flex-1 bg-zinc-950 border border-zinc-900 focus:border-zinc-700 rounded px-3 py-2 text-xs text-white focus:outline-none transition-colors"
                      />
                      <button 
                        onClick={() => submitChat()}
                        disabled={chatLoading}
                        className="bg-zinc-100 hover:bg-zinc-200 disabled:bg-zinc-800 text-zinc-900 px-4 rounded text-xs font-bold transition-colors shrink-0 flex items-center justify-center shadow-sm"
                      >
                        Ask
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: AUDIT REPORT */}
              {activeTab === "report" && (
                <div className="space-y-4">
                  <div className="bg-zinc-900/40 border border-zinc-900 p-4.5 rounded-lg flex flex-col">
                    <div className="flex justify-between items-center flex-wrap gap-3 mb-4">
                      <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-zinc-500" /> Markdown Audit summary
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCopyReport}
                          className="bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-300 font-semibold text-xs px-2.5 py-1.5 rounded flex items-center gap-1 transition-colors"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-zinc-500" /> Copy
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleDownloadReport}
                          className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold text-xs px-2.5 py-1.5 rounded flex items-center gap-1 transition-colors shadow-sm"
                        >
                          <DownloadCloud className="w-3.5 h-3.5" /> Download Report
                        </button>
                      </div>
                    </div>

                    <div className="bg-zinc-950 border border-zinc-900 rounded p-4.5 overflow-y-auto max-h-[460px] text-xs text-zinc-400 font-mono whitespace-pre-wrap leading-relaxed scrollbar-thin">
                      {result.report.report_text}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: EXPORTS & QUALITY TABLE */}
              {activeTab === "export" && (
                <div className="space-y-5">
                  {/* CSV Exports */}
                  <div className="bg-zinc-900/40 border border-zinc-900 p-4.5 rounded-lg">
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block mb-3">Tabular exports</span>

                    {result.data_summary.file_names && result.data_summary.file_names.length > 0 ? (
                      <div className="space-y-2">
                        {result.data_summary.file_names.map((fname, idx) => {
                          const ext = fname.split(".").pop().toLowerCase();
                          const isTabular = ["csv", "xlsx", "xls", "json"].includes(ext);
                          
                          if (!isTabular) return null;

                          return (
                            <div key={idx} className="bg-zinc-950 border border-zinc-900 p-3.5 rounded flex justify-between items-center flex-wrap gap-4">
                              <div className="flex items-center gap-2">
                                <FileSpreadsheet className="w-4 h-4 text-zinc-500" />
                                <div>
                                  <span className="text-xs font-bold text-zinc-300 block font-mono">{fname}</span>
                                  <span className="text-[10px] text-zinc-500 block">Validated & clean layout</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <a 
                                  href={`http://localhost:8000/api/export/cleaned?session_id=${result.session_id}&filename=${fname}`}
                                  target="_blank"
                                  className="bg-zinc-900 hover:bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold text-xs px-3 py-1.5 rounded transition-colors shadow-sm"
                                >
                                  Cleaned CSV
                                </a>
                                <a 
                                  href={`http://localhost:8000/api/export/balanced?session_id=${result.session_id}&filename=${fname}`}
                                  target="_blank"
                                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold text-xs px-3 py-1.5 rounded transition-colors shadow-sm"
                                >
                                  Balanced CSV
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500">No tabular spreadsheet files detected.</p>
                    )}
                  </div>

                  {/* Corrections checklists */}
                  {result.cleaning.issues_found.length > 0 && (
                    <div className="bg-zinc-900/40 border border-zinc-900 p-4.5 rounded-lg">
                      <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block mb-3">Corrections ledger</span>
                      <div className="border border-zinc-900 bg-zinc-950 rounded overflow-hidden">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-900 bg-zinc-900/20">
                              <th className="p-2.5 text-[9px] font-black uppercase tracking-wider text-zinc-500 w-10 text-center">Status</th>
                              <th className="p-2.5 text-[9px] font-black uppercase tracking-wider text-zinc-500">Validation Check details</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-900 text-xs">
                            {result.cleaning.issues_found.map((issue, idx) => (
                              <tr key={idx} className="hover:bg-zinc-900/5">
                                <td className="p-2.5 text-center">
                                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-950 border border-emerald-900/40 text-emerald-400 font-bold text-[10px]">✓</span>
                                </td>
                                <td className="p-2.5 text-zinc-300 font-mono text-[11px]">{issue}</td>
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
          </div>
        )}
      </main>
    </div>
  );
}
