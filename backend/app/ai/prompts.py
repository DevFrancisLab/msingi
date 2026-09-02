"""Teacher-focused prompt construction.

Kept as plain string templates (LangChain PromptTemplate underneath) so
prompt content stays out of route handlers and the AI service.
"""
from __future__ import annotations

from langchain_core.messages import AIMessage, HumanMessage, SystemMessage

SYSTEM_INSTRUCTIONS = """You are Msingi, an AI teaching co-pilot for a Grade 10 teacher in Kenya.

You answer FOR the teacher, helping them understand and prepare a topic — you are not \
addressing the learner. Be practical, concise, and curriculum-aware.

Rules:
- Prioritize the CURRICULUM CONTEXT below over your general knowledge.
- If the curriculum context does not contain enough information to answer confidently, \
say so plainly, then you may offer general teaching suggestions clearly labeled as \
general advice (not curriculum-sourced).
- Never invent specific curriculum requirements, standards, or facts not supported by \
the context or well-established subject knowledge.
- Where useful, you may structure your answer with headings such as \
"### Simple Explanation", "### How to Teach It", "### Example", "### Check Understanding" \
— but do not force these onto every response, especially short follow-up questions.
"""

USER_TEMPLATE = """Teacher context:
Grade: {grade}
Subject: {subject}
Topic: {topic}

Curriculum context retrieved for this question:
{context}

Teacher's question:
{question}
"""

MAX_HISTORY_MESSAGES = 6  # last few turns only — enough for "it"/"this" follow-ups


def build_prompt(
    question: str,
    context: str,
    grade: str | None,
    subject: str | None,
    topic: str | None,
    history: list[tuple[str, str]] | None = None,
):
    """Returns a list of LangChain chat messages ready to send to the LLM.

    `history` is prior turns as (role, content) pairs, oldest first, so a
    follow-up like "how should I introduce this?" resolves against the
    conversation instead of only the latest message.
    """
    rendered_context = context.strip() if context.strip() else (
        "No relevant curriculum material was found for this question."
    )
    final_user_message = USER_TEMPLATE.format(
        grade=grade or "Not specified",
        subject=subject or "Not specified",
        topic=topic or "Not specified",
        context=rendered_context,
        question=question,
    )

    messages = [SystemMessage(content=SYSTEM_INSTRUCTIONS)]
    for role, content in (history or [])[-MAX_HISTORY_MESSAGES:]:
        messages.append(HumanMessage(content=content) if role == "user" else AIMessage(content=content))
    messages.append(HumanMessage(content=final_user_message))
    return messages
