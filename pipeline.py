import hashlib, time
from agents.ingestion import ingest_file
from agents.cleaning  import clean_data
from agents.discovery import discover_patterns
from agents.reporter  import generate_report
from utils.vector_store import store_dataset, store_insights

def run_pipeline(file_path: str) -> dict:
    """
    Run the full Meshloop pipeline on a single file.
    Returns a unified result dict.
    """
    session_id = hashlib.md5(f"{file_path}_{time.time()}".encode()).hexdigest()[:16]
    print(f"\n[Pipeline] Starting | session: {session_id}")

    print("[1/5] Ingesting...")
    ingestion = ingest_file(file_path)

    print("[2/5] Cleaning...")
    cleaning = clean_data(ingestion)

    print("[3/5] Discovering patterns...")
    discovery = discover_patterns(cleaning, ingestion)

    print("[4/5] Storing in vector DB...")
    n_chunks = store_dataset(ingestion, cleaning, session_id)
    store_insights(discovery["insights"], session_id)

    print("[5/5] Generating report...")
    report = generate_report(ingestion, cleaning, discovery)

    print(f"[Pipeline] [OK] Done — {n_chunks} chunks, {discovery['total_found']} insights")

    return {
        "session_id": session_id,
        "ingestion":  ingestion,
        "cleaning":   cleaning,
        "discovery":  discovery,
        "report":     report,
        "data_summary": {
            "file_name":    ingestion["metadata"]["file_name"],
            "row_count":    ingestion["row_count"],
            "column_names": ingestion["column_names"],
            "file_type":    ingestion["file_type"],
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
