# AI Architecture

```
FastAPI route (app/api/routes.py)
        ↓
AIService (app/ai/service.py)
        ↓                     ↓
CurriculumRetriever      app/ai/prompts.py (teacher-focused prompt)
        ↓                     ↓
                app/ai/ollama.py (generate)
                        ↓
                    Ollama → qwen3:4b
```

## AIService

`app/ai/service.py::AIService.answer(question, grade, subject, topic)`:
1. Retrieves relevant curriculum chunks via `CurriculumRetriever`.
2. Builds a teacher-focused chat prompt (`app/ai/prompts.py`) that includes the
   grade/subject/topic context and the retrieved curriculum text.
3. Sends it to Ollama via `app/ai/ollama.py::generate`.
4. Returns an `AIAnswer(content, sources)` — `sources` is curriculum metadata
   only (never raw Chroma/LangChain objects).

Routes never touch retrieval, prompt construction, or Ollama directly — they
only call `AIService`. This is what lets the model/provider change without
touching the API layer.

## Provider abstraction

`AI_PROVIDER` in config selects the provider. Only `ollama` is implemented.
`AIService.__init__` raises `AIServiceError` immediately for any other value —
this is intentional: no silent fallback to a different provider, and no cloud
model is called without explicit implementation. Claude/online support is
future work (see SPEC.md §13) and was not implemented in this pass.

## Ollama integration

`app/ai/ollama.py` is the only place that imports `langchain_ollama` or knows
the Ollama HTTP API shape:
- `check_ollama_available(settings)` — non-raising health check, used by
  `/api/health` and to fail fast with a clear message before generation.
- `generate(settings, messages)` — sends LangChain chat messages, returns text,
  raises `OllamaUnavailableError` on any failure (unreachable, model missing,
  request failure/timeout).

Model name and base URL always come from `Settings` (`app/core/config.py`),
sourced from environment variables — never hard-coded elsewhere.

## Error handling

- Empty question → `AIServiceError` → HTTP 422 (caught at the Pydantic layer,
  `message` has `min_length=1`) or 400-level validation before reaching the service.
- Ollama unreachable / model not pulled / request failure → `OllamaUnavailableError`
  → wrapped as `AIServiceError` → HTTP 503 with a human-readable `detail`, no
  stack trace exposed.
- Retrieval/vector-store failure → wrapped as `AIServiceError` → HTTP 503.
- Any other unhandled exception → generic FastAPI exception handler returns a
  plain HTTP 500 with no internal detail (see `app/main.py`).

## Known limitations

- No streaming responses yet (single blocking call to Ollama).
- No Claude/online provider implementation yet — only the seam (`AI_PROVIDER`)
  exists.
- Conversation memory is simple: the last `MAX_HISTORY_MESSAGES` (6) turns are
  replayed as chat messages so follow-ups like "how should I introduce this?"
  resolve correctly, but retrieval is still keyed only on the latest message,
  not the full conversation. Good enough for the hackathon scope; a longer
  conversation may need query rewriting for retrieval to stay on-topic.
