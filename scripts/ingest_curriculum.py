#!/usr/bin/env python3
"""CLI entry point for (re)building the curriculum vector store.

Usage:
    python scripts/ingest_curriculum.py
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "backend"))

from app.rag.ingest import run_ingestion  # noqa: E402

if __name__ == "__main__":
    result = run_ingestion()
    print(f"Loaded {result['documents_loaded']} document(s) from {result['raw_dir']}")
    print(f"Created {result['chunks_created']} chunk(s)")
    print(f"Vector store rebuilt at {result['vectorstore_dir']}")
