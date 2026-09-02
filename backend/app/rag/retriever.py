"""Curriculum retriever with a clean interface, independent of Chroma.

The rest of the application should only interact with `CurriculumRetriever`
and `RetrievedChunk`, never with the underlying vector store directly.
"""
from __future__ import annotations

from dataclasses import dataclass

from app.core.config import Settings
from app.rag.vectorstore import get_vectorstore


@dataclass
class RetrievedChunk:
    content: str
    metadata: dict


class CurriculumRetriever:
    def __init__(self, settings: Settings):
        self._settings = settings
        self._store = get_vectorstore(
            persist_dir=settings.curriculum_vectorstore_dir,
            collection_name=settings.chroma_collection_name,
            embedding_model_name=settings.embedding_model,
        )

    def retrieve(self, query: str, top_k: int | None = None) -> list[RetrievedChunk]:
        query = (query or "").strip()
        if not query:
            return []

        if self.is_empty():
            return []

        k = top_k or self._settings.retriever_top_k
        results = self._store.similarity_search(query, k=k)
        return [RetrievedChunk(content=doc.page_content, metadata=doc.metadata) for doc in results]

    def is_empty(self) -> bool:
        return self._store.get()["ids"] == []

    def distinct_metadata_values(self, field: str) -> list[str]:
        """Distinct non-empty values for a metadata field across all stored chunks."""
        metadatas = self._store.get()["metadatas"] or []
        return sorted({m[field] for m in metadatas if m.get(field)})
