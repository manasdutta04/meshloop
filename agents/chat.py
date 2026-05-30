import json
from utils.vector_store import search
from utils.llm import call_llm

def answer_question(question: str, session_id: str, data_summary: dict) -> dict:
    # 1. Retrieve relevant context (returns a list of {'text': doc, 'metadata': meta})
    results = search(question, session_id, n=6)
    
    if not results:
        return {
            "answer": "No data has been analyzed yet. Please upload and process a ZIP or file first.",
            "sources": [],
            "suggested_followups": [
                "What patterns are in the data?",
                "What are the main insights?",
                "Which columns have issues?",
            ],
        }

    # Format the context text and extract filenames for citations
    context_lines = []
    sources = set()
    for i, res in enumerate(results):
        txt = res["text"]
        meta = res["metadata"]
        fname = meta.get("file", "unknown")
        sources.add(fname)
        context_lines.append(f"[Chunk {i+1} from '{fname}']: {txt}")
        
    context = "\n\n".join(context_lines)

    # 2. Answer with GPT-4o (via GitHub Models)
    prompt = f"""You are Meshloop, an AI forensic data analyst.
A user uploaded a dataset and is asking questions about it.

Dataset info:
- Files Processed: {data_summary.get('file_names', [data_summary.get('file_name', 'unknown')])}
- Rows Analyzed: {data_summary.get('row_count', '?')}
- Columns Available: {data_summary.get('column_names', [])}

Retrieved data context:
{context}

User question: {question}

Instructions:
- Answer ONLY based on the context provided above.
- Be specific — cite column names, values, and source files (e.g. `[server_log.txt]`).
- If the data is insufficient to answer, say so clearly.
- Keep the answer concise (3-5 sentences max).
- End with: "💡 Action: [one specific thing the user should do based on this finding]"

Answer:"""

    try:
        answer = call_llm(prompt)
    except Exception as e:
        answer = f"Error generating answer: {str(e)}"

    # 3. Generate follow-up questions using Phi-4 (faster/cheaper)
    followup_prompt = f"""Given the user asked: "{question}" about a dataset,
suggest exactly 3 short follow-up questions they might ask next.
Respond ONLY with a JSON array: ["question 1", "question 2", "question 3"]"""
    
    try:
        raw_fu = call_llm(followup_prompt, fast=True)
        # Strip code blocks
        raw_fu = raw_fu.strip()
        if raw_fu.startswith("```"):
            raw_fu = raw_fu.split("```")[1]
            if raw_fu.startswith("json"):
                raw_fu = raw_fu[4:]
        raw_fu = raw_fu.rstrip("```").strip()
        followups = json.loads(raw_fu)
    except Exception:
        followups = [
            "What are the top 3 insights?",
            "Which column needs the most attention?",
            "What trend is most concerning?",
        ]

    return {
        "answer": answer,
        "sources": list(sources),
        "suggested_followups": followups[:3],
    }
