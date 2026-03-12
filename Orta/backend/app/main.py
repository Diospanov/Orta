from contextlib import asynccontextmanager
import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError
from auth.Orta.backend.app.database import init_db



@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    print("Database initialized")
    yield
    print("App shutting down")


app = FastAPI(lifespan=lifespan)

logger = logging.getLogger("uvicorn.error")

@app.exception_handler(IntegrityError)
async def integrity_error_handler(request: Request, exc: IntegrityError):
    return JSONResponse(
        status_code=400,
        content={"detail": "Database integrity error", "error": str(exc.orig)},
    )

@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error: %s", exc)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
    )

