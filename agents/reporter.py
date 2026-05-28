import pandas as pd
import numpy as np

def generate_report(ingestion_result, cleaned_result, discovery_result) -> dict:
    df       = cleaned_result.get("cleaned_df")
    insights = discovery_result.get("insights", [])
    summary  = discovery_result.get("summary", "")
    fname    = ingestion_result["metadata"]["file_name"]

    sev_icon = {"critical": "🔴", "high": "🟠", "medium": "🟡", "low": "🟢"}

    lines = [
        f"# Meshloop Report: `{fname}`", "",
        "## Executive Summary", summary, "",
        "## Data Overview",
        f"- **File:** {fname}",
        f"- **Rows processed:** {ingestion_result['row_count']:,}",
        f"- **Columns:** {', '.join(ingestion_result['column_names'][:10])}",
        f"- **Issues cleaned:** {len(cleaned_result.get('issues_found', []))}",
        f"- **Insights discovered:** {len(insights)}", "",
        "## Insights",
    ]

    for i, ins in enumerate(insights, 1):
        icon = sev_icon.get(ins.get("severity", "low"), "⚪")
        lines += [
            f"### {icon} {i}. {ins.get('title', '')}",
            ins.get("description", ""),
            f"*Evidence: {ins.get('data_evidence', {})}*", "",
        ]

    if cleaned_result.get("issues_found"):
        lines += ["## Data Quality Fixes", ""]
        for fix in cleaned_result["issues_found"]:
            lines.append(f"- [OK] {fix}") # Replaced emoji with text for safety

    report_text = "\n".join(lines)
    chart_specs = _build_chart_specs(df, insights)

    return {"report_text": report_text, "chart_specs": chart_specs}

def _build_chart_specs(df, insights: list) -> list:
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
                          "corr": round(float(best_r), 3)})
        except Exception:
            pass
    if date_cols and num_cols:
        specs.append({"type": "line", "x": date_cols[0], "y": num_cols[0],
                      "title": f"{num_cols[0]} over time"})

    return specs[:4]
