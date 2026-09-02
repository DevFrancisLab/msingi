"""Chroma vector store construction and access.

Wraps langchain_chroma so the rest of the application never touches
Chroma directly.
"""
from __future__ import annotations

from pathlib import Path

from langchain_chroma import Chroma
from langchain_core.documents import Document

from app.rag.embeddings import get_embedding_function


def get_vectorstore(
    persist_dir: str | Path,
    collection_name: str,
    embedding_model_name: str,
) -> Chroma:
    Path(persist_dir).mkdir(parents=True, exist_ok=True)
    embedding_fn = get_embedding_function(embedding_model_name)
    return Chroma(
        collection_name=collection_name,
        embedding_function=embedding_fn,
        persist_directory=str(persist_dir),
    )


def rebuild_vectorstore(
    documents: list[Document],
    persist_dir: str | Path,
    collection_name: str,
    embedding_model_name: str,
) -> Chroma:
    """Delete any existing collection and rebuild it from scratch.

    Used by the ingestion script so re-running ingestion is idempotent
    rather than appending duplicate chunks every time.
    """
    store = get_vectorstore(persist_dir, collection_name, embedding_model_name)
    existing_ids = store.get()["ids"]
    if existing_ids:
        store.delete(ids=existing_ids)

    if documents:
        store.add_documents(documents)
    return store
