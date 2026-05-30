# Meshloop: Autonomous Root-Cause Analyst (ARCA)
> Fusing structured database metrics with unstructured logs to autonomously diagnose enterprise operational failures.

Built for **Microsoft Build AI Hackathon 2026** | Theme 04: AI Meets Data (From Noise to Insight)

[![GitHub Models](https://img.shields.io/badge/GitHub%20Models-GPT--4o%20%2F%20Phi--4-blue?style=flat-square&logo=github&logoColor=white)](https://github.com/marketplace/models)
[![Semantic Kernel](https://img.shields.io/badge/Microsoft-Semantic%20Kernel-red?style=flat-square&logo=microsoft&logoColor=white)](https://github.com/microsoft/semantic-kernel)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-Vector%20Store-orange?style=flat-square)](https://github.com/chroma-core/chroma)
[![Streamlit](https://img.shields.io/badge/Streamlit-UI%20Dashboard-red?style=flat-square&logo=streamlit)](https://streamlit.io)

---

## 💡 The Core Innovation

Enterprise monitoring tools (like PowerBI, Datadog, or Grafana) excel at showing you **what** happened (e.g., *"sales dropped 40% on Tuesday"*), but they cannot tell you **why**. The explanation is always buried in unstructured, messy developer logs, customer support tickets, or emails.

**Meshloop ARCA** bridges this gap:
1.  **Tabular Outlier & Trend Check**: Autonomously parses and cleans metric spreadsheets (CSV/Excel), checking for extreme numerical outliers (IQR) or chronological drops (e.g. >30% metric dips).
2.  **Semantic Metadata Binding**: Index and tag document paragraphs in ChromaDB with metadata keying on specific `date` and `region` attributes.
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
         Streamlit UI Dashboard (with custom premium theme)
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
-   `app.py`: Streamlit frontend with a sleek space-blue premium theme, custom gradient cards, and interactive Incident Chat with suggested questions.
-   `pipeline.py`: Pipeline orchestrator linking the ingestion, cleaning, storing, discovery, and reporting modules.

---

## ⚙️ Setup & Installation

1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/manasdutta04/meshloop.git
    cd meshloop
    ```

2.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

3.  **Configure Secrets**:
    Create a `.env` file in the root directory:
    ```env
    GITHUB_TOKEN=your_github_pat_token_here
    ```
    *Note: Generate a token at [GitHub Developer Settings](https://github.com/settings/tokens/new) with the `models:read` scope.*

4.  **Run the Streamlit Dashboard**:
    ```bash
    streamlit run app.py
    ```

5.  **Try Sample Data**:
    *   Click **"Try Sample Data"** in the sidebar to run a diagnostic test on `arca_test_dataset.zip` (containing `sales.csv` and `server_log.txt`).
    *   Witness the automated progress callbacks and check out the Root-Cause discoveries tab!