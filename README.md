# Meshloop: Autonomous Root-Cause Analyst (ARCA)

> Fusing structured database metrics with unstructured logs to autonomously diagnose enterprise operational failures.

Built for **Microsoft Build AI Hackathon 2026** | Theme 04: AI Meets Data (From Noise to Insight)

[![GitHub Models](https://img.shields.io/badge/GitHub%20Models-GPT--4o%20%2F%20Phi--4-blue?style=flat-square&logo=github&logoColor=white)](https://github.com/marketplace/models)
[![Semantic Kernel](https://img.shields.io/badge/Microsoft-Semantic%20Kernel-red?style=flat-square&logo=microsoft&logoColor=white)](https://github.com/microsoft/semantic-kernel)
[![FastAPI](https://img.shields.io/badge/FastAPI-REST%20API-emerald?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-React%20Frontend-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)

---

## 💡 The Core Innovation

Enterprise monitoring tools excel at showing you **what** happened (e.g., *"sales dropped 40% on Tuesday"*), but they cannot tell you **why**. The explanation is always buried in unstructured, messy developer logs, customer support tickets, or emails.

**Meshloop ARCA** bridges this gap:
1. **Multi-Modal Data Ingestion**: Parses mixed-modal uploads containing database metrics (CSV/Excel) and text reports/developer logs (PDF/TXT/JSON), support single files or standard ZIP archives.
2. **Automated Cleaning & Casing Standardization**: Cleans null values, fixes mixed column types, formats date attributes, standardizes categorical casing, and drops corrupt fields.
3. **Automatic Class Balancing**: Detects severe class imbalances in categorical targets (e.g. over 70% share of a single category) and applies minority oversampling for machine-learning-ready exports.
4. **Semantic Metadata Tagging**: Indexes and stores tabular column summaries and log paragraphs in ChromaDB, tagged with matching `date` and `region` attributes.
5. **Cross-Modal Incident Linking**: Detects statistical outliers (IQR) or drop anomalies in metrics, then queries semantic vector stores for matching log events occurring on those exact dates and regions.
6. **LLM-Based Root-Cause Synthesis**: Correlates the evidence and generates a structured root-cause diagnosis report, detailing severity, description, evidence dictionary, and visualizations.

---

## 🛠️ Extensible AI Backend (Bring Your Own Key)

Meshloop ARCA includes a fully flexible model router supporting multiple remote and local AI backends:

| Provider | Type | API Key Required | Supported Models & Features |
|---|---|---|---|
| **GitHub Models (Default)** | Cloud | Yes (PAT token) | `gpt-4o` (Reasoning), `microsoft/phi-4` (Suggestions), `text-embedding-3-small` (1536-dim vector embeddings) |
| **OpenAI** | Cloud | Yes | `gpt-4o`, `gpt-4o-mini`, standard Text Embeddings |
| **Anthropic** | Cloud | Yes | `claude-3-5-sonnet`, `claude-3-5-haiku`, Voyage Embeddings |
| **Google Gemini** | Cloud | Yes | `gemini-2.0-flash`, `gemini-1.5-pro`, Google Embeddings |
| **Groq** | Cloud | Yes | `llama-3.3-70b-versatile`, Mixtral (Automatic local pseudo-embeddings fallback) |
| **Ollama (Local)** | Local | No | Private offline inference (`llama3.1`, `mistral`, `nomic-embed-text`) |

---

## 📐 System Architecture

```
Raw Uploads (CSV/Excel spreadsheet metrics + PDF/JSON/TXT text logs / ZIPs)
                                │
                                ▼
┌───────────────────────────────────────────────────────────────────────┐
│  SEMANTIC KERNEL AGENT PIPELINE                                       │
│                                                                       │
│  [IngestionAgent] ────► Parses mixed-modal files / extracts ZIPs      │
│         │                                                             │
│         ▼                                                             │
│  [CleaningAgent] ─────► Standardizes formats & applies column fixes   │
│         │               + Balanced datasets creation (Oversampling)   │
│         ▼                                                             │
│  [DiscoveryAgent] ────► 1. Statistical anomaly & drop detector        │
│         │               2. Queries ChromaDB for matching logs         │
│         │               3. Synthesizes cross-modal root cause         │
│         ▼                                                             │
│  [ChromaDB Vector Store] ◄── Stores structured summaries              │
│         │                    + unstructured text metadata tags        │
│         ▼                                                             │
│  [ChatAgent] ─────────◄ Incident Room Q&A (RAG-based citations)       │
│         │                                                             │
│         ▼                                                             │
│  [ReporterAgent] ─────► Forensic markdown reports + SVG/Chart specs   │
└───────────────────────────────────────────────────────────────────────┘
                                │
                                ▼
                         FastAPI REST API (Port 8000)
                                │
                                ▼
               Next.js Premium React Web Application (Port 3000)
```

---

## 📂 Repository Structure

- `agents/`: Core AI agent modules executing specific analytical tasks.
  - [ingestion.py](file:///c:/Coding%20Workspace/OSS-CONTRIBS/meshloop/agents/ingestion.py): Parses CSVs, Excel, PDFs, JSON, and text logs, supporting single files or zipped archives.
  - [cleaning.py](file:///c:/Coding%20Workspace/OSS-CONTRIBS/meshloop/agents/cleaning.py): Resolves nulls, normalizes date/number formats, standardizes casing, and builds balanced tabular datasets.
  - [discovery.py](file:///c:/Coding%20Workspace/OSS-CONTRIBS/meshloop/agents/discovery.py): Combines IQR statistical anomaly detection with ChromaDB semantic search and LLM correlation.
  - [chat.py](file:///c:/Coding%20Workspace/OSS-CONTRIBS/meshloop/agents/chat.py): RAG Q&A interface with source citations and suggested follow-ups.
  - [reporter.py](file:///c:/Coding%20Workspace/OSS-CONTRIBS/meshloop/agents/reporter.py): Generates Markdown forensic reports and maps configuration specs for visualization charts.
- `utils/`: Core utilities and database adapters.
  - [llm.py](file:///c:/Coding%20Workspace/OSS-CONTRIBS/meshloop/utils/llm.py): Thread-safe, rate-limit protected LLM interface supporting multiple providers and caching.
  - [sk_kernel.py](file:///c:/Coding%20Workspace/OSS-CONTRIBS/meshloop/utils/sk_kernel.py): Configures Semantic Kernel connector pointers.
  - [vector_store.py](file:///c:/Coding%20Workspace/OSS-CONTRIBS/meshloop/utils/vector_store.py): In-memory ChromaDB vector store matching metadata tags.
- `frontend/`: Premium Next.js React client application.
  - `src/app/page.tsx`: Glassmorphic landing page.
  - `src/app/app/page.tsx`: Dashboard workspace managing state, upload box, interactive chats, visuals, and reports.
  - `src/app/app/settings/page.tsx`: AI provider settings (OpenAI, Claude, Gemini, Groq, Ollama) storing configs locally.
  - `src/app/globals.css`: Customized CSS system for dark-space variables, animations, and typography.
- [main.py](file:///c:/Coding%20Workspace/OSS-CONTRIBS/meshloop/main.py): FastAPI backend REST service exposing endpoints for file uploads, analysis, RAG chat, settings routing, and data exports.
- [pipeline.py](file:///c:/Coding%20Workspace/OSS-CONTRIBS/meshloop/pipeline.py): Pipeline master orchestrator linking the ingestion, cleaning, storing, discovery, and reporting modules.
- `sample_data/`: Contains preloaded test datasets (`arca_test_dataset.zip`) for running sandbox demonstration runs.

---

## ⚙️ Setup & Installation

### 1. Backend Setup
1. **Clone the Repository**:
   ```bash
   git clone https://github.com/manasdutta04/meshloop.git
   cd meshloop
   ```

2. **Initialize Virtual Environment**:
   ```bash
   python -m venv .venv
   # Activate on Windows (PowerShell):
   .venv\Scripts\Activate.ps1
   # Activate on Linux/macOS:
   source .venv/bin/activate
   ```

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Environment Secrets**:
   Create a `.env` file in the root directory:
   ```env
   GITHUB_TOKEN=your_github_pat_token_here
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
   ALLOWED_ORIGIN_REGEX=https://.*\.vercel\.app
   ```
   *Note: GITHUB_TOKEN is only required if using the default GitHub Models provider. Generate a token at [GitHub Settings](https://github.com/settings/tokens/new) with the `models:read` scope.*

5. **Run FastAPI Backend**:
   ```bash
   uvicorn main:app --port 8000 --reload
   ```

---

### 2. Frontend Setup
1. **Navigate to Frontend Directory**:
   ```bash
   cd frontend
   ```

2. **Install Node Modules**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file inside `frontend/` directory (optional - defaults to port 8000):
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

4. **Run Next.js Dev Server**:
   ```bash
   npm run dev
   ```
   *The client workspace will be available on [http://localhost:3000](http://localhost:3000).*

---

## 🎮 Features & Walkthrough

*   **Offline Sandbox Mode**: Don't have an API key? Hit the **Load Sample sandbox data** button on the upload screen to run analysis offline on pre-bundled telemetry logs and metrics.
*   **Incident Room Chat**: Discuss findings with the AI assistant in real-time. Features clickable citation badges referencing exact source log lines (e.g. `[server_log.txt]`) and suggested follow-ups.
*   **Visual Analytics Tab**: Provides custom SVG charts for categorical drops, scatter plots, trend lines, and outlier histograms derived directly from uploaded database tables.
*   **Exports Tab**: Export cleaned CSV datasets, balanced CSV datasets (correcting class imbalances), or download the complete forensic Markdown report to your local drive.