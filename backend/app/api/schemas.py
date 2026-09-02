"""Pydantic request/response models for the API layer."""
from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    app_env: str
    ai_provider: str
    ollama_available: bool
    ollama_error: str | None = None


class ChatRequest(BaseModel):
    conversation_id: str | None = None
    message: str = Field(min_length=1, description="Teacher's question")
    grade: str | None = None
    subject: str | None = None
    topic: str | None = None
    mode: str | None = Field(
        default=None, description="UNDERSTAND | PREPARE | TEACH — omit to let the model infer."
    )


class ChatMessage(BaseModel):
    role: str
    content: str


class SourceRef(BaseModel):
    source: str | None = None
    page: int | None = None
    subject: str | None = None
    grade: str | None = None
    topic: str | None = None


class ChatResponse(BaseModel):
    conversation_id: str
    message: ChatMessage
    sources: list[SourceRef] = []


class ConversationCreate(BaseModel):
    grade: str | None = None
    subject: str | None = None
    topic: str | None = None
    title: str | None = None


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationOut(BaseModel):
    id: str
    title: str | None
    grade: str | None
    subject: str | None
    topic: str | None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationDetail(ConversationOut):
    messages: list[MessageOut] = []
