from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os

from repo_processor import clone_and_process_repo
from rag_engine import RAGEngine

app = FastAPI(title="RepoGuide API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global RAG engine instance
rag_engine: Optional[RAGEngine] = None
current_repo: Optional[str] = None


class RepoRequest(BaseModel):
    github_url: str


class QueryRequest(BaseModel):
    question: str


class RepoResponse(BaseModel):
    message: str
    repo_name: str
    files_processed: int


class QueryResponse(BaseModel):
    answer: str
    sources: list[str]


@app.get("/")
def root():
    return {"message": "RepoGuide API is running"}


@app.post("/load-repo", response_model=RepoResponse)
async def load_repo(request: RepoRequest):
    """Clone a GitHub repo and build the vector index."""
    global rag_engine, current_repo

    try:
        chunks, repo_name, file_count = clone_and_process_repo(request.github_url)
        rag_engine = RAGEngine()
        rag_engine.build_index(chunks)
        current_repo = repo_name

        return RepoResponse(
            message="Repository loaded and indexed successfully!",
            repo_name=repo_name,
            files_processed=file_count,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/query", response_model=QueryResponse)
async def query_repo(request: QueryRequest):
    """Query the loaded repository using RAG."""
    if rag_engine is None:
        raise HTTPException(
            status_code=400, detail="No repository loaded. Please load a repo first."
        )

    try:
        answer, sources = rag_engine.query(request.question)
        return QueryResponse(answer=answer, sources=sources)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/status")
def get_status():
    return {
        "repo_loaded": rag_engine is not None,
        "current_repo": current_repo,
    }

