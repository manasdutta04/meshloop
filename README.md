# Meshloop
> Turn any messy data file into clear, actionable insights — instantly.

Built for **Microsoft Build AI 2026 Hackathon** | Theme 04: AI Meets Data

## Live Demo
*(URL will be updated here after deployment)*
*(Test with the included sample data — click "Load Sample" in the sidebar)*

## What it does
Meshloop ingests any file (CSV, Excel, PDF, JSON, TXT, MD), automatically
cleans it, and uses AI agents to discover hidden patterns you never thought
to look for. Then you can chat with your data in plain English.

**The "wow" moment:** Upload a messy CSV → the system tells you:
*"Refund rates spike 340% every Tuesday, correlated with Product B — this pattern was never previously flagged."*

## Microsoft AI Stack Used
| Tool | Role | Why Microsoft |
|---|---|---|
| **GitHub Models** (GPT-4o) | LLM for discovery + chat | GitHub is Microsoft |
| **GitHub Models** (Phi-4) | Fast LLM for simple tasks | Microsoft's own model |
| **GitHub Models** (text-embedding-3-small) | Vector embeddings | GitHub is Microsoft |
| **Semantic Kernel** (Python SDK) | Agent orchestration framework | Microsoft open-source |
| **GitHub Copilot** | Used throughout development | Microsoft |
| **GitHub** | Version control + public repo | Microsoft |

> **Azure migration path:** The LLM layer (`utils/llm.py`) is Azure-ready.
> Change `base_url` to your Azure OpenAI endpoint and swap `GITHUB_TOKEN`
> for `AZURE_OPENAI_KEY` — zero other changes needed.

## Architecture

File Upload → [Ingestion Agent] → [Cleaning Agent] → [Discovery Agent] │ [ChromaDB Vector Store] │ [Chat Agent] ← User questions │ [Reporter Agent] → Charts + Report

All agents orchestrated via **Semantic Kernel** (Microsoft).
LLM: **GitHub Models GPT-4o** (Microsoft).

## Setup
```bash
git clone https://github.com/manasdutta04/meshloop.git
cd meshloop
pip install -r requirements.txt
cp .env.example .env
# Add your GITHUB_TOKEN to .env
streamlit run app.py
```

## Team
- **Manas Dutta** — Backend: AI agents, data pipeline, Semantic Kernel integration, vector store
- **Priya** — Frontend: Streamlit UI, chart system, deployment, demo video, pitch deck