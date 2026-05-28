import pandas as pd
import numpy as np
import re

def clean_data(ingestion_result: dict) -> dict:
    """Routes to tabular or text cleaning based on data type."""
    if ingestion_result.get("dataframe") is not None:
        return _clean_tabular(ingestion_result)
    return _clean_text(ingestion_result)

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
                # Use format="mixed" or similar if infer_datetime_format is not available in pandas 2.2.2+
                df[col] = pd.to_datetime(df[col], errors="coerce")
                type_fixes[col] = "→ datetime"
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
                type_fixes[col] = "string → numeric"
    
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

    return {
        "cleaned_df": df,
        "clean_text": df.to_string(max_rows=100),
        "issues_found": issues,
        "cleaning_report": report,
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
        "clean_text": clean,
        "issues_found": issues,
        "cleaning_report": {"chars_before": len(raw), "chars_after": len(clean)},
    }

if __name__ == "__main__":
    from agents.ingestion import ingest_file
    import sys
    if len(sys.argv) < 2:
        print("Usage: python agents/cleaning.py <file_path>")
        sys.exit(1)
    r = ingest_file(sys.argv[1])
    c = clean_data(r)
    print(f"[OK] Cleaned: {c['cleaning_report']['rows_after']} rows | Fixes: {c['cleaning_report']['total_fixes']}")
