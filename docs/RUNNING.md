# Running Msingi Backend

## 1. Install dependencies

```bash
python3 -m venv .venv
source .venv/bin/activate
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

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Try it:
```bash
curl http://localhost:8000/api/health
curl -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Explain photosynthesis to me so I can teach it tomorrow.", "grade": "Grade 10", "subject": "Biology", "topic": "Photosynthesis"}'
```

## 6. Run tests

```bash
pytest
```
Tests marked `requires_ollama` are auto-skipped if Ollama/qwen3:4b isn't available.
