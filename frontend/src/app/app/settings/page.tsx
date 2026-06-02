"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Settings,
  ArrowLeft,
  Save,
  RotateCcw,
  CheckCircle,
  Eye,
  EyeOff,
  ChevronRight,
  Cpu,
  Cloud,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";

type ProviderKey = "anthropic" | "openai" | "google" | "ollama" | "groq";

interface AIConfig {
  provider: ProviderKey;
  baseUrl: string;
  apiKey: string;
  chatModel: string;
  embeddingModel: string;
}

interface ProviderPreset {
  key: ProviderKey;
  name: string;
  tagline: string;
  type: "cloud" | "local";
  badge: string;
  badgeColor: string;
  accentColor: string;
  glowColor: string;
  iconBg: string;
  borderColor: string;
  activeBorder: string;
  defaultBaseUrl: string;
  defaultChatModel: string;
  defaultEmbeddingModel: string;
  requiresKey: boolean;
  modelExamples: string[];
  embeddingExamples: string[];
  logo: React.ReactNode;
}

const PROVIDERS: ProviderPreset[] = [
  {
    key: "anthropic",
    name: "Anthropic Claude",
    tagline: "State-of-the-art reasoning & vision",
    type: "cloud",
    badge: "Cloud · Vision",
    badgeColor: "text-violet-400 bg-violet-950/60 border-violet-800/50",
    accentColor: "text-violet-300",
    glowColor: "rgba(139, 92, 246, 0.12)",
    iconBg: "bg-gradient-to-br from-violet-950 to-violet-900 border-violet-700/40",
    borderColor: "border-zinc-800/60",
    activeBorder: "border-violet-500/60",
    defaultBaseUrl: "https://api.anthropic.com",
    defaultChatModel: "claude-3-5-sonnet-20241022",
    defaultEmbeddingModel: "voyage-3",
    requiresKey: true,
    modelExamples: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022", "claude-3-opus-20240229"],
    embeddingExamples: ["voyage-3", "voyage-3-lite"],
    logo: (
      <img src="/anthropic.svg" alt="Anthropic Claude" className="w-7 h-7 object-contain opacity-90" />
    ),
  },
  {
    key: "openai",
    name: "OpenAI (ChatGPT)",
    tagline: "Industry-leading GPT-4o models",
    type: "cloud",
    badge: "Cloud · Vision",
    badgeColor: "text-emerald-400 bg-emerald-950/60 border-emerald-800/50",
    accentColor: "text-emerald-300",
    glowColor: "rgba(52, 211, 153, 0.1)",
    iconBg: "bg-gradient-to-br from-emerald-950 to-emerald-900 border-emerald-700/40",
    borderColor: "border-zinc-800/60",
    activeBorder: "border-emerald-500/60",
    defaultBaseUrl: "https://api.openai.com/v1",
    defaultChatModel: "gpt-4o",
    defaultEmbeddingModel: "text-embedding-3-small",
    requiresKey: true,
    modelExamples: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo"],
    embeddingExamples: ["text-embedding-3-small", "text-embedding-3-large", "text-embedding-ada-002"],
    logo: (
      <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.677l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" className="text-emerald-300" />
      </svg>
    ),
  },
  {
    key: "google",
    name: "Google Gemini",
    tagline: "Multimodal AI by Google DeepMind",
    type: "cloud",
    badge: "Cloud · Vision",
    badgeColor: "text-blue-400 bg-blue-950/60 border-blue-800/50",
    accentColor: "text-blue-300",
    glowColor: "rgba(59, 130, 246, 0.1)",
    iconBg: "bg-gradient-to-br from-blue-950 to-blue-900 border-blue-700/40",
    borderColor: "border-zinc-800/60",
    activeBorder: "border-blue-500/60",
    defaultBaseUrl: "https://generativelanguage.googleapis.com/v1beta",
    defaultChatModel: "gemini-2.0-flash",
    defaultEmbeddingModel: "text-embedding-004",
    requiresKey: true,
    modelExamples: ["gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"],
    embeddingExamples: ["text-embedding-004", "embedding-001"],
    logo: (
      <img src="/gemini.svg" alt="Google Gemini" className="w-7 h-7 object-contain" />
    ),
  },
  {
    key: "groq",
    name: "Groq",
    tagline: "Ultra-fast LPU inference engine",
    type: "cloud",
    badge: "Cloud · Fast",
    badgeColor: "text-orange-400 bg-orange-950/60 border-orange-800/50",
    accentColor: "text-orange-300",
    glowColor: "rgba(249, 115, 22, 0.1)",
    iconBg: "bg-gradient-to-br from-orange-950 to-orange-900 border-orange-700/40",
    borderColor: "border-zinc-800/60",
    activeBorder: "border-orange-500/60",
    defaultBaseUrl: "https://api.groq.com/openai/v1",
    defaultChatModel: "llama-3.3-70b-versatile",
    defaultEmbeddingModel: "",
    requiresKey: true,
    modelExamples: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "gemma2-9b-it"],
    embeddingExamples: [],
    logo: (
      <img src="/groq.webp" alt="Groq" className="w-7 h-7 object-contain rounded" />
    ),
  },
  {
    key: "ollama",
    name: "Ollama (Local)",
    tagline: "Run models privately on your machine — no API key, no cost, fully offline",
    type: "local",
    badge: "Local · Free",
    badgeColor: "text-amber-400 bg-amber-950/60 border-amber-800/50",
    accentColor: "text-amber-300",
    glowColor: "rgba(251, 191, 36, 0.08)",
    iconBg: "bg-gradient-to-br from-amber-950 to-amber-900 border-amber-700/40",
    borderColor: "border-zinc-800/60",
    activeBorder: "border-amber-500/60",
    defaultBaseUrl: "http://localhost:11434/v1",
    defaultChatModel: "llama3.1",
    defaultEmbeddingModel: "nomic-embed-text",
    requiresKey: false,
    modelExamples: ["llama3.1", "mistral", "codellama", "qwen2.5"],
    embeddingExamples: ["nomic-embed-text", "mxbai-embed-large", "all-minilm"],
    logo: (
      <img src="/ollama.webp" alt="Ollama" className="w-7 h-7 object-contain rounded" />
    ),
  },
];

