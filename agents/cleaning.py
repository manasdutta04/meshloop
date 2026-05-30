import pandas as pd
import numpy as np
import re

def clean_data(ingestion_result: dict) -> dict:
    """Iterates through and cleans all dataframes and unstructured texts in the ingestion result."""
    cleaned_dfs = {}
    balanced_dfs = {}
    cleaned_corpora = {}
    issues_found = []
    cleaning_reports = {}
    
    # 1. Clean dataframes
    for name, df in ingestion_result.get("dataframes", {}).items():
        mock_ing = {"dataframe": df}
        res = _clean_tabular(mock_ing)
        cleaned_dfs[name] = res["cleaned_df"]
        if res.get("balanced_df") is not None:
            balanced_dfs[name] = res["balanced_df"]
        
        for issue in res["issues_found"]:
            issues_found.append(f"[{name}] {issue}")
        cleaning_reports[name] = res["cleaning_report"]
        
    # 2. Clean corpora (text files)
    for name, text in ingestion_result.get("corpora", {}).items():
        mock_ing = {"raw_text": text}
        res = _clean_text(mock_ing)
        cleaned_corpora[name] = res["clean_text"]
        for issue in res["issues_found"]:
            issues_found.append(f"[{name}] {issue}")
        cleaning_reports[name] = res["cleaning_report"]
        
    return {
        "cleaned_dfs": cleaned_dfs,
        "balanced_dfs": balanced_dfs,
        "cleaned_corpora": cleaned_corpora,
        "issues_found": issues_found,
        "cleaning_reports": cleaning_reports
    }

def _clean_tabular(ingestion_result: dict) -> dict:
    df = ingestion_result["dataframe"].copy()
    issues = []
    report = {
        "rows_before": len(df),
        "cols_before": len(df.columns),
    }

    # 1. Strip whitespace from all string columns
    str_cols = df.select_dtypes(include="object").columns
    for col in str_cols:
        df[col] = df[col].astype(str).str.strip()
        df[col] = df[col].replace("nan", np.nan)

    # 2. Auto-fix column types
    type_fixes = {}
    for col in df.columns:
        col_lower = col.lower()
        
        # Date columns
        if any(kw in col_lower for kw in ["date", "time", "created", "updated", "timestamp", "dt"]):
            try:
                df[col] = pd.to_datetime(df[col], errors="coerce")
                type_fixes[col] = "-> datetime"
            except Exception:
                pass
        
        # Numeric columns stored as strings (e.g. "$1,200.50")
        elif df[col].dtype == object:
            cleaned_num = (
                df[col]
                .astype(str)
                .str.replace(r"[$₹€£,]", "", regex=True)
                .str.strip()
            )
            numeric_attempt = pd.to_numeric(cleaned_num, errors="coerce")
            # If 70%+ of values parsed as numeric, convert the column
            if numeric_attempt.notna().mean() > 0.7:
                df[col] = numeric_attempt
                type_fixes[col] = "string -> numeric"
    
    if type_fixes:
        issues.append(f"Fixed column types: {type_fixes}")
        report["type_fixes"] = type_fixes

    # 3. Handle missing values
    null_counts = df.isnull().sum()
    null_cols = null_counts[null_counts > 0]
    
    null_handling = {}
    for col, count in null_cols.items():
        pct = count / len(df) * 100
        null_handling[col] = round(pct, 1)
        
        if pct > 60:
            df.drop(columns=[col], inplace=True)
            issues.append(f"Dropped column '{col}' — {pct:.0f}% missing")
        elif df[col].dtype in [np.float64, np.int64]:
            median_val = df[col].median()
            df[col] = df[col].fillna(median_val)
            issues.append(f"Filled {count} nulls in '{col}' with median ({median_val:.2f})")
        else:
            mode_vals = df[col].mode()
            if len(mode_vals) > 0:
                df[col] = df[col].fillna(mode_vals[0])
                issues.append(f"Filled {count} nulls in '{col}' with mode ('{mode_vals[0]}')")
    
    if null_handling:
        report["null_pcts"] = null_handling

    # 4. Remove exact duplicate rows
    dup_count = int(df.duplicated().sum())
    if dup_count > 0:
        df.drop_duplicates(inplace=True)
        issues.append(f"Removed {dup_count} duplicate rows")
        report["duplicates_removed"] = dup_count

    # 5. Standardize categorical casing
    for col in df.select_dtypes(include="object").columns:
        unique_vals = df[col].dropna().unique()
        lower_unique = set(str(v).lower().strip() for v in unique_vals)
        if 0 < len(lower_unique) < len(unique_vals):
            df[col] = df[col].str.strip().str.title()
            issues.append(f"Standardized casing in column '{col}'")

    report["rows_after"] = len(df)
    report["cols_after"] = len(df.columns)
    report["total_fixes"] = len(issues)

    balance = _balance_tabular(df)
    return {
        "cleaned_df": df,
        "balanced_df": balance["balanced_df"],
        "balance_report": balance["balance_report"],
        "clean_text": df.to_string(max_rows=100),
        "issues_found": issues,
        "cleaning_report": report,
    }

def _balance_tabular(df: pd.DataFrame) -> dict:
    if df is None or len(df) == 0:
        return {"balanced_df": None, "balance_report": {}}

    cat_cols = df.select_dtypes(include=["object", "category"]).columns.tolist()
    best_col = None
    best_score = 0.0

    for col in cat_cols:
        vc = df[col].value_counts(dropna=False)
        if len(vc) < 2:
            continue
        top_share = vc.iloc[0] / vc.sum()
        if top_share < 0.70:
            continue
        score = vc.iloc[0] / vc.iloc[-1]
        if score > best_score:
            best_score = score
            best_col = col

    if best_col is None or best_score < 2.0:
        return {"balanced_df": None, "balance_report": {}}

    counts = df[best_col].value_counts()
    max_n = counts.max()
    balanced_chunks = []
    for value, count in counts.items():
        group = df[df[best_col] == value]
        balanced_chunks.append(group)
        if count < max_n:
            sample = group.sample(n=max_n - count, replace=True, random_state=42)
            balanced_chunks.append(sample)

    balanced_df = pd.concat(balanced_chunks, ignore_index=True)
    balanced_df = balanced_df.sample(frac=1, random_state=42).reset_index(drop=True)

    return {
        "balanced_df": balanced_df,
        "balance_report": {
            "balanced_on": best_col,
            "original_counts": counts.to_dict(),
            "balanced_count": max_n,
        },
    }

def _clean_text(ingestion_result: dict) -> dict:
    raw = ingestion_result.get("raw_text", "")
    issues = []
    
    clean = re.sub(r'\n{3,}', '\n\n', raw)
    clean = re.sub(r'[ \t]{2,}', ' ', clean)
    clean = clean.strip()
    
    chars_removed = len(raw) - len(clean)
    if chars_removed > 0:
        issues.append(f"Removed {chars_removed} excess whitespace characters")

    return {
        "cleaned_df": None,
        "balanced_df": None,
        "balance_report": {},
        "clean_text": clean,
        "issues_found": issues,
        "cleaning_report": {"chars_before": len(raw), "chars_after": len(clean)},
    }
