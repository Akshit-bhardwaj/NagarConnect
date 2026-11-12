from datetime import datetime
import uuid
from pydantic import BaseModel


class NotificationOut(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    message: str
    link: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
