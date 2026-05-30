"""
INGESTION AGENT (ARCA Pivot)
─────────────────────────────
Input : file_path (str)
Output: dict with keys:
  - dataframes     : dict[str, pd.DataFrame] — clean pandas dataframes (CSV/Excel/JSON list)
  - corpora        : dict[str, str]          — clean text mappings (PDF/TXT/JSON dict/MD)
  - metadata       : dict                    — containing list of files, sizes, types
"""

import pandas as pd
import fitz   # PyMuPDF — for PDFs
import json
import os
import tempfile
import zipfile
from pathlib import Path


def ingest_file(file_path: str) -> dict:
    """
    Main entry point.
    Detects if the file is a ZIP archive, or routes a single file directly.
    """
    path = Path(file_path)
    ext = path.suffix.lower().lstrip(".")
    
    if ext == "zip":
        dataframes = {}
        corpora = {}
        files_contained = []
        
        # Create a temp directory to extract zip contents
        temp_dir = tempfile.mkdtemp()
        try:
            with zipfile.ZipFile(file_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)
                
            for root, _, files in os.walk(temp_dir):
                for file in files:
                    if file.startswith(".") or file.startswith("__"):
                        continue
                    fpath = os.path.join(root, file)
                    name = file
                    fext = Path(fpath).suffix.lower().lstrip(".")
                    
                    try:
                        res = _parse_single_file(fpath, fext, name)
                        if res["dataframe"] is not None:
                            dataframes[name] = res["dataframe"]
                        else:
                            corpora[name] = res["raw_text"]
                        files_contained.append(name)
                    except Exception as e:
                        print(f"Warning: Failed to parse file {name} inside ZIP: {e}")
        finally:
            # Note: We keep files in temp_dir or let garbage collection handle it.
            # But the parsed dataframes/text are already copied into memory.
            pass
            
        return {
            "dataframes": dataframes,
            "corpora": corpora,
            "metadata": {
                "file_name": path.name,
                "file_size_bytes": os.path.getsize(file_path),
                "file_type": "zip",
                "files_contained": files_contained
            }
        }
    else:
        # Single file ingestion
        res = _parse_single_file(file_path, ext, path.name)
        dataframes = {}
        corpora = {}
        if res["dataframe"] is not None:
            dataframes[path.name] = res["dataframe"]
        else:
            corpora[path.name] = res["raw_text"]
            
        return {
            "dataframes": dataframes,
            "corpora": corpora,
            "metadata": {
                "file_name": path.name,
                "file_size_bytes": os.path.getsize(file_path),
                "file_type": ext,
                "files_contained": [path.name]
            }
        }


def _parse_single_file(file_path: str, ext: str, name: str) -> dict:
    base_meta = {
        "file_name": name,
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
    print(f"SUCCESS: Ingested metadata: {result['metadata']}")
    print(f"Dataframes: {list(result['dataframes'].keys())}")
    print(f"Corpora: {list(result['corpora'].keys())}")
