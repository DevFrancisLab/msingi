from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.ai.service import AIAnswer, AIServiceError
from app.api.deps import get_ai_service
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_chat_rejects_empty_message(client):
    response = client.post("/api/chat", json={"message": "   "})
    assert response.status_code == 422


def test_chat_rejects_missing_message_field(client):
    response = client.post("/api/chat", json={"grade": "Grade 10"})
    assert response.status_code == 422


def test_chat_success_flow_returns_answer_and_sources(client):
    mock_service = MagicMock()
    mock_service.answer.return_value = AIAnswer(
        content="Photosynthesis converts light into chemical energy.",
        sources=[{"source": "notes.txt", "page": None, "subject": "Biology", "grade": "Grade 10", "topic": "Photosynthesis"}],
    )
    app.dependency_overrides[get_ai_service] = lambda: mock_service

    try:
        response = client.post(
            "/api/chat",
            json={
                "message": "Explain photosynthesis to me so I can teach it tomorrow.",
                "grade": "Grade 10",
                "subject": "Biology",
                "topic": "Photosynthesis",
            },
        )
    finally:
        app.dependency_overrides.pop(get_ai_service, None)

    assert response.status_code == 200
    body = response.json()
    assert body["message"]["role"] == "assistant"
    assert "Photosynthesis" in body["message"]["content"]
    assert body["sources"][0]["subject"] == "Biology"
    assert body["conversation_id"]


def test_chat_returns_503_when_ai_service_unavailable(client):
    mock_service = MagicMock()
    mock_service.answer.side_effect = AIServiceError("Could not reach Ollama")
    app.dependency_overrides[get_ai_service] = lambda: mock_service

    try:
        response = client.post("/api/chat", json={"message": "Explain photosynthesis."})
    finally:
        app.dependency_overrides.pop(get_ai_service, None)

    assert response.status_code == 503
    assert "Ollama" in response.json()["detail"]
