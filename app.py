"""
Customer Support Resolution Assistant (TRACK_ID=PS04)
Main Entrypoint Application.
Starts backend and serves compiled frontend on http://0.0.0.0:8000.
"""

import os
import json
import uvicorn
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from src.backend.models import ResolveRequest, TriageResult
from src.backend.llm_assistant import ResolutionEngine
from src.backend.retrieval import LocalRetriever

load_dotenv()

app = FastAPI(
    title="Customer Support Resolution Assistant",
    description="Resolution Assistant for a broadband & mobile provider's support desk (TRACK_ID=PS04)",
    version="1.0.0"
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize engines
DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
ARTICLES_FILE = os.path.join(DATA_DIR, "support_articles.json")
CUSTOMERS_FILE = os.path.join(DATA_DIR, "customers.json")
TICKETS_FILE = os.path.join(DATA_DIR, "tickets.json")

retriever = LocalRetriever(articles_file=ARTICLES_FILE)
resolution_engine = ResolutionEngine()

def load_json(filepath: str, default: any):
    if os.path.exists(filepath):
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            print(f"[app.py] Error loading {filepath}: {e}")
    return default

# In-memory ticket store initialized from tickets.json
tickets_data = load_json(TICKETS_FILE, [])
customers_data = load_json(CUSTOMERS_FILE, {})

# -----------------------------------------------------------------------------
# REST API Endpoints
# -----------------------------------------------------------------------------

@app.get("/api/health")
async def health_check():
    has_key = bool(os.environ.get("GEMINI_API_KEY"))
    return {
        "status": "ok",
        "trackId": "PS04",
        "service": "Customer Support Resolution Assistant",
        "hasGeminiKey": has_key,
        "model": "gemini-2.5-flash",
        "retrievalEngine": "Local Hybrid Vector (numpy + BM25)",
        "server": "Python 3.12 / FastAPI"
    }

@app.get("/api/articles")
async def get_articles():
    articles = load_json(ARTICLES_FILE, [])
    return JSONResponse(content=articles)

@app.get("/api/articles/search")
async def search_articles(q: str = ""):
    if not q:
        return load_json(ARTICLES_FILE, [])
    results = retriever.search(q, top_k=3)
    return JSONResponse(content=results)

@app.get("/api/customers")
async def get_customers():
    return JSONResponse(content=customers_data)

@app.get("/api/tickets")
async def get_tickets():
    return JSONResponse(content=tickets_data)

@app.post("/api/resolve")
async def resolve_ticket(req: ResolveRequest):
    try:
        articles = req.articles
        if not articles:
            articles = load_json(ARTICLES_FILE, [])
        
        # Check if conversation needs targeted article retrieval
        if req.conversation and len(req.conversation) > 0:
            latest_text = req.conversation[-1].text
            top_articles = retriever.search(latest_text, top_k=3)
            # Merge with existing articles
            existing_ids = {a.id if hasattr(a, 'id') else a.get('id') for a in articles}
            for ta in top_articles:
                if ta["id"] not in existing_ids:
                    articles.append(ta)

        result = resolution_engine.resolve_ticket(
            conversation=req.conversation,
            customer=req.customer,
            articles=articles
        )
        return JSONResponse(content=result.model_dump())
    except Exception as e:
        print(f"[app.py] Error in /api/resolve: {e}")
        from src.backend.heuristics import evaluate_deterministic_rules
        fallback = evaluate_deterministic_rules(req.conversation, req.customer, req.articles or [])
        return JSONResponse(content=fallback.model_dump())

@app.post("/api/tickets/{ticket_id}/message")
async def add_ticket_message(ticket_id: str, payload: dict):
    for t in tickets_data:
        if t.get("id") == ticket_id:
            msg = {
                "id": f"msg-{len(t.get('messages', [])) + 1}",
                "sender": payload.get("sender", "agent"),
                "text": payload.get("text", ""),
                "timestamp": payload.get("timestamp", "Just now"),
                "citedArticleId": payload.get("citedArticleId")
            }
            t.setdefault("messages", []).append(msg)
            return JSONResponse(content={"status": "message_added", "ticket": t})
    raise HTTPException(status_code=404, detail="Ticket not found")

@app.post("/api/tickets/{ticket_id}/handover")
async def handover_ticket(ticket_id: str, payload: dict):
    for t in tickets_data:
        if t.get("id") == ticket_id:
            t["status"] = "Escalated"
            t["assignedSpecialist"] = payload.get("queue", "Tier-2 Escalations")
            sys_msg = {
                "id": f"sys-{len(t.get('messages', [])) + 1}",
                "sender": "system",
                "text": f"Transferred to {payload.get('queue')}. Dossier transmitted. Notes: {payload.get('notes', 'None')}",
                "timestamp": "Just now"
            }
            t.setdefault("messages", []).append(sys_msg)
            return JSONResponse(content={"status": "escalated", "ticket": t})
    raise HTTPException(status_code=404, detail="Ticket not found")

# -----------------------------------------------------------------------------
# Static Frontend Serving (dist/ directory)
# -----------------------------------------------------------------------------
DIST_DIR = os.path.join(os.path.dirname(__file__), "dist")
ASSETS_DIR = os.path.join(DIST_DIR, "assets")

if os.path.exists(ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    # If the requested path corresponds to an existing static file, serve it
    file_path = os.path.join(DIST_DIR, full_path)
    if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # Otherwise fallback to index.html for Single Page Application routing
    index_path = os.path.join(DIST_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return JSONResponse(
        status_code=404,
        content={"error": "Frontend build files not found in dist/. Please run 'npm run build' once if developing."}
    )

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"================================================================")
    print(f"Customer Support Resolution Assistant (TRACK_ID=PS04)")
    print(f"Starting server on http://localhost:{port}")
    print(f"================================================================")
    uvicorn.run(app, host="0.0.0.0", port=port)
