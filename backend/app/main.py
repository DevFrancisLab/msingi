"""FastAPI application entry point."""
from __future__ import annotations

import logging

from fastapi import FastAPI
from fastapi.responses import JSONResponse

from app.api.routes import router
from app.database.session import init_db

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="Msingi API", version="0.1.0")


@app.on_event("startup")
def on_startup() -> None:
    init_db()


@app.exception_handler(Exception)
async def unhandled_exception_handler(request, exc):
    logging.getLogger("msingi.api").exception("Unhandled error")
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


app.include_router(router)
