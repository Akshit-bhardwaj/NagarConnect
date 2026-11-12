import asyncio
import json
from typing import Dict, Set, Any
from app.core.logging import logger


class NotificationBroadcaster:
    """
    In-memory asynchronous Server-Sent Events (SSE) broadcaster.
    Allows real-time streaming of events to connected citizen & admin clients.
    """

    def __init__(self):
        # Map of user_id (str) -> Set of active asyncio.Queue instances
        self._user_listeners: Dict[str, Set[asyncio.Queue]] = {}
        # Listeners for organization or global broadcast
        self._global_listeners: Set[asyncio.Queue] = set()

    async def subscribe(self, user_id: str) -> asyncio.Queue:
        queue: asyncio.Queue = asyncio.Queue()
        if user_id not in self._user_listeners:
            self._user_listeners[user_id] = set()
        self._user_listeners[user_id].add(queue)
        self._global_listeners.add(queue)
        logger.debug(f"[SSE] User {user_id} subscribed to real-time events.")
        return queue

    def unsubscribe(self, user_id: str, queue: asyncio.Queue):
        if user_id in self._user_listeners:
            self._user_listeners[user_id].discard(queue)
            if not self._user_listeners[user_id]:
                del self._user_listeners[user_id]
        self._global_listeners.discard(queue)
        logger.debug(f"[SSE] User {user_id} unsubscribed from real-time events.")

    async def broadcast_to_user(self, user_id: str, event_type: str, data: Dict[str, Any]):
        """
        Send an SSE event specifically to a target user (e.g. Citizen when their complaint changes).
        """
        payload = {
            "event": event_type,
            "data": data,
        }
        user_str = str(user_id)
        if user_str in self._user_listeners:
            queues = list(self._user_listeners[user_str])
            logger.info(f"[SSE] Broadcasting '{event_type}' to user {user_str} ({len(queues)} active connections)")
            for q in queues:
                await q.put(payload)

    async def broadcast_all(self, event_type: str, data: Dict[str, Any]):
        """
        Broadcast to all connected clients (e.g. system broadcast or public advisory).
        """
        payload = {
            "event": event_type,
            "data": data,
        }
        for q in list(self._global_listeners):
            await q.put(payload)


broadcaster = NotificationBroadcaster()
