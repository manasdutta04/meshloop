import pandas as pd
import numpy as np
import re
from utils.llm import call_llm, call_llm_json

def discover_patterns(cleaned_result: dict, ingestion_result: dict, session_id: str = "temp") -> dict:
    """
    Main discovery entry point for ARCA.
    1. Runs statistical anomaly checks on tabular data.
    2. Searches ChromaDB for matching date/region text logs.
    3. Runs GPT-4o to correlate logs and explain root causes.
    """
    from utils.vector_store import search
    
    all_insights = []
    
    # 1. Run statistical checks on each cleaned dataframe
    stat_anomalies = []
    for filename, df in cleaned_result.get("cleaned_dfs", {}).items():
        anomalies = _run_statistical_checks(df, filename)
        stat_anomalies.extend(anomalies)
        
    # 2. Explainer Agent Loop: cross-reference anomalies with unstructured logs
    for anomaly in stat_anomalies:
        if anomaly["type"] == "anomaly" and "date" in anomaly["data_evidence"]:
            date = anomaly["data_evidence"]["date"]
            region = anomaly["data_evidence"].get("region", "unknown")
            
            # Query vector store for logs containing this date and region keywords
            query = f"{date} {region} outage issue crash failure ticket delay"
            
            # Retrieve matching text chunks from ChromaDB (type: log)
            filter_dict = {"type": "log"}
            search_results = search(query, session_id, n=4, filter_dict=filter_dict)
            text_chunks = [res["text"] for res in search_results]
            
            # Query GPT-4o to correlate metrics drop with the logs
            rc_insight = _query_root_cause_explanation(anomaly, text_chunks)
            if rc_insight:
                all_insights.append(rc_insight)
            else:
                all_insights.append(anomaly)
        else:
            all_insights.append(anomaly)
            
    # 3. LLM pattern discovery on dataframe profiles
    for filename, df in cleaned_result.get("cleaned_dfs", {}).items():
        existing_titles = [i["title"] for i in all_insights]
        llm_insights = _run_llm_discovery(df, existing_titles, filename)
        all_insights.extend(llm_insights)
        
    # 4. If no dataframes exist, run unstructured text discovery
    if not cleaned_result.get("cleaned_dfs"):
        for filename, text in cleaned_result.get("cleaned_corpora", {}).items():
            txt_insights = _run_text_discovery(text, filename)
            all_insights.extend(txt_insights)
            
    # Sort by severity
    order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    all_insights.sort(key=lambda x: order.get(x.get("severity", "low"), 3))
    
    top = all_insights[0] if all_insights else {}
    
    summary = _make_summary(all_insights, ingestion_result.get("metadata", {}).get("file_name", "Uploaded Files"))
    
    return {
        "insights": all_insights,
        "top_insight": top,
        "summary": summary,
        "anomalies": [i for i in all_insights if i.get("type") in ["anomaly", "root_cause_anomaly"]],
        "total_found": len(all_insights),
    }

def _run_statistical_checks(df: pd.DataFrame, filename: str) -> list:
    findings = []
    num_cols  = df.select_dtypes(include=np.number).columns.tolist()
    cat_cols  = df.select_dtypes(include="object").columns.tolist()
    date_cols = df.select_dtypes(include=["datetime64"]).columns.tolist()
    
    # Locate date and region columns
    date_col = None
    region_col = None
    for colname in df.columns:
        col_lower = colname.lower()
        if any(kw in col_lower for kw in ["date", "time", "created", "timestamp", "dt"]):
            date_col = colname
        if any(kw in col_lower for kw in ["region", "location", "country", "state", "city", "zone"]):
            region_col = colname

    # 1. Outliers (IQR)
    for col in num_cols:
        s = df[col].dropna()
        if len(s) < 10:
            continue
        Q1, Q3 = s.quantile(0.25), s.quantile(0.75)
        IQR = Q3 - Q1
        if IQR == 0:
            continue
        outliers = s[(s < Q1 - 3*IQR) | (s > Q3 + 3*IQR)]
        if len(outliers) > 0:
            findings.append({
                "type": "anomaly",
                "severity": "high" if len(outliers) > 5 else "medium",
                "title": f"Extreme outliers in '{col}' ({filename})",
                "description": f"In file '{filename}', we detected {len(outliers)} extreme outliers in '{col}'. Normal range: {Q1-3*IQR:.2f} to {Q3+3*IQR:.2f}. Outliers: {outliers.values[:3].tolist()}.",
                "data_evidence": {
                    "file": filename,
                    "column": col,
                    "outlier_count": len(outliers),
                    "examples": outliers.values[:5].tolist(),
                    "normal_range": [round(float(Q1-3*IQR), 2), round(float(Q3+3*IQR), 2)]
                }
            })

    # 2. Chronological Drops (anomalies on specific dates/regions)
    if date_col and num_cols:
        for ncol in num_cols:
            try:
                group_cols = [date_col]
                if region_col:
                    group_cols.append(region_col)
                
                # Daily average
                daily = df.groupby(group_cols)[ncol].mean().reset_index()
                daily[date_col] = pd.to_datetime(daily[date_col])
                daily = daily.sort_values(date_col)
                
                if len(daily) < 5:
                    continue
                
                # Calculate rolling median (past 7 items)
                rolling_median = daily[ncol].rolling(7, min_periods=3).median()
                
                for idx, row in daily.iterrows():
                    val = row[ncol]
                    med = rolling_median.loc[idx]
                    if pd.isna(med) or med == 0:
                        continue
                    
                    drop_pct = (med - val) / med * 100
                    if drop_pct > 30: # 30%+ drop is considered a business anomaly
                        date_str = row[date_col].strftime("%Y-%m-%d")
                        region_val = str(row[region_col]) if region_col else "unknown"
                        
                        findings.append({
                            "type": "anomaly",
                            "severity": "high",
                            "title": f"Metric drop in '{ncol}' on {date_str} in '{region_val}'",
                            "description": f"In '{filename}', the metric '{ncol}' dropped by {drop_pct:.0f}% to {val:.2f} on {date_str} (median: {med:.2f}) in region '{region_val}'.",
                            "data_evidence": {
                                "file": filename,
                                "column": ncol,
                                "date": date_str,
                                "region": region_val.title() if region_val != "unknown" else "unknown",
                                "drop_pct": round(drop_pct, 1),
                                "actual_value": round(val, 2),
                                "expected_value": round(med, 2)
                            }
                        })
            except Exception as e:
                print(f"Error checking chronological drops: {e}")
                
    return findings

