import chromadb
import hashlib
import pandas as pd
import numpy as np
import re
from utils.llm import get_embedding

# In-memory ChromaDB client (resets on app restart — fine for hackathon)
_chroma = chromadb.Client()
_collections: dict = {}

def _get_collection(session_id: str):
    name = f"s_{session_id[:16]}"   # ChromaDB name length limit
    if name not in _collections:
        _collections[name] = _chroma.get_or_create_collection(name)
    return _collections[name]

def _extract_date(text: str) -> str:
    # Look for YYYY-MM-DD
    m = re.search(r'\b(\d{4}-\d{2}-\d{2})\b', text)
    if m:
        return m.group(1)
    
    # Look for Month DD, YYYY or DD Month YYYY
    months = r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*'
    m2 = re.search(rf'\b({months})\s+(\d{{1,2}})[,\s]+(\d{{4}})\b', text, re.IGNORECASE)
    if m2:
        return f"{m2.group(3)}-{m2.group(1).title()}-{m2.group(2)}"
    m3 = re.search(rf'\b(\d{{1,2}})\s+({months})[,\s]+(\d{{4}})\b', text, re.IGNORECASE)
    if m3:
        return f"{m3.group(3)}-{m3.group(2).title()}-{m3.group(1)}"
    
    # Simple check for DD-MM-YYYY
    m4 = re.search(r'\b(\d{2}-\d{2}-\d{4})\b', text)
    if m4:
        return m4.group(1)
    return "unknown"

def _extract_region(text: str) -> str:
    for reg in ["North", "South", "East", "West"]:
        if re.search(rf'\b{reg}\b', text, re.IGNORECASE):
            return reg.title()
    return "unknown"

def store_dataset(ingestion_result: dict, cleaned_result: dict, session_id: str) -> int:
    """
    Chunk the datasets into searchable pieces and store in ChromaDB with embeddings and date/region tags.
    """
    col = _get_collection(session_id)
    docs, embeds, ids, metas = [], [], [], []
    
    cleaned_dfs = cleaned_result.get("cleaned_dfs", {})
    cleaned_corpora = cleaned_result.get("cleaned_corpora", {})
    
    # 1. Index DataFrames (structured tables)
    for filename, df in cleaned_dfs.items():
        if df is None or len(df) == 0:
            continue
            
        # Detect date and region columns
        date_col = None
        region_col = None
        for colname in df.columns:
            col_lower = colname.lower()
            if any(kw in col_lower for kw in ["date", "time", "created", "timestamp", "dt"]):
                date_col = colname
            if any(kw in col_lower for kw in ["region", "location", "country", "state", "city", "zone"]):
                region_col = colname
                
        # Store column metadata
        for colname in df.columns:
            s = df[colname].dropna()
            if len(s) == 0:
                continue
            if s.dtype in [np.float64, np.int64, float, int] or pd.api.types.is_numeric_dtype(s):
                try:
                    chunk = (
                        f"Table '{filename}', Column '{colname}' (numeric): "
                        f"min={s.min():.2f}, max={s.max():.2f}, "
                        f"mean={s.mean():.2f}, median={s.median():.2f}"
                    )
                except Exception:
                    chunk = f"Table '{filename}', Column '{colname}' (numeric): data available."
            else:
                top5 = s.value_counts().head(5).to_dict()
                chunk = f"Table '{filename}', Column '{colname}' (text): {len(s.unique())} unique values. Top: {top5}"
                
            uid = hashlib.md5(f"{session_id}_{filename}_col_{colname}".encode()).hexdigest()
            docs.append(chunk)
            embeds.append(get_embedding(chunk))
            ids.append(uid)
            metas.append({
                "type": "column", 
                "col": colname, 
                "file": filename, 
                "date": "unknown", 
                "region": "unknown"
            })
            
        # Store row chunks (up to 25 rows to keep indexing fast and within limits)
        for i, row in df.head(25).iterrows():
            row_dict = row.to_dict()
            
            # Extract tags from row
            row_date = "unknown"
            if date_col and pd.notna(row_dict.get(date_col)):
                try:
                    row_date = pd.to_datetime(row_dict[date_col]).strftime("%Y-%m-%d")
                except Exception:
                    row_date = str(row_dict[date_col])
                    
            row_region = "unknown"
            if region_col and pd.notna(row_dict.get(region_col)):
                row_region = str(row_dict[region_col]).strip().title()
                
            chunk = f"Row {i} in Table '{filename}': {row_dict}"
            uid = hashlib.md5(f"{session_id}_{filename}_row_{i}".encode()).hexdigest()
            docs.append(chunk)
            embeds.append(get_embedding(chunk))
            ids.append(uid)
            metas.append({
                "type": "row",
                "file": filename,
                "date": row_date,
                "region": row_region
            })
            
    # 2. Index corpora (unstructured logs)
    for filename, text in cleaned_corpora.items():
        if not text.strip():
            continue
            
        paragraphs = text.split("\n\n")
        chunks = []
        for p in paragraphs:
            p = p.strip()
            if not p:
                continue
            if len(p) > 500:
                for j in range(0, len(p), 400):
                    chunks.append(p[j:j+400])
            else:
                chunks.append(p)
                
        for i, chunk in enumerate(chunks):
            if not chunk.strip():
                continue
                
            extracted_date = _extract_date(chunk)
            extracted_region = _extract_region(chunk)
            
            uid = hashlib.md5(f"{session_id}_{filename}_txt_{i}".encode()).hexdigest()
            docs.append(chunk)
            embeds.append(get_embedding(chunk))
            ids.append(uid)
            metas.append({
                "type": "log",
                "file": filename,
                "date": extracted_date,
                "region": extracted_region
            })
            
    if docs:
        col.upsert(documents=docs, embeddings=embeds, ids=ids, metadatas=metas)
    return len(docs)

def store_insights(insights: list, session_id: str):
    """Store insights in the vector store so the chat agent can reference them."""
    col = _get_collection(session_id)
    docs, embeds, ids, metas = [], [], [], []
    
    for i, ins in enumerate(insights):
        chunk = f"INSIGHT: {ins.get('title')}\n{ins.get('description')}"
        uid = hashlib.md5(f"{session_id}_ins_{i}".encode()).hexdigest()
        docs.append(chunk)
        embeds.append(get_embedding(chunk))
        ids.append(uid)
        metas.append({
            "type": "insight", 
            "severity": ins.get("severity", "medium"),
            "date": ins.get("data_evidence", {}).get("date", "unknown"),
            "region": ins.get("data_evidence", {}).get("region", "unknown"),
            "file": "discovery"
        })
    
    if docs:
        col.upsert(documents=docs, embeddings=embeds, ids=ids, metadatas=metas)

def search(query: str, session_id: str, n: int = 6, filter_dict: dict = None) -> list[dict]:
    """Search vector store. Returns list of dicts: [{'text': doc, 'metadata': meta}]."""
    col = _get_collection(session_id)
    q_embed = get_embedding(query)
    
    kwargs = {
        "query_embeddings": [q_embed],
        "n_results": min(n, 10)
    }
    if filter_dict:
        kwargs["where"] = filter_dict
        
    results = col.query(**kwargs)
    
    ret = []
    if results and results["documents"] and results["documents"][0]:
        for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
            ret.append({
                "text": doc,
                "metadata": meta
            })
    return ret
