"""API routes. No retrieval or prompt logic lives here — it all goes
through AIService / CurriculumRetriever."""
from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.ai.ollama import check_ollama_available
from app.ai.service import AIService, AIServiceError
from app.api.deps import get_ai_service, get_retriever
from app.api.reference import SUPPORTED_GRADES, get_available_subjects, get_available_topics
from app.api.schemas import (
    ChatMessage,
    ChatRequest,
    ChatResponse,
    ConversationCreate,
    ConversationDetail,
    ConversationOut,
    HealthResponse,
    SourceRef,
)
from app.core.config import get_settings
from app.database.models import Conversation, Message
from app.database.session import get_db

logger = logging.getLogger("msingi.api")
router = APIRouter(prefix="/api")


@router.get("/health", response_model=HealthResponse)
def health():
    settings = get_settings()
    ok, error = check_ollama_available(settings)
    return HealthResponse(
        status="ok",
        app_env=settings.app_env,
        ai_provider=settings.ai_provider,
        ollama_available=ok,
        ollama_error=error,
    )


@router.get("/grades", response_model=list[str])
def grades():
    return SUPPORTED_GRADES


@router.get("/subjects", response_model=list[str])
def subjects(retriever=Depends(get_retriever)):
    return get_available_subjects(retriever)


@router.get("/topics", response_model=list[str])
def topics(subject: str | None = None, retriever=Depends(get_retriever)):
    return get_available_topics(retriever, subject=subject)


@router.post("/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    db: Session = Depends(get_db),
    ai_service: AIService = Depends(get_ai_service),
):
    message = request.message.strip()
    if not message:
        raise HTTPException(status_code=422, detail="message must not be empty")

    conversation = None
    if request.conversation_id:
        conversation = db.get(Conversation, request.conversation_id)
        if conversation is None:
            raise HTTPException(status_code=404, detail="conversation not found")
    else:
        conversation = Conversation(grade=request.grade, subject=request.subject, topic=request.topic)
        db.add(conversation)
        db.commit()
        db.refresh(conversation)

    grade = request.grade or conversation.grade
    subject = request.subject or conversation.subject
    topic = request.topic or conversation.topic

    history = [(m.role, m.content) for m in conversation.messages]

    db.add(Message(conversation_id=conversation.id, role="user", content=message))
    db.commit()

    try:
        answer = ai_service.answer(
            message, grade=grade, subject=subject, topic=topic, mode=request.mode, history=history
        )
    except AIServiceError as exc:
        logger.warning("AI service error: %s", exc)
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    db.add(Message(conversation_id=conversation.id, role="assistant", content=answer.content))
    db.commit()

    return ChatResponse(
        conversation_id=conversation.id,
        message=ChatMessage(role="assistant", content=answer.content),
        sources=[SourceRef(**s) for s in answer.sources],
    )


@router.post("/conversations", response_model=ConversationOut)
def create_conversation(payload: ConversationCreate, db: Session = Depends(get_db)):
    conversation = Conversation(
        grade=payload.grade, subject=payload.subject, topic=payload.topic, title=payload.title
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation


@router.get("/conversations", response_model=list[ConversationOut])
def list_conversations(db: Session = Depends(get_db)):
    return db.query(Conversation).order_by(Conversation.updated_at.desc()).all()


@router.get("/conversations/{conversation_id}", response_model=ConversationDetail)
def get_conversation(conversation_id: str, db: Session = Depends(get_db)):
    conversation = db.get(Conversation, conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="conversation not found")
    return conversation


@router.delete("/conversations/{conversation_id}", status_code=204)
def delete_conversation(conversation_id: str, db: Session = Depends(get_db)):
    conversation = db.get(Conversation, conversation_id)
    if conversation is None:
        raise HTTPException(status_code=404, detail="conversation not found")
    db.delete(conversation)
    db.commit()
