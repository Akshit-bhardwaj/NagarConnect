from datetime import datetime, timezone
import os
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.dependencies import get_db
from app.core.config import settings

router = APIRouter(prefix="/health", tags=["Health & Observability"])


@router.get("/live")
async def liveness():
    return {
        "status": "ok",
        "service": settings.APP_NAME,
        "environment": settings.APP_ENV,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/ready")
async def readiness(db: AsyncSession = Depends(get_db)):
    db_status = "unknown"
    storage_status = "unknown"
    try:
        await db.execute(text("SELECT 1;"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"

    try:
        os.makedirs(settings.STORAGE_DIR, exist_ok=True)
        storage_status = "accessible"
    except Exception as e:
        storage_status = f"error: {str(e)}"

    is_ready = db_status == "connected" and storage_status == "accessible"
    response_code = status.HTTP_200_OK if is_ready else status.HTTP_503_SERVICE_UNAVAILABLE

    return JSONResponse(
        status_code=response_code,
        content={
            "status": "ready" if is_ready else "not_ready",
            "database": db_status,
            "storage": storage_status,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        },
    )
