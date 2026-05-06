# RepoGuide 🔎

**Codebase Documentation Chatbot** — Ask questions about any GitHub repository in natural language.

Built using RAG (Retrieval-Augmented Generation): FAISS vector search + sentence transformers + OpenAI GPT.

---

## Architecture

```
GitHub URL
    │
    ▼
GitPython (clone repo)
    │
    ▼
File Parser → Text Chunker (1500 chars, 200 overlap)
    │
    ▼
SentenceTransformer (all-MiniLM-L6-v2) → Embeddings
    │
    ▼
FAISS Vector Index
    │         ▲
    │   Query embedding
    ▼         │
Top-K Retrieval ← User Question
    │
    ▼
Context + Question → OpenAI GPT-3.5-turbo
    │
    ▼
Answer + Source Files → React Frontend
```

---

## Project Structure

```
repoguide/
├── backend/
│   ├── main.py              # FastAPI app + endpoints
│   ├── repo_processor.py    # GitHub cloning + text chunking
│   ├── rag_engine.py        # FAISS index + RAG query logic
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── App.jsx          # Full chat UI (React + styled-components)
    │   ├── main.jsx
    │   └── index.css
    ├── index.html
    ├── package.json
    └── vite.config.js
```

---

## Setup & Running

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set your OpenAI API key
cp .env.example .env
# Edit .env and add: OPENAI_API_KEY=sk-...

# Run the server
uvicorn main:app --reload --port 8000
```

API will be live at: `http://localhost:8000`
Swagger docs: `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will be live at: `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/load-repo` | Clone + index a GitHub repo |
| POST | `/query` | Ask a question about the repo |
| GET | `/status` | Check if a repo is loaded |

### Example

```bash
# Load a repo
curl -X POST http://localhost:8000/load-repo \
  -H "Content-Type: application/json" \
  -d '{"github_url": "https://github.com/tiangolo/fastapi"}'

# Query it
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What is the main purpose of this project?"}'
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, Python |
| Repo Cloning | GitPython |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) |
| Vector DB | FAISS |
| LLM | OpenAI GPT-3.5-turbo |
| Frontend | React 18, Vite, styled-components |

---

## Team

- Janllyn Avantika (43611173)
- Pranaambigai Rajesh (43611103)

**Guide:** Dr. S. Sreeji, M.E., Ph.D. — Assistant Professor, CSE  
**Institution:** Sathyabama Institute of Science and Technology
