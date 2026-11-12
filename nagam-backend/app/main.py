from contextlib import asynccontextmanager
import os
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.exceptions import AppException
from app.core.logging import logger, setup_logging
from app.core.middleware import RequestTimingMiddleware
from app.api.v1.router import api_v1_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    os.makedirs(settings.STORAGE_DIR, exist_ok=True)
    logger.info(f"🚀 Starting {settings.APP_NAME} API in {settings.APP_ENV} mode")
    yield
    logger.info(f"🛑 Shutting down {settings.APP_NAME} API")


app = FastAPI(
    title="NagarConnect CivicTech Platform API",
    description="Configurable, multi-tenant civic services API for municipal corporations and city administrations.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Timing & ID Middleware
app.add_middleware(RequestTimingMiddleware)

# Custom Application Exception Handler
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.error_code,
                "message": exc.detail,
                "extra": exc.extra,
            },
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled error occurred: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected server error occurred. Please try again later.",
            },
        },
    )


# Mount uploads directory for local development object storage
os.makedirs(settings.STORAGE_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.STORAGE_DIR), name="uploads")

# Include API v1 router
app.include_router(api_v1_router, prefix=settings.API_V1_PREFIX)


@app.get("/", tags=["Root"])
async def root():
    return {
        "platform": settings.APP_NAME,
        "status": "operational",
        "docs": "/docs",
        "api_v1": settings.API_V1_PREFIX,
    }
