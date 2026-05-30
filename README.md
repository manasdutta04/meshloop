# Meshloop: Autonomous Root-Cause Analyst (ARCA)
> Fusing structured database metrics with unstructured logs to autonomously diagnose enterprise operational failures.

Built for **Microsoft Build AI Hackathon 2026** | Theme 04: AI Meets Data (From Noise to Insight)

[![GitHub Models](https://img.shields.io/badge/GitHub%20Models-GPT--4o%20%2F%20Phi--4-blue?style=flat-square&logo=github&logoColor=white)](https://github.com/marketplace/models)
[![Semantic Kernel](https://img.shields.io/badge/Microsoft-Semantic%20Kernel-red?style=flat-square&logo=microsoft&logoColor=white)](https://github.com/microsoft/semantic-kernel)
[![FastAPI](https://img.shields.io/badge/FastAPI-REST%20API-emerald?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-React%20Frontend-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)

---

## 💡 The Core Innovation

Enterprise monitoring tools (like PowerBI, Datadog, or Grafana) excel at showing you **what** happened (e.g., *"sales dropped 40% on Tuesday"*), but they cannot tell you **why**. The explanation is always buried in unstructured, messy developer logs, customer support tickets, or emails.

**Meshloop ARCA** bridges this gap:
1.  **Tabular Outlier & Trend Check**: Autonomously parses and cleans metric spreadsheets (CSV/Excel), checking for extreme numerical outliers (IQR) or chronological drops (e.g. >30% metric dips).
2.  **Semantic Metadata Binding**: Indexes and tags document paragraphs in ChromaDB with metadata keying on specific `date` and `region` attributes.
3.  **Cross-Modal Root-Cause Linking**: Queries matching log chunks for any detected numerical anomalies on those exact dates/regions.
4.  **GPT-4o Forensics**: Synthesizes the exact root cause, citing specific files and returning it in a gorgeous visual incident card interface.

---

## 🛠️ Microsoft AI Stack Used

| Tool | Role | Why Microsoft |
|---|---|---|
| **GitHub Models** (GPT-4o) | Primary reasoner for discovery & Q&A | GitHub is Microsoft |
| **GitHub Models** (Phi-4) | Fast model for suggested follow-up questions | Microsoft model |
| **GitHub Models** (text-embedding-3-small) | 1536-dim vector embeddings | GitHub is Microsoft |
| **Semantic Kernel** (Python SDK) | Orchestrator agent framework | Microsoft open-source |
| **GitHub Copilot** | Dev AI assistant | Microsoft |

---

## 📐 System Architecture

```
Raw Data Files (CSV/Excel spreadsheet metrics + PDF/JSON/TXT text logs)
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────┐
│  SEMANTIC KERNEL AGENT PIPELINE (Microsoft)                           │
│                                                                       │
│  [IngestionAgent] ────► Reads ZIP or multiple mixed-modal files       │
│         │                                                             │
│         ▼                                                             │
│  [CleaningAgent] ─────► Standardizes formats & applies column fixes   │
│         │                                                             │
│         ▼                                                             │
│  [DiscoveryAgent] ────► 1. Statistical anomaly & drop detector        │
│         │               2. Queries ChromaDB for matching logs         │
│         │               3. GPT-4o explains the Root Cause             │
│         ▼                                                             │
│  [ChromaDB Vector Store] ◄── Stores structured summaries              │
│         │                    + unstructured text metadata tags        │
│         ▼                                                             │
│  [ChatAgent] ─────────◄ Incident Room Q&A (RAG-based citations)       │
│         │                                                             │
│         ▼                                                             │
│  [ReporterAgent] ─────► Forensic markdown reports + Plotly specs      │
└───────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                        FastAPI REST API
                                │
                                ▼
              Next.js Premium React Web Application
```

---

## 📂 Repository Structure

-   `agents/`: Custom AI agents executing specific tasks
    -   `ingestion.py`: Parses CSVs, Excel, PDFs, JSON, and text logs, supporting single files or zipped archives.
    -   `cleaning.py`: Resolves nulls, dates, numeric formats, casing, and handles imbalanced datasets.
    -   `discovery.py`: Combines IQR statistical anomaly detection with ChromaDB semantic search and GPT-4o correlation.
    -   `chat.py`: RAG Q&A interface with source citations and Microsoft Phi-4 suggested follow-ups.
    -   `reporter.py`: Generates the Markdown forensic report and maps Plotly visualization configurations.
-   `utils/`: Core utilities
    -   `llm.py`: Thread-safe, rate-limit protected client for GitHub Models with persistent `.llm_cache.json` caching.
    -   `sk_kernel.py`: Configures Semantic Kernel connectors pointing to the GitHub Models base URL.
    -   `vector_store.py`: In-memory ChromaDB vector store matching metadata tags.
-   `main.py`: FastAPI backend REST service exposing endpoints for file uploads, analysis, RAG chat, and download exports.
-   `pipeline.py`: Pipeline orchestrator linking the ingestion, cleaning, storing, discovery, and reporting modules.
-   `frontend/`: Premium Next.js React client application.
    -   `src/app/page.js`: Dashboard homepage managing state, upload boxes, SVG graphics, and chat dialogs.
    -   `src/app/globals.css`: Customized CSS system for layout, space-dark aesthetic variables, and components.

---

## ⚙️ Setup & Installation

### 1. Backend Setup
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/manasdutta04/meshloop.git
    cd meshloop
    ```

2.  **Initialize Virtual Environment**:
    ```bash
    python -m venv .venv
    # Activate on Windows (PowerShell):
    .venv\Scripts\Activate.ps1
    ```

3.  **Install Requirements**:
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure Environment Secrets**:
    Create a `.env` file in the root directory:
    ```env
    GITHUB_TOKEN=your_github_pat_token_here
    ```
    *Note: Generate a token at [GitHub Settings](https://github.com/settings/tokens/new) with the `models:read` scope.*

5.  **Run FastAPI Backend**:
    ```bash
    uvicorn main:app --port 8000 --reload
    ```

---

### 2. Frontend Setup
1.  **Navigate to Frontend Directory**:
    ```bash
    cd frontend
    ```

2.  **Install Node Modules**:
    ```bash
    npm install
    ```

3.  **Run Next.js Dev Server**:
    ```bash
    npm run dev
    ```
    *The app will be available on [http://localhost:3000](http://localhost:3000).*