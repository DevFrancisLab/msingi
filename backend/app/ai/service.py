"""AIService: the single entry point the rest of the app uses for chat.

FastAPI routes call this, and only this. It hides retrieval, prompt
construction, and the model provider behind one interface, so routes
never talk to Chroma or Ollama directly.
"""
from __future__ import annotations

from dataclasses import dataclass, field

from app.ai.ollama import OllamaUnavailableError, generate
from app.ai.prompt_builder import build_prompt
from app.core.config import Settings, get_settings
from app.rag.retriever import CurriculumRetriever, RetrievedChunk


class AIServiceError(RuntimeError):
    """Raised for any AI-pipeline failure the API layer should turn into a clean error."""


@dataclass
class AIAnswer:
    content: str
    sources: list[dict] = field(default_factory=list)


class AIService:
    def __init__(self, settings: Settings | None = None, retriever: CurriculumRetriever | None = None):
        self._settings = settings or get_settings()
        if self._settings.ai_provider != "ollama":
            raise AIServiceError(
                f"Unsupported AI_PROVIDER '{self._settings.ai_provider}'. Only 'ollama' is implemented."
            )
        self._retriever = retriever or CurriculumRetriever(self._settings)

    def answer(
        self,
        question: str,
        grade: str | None = None,
        subject: str | None = None,
        topic: str | None = None,
        mode: str | None = None,
        history: list[tuple[str, str]] | None = None,
    ) -> AIAnswer:
        question = (question or "").strip()
        if not question:
            raise AIServiceError("Question must not be empty.")

        try:
            chunks: list[RetrievedChunk] = self._retriever.retrieve(question)
        except Exception as exc:
            raise AIServiceError(f"Curriculum retrieval failed: {exc}") from exc

        messages = build_prompt(question, chunks, grade, subject, topic, mode=mode, history=history)

        try:
            content = generate(self._settings, messages)
        except OllamaUnavailableError as exc:
            raise AIServiceError(str(exc)) from exc

        sources = [
            {
                "source": chunk.metadata.get("source"),
                "page": chunk.metadata.get("page"),
                "subject": chunk.metadata.get("subject"),
                "grade": chunk.metadata.get("grade"),
                "topic": chunk.metadata.get("topic"),
            }
            for chunk in chunks
        ]
        return AIAnswer(content=content, sources=sources)
