from datetime import datetime
from typing import Optional
import uuid
from pydantic import BaseModel, Field


class NoticeBase(BaseModel):
    title: str = Field(..., max_length=255)
    summary: str = ""
    content: str
    category: str = "GENERAL"
    department_id: Optional[uuid.UUID] = None
    attachment_name: str = ""
    attachment_path: str = ""
    expires_at: Optional[datetime] = None


class NoticeCreate(NoticeBase):
    status: str = "DRAFT"


class NoticeOut(NoticeBase):
    id: uuid.UUID
    organization_id: uuid.UUID
    status: str
    published_at: Optional[datetime] = None
    created_at: datetime
    department_name: Optional[str] = None

    class Config:
        from_attributes = True