def _query_root_cause_explanation(anomaly: dict, text_chunks: list) -> dict:
    """Uses GPT-4o to read text log context and determine if it explains the metric anomaly."""
    if not text_chunks:
        return None
        
    context = "\n\n".join(f"[Log Chunk {i+1}]: {c}" for i, c in enumerate(text_chunks))
    
    prompt = f"""You are a senior forensic data analyst.
We detected a business anomaly in our structured metrics:
- Anomaly: {anomaly['description']}
- Date: {anomaly['data_evidence'].get('date')}
- Region: {anomaly['data_evidence'].get('region')}

We retrieved the following unstructured logs/reports from that same timeframe/location:
{context}

Your task:
1. Determine if any of the retrieved logs logically explain the cause of this metric drop.
2. If yes, write a clear, actionable explanation of the root cause linking the numerical drop to the text event. CITE the specific log files or sources mentioned in the log chunks.
3. If no logical connection exists, say so.

Respond ONLY with valid JSON in this format:
{{
  "has_root_cause": true,
  "explanation": "2-3 sentences explaining the link with numbers and citing log source files.",
  "title": "Short title under 12 words",
  "severity": "critical"
}}"""

    try:
        res = call_llm_json(prompt)
        if res.get("has_root_cause"):
            return {
                "type": "root_cause_anomaly",
                "severity": res.get("severity", "high"),
                "title": res.get("title", "Root Cause: " + anomaly["title"]),
                "description": res.get("explanation"),
                "data_evidence": anomaly["data_evidence"]
            }
    except Exception as e:
        print(f"Error querying root cause: {e}")
    return None

def _run_llm_discovery(df: pd.DataFrame, existing: list, file_name: str) -> list:
    """Ask GPT-4o to look at the data profile and find business patterns."""
    num_summary = (
        df.describe().round(2).to_string()
        if len(df.select_dtypes(include=np.number).columns) > 0
        else "No numeric columns."
    )
    sample_str = df.head(8).to_string()

    prompt = f"""You are a senior data analyst.
Analyze this dataset profile and find 1-2 actionable business insights.

File: {file_name}
Columns: {df.columns.tolist()}
Row count: {len(df)}

Sample data (first 8 rows):
{sample_str}

Statistical summary:
{num_summary}

ALREADY FOUND — DO NOT REPEAT: {existing}

Respond ONLY with valid JSON in this exact format:
{{
  "insights": [
    {{
      "type": "pattern",
      "severity": "medium",
      "title": "Short title under 12 words",
      "description": "2-3 sentences. Be specific. Explain the business implication.",
      "data_evidence": {{"detail": "reference to columns or values"}}
    }}
  ]
}}"""

    try:
        result = call_llm_json(prompt)
        return result.get("insights", [])
    except Exception as e:
        print(f"LLM discovery failed: {e}")
        return []

def _run_text_discovery(text: str, file_name: str) -> list:
    prompt = f"""Analyze this document and find 1-2 non-obvious insights or patterns.

Document ({file_name}) preview:
{text[:6000]}

Respond ONLY with valid JSON:
{{
  "insights": [
    {{
      "type": "pattern",
      "severity": "medium",
      "title": "Short title",
      "description": "2-3 sentence explanation with specific references.",
      "data_evidence": {{"detail": "specific quote or reference"}}
    }}
  ]
}}"""

    try:
        result = call_llm_json(prompt)
        return result.get("insights", [])
    except Exception as e:
        print(f"Text discovery failed: {e}")
        return []

def _make_summary(insights: list, file_name: str) -> str:
    if not insights:
        return "No significant patterns were found in this dataset."
    titles = [i["title"] for i in insights[:4]]
    prompt = (
        f"Write a 2-sentence executive summary for a business audience "
        f"about these forensic findings in '{file_name}':\n{titles}\n"
        f"Be specific. Start with the most critical incident."
    )
    try:
        return call_llm(prompt, fast=True)
    except Exception:
        return f"Discovered {len(insights)} forensic incidents in {file_name}."
