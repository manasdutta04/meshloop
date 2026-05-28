import chromadb
import hashlib
import pandas as pd
import numpy as np
from utils.llm import get_embedding

# In-memory ChromaDB client (resets on app restart — fine for hackathon)
_chroma = chromadb.Client()
_collections: dict = {}

def _get_collection(session_id: str):
    name = f"s_{session_id[:16]}"   # ChromaDB name length limit
    if name not in _collections:
        _collections[name] = _chroma.get_or_create_collection(name)
    return _collections[name]

def store_dataset(ingestion_result: dict, cleaned_result: dict, session_id: str) -> int:
    """
    Chunk the dataset into searchable pieces and store with embeddings.
    Returns the number of chunks stored.
    """
    col = _get_collection(session_id)
    docs, embeds, ids, metas = [], [], [], []

    df = cleaned_result.get("cleaned_df")
    text = cleaned_result.get("clean_text", "")

    if df is not None:
        # Store one summary chunk per column
        for colname in df.columns:
            s = df[colname].dropna()
            if len(s) == 0:
                continue
            if s.dtype in [np.float64, np.int64, float, int] or pd.api.types.is_numeric_dtype(s):
                try:
                    chunk = (
                        f"Column '{colname}' (numeric): "
                        f"min={s.min():.2f}, max={s.max():.2f}, "
                        f"mean={s.mean():.2f}, median={s.median():.2f}"
                    )
                except Exception:
                    chunk = f"Column '{colname}' (numeric): data available."
            else:
                top5 = s.value_counts().head(5).to_dict()
                chunk = f"Column '{colname}' (text): {len(s.unique())} unique values. Top: {top5}"
            
            uid = hashlib.md5(f"{session_id}_col_{colname}".encode()).hexdigest()
            docs.append(chunk)
            embeds.append(get_embedding(chunk))
            ids.append(uid)
            metas.append({"type": "column", "col": colname})

        # Store sample rows
        for i, row in df.head(25).iterrows():
            chunk = f"Row {i}: {row.to_dict()}"
            uid = hashlib.md5(f"{session_id}_row_{i}".encode()).hexdigest()
            docs.append(chunk)
            embeds.append(get_embedding(chunk))
            ids.append(uid)
            metas.append({"type": "row"})
    else:
        # Text chunking for PDF/TXT
        size = 400
        chunks = [text[i:i+size] for i in range(0, min(len(text), 8000), size)]
        for i, chunk in enumerate(chunks):
            if not chunk.strip():
                continue
            uid = hashlib.md5(f"{session_id}_txt_{i}".encode()).hexdigest()
            docs.append(chunk)
            embeds.append(get_embedding(chunk))
            ids.append(uid)
            metas.append({"type": "text"})

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
        metas.append({"type": "insight", "severity": ins.get("severity", "medium")})
    
    if docs:
        col.upsert(documents=docs, embeddings=embeds, ids=ids, metadatas=metas)

def search(query: str, session_id: str, n: int = 6) -> list[str]:
    """Search vector store. Returns list of relevant text chunks."""
    col = _get_collection(session_id)
    q_embed = get_embedding(query)
    results = col.query(query_embeddings=[q_embed], n_results=min(n, 10))
    return results["documents"][0] if results["documents"] else []
