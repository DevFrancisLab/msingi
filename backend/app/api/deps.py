"""Shared FastAPI dependencies."""
from __future__ import annotations

from functools import lru_cache

from app.ai.service import AIService
from app.core.config import Settings, get_settings
from app.rag.retriever import CurriculumRetriever


@lru_cache
def get_retriever() -> CurriculumRetriever:
    return CurriculumRetriever(get_settings())


@lru_cache
def get_ai_service() -> AIService:
    return AIService(get_settings(), get_retriever())
