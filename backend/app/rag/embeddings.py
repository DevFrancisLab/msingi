"""Local embedding model wrapper.

Uses a small local sentence-transformers model so no cloud embedding API
is required. This keeps the pipeline fully offline-capable, matching the
Ollama-only inference requirement.
"""
from __future__ import annotations

from functools import lru_cache

from langchain_huggingface import HuggingFaceEmbeddings


@lru_cache
def get_embedding_function(model_name: str) -> HuggingFaceEmbeddings:
    return HuggingFaceEmbeddings(model_name=model_name)
