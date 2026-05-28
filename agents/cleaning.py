"""
CLEANING AGENT STUB
"""

def clean_data(ingestion_result: dict) -> dict:
    return {
        "cleaned_df": ingestion_result.get("dataframe"),
        "clean_text": ingestion_result.get("raw_text", ""),
        "issues_found": [],
        "cleaning_report": {"rows_before": ingestion_result.get("row_count", 0), "rows_after": ingestion_result.get("row_count", 0)},
    }
