# Msingi

**An AI teaching co-pilot for Grade 10 teachers in Kenya.**

> Teaching doesn't stop when the internet does.

Msingi helps a teacher move from *"I don't know how to teach this"* to *"Now I can teach it."* The system is designed to run locally on a school's server, so teachers can get lesson support even when the internet is unreliable.

---

## What it does

A teacher selects their **Grade**, **Subject**, and **Topic**, then asks Msingi to help them:

- **Understand** an unfamiliar topic before teaching it
- **Prepare** lesson structures, activities, and questions
- **Teach** with practical explanations, examples, and analogies

Msingi grounds its answers in uploaded curriculum documents (PDFs, text files) so responses stay aligned with what teachers are actually required to cover. When the curriculum material doesn't answer a question, Msingi says so and offers general teaching advice—clearly labeled as such.

The teacher is the user. There are no student accounts, no grading, no analytics. This is a teacher tool.

---

## Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Frontend (React + Vite)                                                   │
│  Teacher selects Grade/Subject/Topic → types a question → sees the answer  │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│  FastAPI Backend                                                           │
│  /api/chat  /api/conversations  /api/grades  /api/subjects  /api/topics    │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                 ┌──────────────────┴──────────────────┐
                 ▼                                     ▼
┌─────────────────────────────┐      ┌─────────────────────────────────────┐
│  RAG Pipeline               │      │  AI Service                         │
│  Chroma + local embeddings  │ ──▶  │  prompt_builder → Ollama → Qwen3 4B │
│  curriculum/vectorstore/    │      │  (or future Claude provider)        │
└─────────────────────────────┘      └─────────────────────────────────────┘
```

All AI processing happens locally via [Ollama](https://ollama.com). The frontend never talks to Ollama directly—everything goes through the backend API.

---

## Quick start

### Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- [Ollama](https://ollama.com) with `qwen3:4b` pulled

### 1. Clone and set up the backend

```bash
git clone <repo-url>
cd msingi

python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt

cp .env.example .env
```

### 2. Start Ollama

```bash
ollama serve &
ollama pull qwen3:4b
```

### 3. (Optional) Ingest curriculum documents

Place curriculum PDFs/text under `curriculum/raw/<Subject>/<Grade>/<Topic>/`, then:

```bash
python scripts/ingest_curriculum.py
```

The loader extracts subject/grade/topic metadata from the directory structure. Without ingested documents, Msingi still works but answers are not curriculum-grounded.

### 4. Run the backend

```bash
python -m uvicorn app.main:app --app-dir backend --reload --port 8000
```

Verify: `curl http://localhost:8000/api/health` should show `ollama_available: true`.

### 5. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Select a grade/subject/topic and ask your first question.

---

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Service status + Ollama availability |
| `/api/grades` | GET | Supported grades (Grade 10 only for MVP) |
| `/api/subjects` | GET | Subjects available in the ingested curriculum |
| `/api/topics?subject=...` | GET | Topics for a subject |
| `/api/chat` | POST | Send a teacher question, get an AI answer + sources |
| `/api/conversations` | GET/POST | List or create conversations |
| `/api/conversations/{id}` | GET/DELETE | Retrieve or delete a conversation |

### Chat request

```json
{
  "message": "Explain photosynthesis so I can teach it tomorrow.",
  "grade": "Grade 10",
  "subject": "Agriculture",
  "topic": "Photosynthesis",
  "mode": "UNDERSTAND",
  "conversation_id": null
}
```

`mode` is optional: `UNDERSTAND`, `PREPARE`, or `TEACH`. Omit it to let the model infer.

### Chat response

```json
{
  "conversation_id": "abc-123",
  "message": {
    "role": "assistant",
    "content": "### Simple Explanation\n\nPhotosynthesis is..."
  },
  "sources": [
    {"source": "Agriculture-Grade-10.pdf", "page": 35, "subject": "Agriculture", "grade": "Grade 10", "topic": "General"}
  ]
}
```

Sources are only returned when the RAG retriever found relevant curriculum chunks. The frontend never invents them.

---

## Project structure

```
msingi/
├── backend/
│   └── app/
│       ├── ai/                 # Prompt templates, builder, Ollama integration
│       │   ├── prompts.py      # System/mode/context string templates
│       │   ├── prompt_builder.py  # Assembles LangChain messages
│       │   ├── service.py      # AIService: retrieve → build prompt → generate
│       │   └── ollama.py       # ChatOllama wrapper
│       ├── api/                # FastAPI routes, schemas, reference data
│       ├── rag/                # Loader, chunker, embeddings, Chroma, retriever
│       ├── database/           # SQLite models (Conversation, Message)
│       └── core/               # Settings from .env
├── frontend/                   # React + TypeScript + Vite + Tailwind
├── curriculum/
│   ├── raw/                    # Source PDFs/txt/md (commit these)
│   └── vectorstore/            # Generated by ingestion (gitignored)
├── tests/                      # pytest: ai/, api/, rag/
├── docs/                       # Setup guides
├── scripts/                    # ingest_curriculum.py
├── SPEC.md                     # Full product specification
└── .env.example                # Configuration template
```

---

## Configuration

All settings come from environment variables (see `.env.example`):

| Variable | Default | Description |
|----------|---------|-------------|
| `AI_PROVIDER` | `ollama` | AI backend (only `ollama` is implemented) |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server URL |
| `OLLAMA_MODEL` | `qwen3:4b` | Model to use |
| `OLLAMA_REQUEST_TIMEOUT` | `120` | Seconds before timeout |
| `EMBEDDING_MODEL` | `sentence-transformers/all-MiniLM-L6-v2` | Embedding model for RAG |
| `RETRIEVER_TOP_K` | `4` | Number of curriculum chunks to retrieve |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Allowed frontend origins |

---

## Tests

```bash
source .venv/bin/activate
pytest
```

38 tests cover prompt construction, the AI service, the RAG pipeline, and API routes. Tests marked `requires_ollama` are auto-skipped when Ollama isn't running.

---

## Documentation

- [docs/RUNNING.md](docs/RUNNING.md) — Detailed setup instructions
- [docs/OLLAMA-SETUP.md](docs/OLLAMA-SETUP.md) — Ollama installation and model setup
- [docs/RAG.md](docs/RAG.md) — Curriculum ingestion and retrieval pipeline
- [docs/AI-ARCHITECTURE.md](docs/AI-ARCHITECTURE.md) — AI service, prompt system, provider abstraction
- [SPEC.md](SPEC.md) — Full product and technical specification

---

## What Msingi does NOT do (by design)

- No student accounts or learner profiles
- No grading or assessment tracking
- No analytics or dashboards
- No multi-agent architecture
- No web search or autonomous browsing
- No SMS, WhatsApp, or voice (yet—see SPEC.md Phase 2)

The goal is a reliable teacher co-pilot, not an education platform.

---

## Roadmap

**Phase 1 (current):** Local text AI — FastAPI + Ollama + RAG + conversation persistence.

**Phase 2:** Local voice — speech-to-text input so teachers can speak instead of type.

**Phase 3:** Fully offline — the entire system runs on a school's local server with no internet dependency.

---

## License

[To be determined]

---

## Contributing

This project was built during a hackathon. Contributions welcome—see the issues tab or reach out.
