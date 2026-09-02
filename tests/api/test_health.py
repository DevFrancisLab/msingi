from fastapi.testclient import TestClient

from app.main import app


def test_health_endpoint_returns_status():
    client = TestClient(app)
    response = client.get("/api/health")

    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "ollama_available" in body
    assert body["ai_provider"] == "ollama"
