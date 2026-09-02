"""Application configuration loaded from environment variables / .env."""
from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"

    ai_provider: str = "ollama"

    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "qwen3:4b"
    ollama_request_timeout: float = 120.0

    anthropic_api_key: str | None = None
    anthropic_model: str = "claude-sonnet-5"

    database_url: str = "sqlite:///./msingi.db"

    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"

    curriculum_raw_dir: str = "curriculum/raw"
    curriculum_vectorstore_dir: str = "curriculum/vectorstore"
    chroma_collection_name: str = "msingi_curriculum"

    chunk_size: int = 1000
    chunk_overlap: int = 150
    retriever_top_k: int = 4


@lru_cache
def get_settings() -> Settings:
    return Settings()
