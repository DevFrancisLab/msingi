"""Grade/subject/topic reference lists.

Msingi's MVP scope is Grade 10 only (per SPEC.md). Subject/topic values
are derived from whatever curriculum has actually been ingested into the
vector store, so we never claim curriculum coverage we don't have.
"""
from __future__ import annotations

from app.rag.retriever import CurriculumRetriever

SUPPORTED_GRADES = ["Grade 10"]


def get_available_subjects(retriever: CurriculumRetriever) -> list[str]:
    return retriever.distinct_metadata_values("subject")


def get_available_topics(retriever: CurriculumRetriever) -> list[str]:
    return retriever.distinct_metadata_values("topic")
