"""Tests that require a live Ollama instance with qwen3:4b pulled.

Skipped automatically (see tests/conftest.py) when Ollama is unavailable.
"""
import pytest

from app.ai.ollama import check_ollama_available, generate
from app.ai.prompts import build_prompt
from app.core.config import get_settings


@pytest.mark.requires_ollama
def test_check_ollama_available_reports_ok():
    ok, error = check_ollama_available(get_settings())
    assert ok is True
    assert error is None


@pytest.mark.requires_ollama
def test_generate_returns_text_response():
    messages = build_prompt(
        question="Say hello in one short sentence.",
        context="",
        grade="Grade 10",
        subject="Biology",
        topic="Photosynthesis",
    )
    result = generate(get_settings(), messages)
    assert isinstance(result, str)
    assert len(result) > 0
