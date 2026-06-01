import json
from utils.vector_store import search
from utils.llm import call_llm
from utils.llm import demo_mode as llm_demo_mode


def _contextual_fallback_answer(question: str, results: list[dict], data_summary: dict) -> str:
    sources = []
    excerpts = []
    for res in results[:3]:
        meta = res.get("metadata", {})
        source_name = meta.get("file", "unknown")
        sources.append(source_name)
        snippet = " ".join(res.get("text", "").split())[:220]
        if snippet:
            excerpts.append(f"[{source_name}] {snippet}")

    unique_sources = list(dict.fromkeys(sources))
    source_text = ", ".join(unique_sources) if unique_sources else "the uploaded files"
    excerpt_text = " ".join(excerpts[:2]) if excerpts else "The retrieved context did not contain enough detail for a precise answer."

    return (
        f"I found relevant context in {source_text}. {excerpt_text} "
        f"For the question '{question}', the safest next step is to verify the strongest source chunk and compare it with the surrounding records. "
        "💡 Action: inspect the top matching file and confirm whether the same pattern appears near the incident window."
    )


def _fallback_followups(question: str) -> list[str]:
    return [
        "What evidence is strongest in the uploaded files?",
        "Which source file is most relevant here?",
        "What should I verify next in the incident window?",
    ]

def answer_question(question: str, session_id: str, data_summary: dict, demo_mode: bool = False) -> dict:
    with llm_demo_mode(demo_mode):
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

        if not answer or answer.startswith("[LLM unavailable") or answer.startswith("Remote LLM unavailable"):
            answer = _contextual_fallback_answer(question, results, data_summary)

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
            followups = _fallback_followups(question)

        return {
            "answer": answer,
            "sources": list(sources),
            "suggested_followups": followups[:3],
        }
