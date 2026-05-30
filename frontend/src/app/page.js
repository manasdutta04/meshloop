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
  TrendingUp, 
  LineChart, 
  FileText, 
  RefreshCw,
  Search,
  MessageSquare,
  AlertTriangle,
  ArrowRight
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
      // Simulate progressive updates
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
      
      // Short delay to let user see 100% complete
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

    // Append user message
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
    <div className="flex flex-1 min-h-screen bg-[#090d16] text-[#f1f5f9]">
      {/* SIDEBAR */}
      <aside className="w-80 bg-[#0d1321] border-r border-[#1f2937] p-6 flex flex-col justify-between hidden md:flex">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-900/30">
              M
            </div>
            <div>
              <h2 className="font-extrabold text-lg leading-none tracking-tight">Meshloop</h2>
              <span className="text-xs text-blue-400 font-medium">ARCA Agent</span>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3">Workflow</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-slate-400">
                  <span className="w-5 h-5 rounded bg-[#1e293b] flex items-center justify-center text-xs text-blue-400 font-bold">1</span>
                  Drop datasets (CSV/ZIP)
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <span className="w-5 h-5 rounded bg-[#1e293b] flex items-center justify-center text-xs text-blue-400 font-bold">2</span>
                  Auto-cleaning checks
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <span className="w-5 h-5 rounded bg-[#1e293b] flex items-center justify-center text-xs text-blue-400 font-bold">3</span>
                  Root-cause discovery
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <span className="w-5 h-5 rounded bg-[#1e293b] flex items-center justify-center text-xs text-blue-400 font-bold">4</span>
                  Interactive Incident Q&A
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-3">Microsoft Stack Used</h3>
              <div className="space-y-2">
                <div className="bg-[#111827] border border-[#1f2937] p-2.5 rounded-lg text-xs flex justify-between items-center">
                  <span className="text-slate-400 font-medium">LLM Engine</span>
                  <span className="bg-blue-950/40 text-blue-400 font-bold px-2 py-0.5 rounded border border-blue-900/30">GPT-4o / Phi-4</span>
                </div>
                <div className="bg-[#111827] border border-[#1f2937] p-2.5 rounded-lg text-xs flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Framework</span>
                  <span className="bg-red-950/40 text-red-400 font-bold px-2 py-0.5 rounded border border-red-900/30">Semantic Kernel</span>
                </div>
                <div className="bg-[#111827] border border-[#1f2937] p-2.5 rounded-lg text-xs flex justify-between items-center">
                  <span className="text-slate-400 font-medium">Embeddings</span>
                  <span className="bg-blue-950/40 text-blue-400 font-bold px-2 py-0.5 rounded border border-blue-900/30">3-small</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#1f2937] pt-6 space-y-3">
          <div className="flex gap-2">
            <img src="https://img.shields.io/badge/GitHub%20Models-GPT--4o%20%2F%20Phi--4-blue?style=flat-square&logo=github&logoColor=white" className="h-5" alt="GitHub Models" />
            <img src="https://img.shields.io/badge/Microsoft-Semantic%20Kernel-red?style=flat-square&logo=microsoft&logoColor=white" className="h-5" alt="Semantic Kernel" />
          </div>
          <div className="text-xs text-slate-500">
            🏆 Microsoft Build AI Hackathon 2026
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto max-w-7xl mx-auto flex flex-col justify-start">
        {/* LANDING / UPLOAD STATE */}
        {!loading && !result && (
          <div className="max-w-2xl mx-auto w-full my-auto py-12 flex flex-col items-center">
            <div className="inline-flex items-center gap-2 bg-blue-950/40 text-blue-400 border border-blue-900/40 px-3.5 py-1.5 rounded-full text-xs font-bold mb-6 tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" /> AI-Powered Incident Investigation
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black text-center mb-4 tracking-tight">
              Meshloop <span className="bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent glow-text">ARCA</span>
            </h1>
            
            <p className="text-slate-400 text-center text-lg mb-10 max-w-lg leading-relaxed">
              Autonomously correlate tabular metrics deviations with unstructured incident logs to explain precisely <b>why</b> business outages happen.
            </p>

            {/* Drag & Drop Box */}
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current.click()}
              className="w-full bg-[#111827]/60 border-2 border-dashed border-[#1f2937] hover:border-blue-500/50 rounded-2xl p-10 flex flex-col items-center cursor-pointer transition-all duration-300 shadow-2xl"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                multiple
              />
              <Upload className="w-12 h-12 text-blue-400 mb-4 animate-bounce" />
              <p className="text-slate-200 font-semibold mb-1 text-center">
                Drag and drop your dataset here
              </p>
              <p className="text-xs text-slate-500 mb-6 text-center">
                Supports CSV, Excel, PDF, JSON, TXT or ZIP files
              </p>
              <button 
                type="button" 
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-lg shadow-blue-600/20 transition-all active:scale-95"
              >
                Browse Files
              </button>
            </div>

            {/* Selected Files List */}
            {files.length > 0 && (
              <div className="w-full mt-6 bg-[#0d1321] border border-[#1f2937] rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Selected Files ({files.length})</span>
                  <button 
                    onClick={() => setFiles([])}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-semibold"
                  >
                    <Trash className="w-3 h-3" /> Clear
                  </button>
                </div>
                <div className="max-h-32 overflow-y-auto space-y-2 pr-2">
                  {files.map((f, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-[#111827]/80 px-3 py-2 rounded-lg text-sm border border-[#1f2937]">
                      <span className="truncate max-w-md font-medium text-slate-300">📄 {f.name}</span>
                      <span className="text-xs text-slate-500">{(f.size / 1024).toFixed(1)} KB</span>
                    </div>
                  ))}
                </div>
                
                <button
                  onClick={runAnalysis}
                  className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/35 transition-all"
                >
                  <Play className="w-4 h-4" /> Run Forensic Analysis
                </button>
              </div>
            )}

            {/* Sample Button */}
            {files.length === 0 && (
              <div className="mt-8 flex flex-col items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Or check the dashboard layout with test data</span>
                <button
                  onClick={runSampleAnalysis}
                  className="bg-[#111827] border border-[#1f2937] hover:border-slate-700 hover:bg-[#182235] text-slate-300 font-bold px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4 text-blue-400" /> Try Sample Data
                </button>
              </div>
            )}
          </div>
        )}

        {/* LOADING / PROGRESS STATE */}
        {loading && (
          <div className="max-w-md mx-auto w-full my-auto py-16 flex flex-col items-center text-center">
            <div className="relative w-24 h-24 mb-8">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full border-4 border-blue-500/20 animate-ping"></div>
              {/* Inner loading ring */}
              <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
              {/* Center bot icon */}
              <div className="absolute inset-4 rounded-full bg-[#111827] flex items-center justify-center border border-[#1f2937]">
                <Bot className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold mb-2">Analyzing Data Logs...</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-xs">{progressMsg}</p>
            
            {/* Progress Bar */}
            <div className="w-full bg-[#111827] rounded-full h-2 border border-[#1f2937] overflow-hidden mb-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <span className="text-xs text-blue-400 font-bold">{Math.round(progressPercent)}% Complete</span>
          </div>
        )}

        {/* RESULTS STATE */}
        {result && (
          <div className="space-y-8 animate-fade-in">
            {/* Header / Summary stats */}
            <div className="flex justify-between items-center flex-wrap gap-4 border-b border-[#1f2937] pb-6">
              <div>
                <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">Diagnostic Analysis</span>
                <h2 className="text-2xl font-black truncate max-w-lg mt-1 text-white">
                  📄 {result.data_summary.file_name}
                </h2>
              </div>
              <button 
                onClick={resetApp}
                className="bg-[#111827] border border-[#1f2937] hover:border-red-900/30 hover:bg-red-950/20 text-slate-300 hover:text-red-400 font-bold text-sm px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-4 h-4" /> Analyze Another
              </button>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl flex flex-col justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase">Rows Analyzed</span>
                <span className="text-3xl font-black mt-2 text-white">{result.data_summary.row_count.toLocaleString()}</span>
              </div>
              <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl flex flex-col justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase">Columns Detected</span>
                <span className="text-3xl font-black mt-2 text-white">{result.data_summary.column_names.length}</span>
              </div>
              <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl flex flex-col justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase">Issues Cleaned</span>
                <span className="text-3xl font-black mt-2 text-emerald-400">{result.cleaning.issues_found.length}</span>
              </div>
              <div className="bg-[#111827] border border-[#1f2937] p-5 rounded-xl flex flex-col justify-between">
                <span className="text-xs text-slate-500 font-bold uppercase">Insights Found</span>
                <span className="text-3xl font-black mt-2 text-blue-400">{result.discovery.total_found}</span>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="tab-list">
              <button 
                onClick={() => setActiveTab("discoveries")}
                className={`tab-button ${activeTab === "discoveries" ? "active" : ""}`}
              >
                🔍 Root-Cause Discoveries
              </button>
              <button 
                onClick={() => setActiveTab("visuals")}
                className={`tab-button ${activeTab === "visuals" ? "active" : ""}`}
              >
                📊 Visual Analytics
              </button>
              <button 
                onClick={() => setActiveTab("chat")}
                className={`tab-button ${activeTab === "chat" ? "active" : ""}`}
              >
                💬 Incident Room Chat
              </button>
              <button 
                onClick={() => setActiveTab("report")}
                className={`tab-button ${activeTab === "report" ? "active" : ""}`}
              >
                📋 Audit Report
              </button>
              <button 
                onClick={() => setActiveTab("export")}
                className={`tab-button ${activeTab === "export" ? "active" : ""}`}
              >
                💾 Exports & Clean Details
              </button>
            </div>

            {/* TAB CONTENTS */}
            <div className="min-h-[400px]">
              
              {/* TAB 1: ROOT-CAUSE DISCOVERIES */}
              {activeTab === "discoveries" && (
                <div className="space-y-6">
                  {/* Executive Summary */}
                  <div className="bg-[#111827]/40 border border-[#1f2937] p-6 rounded-xl">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-400" /> Executive Summary
                    </h3>
                    <p className="text-[#cbd5e1] leading-relaxed text-sm">
                      {result.discovery.summary}
                    </p>
                  </div>

                  {/* Top Discovery Banner */}
                  {result.discovery.top_insight && (
                    <div className="top-insight-card">
                      <div className="top-insight-title">
                        <Sparkles className="w-5 h-5 text-amber-300" /> Top Incident Discovery
                      </div>
                      <h4 className="text-xl font-bold mb-2 text-white">
                        {result.discovery.top_insight.title}
                      </h4>
                      <p className="top-insight-desc">
                        {result.discovery.top_insight.description}
                      </p>
                    </div>
                  )}

                  {/* All Findings Grid */}
                  <div>
                    <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-4">All Incident Logs & Metrics Anomalies</h3>
                    <div className="space-y-4">
                      {result.discovery.insights.map((ins, idx) => {
                        const sev = ins.severity?.toLowerCase() || "low";
                        const icon = { critical: "🚨", high: "🔴", medium: "🟡", low: "🟢" }[sev] || "⚪";
                        return (
                          <div key={idx} className={`insight-card ${sev}`}>
                            <div className="insight-header">
                              <span className="insight-title font-bold text-white flex items-center gap-2">
                                <span>{icon}</span> {ins.title}
                              </span>
                              <span className={`severity-tag ${sev}`}>{sev}</span>
                            </div>
                            <p className="insight-desc">{ins.description}</p>
                            {ins.data_evidence && Object.keys(ins.data_evidence).length > 0 && (
                              <div className="insight-evidence">
                                <b>Evidence:</b> {JSON.stringify(ins.data_evidence)}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: VISUAL ANALYTICS */}
              {activeTab === "visuals" && (
                <div className="space-y-6">
                  <div className="bg-[#111827] border border-[#1f2937] p-6 rounded-xl">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-6 flex items-center gap-1.5">
                      <LineChart className="w-4 h-4 text-blue-400" /> Auto-Generated Visual Analytics
                    </h3>

                    {result.report.chart_specs.length === 0 ? (
                      <p className="text-sm text-slate-500 text-center py-12">No visualization specs returned for this dataset</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {result.report.chart_specs.map((spec, idx) => {
                          return (
                            <div key={idx} className="bg-[#0b1329] border border-[#1f2937] p-5 rounded-xl flex flex-col">
                              <span className="text-xs text-blue-400 font-bold uppercase mb-4">{spec.title}</span>
                              
                              {/* RENDER PURE ACCESSIBLE SVG CHART */}
                              <div className="w-full h-64 bg-[#090d16] border border-[#1f2937] rounded-lg p-4 flex items-center justify-center relative">
                                {spec.type === "histogram" || spec.type === "bar" ? (
                                  /* Render SVG Bar Chart */
                                  <svg className="w-full h-full" viewBox="0 0 100 60">
                                    <line x1="10" y1="50" x2="90" y2="50" stroke="#1f2937" strokeWidth="0.5" />
                                    <line x1="10" y1="10" x2="10" y2="50" stroke="#1f2937" strokeWidth="0.5" />
                                    {/* Mock Bars */}
                                    <rect x="20" y="25" width="10" height="25" fill="#3b82f6" rx="1" />
                                    <rect x="35" y="15" width="10" height="35" fill="#3b82f6" rx="1" />
                                    <rect x="50" y="35" width="10" height="15" fill="#ef4444" rx="1" />
                                    <rect x="65" y="20" width="10" height="30" fill="#3b82f6" rx="1" />
                                    <text x="25" y="55" fill="#475569" fontSize="3" textAnchor="middle">Q1</text>
                                    <text x="40" y="55" fill="#475569" fontSize="3" textAnchor="middle">Q2</text>
                                    <text x="55" y="55" fill="#ef4444" fontSize="3" textAnchor="middle">Drop</text>
                                    <text x="70" y="55" fill="#475569" fontSize="3" textAnchor="middle">Q4</text>
                                  </svg>
                                ) : spec.type === "line" ? (
                                  /* Render SVG Line Chart */
                                  <svg className="w-full h-full" viewBox="0 0 100 60">
                                    <line x1="10" y1="50" x2="90" y2="50" stroke="#1f2937" strokeWidth="0.5" />
                                    {/* Grid Lines */}
                                    <line x1="10" y1="35" x2="90" y2="35" stroke="#111827" strokeWidth="0.3" strokeDasharray="1" />
                                    <line x1="10" y1="20" x2="90" y2="20" stroke="#111827" strokeWidth="0.3" strokeDasharray="1" />
                                    {/* Line path */}
                                    <path 
                                      d="M 15 20 L 30 18 L 45 45 L 60 46 L 75 22 L 85 15" 
                                      fill="none" 
                                      stroke="#3b82f6" 
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                    />
                                    {/* Highlighting drop */}
                                    <circle cx="45" cy="45" r="2" fill="#ef4444" />
                                    <circle cx="60" cy="46" r="2" fill="#ef4444" />
                                    <text x="52" y="54" fill="#ef4444" fontSize="3" textAnchor="middle">Incident Period</text>
                                  </svg>
                                ) : (
                                  /* Render SVG Scatter Chart */
                                  <svg className="w-full h-full" viewBox="0 0 100 60">
                                    <line x1="10" y1="50" x2="90" y2="50" stroke="#1f2937" strokeWidth="0.5" />
                                    {/* Dots */}
                                    <circle cx="20" cy="40" r="1.5" fill="#3b82f6" opacity="0.6" />
                                    <circle cx="30" cy="35" r="1.5" fill="#3b82f6" opacity="0.6" />
                                    <circle cx="38" cy="42" r="1.5" fill="#3b82f6" opacity="0.6" />
                                    <circle cx="48" cy="15" r="1.8" fill="#ef4444" /> {/* outlier */}
                                    <circle cx="55" cy="28" r="1.5" fill="#3b82f6" opacity="0.6" />
                                    <circle cx="70" cy="20" r="1.5" fill="#3b82f6" opacity="0.6" />
                                    <circle cx="80" cy="18" r="1.5" fill="#3b82f6" opacity="0.6" />
                                    {/* Trendline */}
                                    <line x1="15" y1="42" x2="85" y2="15" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="2" />
                                    <text x="48" y="10" fill="#ef4444" fontSize="3" textAnchor="middle">Outlier</text>
                                  </svg>
                                )}
                                <span className="absolute bottom-2 right-2 text-[10px] text-slate-500">Forensics Mode</span>
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
                  <div className="bg-[#111827]/40 border border-[#1f2937] p-6 rounded-xl flex flex-col">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
                      <Bot className="w-4 h-4 text-blue-400" /> Incident Room Q&A (RAG-based chat)
                    </h3>

                    {/* Chat container */}
                    <div className="chat-container min-h-[300px] mb-4">
                      {chatHistory.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                          <Bot className="w-10 h-10 text-slate-600 mb-2" />
                          <p className="text-sm text-slate-400 font-semibold mb-1">Incident Room Open</p>
                          <p className="text-xs text-slate-500 max-w-xs">Ask specific queries like: "Which checks failed on May 12?" or "Explain the outage in East region".</p>
                        </div>
                      )}

                      {chatHistory.map((msg, idx) => (
                        <div 
                          key={idx} 
                          className={msg.role === "user" ? "chat-user-msg" : "chat-bot-msg"}
                        >
                          <span className="font-semibold text-xs block mb-1 opacity-70">
                            {msg.role === "user" ? "🧑 You" : "🤖 Meshloop Analyst"}
                          </span>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                          
                          {/* Citation sources */}
                          {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                            <div className="source-badges">
                              {msg.sources.filter(Boolean).map((src, sidx) => (
                                <span key={sidx} className="source-badge">
                                  📄 {src}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}

                      {chatLoading && (
                        <div className="chat-bot-msg animate-pulse">
                          <span className="font-semibold text-xs block mb-1 opacity-70">🤖 Meshloop Analyst</span>
                          <p className="text-sm">Thinking...</p>
                        </div>
                      )}
                      
                      <div ref={chatEndRef} />
                    </div>

                    {/* Suggested followups */}
                    {chatHistory.length > 0 && chatHistory[chatHistory.length - 1].role === "assistant" && chatHistory[chatHistory.length - 1].suggested_followups && (
                      <div className="mb-4">
                        <span className="text-xs font-bold text-slate-500 uppercase block mb-2">Suggested follow-ups:</span>
                        <div className="flex flex-wrap gap-2">
                          {chatHistory[chatHistory.length - 1].suggested_followups.map((q, idx) => (
                            <button
                              key={idx}
                              onClick={() => submitChat(q)}
                              className="bg-[#1f2937] hover:bg-slate-700 text-xs text-slate-300 font-medium px-3.5 py-2 rounded-full border border-slate-700 transition-all flex items-center gap-1"
                            >
                              {q} <ArrowRight className="w-3 h-3 text-blue-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Standard Suggestions if chat history is empty */}
                    {chatHistory.length === 0 && (
                      <div className="mb-4">
                        <span className="text-xs font-bold text-slate-500 uppercase block mb-2">Try asking:</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {[
                            "What is the most important pattern in this data?",
                            "Which values look suspicious or unusual?",
                            "What should I investigate first?",
                            "Summarize the key takeaways."
                          ].map((q, idx) => (
                            <button
                              key={idx}
                              onClick={() => submitChat(q)}
                              className="text-left bg-[#111827]/80 hover:bg-[#182235] text-xs text-slate-300 font-medium px-4 py-2.5 rounded-lg border border-[#1f2937] transition-all flex justify-between items-center"
                            >
                              {q} <ArrowRight className="w-3 h-3 text-blue-400" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Input box */}
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && submitChat()}
                        placeholder="Ask anything about your datasets..."
                        className="flex-1 bg-[#0d121f] border border-[#1f2937] focus:border-blue-500 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none transition-all"
                      />
                      <button 
                        onClick={() => submitChat()}
                        disabled={chatLoading}
                        className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white px-5 rounded-lg text-sm font-bold shadow-md shadow-blue-900/10 flex items-center justify-center transition-all active:scale-95"
                      >
                        Send
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: AUDIT REPORT */}
              {activeTab === "report" && (
                <div className="space-y-6">
                  <div className="bg-[#111827]/40 border border-[#1f2937] p-6 rounded-xl flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-400" /> Full Forensic Report (.md)
                      </h3>
                      <button
                        onClick={handleDownloadReport}
                        className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1 shadow-md shadow-blue-900/10 transition-all"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Report
                      </button>
                    </div>

                    <div className="bg-[#0b1329] border border-[#1f2937] rounded-xl p-6 overflow-y-auto max-h-[500px] text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                      {result.report.report_text}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: EXPORTS & QUALITY CHECK */}
              {activeTab === "export" && (
                <div className="space-y-6">
                  {/* Export Cleaned Files */}
                  <div className="bg-[#111827]/40 border border-[#1f2937] p-6 rounded-xl">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-blue-400" /> Export Cleaned Tabular Datasets
                    </h3>

                    {result.data_summary.file_names && result.data_summary.file_names.length > 0 ? (
                      <div className="space-y-4">
                        {result.data_summary.file_names.map((fname, idx) => {
                          // Check if it's a tabular file (csv, xlsx, xls, json)
                          const ext = fname.split(".").pop().toLowerCase();
                          const isTabular = ["csv", "xlsx", "xls", "json"].includes(ext);
                          
                          if (!isTabular) return null;

                          return (
                            <div key={idx} className="bg-[#0d1321] border border-[#1f2937] p-4 rounded-xl flex justify-between items-center flex-wrap gap-4">
                              <div>
                                <span className="text-sm font-bold text-white block">📄 {fname}</span>
                                <span className="text-xs text-slate-500">Processed & structured layout ready</span>
                              </div>
                              <div className="flex gap-2">
                                <a 
                                  href={`http://localhost:8000/api/export/cleaned?session_id=${result.session_id}&filename=${fname}`}
                                  target="_blank"
                                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1 transition-all"
                                >
                                  <Download className="w-3.5 h-3.5" /> Cleaned CSV
                                </a>
                                <a 
                                  href={`http://localhost:8000/api/export/balanced?session_id=${result.session_id}&filename=${fname}`}
                                  target="_blank"
                                  className="bg-[#1f2937] hover:bg-slate-700 text-slate-300 font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1 border border-slate-700 transition-all"
                                >
                                  <Download className="w-3.5 h-3.5" /> Balanced CSV
                                </a>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">No exports available for this dataset type.</p>
                    )}
                  </div>

                  {/* Clean Fixes Applied checklist */}
                  {result.cleaning.issues_found.length > 0 && (
                    <div className="bg-[#111827]/40 border border-[#1f2937] p-6 rounded-xl">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
                        <CheckCircle className="w-4 h-4 text-emerald-400" /> Data Quality Checks Applied
                      </h3>
                      <div className="space-y-2">
                        {result.cleaning.issues_found.map((issue, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                            <span className="text-emerald-400 mt-0.5 font-bold">✓</span>
                            <span>{issue}</span>
                          </div>
                        ))}
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
