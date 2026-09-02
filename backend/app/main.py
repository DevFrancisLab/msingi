"""FastAPI application entry point."""
from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes import router
from app.core.config import get_settings
from app.database.session import init_db

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Msingi API", version="0.1.0")

# Lets the Vite dev server (a different origin/port) call this API directly.
# See core/config.py:cors_origins / .env's CORS_ORIGINS.
_settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in _settings.cors_origins.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc):
    logging.getLogger("msingi.api").exception("Unhandled error")
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


app.include_router(router)
