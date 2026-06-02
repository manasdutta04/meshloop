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
    
    # Build chart specs with actual data from the largest numeric dataframe
    best_df = None
    best_name = None
    for name, df in cleaned_dfs.items():
        num_cols = df.select_dtypes(include=np.number).columns
        if best_df is None or len(num_cols) > len(best_df.select_dtypes(include=np.number).columns):
            best_df = df
            best_name = name

    chart_specs = _build_chart_specs(best_df, insights) if best_df is not None else []
    
    return {"report_text": report_text, "chart_specs": chart_specs}


def _safe_float(v) -> float:
    """Convert numpy/pandas scalars to plain Python float."""
    try:
        f = float(v)
        return round(f, 4) if not (np.isnan(f) or np.isinf(f)) else 0.0
    except Exception:
        return 0.0


def _build_chart_specs(df: pd.DataFrame, insights: list) -> list:
    if df is None or len(df) == 0:
        return []

    specs = []
    num_cols  = df.select_dtypes(include=np.number).columns.tolist()
    cat_cols  = [c for c in df.select_dtypes(include="object").columns if df[c].nunique() <= 30]
    
    # Detect date-like columns (parsed or string patterns)
    date_cols = df.select_dtypes(include=["datetime64"]).columns.tolist()
    if not date_cols:
        for c in df.select_dtypes(include="object").columns:
            try:
                parsed = pd.to_datetime(df[c], infer_datetime_format=True)
                if parsed.notna().sum() > len(df) * 0.5:
                    df = df.copy()
                    df[c] = parsed
                    date_cols.append(c)
                    break
            except Exception:
                pass

    # ── 1. Histogram of first numeric column ─────────────────────────────
    if num_cols:
        col = num_cols[0]
        series = df[col].dropna()
        n_bins = min(20, max(5, len(series) // 5))
        counts, bin_edges = np.histogram(series, bins=n_bins)
        # Mark bins that fall in insight outlier ranges
        outlier_vals = set()
        for ins in insights:
            ev = ins.get("data_evidence", {})
            if ev.get("column") == col and "examples" in ev:
                outlier_vals.update(ev["examples"])
        bins_data = []
        for i, (lo, hi, cnt) in enumerate(zip(bin_edges[:-1], bin_edges[1:], counts)):
            is_outlier = any(lo <= v <= hi for v in outlier_vals)
            bins_data.append({
                "x": round(float((lo + hi) / 2), 2),
                "label": f"{lo:.1f}–{hi:.1f}",
                "count": int(cnt),
                "outlier": is_outlier,
            })
        specs.append({
            "type": "histogram",
            "col": col,
            "title": f"Distribution of {col}",
            "bins": bins_data,
            "mean": _safe_float(series.mean()),
            "median": _safe_float(series.median()),
        })

    # ── 2. Bar chart — category breakdown of first numeric col ───────────
    if cat_cols and num_cols:
        cat_col = cat_cols[0]
        num_col = num_cols[0]
        agg = df.groupby(cat_col)[num_col].mean().sort_values(ascending=False)
        overall_mean = _safe_float(agg.mean())
        bars = [
            {
                "label": str(k),
                "value": _safe_float(v),
                "drop": _safe_float(v) < overall_mean * 0.8,
            }
            for k, v in agg.items()
        ]
        specs.append({
            "type": "bar",
            "col": cat_col,
            "metric": num_col,
            "title": f"{num_col} by {cat_col}",
            "bars": bars,
            "mean": overall_mean,
        })

    # ── 3. Scatter — best-correlated numeric pair ─────────────────────────
    if len(num_cols) >= 2:
        try:
            corr = df[num_cols].corr()
            best_r, ca, cb = 0.0, num_cols[0], num_cols[1]
            for i, c1 in enumerate(num_cols):
                for c2 in num_cols[i + 1:]:
                    v = abs(corr.loc[c1, c2])
                    if not pd.isna(v) and v > best_r:
                        best_r, ca, cb = float(v), c1, c2
            pair = df[[ca, cb]].dropna()
            # Downsample to ≤ 200 points for rendering
            sample = pair.sample(min(200, len(pair)), random_state=42) if len(pair) > 200 else pair
            # Identify outlier points from insights
            outlier_pairs = set()
            for ins in insights:
                ev = ins.get("data_evidence", {})
                if ev.get("column") in (ca, cb) and "examples" in ev:
                    outlier_pairs.update(ev["examples"])
            points = []
            for _, row in sample.iterrows():
                xv, yv = _safe_float(row[ca]), _safe_float(row[cb])
                is_out = xv in outlier_pairs or yv in outlier_pairs
                points.append({"x": xv, "y": yv, "outlier": is_out})
            specs.append({
                "type": "scatter",
                "x": ca,
                "y": cb,
                "title": f"{ca} vs {cb}",
                "corr": round(best_r, 3),
                "points": points,
            })
        except Exception:
            pass

    # ── 4. Line chart — numeric col over date/time ───────────────────────
    if date_cols and num_cols:
        dc, nc = date_cols[0], num_cols[0]
        ts = df[[dc, nc]].dropna().copy()
        ts[dc] = pd.to_datetime(ts[dc])
        ts = ts.sort_values(dc)
        # Group by date if > 200 rows
        if len(ts) > 200:
            ts = ts.set_index(dc).resample("D")[nc].mean().dropna().reset_index()
        # Identify drop dates from insights
        drop_dates = set()
        for ins in insights:
            ev = ins.get("data_evidence", {})
            if ev.get("column") == nc and "date" in ev:
                drop_dates.add(str(ev["date"])[:10])
        pts = []
        for _, row in ts.iterrows():
            date_str = str(row[dc])[:10]
            pts.append({
                "date": date_str,
                "value": _safe_float(row[nc]),
                "drop": date_str in drop_dates,
            })
        specs.append({
            "type": "line",
            "x": dc,
            "y": nc,
            "title": f"{nc} over time",
            "points": pts,
        })

    return specs[:4]
