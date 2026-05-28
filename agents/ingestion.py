"""
INGESTION AGENT
─────────────────
Input : file_path (str)
Output: dict with keys:
  - raw_text       : str   — all text content from the file
  - dataframe      : pd.DataFrame or None
  - file_type      : str   ('csv', 'xlsx', 'pdf', 'json', 'txt')
  - row_count      : int
  - column_names   : list[str]
  - sample_rows    : list[dict]  (first 5 rows)
  - metadata       : dict  (file_name, file_size_bytes, etc.)
"""

import pandas as pd
import fitz   # PyMuPDF — for PDFs
import json
import os
from pathlib import Path


def ingest_file(file_path: str) -> dict:
    """
    Main entry point.
    Detects file type by extension and routes to the right parser.
    Raises ValueError for unsupported types.
    """
    path = Path(file_path)
    ext = path.suffix.lower().lstrip(".")
    
    base_meta = {
        "file_name": path.name,
        "file_size_bytes": os.path.getsize(file_path),
        "file_type": ext,
    }

    parsers = {
        "csv":  _parse_csv,
        "xlsx": _parse_excel,
        "xls":  _parse_excel,
        "pdf":  _parse_pdf,
        "json": _parse_json,
        "txt":  _parse_text,
        "md":   _parse_text,
    }

    if ext not in parsers:
        raise ValueError(
            f"Unsupported file type: .{ext}\n"
            f"Supported types: {', '.join(parsers.keys())}"
        )

    return parsers[ext](file_path, base_meta)


# ── Individual parsers ────────────────────────────────────────────────

def _parse_csv(file_path: str, meta: dict) -> dict:
    df = None
    used_encoding = "utf-8"
    for enc in ["utf-8", "latin-1", "cp1252", "utf-8-sig"]:
        try:
            df = pd.read_csv(file_path, encoding=enc)
            used_encoding = enc
            break
        except (UnicodeDecodeError, Exception):
            continue
    
    if df is None:
        raise ValueError("Could not read CSV file with any supported encoding.")
    
    return {
        "raw_text": df.to_string(max_rows=200),
        "dataframe": df,
        "file_type": "csv",
        "row_count": len(df),
        "column_names": df.columns.tolist(),
        "sample_rows": df.head(5).to_dict(orient="records"),
        "metadata": {**meta, "encoding": used_encoding},
    }


def _parse_excel(file_path: str, meta: dict) -> dict:
    df = pd.read_excel(file_path)
    return {
        "raw_text": df.to_string(max_rows=200),
        "dataframe": df,
        "file_type": "xlsx",
        "row_count": len(df),
        "column_names": df.columns.tolist(),
        "sample_rows": df.head(5).to_dict(orient="records"),
        "metadata": meta,
    }


def _parse_pdf(file_path: str, meta: dict) -> dict:
    doc = fitz.open(file_path)
    pages = []
    for i, page in enumerate(doc):
        text = page.get_text().strip()
        if text:
            pages.append(f"[Page {i+1}]\n{text}")
    doc.close()
    
    raw_text = "\n\n".join(pages)
    return {
        "raw_text": raw_text,
        "dataframe": None,
        "file_type": "pdf",
        "row_count": len(pages),
        "column_names": [],
        "sample_rows": [],
        "metadata": {**meta, "page_count": len(pages)},
    }


def _parse_json(file_path: str, meta: dict) -> dict:
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    df = None
    if isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict):
        df = pd.DataFrame(data)
    
    raw_text = json.dumps(data, indent=2)[:12000]
    
    return {
        "raw_text": raw_text,
        "dataframe": df,
        "file_type": "json",
        "row_count": len(data) if isinstance(data, list) else 1,
        "column_names": df.columns.tolist() if df is not None else [],
        "sample_rows": df.head(5).to_dict(orient="records") if df is not None else [],
        "metadata": meta,
    }


def _parse_text(file_path: str, meta: dict) -> dict:
    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        raw_text = f.read()
    return {
        "raw_text": raw_text,
        "dataframe": None,
        "file_type": "txt",
        "row_count": len(raw_text.splitlines()),
        "column_names": [],
        "sample_rows": [],
        "metadata": meta,
    }


# ── Test ──────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python agents/ingestion.py <file_path>")
        sys.exit(1)
    result = ingest_file(sys.argv[1])
    print(f"SUCCESS: Ingested: {result['file_type']} | {result['row_count']} rows | columns: {result['column_names']}")
    print(f"Text preview: {result['raw_text'][:300]}")