const DEFAULT_CONFIG: AIConfig = {
  provider: "openai",
  baseUrl: "https://api.openai.com/v1",
  apiKey: "",
  chatModel: "gpt-4o",
  embeddingModel: "text-embedding-3-small",
};

export default function SettingsPage() {
  const [config, setConfig] = useState<AIConfig>(DEFAULT_CONFIG);
  const [savedConfig, setSavedConfig] = useState<AIConfig>(DEFAULT_CONFIG);
  const [showKey, setShowKey] = useState(false);
  const [saved, setSaved] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const raw = window.localStorage.getItem("meshloop-ai-config");
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<AIConfig>;
        // Migrate old provider keys to new ones
        if ((parsed.provider as string) === "github") parsed.provider = "openai";
        if ((parsed.provider as string) === "openai-compatible") parsed.provider = "ollama";
        const merged = { ...DEFAULT_CONFIG, ...parsed };
        setConfig(merged);
        setSavedConfig(merged);
      } catch {
        window.localStorage.removeItem("meshloop-ai-config");
      }
    }
  }, []);

  const activePreset = PROVIDERS.find((p) => p.key === config.provider)!;

  const selectProvider = (preset: ProviderPreset) => {
    setConfig({
      provider: preset.key,
      baseUrl: preset.defaultBaseUrl,
      apiKey: config.provider === preset.key ? config.apiKey : "",
      chatModel: preset.defaultChatModel,
      embeddingModel: preset.defaultEmbeddingModel,
    });
  };

  const saveConfig = () => {
    window.localStorage.setItem("meshloop-ai-config", JSON.stringify(config));
    setSavedConfig(config);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const resetConfig = () => {
    const preset = activePreset;
    setConfig({
      provider: preset.key,
      baseUrl: preset.defaultBaseUrl,
      apiKey: "",
      chatModel: preset.defaultChatModel,
      embeddingModel: preset.defaultEmbeddingModel,
    });
  };

  const isDirty =
    JSON.stringify(config) !== JSON.stringify(savedConfig);

  if (!mounted) return null;

  return (
    <div className="relative min-h-screen bg-[#030307] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-100 bg-dot-grid flex flex-col">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[300px] ambient-glow -translate-y-1/2" />
      <div className="absolute top-0 right-1/4 w-[500px] h-[300px] ambient-glow -translate-y-1/2" />
      <div
        className="absolute top-40 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none transition-all duration-700"
        style={{
          background: `radial-gradient(${activePreset.glowColor}, transparent 70%)`,
          filter: "blur(60px)",
        }}
      />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#030307]/80 supports-[backdrop-filter]:backdrop-blur-md border-b border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-12">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo.png" alt="Meshloop Logo" className="h-6 w-6 object-contain" />
              <span className="text-xs font-semibold tracking-[0.18em] text-white uppercase">Meshloop</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/app"
                className="flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition-colors text-xs font-medium px-2.5 py-1 rounded-md hover:bg-white/5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to App
              </Link>
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

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-6 md:p-10 pt-20 md:pt-24 flex flex-col gap-8 z-10">
        {/* Page Title */}
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800/60 flex items-center justify-center">
              <Settings className="w-4 h-4 text-zinc-400" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-white">AI Provider Settings</h1>
          </div>
          <p className="text-xs text-zinc-500 ml-11 leading-relaxed">
            Choose your AI backend and configure credentials. Settings are saved locally in your browser.
          </p>
        </div>

        {/* Provider Selector Cards */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.05s" }}>
          <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500 mb-3">
            Choose Provider
          </p>

          {/* Cloud providers — 2×2 grid */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            {PROVIDERS.filter((p) => p.type === "cloud").map((preset) => {
              const isActive = config.provider === preset.key;
              return (
                <button
                  key={preset.key}
                  onClick={() => selectProvider(preset)}
                  className={`relative text-left p-4 rounded-xl border transition-all duration-300 group ${
                    isActive
                      ? `${preset.activeBorder} bg-zinc-900/80`
                      : `${preset.borderColor} bg-zinc-950/40 hover:bg-zinc-900/50 hover:border-zinc-700/60`
                  }`}
                  style={
                    isActive
                      ? { boxShadow: `0 0 24px ${preset.glowColor}, inset 0 0 30px ${preset.glowColor}` }
                      : {}
                  }
                >
                  {isActive && (
                    <span className="absolute top-3 right-3">
                      <CheckCircle className={`w-4 h-4 ${preset.accentColor}`} />
                    </span>
                  )}
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${preset.iconBg} transition-transform duration-300 ${isActive ? "scale-105" : "group-hover:scale-105"}`}
                    >
                      {preset.logo}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-bold text-white block truncate mb-0.5">{preset.name}</span>
                      <p className="text-[10px] text-zinc-500 leading-relaxed mb-2 font-medium">{preset.tagline}</p>
                      <div className="flex items-center gap-1.5">
                        <Cloud className="w-3 h-3 text-zinc-600" />
                        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${preset.badgeColor}`}>
                          {preset.badge}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Local model — full-width wide card */}
          {PROVIDERS.filter((p) => p.type === "local").map((preset) => {
            const isActive = config.provider === preset.key;
            return (
              <button
                key={preset.key}
                onClick={() => selectProvider(preset)}
                className={`relative w-full text-left p-4 rounded-xl border transition-all duration-300 group ${
                  isActive
                    ? `${preset.activeBorder} bg-zinc-900/80`
                    : `${preset.borderColor} bg-zinc-950/40 hover:bg-zinc-900/50 hover:border-zinc-700/60`
                }`}
                style={
                  isActive
                    ? { boxShadow: `0 0 24px ${preset.glowColor}, inset 0 0 30px ${preset.glowColor}` }
                    : {}
                }
              >
                {isActive && (
                  <span className="absolute top-3 right-3">
                    <CheckCircle className={`w-4 h-4 ${preset.accentColor}`} />
                  </span>
                )}
                <div className="flex items-center gap-4">
                  <div
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${preset.iconBg} transition-transform duration-300 ${isActive ? "scale-105" : "group-hover:scale-105"}`}
                  >
                    {preset.logo}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap mb-0.5">
                      <span className="text-sm font-bold text-white">{preset.name}</span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full border ${preset.badgeColor}`}>
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">{preset.tagline}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 shrink-0 text-[10px] text-zinc-600 font-medium">
                    <Cpu className="w-3.5 h-3.5" />
                    <span>No internet required</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Configuration Panel */}
        <div
          className="glass-card rounded-2xl border p-6 animate-fade-in-up transition-all duration-500"
          style={{
            animationDelay: "0.1s",
            borderColor: `rgba(255,255,255,0.07)`,
            boxShadow: `0 0 40px ${activePreset.glowColor}`,
          }}
        >
          {/* Panel header */}
          <div className="flex items-center gap-2 mb-5 pb-4 border-b border-white/[0.06]">
            <div
              className={`w-7 h-7 rounded-lg border flex items-center justify-center ${activePreset.iconBg}`}
            >
              {activePreset.logo}
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-wider text-zinc-500">
                Configuration
              </p>
              <h2 className={`text-sm font-bold ${activePreset.accentColor}`}>{activePreset.name}</h2>
            </div>
            <div className="ml-auto flex items-center gap-1.5">
              {activePreset.type === "local" ? (
                <span className="flex items-center gap-1 text-[9px] text-amber-400 font-bold">
                  <WifiOff className="w-3 h-3" /> No key required
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[9px] text-zinc-500 font-medium">
                  <Wifi className="w-3 h-3" /> API key required
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Base URL */}
            <label className="grid gap-1.5 md:col-span-2">
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">
                Base URL
              </span>
              <input
                value={config.baseUrl}
                onChange={(e) => setConfig((prev) => ({ ...prev, baseUrl: e.target.value }))}
                placeholder={activePreset.defaultBaseUrl}
                className="rounded-lg border border-zinc-800/80 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 outline-none focus:border-zinc-600 transition-colors font-mono"
              />
            </label>

            {/* API Key */}
            <label className="grid gap-1.5 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">
                  API Key
                </span>
                {!activePreset.requiresKey && (
                  <span className="text-[9px] text-amber-500/80 font-medium">
                    Optional for local Ollama
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  value={config.apiKey}
                  onChange={(e) => setConfig((prev) => ({ ...prev, apiKey: e.target.value }))}
                  placeholder={
                    activePreset.requiresKey
                      ? `Paste your ${activePreset.name} API key...`
                      : "Leave empty for local Ollama"
                  }
                  type={showKey ? "text" : "password"}
                  className="w-full rounded-lg border border-zinc-800/80 bg-zinc-950 px-3.5 py-2.5 pr-10 text-xs text-zinc-100 outline-none focus:border-zinc-600 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </label>

            {/* Chat Model */}
            <label className="grid gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">
                Chat Model
              </span>
              <input
                value={config.chatModel}
                onChange={(e) => setConfig((prev) => ({ ...prev, chatModel: e.target.value }))}
                placeholder={activePreset.defaultChatModel}
                className="rounded-lg border border-zinc-800/80 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 outline-none focus:border-zinc-600 transition-colors font-mono"
              />
              <div className="flex flex-wrap gap-1 mt-0.5">
                {activePreset.modelExamples.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, chatModel: m }))}
                    className={`text-[9px] px-1.5 py-0.5 rounded border transition-all font-mono ${
                      config.chatModel === m
                        ? `${activePreset.badgeColor} font-bold`
                        : "border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </label>

            {/* Embedding Model */}
            <label className="grid gap-1.5">
              <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500">
                Embedding Model
              </span>
              <input
                value={config.embeddingModel}
                onChange={(e) => setConfig((prev) => ({ ...prev, embeddingModel: e.target.value }))}
                placeholder={activePreset.defaultEmbeddingModel}
                className="rounded-lg border border-zinc-800/80 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 outline-none focus:border-zinc-600 transition-colors font-mono"
              />
              <div className="flex flex-wrap gap-1 mt-0.5">
                {activePreset.embeddingExamples.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setConfig((prev) => ({ ...prev, embeddingModel: m }))}
                    className={`text-[9px] px-1.5 py-0.5 rounded border transition-all font-mono ${
                      config.embeddingModel === m
                        ? `${activePreset.badgeColor} font-bold`
                        : "border-zinc-800 text-zinc-600 hover:text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </label>
          </div>

          {/* Helper text */}
          {activePreset.key === "ollama" && (
            <div className="mt-4 flex items-start gap-2 bg-amber-950/20 border border-amber-900/30 rounded-lg p-3">
              <Cpu className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-400/80 leading-relaxed">
                Make sure Ollama is running locally:{" "}
                <code className="font-mono bg-amber-950/40 px-1 rounded">ollama serve</code>. Pull
                models with{" "}
                <code className="font-mono bg-amber-950/40 px-1 rounded">ollama pull llama3.1</code>.
                CORS must be enabled for browser requests.
              </p>
            </div>
          )}
          {activePreset.key === "anthropic" && (
            <div className="mt-4 flex items-start gap-2 bg-violet-950/20 border border-violet-900/30 rounded-lg p-3">
              <Zap className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-violet-300/70 leading-relaxed">
                Get your API key from{" "}
                <a
                  href="https://console.anthropic.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 underline underline-offset-2 hover:text-violet-300"
                >
                  console.anthropic.com
                </a>
                . Voyage embeddings are billed separately via{" "}
                <a
                  href="https://www.voyageai.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-violet-400 underline underline-offset-2 hover:text-violet-300"
                >
                  voyageai.com
                </a>
                .
              </p>
            </div>
          )}
          {activePreset.key === "groq" && (
            <div className="mt-4 flex items-start gap-2 bg-orange-950/20 border border-orange-900/30 rounded-lg p-3">
              <Zap className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-orange-300/70 leading-relaxed">
                Get your free API key from{" "}
                <a
                  href="https://console.groq.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 underline underline-offset-2 hover:text-orange-300"
                >
                  console.groq.com
                </a>
                . <strong className="text-orange-400">Groq does not support embeddings</strong> — Meshloop will automatically use fast local pseudo-embeddings for RAG retrieval when Groq is selected.
              </p>
            </div>
          )}
        </div>

        {/* Save / Reset Actions */}
        <div className="flex items-center justify-between gap-4 animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <button
            type="button"
            onClick={resetConfig}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors text-xs font-medium px-3 py-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-zinc-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset to defaults
          </button>

          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="text-[10px] text-zinc-500 font-medium">Unsaved changes</span>
            )}
            <button
              type="button"
              onClick={saveConfig}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black transition-all duration-300 ${
                saved
                  ? "bg-emerald-600 text-white border border-emerald-500"
                  : isDirty
                  ? "bg-white text-zinc-950 hover:bg-zinc-100 glow-btn-primary"
                  : "bg-zinc-900 text-zinc-400 border border-zinc-800 cursor-default"
              }`}
            >
              {saved ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5" /> Saved!
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" /> Save Settings
                </>
              )}
            </button>
          </div>
        </div>

        {/* Back to app CTA */}
        <div className="flex justify-center pb-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <Link
            href="/app"
            className="flex items-center gap-2 text-xs text-zinc-600 hover:text-zinc-300 transition-colors font-medium group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to diagnostic workspace
            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>
      </main>
    </div>
  );
}
