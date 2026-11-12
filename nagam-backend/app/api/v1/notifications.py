import asyncio
import json
import uuid
from typing import List, Optional
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Request, status
from fastapi.responses import StreamingResponse
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.core.sse import broadcaster
from app.db.dependencies import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.notifications.models import Notification
from app.modules.notifications.schemas import NotificationOut
from app.modules.users.models import User

router = APIRouter(prefix="/notifications", tags=["Notifications & Real-Time SSE"])


@router.get("/stream")
async def sse_notifications_stream(
    request: Request,
    current_user: User = Depends(get_current_user),
):
    """
    Server-Sent Events (SSE) real-time notifications stream.
    Clients connect via `new EventSource('/api/v1/notifications/stream?token=...')`.
    Events are pushed instantly when municipal staff updates grievances or applications.
    """
    user_id_str = str(current_user.id)
    queue = await broadcaster.subscribe(user_id_str)

    async def event_generator():
        try:
            # 1. Initial connection acknowledgement event
            connected_data = json.dumps({
                "status": "connected",
                "user_id": user_id_str,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            })
            yield f"event: connected\ndata: {connected_data}\n\n"

            # 2. Keep-alive heartbeat & message consumer loop
            while True:
                # If client disconnected, exit cleanly
                if await request.is_disconnected():
                    break

                try:
                    # Wait up to 15 seconds for an event
                    payload = await asyncio.wait_for(queue.get(), timeout=15.0)
                    event_type = payload.get("event", "notification")
                    event_data = json.dumps(payload.get("data", {}))
                    yield f"event: {event_type}\ndata: {event_data}\n\n"
                except asyncio.TimeoutError:
                    # Send periodic keepalive heartbeat ping
                    ping_data = json.dumps({"ping": datetime.now(timezone.utc).isoformat()})
                    yield f"event: ping\ndata: {ping_data}\n\n"
        except asyncio.CancelledError:
            pass
        finally:
            broadcaster.unsubscribe(user_id_str, queue)

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("", response_model=List[NotificationOut])
async def list_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Retrieve user notifications list ordered by most recent first.
    """
    stmt = (
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
    )
    res = await db.execute(stmt)
    notifications = res.scalars().all()
    return notifications


@router.patch("/{notification_id}/read", status_code=status.HTTP_200_OK)
async def mark_notification_read(
    notification_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Mark a specific notification as read.
    """
    stmt = select(Notification).where(
        Notification.id == notification_id,
        Notification.user_id == current_user.id,
    )
    res = await db.execute(stmt)
    notif = res.scalar_one_or_none()
    if not notif:
        raise NotFoundError("Notification", notification_id)

    notif.is_read = True
    await db.commit()
    return {"success": True, "message": "Notification marked as read"}


@router.post("/read-all", status_code=status.HTTP_200_OK)
async def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Mark all unread notifications for current user as read.
    """
    stmt = (
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.is_read == False)
        .values(is_read=True)
    )
    await db.execute(stmt)
    await db.commit()
    return {"success": True, "message": "All notifications marked as read"}
