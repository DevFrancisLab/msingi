# Running Msingi Backend

## 1. Install dependencies

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r backend/requirements.txt
```

## 2. Configure environment

```bash
cp .env.example .env
```

Defaults work for local dev. Edit `OLLAMA_MODEL`/`OLLAMA_BASE_URL` if needed.

## 3. Start Ollama (see docs/OLLAMA-SETUP.md)

```bash
ollama serve &
ollama pull qwen3:4b
```

## 4. Ingest curriculum (optional but recommended)

Put PDFs/txt/md under `curriculum/raw/<Subject>/<Grade>/<Topic>/`, then:
```bash
python scripts/ingest_curriculum.py
```

## 5. Run the API

From the project root:
```bash
python -m uvicorn app.main:app --app-dir backend --reload --port 8000
```

Try it:
```bash
curl http://localhost:8000/api/health

curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain photosynthesis so I can teach it tomorrow.",
    "grade": "Grade 10",
    "subject": "Agriculture",
    "topic": "Photosynthesis",
    "mode": "UNDERSTAND"
  }'
```

## 6. Run tests

```bash
pytest
```

Tests marked `requires_ollama` are auto-skipped if Ollama/qwen3:4b isn't available.

## 7. Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Opens on http://localhost:5173. Backend must be running for the chat to work.

