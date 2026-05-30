import pandas as pd
import numpy as np

def generate_report(ingestion_result: dict, cleaned_result: dict, discovery_result: dict) -> dict:
    """Generates a markdown Forensic Audit Report and maps out chart configurations."""
    cleaned_dfs = cleaned_result.get("cleaned_dfs", {})
    insights    = discovery_result.get("insights", [])
    summary     = discovery_result.get("summary", "")
    metadata    = ingestion_result.get("metadata", {})
    fname       = metadata.get("file_name", "unknown")
    files_list  = metadata.get("files_contained", [fname])
    
    sev_icon = {"critical": "🚨", "high": "🔴", "medium": "🟠", "low": "🟢"}
    
    # Calculate row count
    row_count = 0
    for df in cleaned_dfs.values():
        row_count += len(df)
        
    lines = [
        f"# Meshloop Forensic Audit Report: `{fname}`", "",
        "## Executive Summary", summary, "",
        "## Data & Incident Overview",
        f"- **Upload Source:** {fname}",
        f"- **Files Ingested:** {', '.join(f'`{f}`' for f in files_list)}",
        f"- **Total Rows Processed:** {row_count:,}",
        f"- **Data Quality Fixes Applied:** {len(cleaned_result.get('issues_found', []))}",
        f"- **Forensic Incidents Discovered:** {len(insights)}", "",
        "## Critical Incidents & Insights", ""
    ]
    
    for i, ins in enumerate(insights, 1):
        icon = sev_icon.get(ins.get("severity", "low"), "⚪")
        lines += [
            f"### {icon} {i}. {ins.get('title', '')}",
            ins.get("description", ""),
            f"*Evidence: {ins.get('data_evidence', {})}*", ""
        ]
        
    if cleaned_result.get("issues_found"):
        lines += ["## Data Quality Fixes Applied", ""]
        for fix in cleaned_result["issues_found"]:
            lines.append(f"- ✅ {fix}")
            
    report_text = "\n".join(lines)
    
    # Build chart specs for the first active dataframe
    first_df = next(iter(cleaned_dfs.values())) if cleaned_dfs else None
    chart_specs = _build_chart_specs(first_df, insights)
    
    return {"report_text": report_text, "chart_specs": chart_specs}

def _build_chart_specs(df: pd.DataFrame, insights: list) -> list:
    if df is None or len(df) == 0:
        return []
    
    specs = []
    num_cols  = df.select_dtypes(include=np.number).columns.tolist()
    cat_cols  = df.select_dtypes(include="object").columns.tolist()
    date_cols = df.select_dtypes(include=["datetime64"]).columns.tolist()

    if num_cols:
        specs.append({"type": "histogram", "col": num_cols[0],
                      "title": f"Distribution of {num_cols[0]}"})
    if cat_cols:
        specs.append({"type": "bar", "col": cat_cols[0],
                      "title": f"Breakdown by {cat_cols[0]}"})
    if len(num_cols) >= 2:
        try:
            corr = df[num_cols].corr()
            best_r, ca, cb = 0, num_cols[0], num_cols[1]
            for i, c1 in enumerate(num_cols):
                for c2 in num_cols[i+1:]:
                    v = abs(corr.loc[c1, c2])
                    if not pd.isna(v) and v > best_r:
                        best_r, ca, cb = v, c1, c2
            specs.append({"type": "scatter", "x": ca, "y": cb,
                          "title": f"{ca} vs {cb}",
                          "corr": round(best_r, 3)})
        except Exception:
            pass
    if date_cols and num_cols:
        specs.append({"type": "line", "x": date_cols[0], "y": num_cols[0],
                      "title": f"{num_cols[0]} over time"})

    return specs[:4]
