from unittest.mock import MagicMock, patch

import pytest

from app.ai.ollama import OllamaUnavailableError
from app.ai.service import AIService, AIServiceError
from app.core.config import Settings


def _service_with_mock_retriever(settings, retrieved_chunks=None):
    retriever = MagicMock()
    retriever.retrieve.return_value = retrieved_chunks or []
    return AIService(settings=settings, retriever=retriever), retriever


def test_answer_rejects_empty_question(tmp_settings):
    service, _ = _service_with_mock_retriever(tmp_settings)
    with pytest.raises(AIServiceError):
        service.answer("   ")


def test_answer_raises_when_ollama_unavailable(tmp_settings):
    service, _ = _service_with_mock_retriever(tmp_settings)
    with patch("app.ai.service.generate", side_effect=OllamaUnavailableError("no ollama")):
        with pytest.raises(AIServiceError):
            service.answer("Explain photosynthesis", grade="Grade 10", subject="Biology", topic="Photosynthesis")


def test_answer_returns_sources_from_retrieved_chunks(tmp_settings):
    from app.rag.retriever import RetrievedChunk

    chunk = RetrievedChunk(content="Photosynthesis facts.", metadata={"source": "notes.txt", "subject": "Biology"})
    service, retriever = _service_with_mock_retriever(tmp_settings, [chunk])

    with patch("app.ai.service.generate", return_value="Here is the explanation."):
        answer = service.answer("Explain photosynthesis", grade="Grade 10", subject="Biology", topic="Photosynthesis")

    assert answer.content == "Here is the explanation."
    assert answer.sources[0]["source"] == "notes.txt"
    retriever.retrieve.assert_called_once()


def test_answer_handles_no_retrieved_context(tmp_settings):
    service, _ = _service_with_mock_retriever(tmp_settings, [])

    with patch("app.ai.service.generate", return_value="General teaching advice.") as mocked:
        answer = service.answer("Explain something obscure", grade="Grade 10")

    assert answer.sources == []
    # context passed to build_prompt should be empty, prompts.py fills in the fallback message
    called_messages = mocked.call_args[0][1]
    rendered = "\n".join(m.content for m in called_messages)
    assert "No relevant curriculum material was found" in rendered


def test_unsupported_provider_raises_on_construction(tmp_settings):
    bad_settings = Settings(
        ai_provider="claude",
        curriculum_raw_dir=tmp_settings.curriculum_raw_dir,
        curriculum_vectorstore_dir=tmp_settings.curriculum_vectorstore_dir,
    )
    with pytest.raises(AIServiceError):
        AIService(settings=bad_settings, retriever=MagicMock())
