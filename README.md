# Meshloop: Autonomous Root-Cause Analyst (ARCA)
> Fusing structured database metrics with unstructured logs to autonomously diagnose operational failures.

Built for **Microsoft Build AI 2026 Hackathon** | Theme 04: AI Meets Data (From Noise to Insight)

---

## 🎥 Live Demo
*(URL will be updated here after deployment)*
*(Test with the included sample datasets — click "Load Sample" in the sidebar)*

---

## 💡 What it does
Meshloop ARCA bridges the gap between **numbers** and **narratives** in enterprise operations.

*   **The Problem**: Normal dashboards (like PowerBI) show you **what** happened (e.g., *"sales dropped 40% on Tuesday"*), but they cannot tell you **why**. The answer is always buried in messy, unstructured developer logs, customer support tickets, or emails.
*   **The Solution**: Meshloop ARCA automatically digests structured CSV data alongside unstructured PDF/JSON logs. It runs statistical anomaly detection to locate metrics dips and autonomously queries a vector store to find matching incident text logs during those exact dates and regions, returning a complete root-cause explanation.

**The "wow" moment:** Upload a sales CSV + a folder of PDF outages → the system tells you:
> *"Sales in the West region dropped 48% on May 12. Meshloop matched this date with `server_outages.pdf` (Page 3), which documented a database connection timeout. This outage cost you $12,400 in lost revenue."*

---

## 🛠️ Microsoft AI Stack Used

| Tool | Role | Why Microsoft |
|---|---|---|
| **GitHub Models** (GPT-4o) | LLM for root-cause synthesis & chat | GitHub is Microsoft |
| **GitHub Models** (Phi-4) | Fast LLM for follow-up question generation | Microsoft's own model |
| **GitHub Models** (text-embedding-3-small) | Vector embeddings | GitHub is Microsoft |
| **Semantic Kernel** (Python SDK) | Agent orchestration framework | Microsoft open-source |
| **GitHub Copilot** | Used throughout development | Microsoft |
| **GitHub** | Version control + public repo | Microsoft |

> **Azure migration path:** The LLM layer (`utils/llm.py`) is Azure-ready. Change `base_url` to your Azure OpenAI endpoint and swap `GITHUB_TOKEN` for `AZURE_OPENAI_KEY` — zero other changes needed.

---

## 📐 Architecture

```
Raw Data Files (CSV spreadsheet metrics + PDF/JSON text logs)
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│  SEMANTIC KERNEL AGENT PIPELINE (Microsoft)                     │
│                                                                 │
│  [IngestionAgent] ──► Reads ZIP or multiple mixed-modal files   │
│         │                                                       │
│         ▼                                                       │
│  [CleaningAgent] ──► Cleans tabular fields & text formats       │
│         │                                                       │
│         ▼                                                       │
│  [DiscoveryAgent] ──► 1. Statistical anomaly detector           │
│         │             2. Queries ChromaDB for matching date tags │
│         │             3. GPT-4o explains the Root Cause         │
│         ▼                                                       │
│  [ChromaDB Vector Store] ◄── Stores structured summaries        │
│         │                    + unstructured text metadata tags  │
│         ▼                                                       │
│  [ChatAgent] ◄── Incident Room Q&A (RAG-based)                  │
│         │                                                       │
│         ▼                                                       │
│  [ReporterAgent] ──► Forensic report + dynamic Plotly specs     │
└─────────────────────────────────────────────────────────────────┘
            │
            ▼
     Streamlit UI (live URL for judges)
```

---

## ⚙️ Setup

```bash
git clone https://github.com/manasdutta04/meshloop.git
cd meshloop
pip install -r requirements.txt
cp .env.example .env
# Add your GITHUB_TOKEN to .env
streamlit run app.py
```

---

## 👥 Team
- **Manas Dutta** — Backend: AI agents, data pipeline, Semantic Kernel integration, vector store
- **Priya** — Frontend: Streamlit UI, chart system, deployment, demo video, pitch deck