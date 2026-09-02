"""Assembles LangChain chat messages from the templates in prompts.py.

Keeps prompt CONTENT (prompts.py) separate from prompt CONSTRUCTION (this
file) and from model invocation (ollama.py / service.py) — each stays
independently testable.

Message order sent to the model:
    System (persona + teaching context + mode + curriculum context)
    -> conversation history (actual prior turns)
    -> current teacher question
"""
from __future__ import annotations

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage

from app.ai.prompts import (
    CURRICULUM_CHUNK_TEMPLATE,
    CURRICULUM_CONTEXT_INSTRUCTION,
    MAX_HISTORY_MESSAGES,
    MODE_INSTRUCTIONS,
    NO_CURRICULUM_CONTEXT_MESSAGE,
    SYSTEM_INSTRUCTIONS,
    TEACHER_QUESTION_TEMPLATE,
    TEACHING_CONTEXT_TEMPLATE,
)

# (metadata key, display label) — only fields the retriever actually
# returned are rendered; nothing here is ever fabricated.
_METADATA_LABELS = (
    ("source", "Source"),
    ("subject", "Subject"),
    ("grade", "Grade"),
    ("topic", "Topic"),
    ("page", "Page"),
)


def _chunk_content(chunk) -> str:
    return chunk.content if hasattr(chunk, "content") else chunk["content"]


def _chunk_metadata(chunk) -> dict:
    if hasattr(chunk, "metadata"):
        return chunk.metadata or {}
    return chunk.get("metadata") or {}


def _format_chunk_metadata(metadata: dict) -> str:
    parts = [
        f"{label}: {metadata[key]}"
        for key, label in _METADATA_LABELS
        if metadata.get(key) not in (None, "")
    ]
    return ", ".join(parts) if parts else "source unknown"


def format_curriculum_context(chunks) -> str:
    """Builds the delimited <curriculum_context> block from retrieved chunks.

    `chunks` is the list of RetrievedChunk from app.rag.retriever (or any
    object/dict exposing `content`/`metadata`). Retrieved content is never
    treated as instructions — see CURRICULUM_CONTEXT_INSTRUCTION and the
    CONTENT SECURITY section of SYSTEM_INSTRUCTIONS.
    """
    if not chunks:
        body = NO_CURRICULUM_CONTEXT_MESSAGE
    else:
        pieces = [
            CURRICULUM_CHUNK_TEMPLATE.format(
                meta=_format_chunk_metadata(_chunk_metadata(chunk)),
                content=_chunk_content(chunk).strip(),
            )
            for chunk in chunks
        ]
        body = "\n\n---\n\n".join(pieces)

    return f"<curriculum_context>\n{body}\n</curriculum_context>\n{CURRICULUM_CONTEXT_INSTRUCTION}"


def build_system_message(
    grade: str | None,
    subject: str | None,
    topic: str | None,
    mode: str | None,
    curriculum_context: str,
) -> str:
    """Combines persona, teaching context, mode instruction, and curriculum
    context into one system message. Kept as one message (rather than the
    conceptual System -> Context -> Mode -> Curriculum stages as separate
    messages) because everything here is standing context for the whole
    turn, not part of the back-and-forth conversation — that's what
    `history` in build_prompt is for.
    """
    sections = [
        SYSTEM_INSTRUCTIONS.strip(),
        TEACHING_CONTEXT_TEMPLATE.format(
            grade=grade or "Not specified",
            subject=subject or "Not specified",
            topic=topic or "Not specified",
        ),
    ]

    mode_key = (mode or "").strip().upper()
    if mode_key in MODE_INSTRUCTIONS:
        sections.append(MODE_INSTRUCTIONS[mode_key])

    sections.append(curriculum_context)
    return "\n\n".join(sections)


def build_prompt(
    question: str,
    chunks=None,
    grade: str | None = None,
    subject: str | None = None,
    topic: str | None = None,
    mode: str | None = None,
    history: list[tuple[str, str]] | None = None,
) -> list[BaseMessage]:
    """Returns LangChain chat messages ready to send to the model.

    `chunks` is the list of RetrievedChunk returned by CurriculumRetriever
    (or None/[] when nothing was retrieved).

    `history` is prior turns as (role, content) pairs, oldest first, so a
    follow-up like "how should I introduce this?" resolves against the
    conversation instead of only the latest message.

    `mode` is one of "UNDERSTAND" / "PREPARE" / "TEACH", or None to let the
    model infer the appropriate response.
    """
    curriculum_context = format_curriculum_context(chunks or [])
    system_content = build_system_message(grade, subject, topic, mode, curriculum_context)

    messages: list[BaseMessage] = [SystemMessage(content=system_content)]
    for role, content in (history or [])[-MAX_HISTORY_MESSAGES:]:
        messages.append(HumanMessage(content=content) if role == "user" else AIMessage(content=content))
    messages.append(HumanMessage(content=TEACHER_QUESTION_TEMPLATE.format(question=question)))
    return messages
