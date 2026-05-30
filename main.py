import os
import tempfile
import zipfile
from typing import List, Dict, Any
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel
import io
import pandas as pd

# Import our agents and pipeline
from pipeline import run_pipeline
from agents.chat import answer_question

app = FastAPI(title="Meshloop ARCA API", description="FastAPI Backend for Autonomous Root-Cause Analyst")

# Enable CORS for Next.js app (running on port 3000 by default)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory session store (resets on restart - perfect for hackathon)
_sessions: Dict[str, Dict[str, Any]] = {}

class ChatRequest(BaseModel):
    session_id: str
    question: str
    data_summary: Dict[str, Any]

@app.post("/api/analyze")
async def analyze_files(files: List[UploadFile] = File(...)):
    """
    Ingests and runs the full ARCA analysis pipeline on uploaded files.
    If multiple files are uploaded, they are zipped together before parsing.
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded")

    # Create temporary zip file
    tmp_zip = tempfile.NamedTemporaryFile(delete=False, suffix=".zip")
    try:
        if len(files) == 1 and files[0].filename.lower().endswith(".zip"):
            # Single zip file upload
            content = await files[0].read()
            tmp_zip.write(content)
            tmp_zip.close()
            file_path = tmp_zip.name
        else:
            # Package multiple files into a zip
            with zipfile.ZipFile(tmp_zip.name, mode="w") as zf:
                for f in files:
                    content = await f.read()
                    zf.writestr(f.filename, content)
            tmp_zip.close()
            file_path = tmp_zip.name

        # Run pipeline
        result = run_pipeline(file_path)
        
        # Save result to our in-memory session store
        session_id = result["session_id"]
        _sessions[session_id] = result
        
        # Clean up temp file
        if os.path.exists(file_path):
            os.unlink(file_path)
            
        # Return serializable summary metadata to Next.js (exclude raw dataframes)
        serializable_result = {
            "session_id": session_id,
            "data_summary": result["data_summary"],
            "cleaning": {
                "issues_found": result["cleaning"].get("issues_found", []),
                "cleaning_reports": result["cleaning"].get("cleaning_reports", {})
            },
            "discovery": {
                "insights": result["discovery"].get("insights", []),
                "top_insight": result["discovery"].get("top_insight", {}),
                "summary": result["discovery"].get("summary", ""),
                "total_found": result["discovery"].get("total_found", 0)
            },
            "report": {
                "report_text": result["report"].get("report_text", ""),
                "chart_specs": result["report"].get("chart_specs", [])
            }
        }
        
        return JSONResponse(content=serializable_result)
        
    except Exception as e:
        if os.path.exists(tmp_zip.name):
            os.unlink(tmp_zip.name)
        raise HTTPException(status_code=500, detail=f"Pipeline error: {str(e)}")

@app.post("/api/analyze/sample")
async def analyze_sample():
    """
    Runs analysis on the included sample_data/arca_test_dataset.zip.
    """
    sample_path = "sample_data/arca_test_dataset.zip"
    if not os.path.exists(sample_path):
        raise HTTPException(status_code=404, detail="Sample data not found")
        
    try:
        result = run_pipeline(sample_path)
        session_id = result["session_id"]
        _sessions[session_id] = result
        
        serializable_result = {
            "session_id": session_id,
            "data_summary": result["data_summary"],
            "cleaning": {
                "issues_found": result["cleaning"].get("issues_found", []),
                "cleaning_reports": result["cleaning"].get("cleaning_reports", {})
            },
            "discovery": {
                "insights": result["discovery"].get("insights", []),
                "top_insight": result["discovery"].get("top_insight", {}),
                "summary": result["discovery"].get("summary", ""),
                "total_found": result["discovery"].get("total_found", 0)
            },
            "report": {
                "report_text": result["report"].get("report_text", ""),
                "chart_specs": result["report"].get("chart_specs", [])
            }
        }
        return JSONResponse(content=serializable_result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sample pipeline error: {str(e)}")

@app.post("/api/chat")
async def chat_with_data(req: ChatRequest):
    """
    Handles RAG incident-room chat query.
    """
    try:
        resp = answer_question(req.question, req.session_id, req.data_summary)
        return resp
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat agent error: {str(e)}")

@app.get("/api/export/cleaned")
def export_cleaned_df(session_id: str = Query(...), filename: str = Query(...)):
    """
    Streams back a cleaned CSV dataset for download.
    """
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    cleaned_dfs = session["cleaning"].get("cleaned_dfs", {})
    df = cleaned_dfs.get(filename)
    if df is None:
        raise HTTPException(status_code=404, detail=f"Dataset {filename} not found in this session")
        
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    
    response = StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv"
    )
    base_name = os.path.splitext(filename)[0]
    response.headers["Content-Disposition"] = f"attachment; filename=cleaned_{base_name}.csv"
    return response

@app.get("/api/export/balanced")
def export_balanced_df(session_id: str = Query(...), filename: str = Query(...)):
    """
    Streams back a balanced CSV dataset for download.
    """
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    balanced_dfs = session["cleaning"].get("balanced_dfs", {})
    df = balanced_dfs.get(filename)
    if df is None:
        raise HTTPException(status_code=404, detail=f"Balanced dataset for {filename} not found in this session")
        
    stream = io.StringIO()
    df.to_csv(stream, index=False)
    
    response = StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv"
    )
    base_name = os.path.splitext(filename)[0]
    response.headers["Content-Disposition"] = f"attachment; filename=balanced_{base_name}.csv"
    return response

@app.get("/api/export/report")
def export_audit_report(session_id: str = Query(...)):
    """
    Streams back the full Markdown forensic report.
    """
    session = _sessions.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    report_text = session["report"].get("report_text", "No report generated.")
    
    response = StreamingResponse(
        iter([report_text]),
        media_type="text/markdown"
    )
    file_name = session["data_summary"].get("file_name", "meshloop_report")
    base_name = os.path.splitext(file_name)[0]
    response.headers["Content-Disposition"] = f"attachment; filename=meshloop_{base_name}.md"
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
