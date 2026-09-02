"""Loads curriculum source documents from curriculum/raw/.

Supports PDF and plain text/markdown files. Metadata is only set from
information we can reliably determine: the file path/name and, for PDFs,
the page number. Subject/grade/topic are NOT guessed from content; they
should be supplied via a sidecar naming convention or left absent.
"""
from __future__ import annotations

from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_core.documents import Document

SUPPORTED_SUFFIXES = {".pdf", ".txt", ".md"}


def _metadata_from_path(path: Path, raw_dir: Path) -> dict:
    """Derive subject/grade/topic from directory structure, if present.

    Convention: curriculum/raw/<subject>/<grade>/<topic>/document.pdf
    Any level that is missing is simply omitted rather than guessed.
    """
    try:
        rel_parts = path.relative_to(raw_dir).parts[:-1]  # exclude filename
    except ValueError:
        rel_parts = ()

    labels = ["subject", "grade", "topic"]
    metadata = {}
    for label, part in zip(labels, rel_parts):
        metadata[label] = part
    return metadata


def _load_single_file(path: Path, raw_dir: Path) -> list[Document]:
    if path.suffix.lower() == ".pdf":
        loader = PyPDFLoader(str(path))
    elif path.suffix.lower() in {".txt", ".md"}:
        loader = TextLoader(str(path), encoding="utf-8")
    else:
        raise ValueError(f"Unsupported curriculum file type: {path.suffix}")

    docs = loader.load()
    path_metadata = _metadata_from_path(path, raw_dir)
    for doc in docs:
        doc.metadata["source"] = path.name
        doc.metadata.setdefault("page", None)
        doc.metadata.update(path_metadata)
    return docs


def load_curriculum_documents(raw_dir: str | Path) -> list[Document]:
    """Load every supported document under raw_dir. Skips unsupported files."""
    raw_dir = Path(raw_dir)
    if not raw_dir.exists():
        return []

    all_docs: list[Document] = []
    for path in sorted(raw_dir.rglob("*")):
        if not path.is_file():
            continue
        if path.suffix.lower() not in SUPPORTED_SUFFIXES:
            continue
        all_docs.extend(_load_single_file(path, raw_dir))
    return all_docs
