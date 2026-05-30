import hashlib, time
from agents.ingestion import ingest_file
from agents.cleaning  import clean_data
from agents.discovery import discover_patterns
from agents.reporter  import generate_report
from utils.vector_store import store_dataset, store_insights

def run_pipeline(file_path: str, progress_callback=None) -> dict:
    """
    Run the full Meshloop ARCA pipeline on a single file or ZIP archive.
    Returns a unified result dict.
    """
    session_id = hashlib.md5(f"{file_path}_{time.time()}".encode()).hexdigest()[:16]
    print(f"\n[Pipeline] Starting | session: {session_id}")

    if progress_callback: progress_callback(20, "📂 Reading and parsing mixed-modal files...")
    print("[1/5] Ingesting...")
    ingestion = ingest_file(file_path)

    if progress_callback: progress_callback(40, "🧹 Cleaning tabular and log formats...")
    print("[2/5] Cleaning...")
    cleaning = clean_data(ingestion)

    if progress_callback: progress_callback(60, "💾 Storing in metadata tagged vector store...")
    print("[3/5] Storing in vector DB...")
    n_chunks = store_dataset(ingestion, cleaning, session_id)

    if progress_callback: progress_callback(80, "🔍 Performing statistical anomaly checks & root-cause explanations...")
    print("[4/5] Discovering patterns...")
    discovery = discover_patterns(cleaning, ingestion, session_id)
    
    # Store insights in the vector store so the chat agent can reference them
    store_insights(discovery["insights"], session_id)

    if progress_callback: progress_callback(90, "📊 Generating forensic charts and report...")
    print("[5/5] Generating report...")
    report = generate_report(ingestion, cleaning, discovery)

    if progress_callback: progress_callback(100, "✅ Analysis complete!")
    print(f"[Pipeline] [OK] Done — {n_chunks} chunks, {discovery['total_found']} insights")

    # Sum up row counts across all dataframes
    total_rows = sum(len(df) for df in cleaning.get("cleaned_dfs", {}).values())
    
    # Collect all unique column names
    col_names = []
    for df in cleaning.get("cleaned_dfs", {}).values():
        col_names.extend(df.columns.tolist())
    col_names = list(set(col_names))

    return {
        "session_id": session_id,
        "ingestion":  ingestion,
        "cleaning":   cleaning,
        "discovery":  discovery,
        "report":     report,
        "data_summary": {
            "file_name":    ingestion["metadata"]["file_name"],
            "file_names":   ingestion["metadata"]["files_contained"],
            "row_count":    total_rows,
            "column_names": col_names,
            "file_type":    ingestion["metadata"]["file_type"],
        },
    }

if __name__ == "__main__":
    import sys, json
    if len(sys.argv) < 2:
        print("Usage: python pipeline.py <file_path>")
        sys.exit(1)
    
    result = run_pipeline(sys.argv[1])
    print("\n--- RESULTS SUMMARY ---")
    print(json.dumps({
        "session_id": result["session_id"],
        "insights":   result["discovery"]["total_found"],
        "top":        result["discovery"]["top_insight"].get("title", "none"),
        "summary":    result["discovery"]["summary"],
    }, indent=2))
