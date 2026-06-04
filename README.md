# Meshloop ARCA: Autonomous Root-Cause Analyst

> **AI-Native Incident Intelligence Engine** | Fusing structured telemetry metrics with unstructured system logs to autonomously diagnose enterprise service failures.

Built for the **Microsoft Build AI Hackathon 2026** | **Theme 04: AI Meets Data (From Noise to Insight)**

---

[![GitHub Models](https://img.shields.io/badge/GitHub%20Models-GPT--4o%20%2F%20Phi--4-blue?style=flat-square&logo=github&logoColor=white)](https://github.com/marketplace/models)
[![Semantic Kernel](https://img.shields.io/badge/Microsoft-Semantic%20Kernel-red?style=flat-square&logo=microsoft&logoColor=white)](https://github.com/microsoft/semantic-kernel)
[![FastAPI](https://img.shields.io/badge/FastAPI-REST%20API-emerald?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-React%20Frontend-black?style=flat-square&logo=next.js&logoColor=white)](https://nextjs.org)

---

## The SaaS Pitch: Why Meshloop ARCA?

Modern enterprise systems generate petabytes of telemetry. When an outage occurs, site reliability engineers (SREs) face a chaotic workflow:
1. **Metrics Dashboards** show the *symptom* (e.g., `"latency spiked from 220ms to 8400ms"`, `"orders dropped to zero"`).
2. **Log Management tools** hold the *clues* (e.g., config changes, DB pool exhaustion warnings).
3. **Ticketing systems & payment gateways** contain the *customer impact* details.

Diagnosing the **root cause** requires hours of manual correlation, cross-referencing timestamps, and matching regions. 

**Meshloop ARCA (Autonomous Root-Cause Analyst)** reduces Mean Time to Resolution (MTTR) from hours to **seconds**. By orchestrating a multi-agent workflow, it autonomously ingests mixed-modal telemetry, sanitizes data quality anomalies, builds statistical-semantic links, and conducts a structured multi-agent debate to surface the definitive root cause.

---

## Key Features & Innovations

### 1. Multi-Agent Consensus Engine (Agent Debate)
Rather than relying on a single LLM output, ARCA employs a **multi-agent debate pipeline** using Microsoft's Semantic Kernel design pattern. This allows the system to cross-reference multiple perspectives before presenting findings:
*   **Discovery Agent** (Primary): Analyzes outliers and flags primary database/metric abnormalities.
*   **Validator Agent** (Challenger): Evaluates secondary logs, asks *"what else could explain this?"*, and challenges the primary agent using counter-observations.
*   **Synthesis Agent** (Consensus): Resolves the arguments and crafts a refined root cause with a confidence score and a recommended first action.

### 2. Multi-Modal Ingestion & Auto-Sanitization
*   **Zero-Overhead Ingestion**: Upload mixed-modal raw files directly (CSV metrics, log txt dumps, JSON reports) or pack them into a single standard `.zip` archive.
*   **Auto-Cleaning & Typing**: Cleans missing data, repairs broken timestamps (e.g. converting `"30/11/2024 02:15"` to ISO format), standardizes mixed strings (e.g. `"8423ms"` -> `8423.0`), and drops duplicate files.
*   **Auto-Class Balancing**: Identifies major class imbalances in dataset categories (e.g. over 70% share of a single category) and auto-generates balanced oversampled files for downstream ML models.

### 3. Chronological & Regional Correlation
*   ARCA parses metrics to detect statistical outliers (IQR) and significant performance drops.
*   It indexes unstructured log files into a local **ChromaDB vector store**, tagged with `date` and `region` metadata.
*   The correlation engine maps the exact timeframe and region of the statistical metric drop, query-matching ChromaDB for log events occurring under the exact same parameters.

### 4. Interactive Forensic Dashboard
*   **Incident Room RAG Chat**: Discuss the incident with an AI responder that cites specific source log files and proposes context-aware follow-up questions.
*   **Visual Analytics**: Generates premium custom SVG dashboard charts displaying data drops, scatter plots, trend lines, and outlier histograms.
*   **SaaS Export Center**: Download audited forensic markdown reports, fully cleaned metrics CSVs, or balanced ML-ready datasets.

---

## System Architecture & Dataflow

```
Raw Uploads (CSV Metrics + TXT Developer Logs + Support Tickets + Config ZIPs)
                                 │
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│  SEMANTIC KERNEL MULTI-AGENT PIPELINE                                  │
│                                                                        │
│  [IngestionAgent] ──────► Ingests & extracts mixed files / ZIPs        │
│         │                                                              │
│         ▼                                                              │
│  [CleaningAgent] ───────► Standardizes formatting & performs typing    │
│         │                 + Oversamples imbalanced data categories     │
│         ▼                                                              │
│  [DiscoveryAgent] ──────► Runs statistical outlier & drop detectors    │
│         │                 + Indexes and query-matches tag metadata     │
│         ▼                                                              │
│  [ChromaDB Vector DB] ◄─► Vector embeddings storage with filters       │
│         │                                                              │
│         ▼                                                              │
│  [Agent Debate Step]                                                   │
│   ├─► Discovery Agent (Stance: Primary finding presentation)           │
│   ├─► Validator Agent (Stance: Challenges assumptions / other logs)    │
│   └─► Synthesis Agent (Stance: Resolves and outputs final verdict)     │
│         │                                                              │
│         ▼                                                              │
│  [ReporterAgent] ───────► Formulates SVG charts and forensic report    │
│         │                                                              │
│         ▼                                                              │
│  [ChatAgent] ───────────► RAG Q&A with source citations                │
└────────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                    FastAPI REST backend (Port 8000)
                                 │
                                 ▼
              Premium Glassmorphic Next.js (Port 3000)
```

---

## Extensible "BYO-Key" Cloud Router

Meshloop ARCA includes a zero-trust model router. Hackathon judges and developers can configure their own preferred LLM providers directly in the settings dashboard (saved securely in local storage):

| Provider | Type | API Key Required | Target Models & Features |
|---|---|---|---|
| **GitHub Models (Default)** | Cloud | Yes (PAT token) | `gpt-4o` (Reasoning), `microsoft/phi-4` (Sub-tasks), `text-embedding-3-small` (1536-dim vector embeddings) |
| **OpenAI** | Cloud | Yes | `gpt-4o`, `gpt-4o-mini`, Text Embeddings |
| **Anthropic** | Cloud | Yes | `claude-3-5-sonnet`, `claude-3-5-haiku`, Voyage Embeddings |
| **Google Gemini** | Cloud | Yes | `gemini-2.0-flash`, `gemini-1.5-pro`, Google Embeddings |
| **Groq** | Cloud | Yes | `llama-3.3-70b-versatile`, Mixtral (Automatic local pseudo-embeddings fallback) |
| **Ollama (Local)** | Local | No | Private offline inference (`llama3.1`, `mistral`, `nomic-embed-text`) |

---

## Repository Structure

*   `agents/`: Core analytical agent modules.
    *   [ingestion.py](file:///c:/Coding%20Workspace/OSS-CONTRIBS/meshloop/agents/ingestion.py): Parses CSVs, Excel, PDFs, JSON, and text logs, supporting single files or zipped archives.
    *   [cleaning.py](file:///c:/Coding%20Workspace/OSS-CONTRIBS/meshloop/agents/cleaning.py): Resolves nulls, normalizes date/number formats, standardizes casing, and builds balanced tabular datasets.
    *   [discovery.py](file:///c:/Coding%20Workspace/OSS-CONTRIBS/meshloop/agents/discovery.py): Combines IQR statistical anomaly detection with ChromaDB semantic search and LLM correlation, orchestrating the `run_agent_debate` consensus loop.
    *   [chat.py](file:///c:/Coding%20Workspace/OSS-CONTRIBS/meshloop/agents/chat.py): RAG Q&A interface with source citations and suggested follow-ups.
    *   [reporter.py](file:///c:/Coding%20Workspace/OSS-CONTRIBS/meshloop/agents/reporter.py): Generates Markdown forensic reports and maps configuration specs for visualization charts.
*   `utils/`: Infrastructure and database adapters.
    *   [llm.py](file:///c:/Coding%20Workspace/OSS-CONTRIBS/meshloop/utils/llm.py): Thread-safe, rate-limit protected LLM interface supporting multiple providers and caching.
    *   [sk_kernel.py](file:///c:/Coding%20Workspace/OSS-CONTRIBS/meshloop/utils/sk_kernel.py): Configures Semantic Kernel connector pointers.
    *   [vector_store.py](file:///c:/Coding%20Workspace/OSS-CONTRIBS/meshloop/utils/vector_store.py): In-memory ChromaDB vector store matching metadata tags.
*   `frontend/`: Next.js React client application.
    *   `src/app/page.tsx`: Glassmorphic SaaS landing page.
    *   `src/app/app/page.tsx`: Dashboard workspace managing state, upload box, interactive chats, visuals, and reports.
    *   `src/app/app/settings/page.tsx`: Settings dashboard storing configs locally.
    *   `src/app/globals.css`: Customized CSS system for dark-space variables, animations, and typography.
*   [main.py](file:///c:/Coding%20Workspace/OSS-CONTRIBS/meshloop/main.py): FastAPI backend REST service exposing endpoints for file uploads, analysis, RAG chat, settings routing, and data exports.
*   [pipeline.py](file:///c:/Coding%20Workspace/OSS-CONTRIBS/meshloop/pipeline.py): Pipeline master orchestrator linking the ingestion, cleaning, storing, discovery, and reporting modules.
*   `sample_data/`: Preloaded test datasets for running sandbox demonstration runs.

---

## Setup & Installation

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
   Create a `.env.local` file inside `frontend/` directory (optional):
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

4. **Run Next.js Dev Server**:
   ```bash
   npm run dev
   ```
   *The client workspace will be available on [http://localhost:3000](http://localhost:3000).*

---

## The Ultimate Demo: "Black Friday Incident"

Meshloop ARCA includes a pre-packaged simulation file designed to demonstrate cross-modal AI investigation.

### Run the Generator
To generate the Black Friday incident datasets, run the generator script in your terminal:
```bash
python sample_data/generate_blackfriday.py
```
This produces `sample_data/blackfriday_incident.zip` containing 4 files:
1. `metrics.csv`: 72 hours of 5-minute interval metrics containing a checkout latency spike, a drop in orders, and connection spikes in the `East` region.
2. `deployment_log.txt`: Routine production log from the previous day showing a configuration edit that sets `db.connection_pool.max=500` but warns that it *only grows on demand*.
3. `db_error_logs.txt`: PostgreSQL/app logs showing database connection slots exhaustion and replication reserves errors starting at `02:11 UTC` on `2024-11-30`.
4. `support_tickets.txt`: Customer complaint data reporting checkout checkout latency starting at `02:17 UTC`.

### Upload to Meshloop ARCA
1. Navigate to the local dashboard ([http://localhost:3000](http://localhost:3000)).
2. Drag and drop the `sample_data/blackfriday_incident.zip` file.
3. Watch the pipeline parse, clean, and align dates and regions.
4. **Inspect the Agent Debate**: Witness the Discovery, Validator, and Synthesis agents debate the root cause—surfacing the hidden insight: *under peak Black Friday traffic at 02:10, the database connection pool tried to expand rapidly from 45 to 500 active connections, triggering a cascading PostgreSQL exhaustion because the pool only grows on demand, crashing the East region checkout service.*
5. Open the **Incident Room Chat** and ask: *"How did the deployment on the day before cause the outage?"* and watch the Chat Agent cite lines from `deployment_log.txt`!