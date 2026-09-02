"""Reusable Ollama integration.

Single place where the app talks to Ollama, so no other module needs
to import langchain_ollama or hard-code a model name/base URL directly.
"""
from __future__ import annotations

from functools import lru_cache

import httpx
from langchain_ollama import ChatOllama

from app.core.config import Settings


class OllamaUnavailableError(RuntimeError):
    """Raised when Ollama cannot be reached or the configured model is missing."""


def check_ollama_available(settings: Settings) -> tuple[bool, str | None]:
    """Returns (ok, error_message). Does not raise."""
    try:
        resp = httpx.get(f"{settings.ollama_base_url}/api/tags", timeout=5.0)
        resp.raise_for_status()
    except httpx.HTTPError as exc:
        return False, f"Could not reach Ollama at {settings.ollama_base_url}: {exc}"

    models = [m.get("name") for m in resp.json().get("models", [])]
    if settings.ollama_model not in models:
        return False, (
            f"Model '{settings.ollama_model}' is not pulled in Ollama. "
            f"Run: ollama pull {settings.ollama_model}"
        )
    return True, None


@lru_cache
def get_chat_model(base_url: str, model: str, timeout: float) -> ChatOllama:
    return ChatOllama(base_url=base_url, model=model, timeout=timeout)


def generate(settings: Settings, messages) -> str:
    """Send chat messages to the configured Ollama model, return the text.

    `messages` is a list of LangChain chat messages (see app.ai.prompts).
    """
    ok, error = check_ollama_available(settings)
    if not ok:
        raise OllamaUnavailableError(error)

    llm = get_chat_model(settings.ollama_base_url, settings.ollama_model, settings.ollama_request_timeout)
    try:
        response = llm.invoke(messages)
    except Exception as exc:  # network/timeout/model errors from the Ollama client
        raise OllamaUnavailableError(f"Ollama request failed: {exc}") from exc

    return response.content
