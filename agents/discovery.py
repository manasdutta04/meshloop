import pandas as pd
import numpy as np
from utils.llm import call_llm, call_llm_json

def discover_patterns(cleaned_result: dict, ingestion_result: dict) -> dict:
    df = cleaned_result.get("cleaned_df")
    text = cleaned_result.get("clean_text", "")
    file_name = ingestion_result["metadata"]["file_name"]

    if df is not None and len(df) > 0:
        stat_insights = _run_statistical_checks(df)
        llm_insights  = _run_llm_discovery(df, stat_insights, file_name)
    else:
        stat_insights = []
        llm_insights  = _run_text_discovery(text, file_name)

    all_insights = stat_insights + llm_insights

    # Sort by severity
    order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    all_insights.sort(key=lambda x: order.get(x.get("severity", "low"), 3))

    top = all_insights[0] if all_insights else {}
    summary = _make_summary(all_insights, file_name)

    return {
        "insights": all_insights,
        "top_insight": top,
        "summary": summary,
        "anomalies": [i for i in all_insights if i.get("type") == "anomaly"],
        "total_found": len(all_insights),
    }

def _run_statistical_checks(df: pd.DataFrame) -> list:
    """Pure statistics — fast, no LLM tokens used."""
    findings = []
    num_cols  = df.select_dtypes(include=np.number).columns.tolist()
    cat_cols  = df.select_dtypes(include="object").columns.tolist()
    date_cols = df.select_dtypes(include=["datetime64"]).columns.tolist()

    # 1. Outliers (IQR method)
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
                "title": f"Extreme outliers detected in '{col}'",
                "description": (
                    f"{len(outliers)} values in '{col}' are extreme outliers "
                    f"(beyond 3× IQR). Normal range: {Q1-3*IQR:.2f} to {Q3+3*IQR:.2f}. "
                    f"Outlier examples: {outliers.values[:3].tolist()}. "
                    f"These may indicate data entry errors or genuinely unusual events."
                ),
                "data_evidence": {
                    "column": col,
                    "outlier_count": len(outliers),
                    "examples": outliers.values[:5].tolist(),
                    "normal_range": [round(float(Q1-3*IQR), 2), round(float(Q3+3*IQR), 2)],
                },
            })

    # 2. Strong correlations (r > 0.7)
    if len(num_cols) >= 2:
        corr = df[num_cols].corr()
        for i, c1 in enumerate(num_cols):
            for c2 in num_cols[i+1:]:
                r = corr.loc[c1, c2]
                if pd.isna(r) or abs(r) <= 0.70:
                    continue
                direction = "positively" if r > 0 else "negatively"
                findings.append({
                    "type": "correlation",
                    "severity": "high" if abs(r) > 0.85 else "medium",
                    "title": f"Strong link between '{c1}' and '{c2}'",
                    "description": (
                        f"'{c1}' and '{c2}' are strongly {direction} correlated "
                        f"(r = {r:.2f}). When '{c1}' increases, '{c2}' reliably "
                        f"{'increases' if r > 0 else 'decreases'} as well."
                    ),
                    "data_evidence": {"col1": c1, "col2": c2, "r": round(float(r), 3)},
                })

    # 3. Category dominance
    for col in cat_cols:
        vc = df[col].value_counts(normalize=True)
        if len(vc) >= 2 and vc.iloc[0] > 0.60:
            findings.append({
                "type": "distribution",
                "severity": "medium",
                "title": f"'{col}' is dominated by one value",
                "description": (
                    f"'{vc.index[0]}' accounts for {vc.iloc[0]*100:.1f}% of all "
                    f"entries in '{col}'. This heavy concentration may indicate "
                    f"a sampling bias or a real business pattern worth investigating."
                ),
                "data_evidence": {
                    "column": col,
                    "dominant_value": str(vc.index[0]),
                    "pct": round(float(vc.iloc[0]*100), 1),
                },
            })

    # 4. Time trend
    if date_cols and num_cols:
        dcol, ncol = date_cols[0], num_cols[0]
        try:
            sub = df[[dcol, ncol]].dropna().sort_values(dcol)
            mid = len(sub) // 2
            avg1 = sub[ncol].iloc[:mid].mean()
            avg2 = sub[ncol].iloc[mid:].mean()
            if avg1 != 0:
                chg = (avg2 - avg1) / abs(avg1) * 100
                if abs(chg) > 20:
                    word = "increased" if chg > 0 else "decreased"
                    findings.append({
                        "type": "trend",
                        "severity": "high",
                        "title": f"'{ncol}' has {word} significantly over time",
                        "description": (
                            f"'{ncol}' {word} by {abs(chg):.1f}% comparing "
                            f"the first and second halves of the time period. "
                            f"Average went from {avg1:.2f} to {avg2:.2f}."
                        ),
                        "data_evidence": {
                            "column": ncol,
                            "change_pct": round(float(chg), 1),
                            "first_half_avg": round(float(avg1), 2),
                            "second_half_avg": round(float(avg2), 2),
                        },
                    })
        except Exception:
            pass

    # 5. Missing data flags
    null_pcts = df.isnull().mean() * 100
    bad_cols = null_pcts[null_pcts > 10]
    if len(bad_cols) > 0:
        findings.append({
            "type": "data_quality",
            "severity": "medium",
            "title": f"{len(bad_cols)} columns have >10% missing data",
            "description": (
                f"Columns with significant missing values: "
                f"{', '.join(f'{c} ({v:.1f}%)' for c, v in bad_cols.items())}. "
                f"This could affect the reliability of any analysis."
            ),
            "data_evidence": {"missing_columns": bad_cols.round(1).to_dict()},
        })

    return findings

