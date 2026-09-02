"""Curriculum ingestion pipeline: raw docs -> chunks -> embeddings -> Chroma.

Run via scripts/ingest_curriculum.py. Safe to re-run: rebuilds the
collection from scratch each time so the vector store never accumulates
stale/duplicate chunks after curriculum files change.
"""
from __future__ import annotations

from app.core.config import Settings, get_settings
from app.rag.chunker import chunk_documents
from app.rag.loader import load_curriculum_documents
from app.rag.vectorstore import rebuild_vectorstore


def run_ingestion(settings: Settings | None = None) -> dict:
    settings = settings or get_settings()

    documents = load_curriculum_documents(settings.curriculum_raw_dir)
    chunks = chunk_documents(
        documents,
        chunk_size=settings.chunk_size,
        chunk_overlap=settings.chunk_overlap,
    )
    rebuild_vectorstore(
        chunks,
        persist_dir=settings.curriculum_vectorstore_dir,
        collection_name=settings.chroma_collection_name,
        embedding_model_name=settings.embedding_model,
    )

    return {
        "documents_loaded": len(documents),
        "chunks_created": len(chunks),
        "raw_dir": settings.curriculum_raw_dir,
        "vectorstore_dir": settings.curriculum_vectorstore_dir,
    }


if __name__ == "__main__":
    result = run_ingestion()
    print(f"Loaded {result['documents_loaded']} document(s) from {result['raw_dir']}")
    print(f"Created {result['chunks_created']} chunk(s)")
    print(f"Vector store rebuilt at {result['vectorstore_dir']}")
