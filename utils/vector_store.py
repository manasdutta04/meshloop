"""
VECTOR STORE UTILITY STUB
"""

def store_dataset(ingestion_result: dict, cleaned_result: dict, session_id: str) -> int:
    return 0

def store_insights(insights: list, session_id: str):
    pass

def search(query: str, session_id: str, n: int = 6) -> list[str]:
    return []