def _run_llm_discovery(df: pd.DataFrame, stat_insights: list, file_name: str) -> list:
    """
    Ask GPT-4o to look at the data profile and find 2-3 business patterns
    that the statistical checks would not catch.
    """
    num_summary = (
        df.describe().round(2).to_string()
        if len(df.select_dtypes(include=np.number).columns) > 0
        else "No numeric columns."
    )
    sample_str = df.head(8).to_string()
    existing = [i["title"] for i in stat_insights]

    prompt = f"""You are a senior business data analyst.
Analyze this dataset profile and find 2-3 non-obvious, ACTIONABLE business insights.

File: {file_name}
Columns: {df.columns.tolist()}
Row count: {len(df)}

Sample data (first 8 rows):
{sample_str}

Statistical summary:
{num_summary}

ALREADY FOUND — DO NOT REPEAT: {existing}

Your task: Find patterns a business consultant would flag as important.
Think about: unusual concentrations, unexpected absences, cross-column relationships, business risk signals.

Respond ONLY with valid JSON in this exact format:
{{
  "insights": [
    {{
      "type": "pattern",
      "severity": "high",
      "title": "Short title under 12 words",
      "description": "2-3 sentences. Be specific with numbers. Explain the business implication.",
      "data_evidence": {{"detail": "specific reference to columns or values"}}
    }}
  ]
}}

Return 1 to 3 insights only. Only include real patterns visible in the data above."""

    try:
        result = call_llm_json(prompt)
        return result.get("insights", [])
    except Exception as e:
        print(f"LLM discovery failed (non-fatal): {e}")
        return []

def _run_text_discovery(text: str, file_name: str) -> list:
    """For PDF/text files — find patterns in unstructured content."""
    prompt = f"""Analyze this document and find 3-5 non-obvious insights or patterns.

Document ({file_name}) preview:
{text[:6000]}

Look for: contradictions, unusual patterns, key entities and relationships,
implied trends, suspicious gaps, or anything a business analyst would flag.

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
        print(f"Text discovery failed (non-fatal): {e}")
        return []

def _make_summary(insights: list, file_name: str) -> str:
    if not insights:
        return "No significant patterns were found in this dataset."
    titles = [i["title"] for i in insights[:4]]
    prompt = (
        f"Write a 2-sentence executive summary for a business audience "
        f"about these findings in '{file_name}':\n{titles}\n"
        f"Be specific. Start with the most important finding."
    )
    # Using call_llm directly might fail without API key, but we'll assume it works when called in pipeline
    try:
        return call_llm(prompt, fast=True)
    except Exception:
        return f"Discovered {len(insights)} patterns in {file_name}."

if __name__ == "__main__":
    from agents.ingestion import ingest_file
    from agents.cleaning import clean_data
    import sys
    if len(sys.argv) < 2:
        print("Usage: python agents/discovery.py <file_path>")
        sys.exit(1)
    ing = ingest_file(sys.argv[1])
    cln = clean_data(ing)
    result = discover_patterns(cln, ing)
    print(f"\n[OK] Found {result['total_found']} insights")
    print(f"\nTOP: {result['top_insight'].get('title')}")
    print(f"     {result['top_insight'].get('description', '')[:200]}")
