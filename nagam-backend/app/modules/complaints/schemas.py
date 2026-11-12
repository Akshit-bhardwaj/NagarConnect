from datetime import datetime
from typing import List, Optional
import uuid
from pydantic import BaseModel, Field


class ComplaintAttachmentOut(BaseModel):
    id: uuid.UUID
    file_name: str
    file_path: str
    file_size: int
    mime_type: str
    is_resolution_proof: bool
    created_at: datetime

    class Config:
        from_attributes = True


class StatusHistoryOut(BaseModel):
    id: uuid.UUID
    from_status: str
    to_status: str
    reason_or_remark: str
    is_citizen_visible: bool
    created_at: datetime
    changed_by_name: Optional[str] = None

    class Config:
        from_attributes = True


class CommentOut(BaseModel):
    id: uuid.UUID
    comment: str
    is_internal_note: bool
    created_at: datetime
    author_name: Optional[str] = None

    class Config:
        from_attributes = True


class ComplaintCreate(BaseModel):
    city_id: uuid.UUID
    ward_id: uuid.UUID
    locality_id: Optional[uuid.UUID] = None
    department_id: Optional[uuid.UUID] = None
    category: str = Field(..., max_length=100)
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10)
    address_text: str = ""
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    priority: str = "MEDIUM"


class ComplaintOut(BaseModel):
    id: uuid.UUID
    reference_no: str
    organization_id: uuid.UUID
    citizen_id: uuid.UUID
    city_id: uuid.UUID
    ward_id: uuid.UUID
    locality_id: Optional[uuid.UUID] = None
    department_id: Optional[uuid.UUID] = None
    category: str
    title: str
    description: str
    address_text: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    status: str
    priority: str
    assigned_to_user_id: Optional[uuid.UUID] = None
    assigned_officer_name: Optional[str] = None
    department_name: Optional[str] = None
    ward_name: Optional[str] = None
    city_name: Optional[str] = None
    sla_due_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    citizen_rating: Optional[int] = None
    citizen_feedback: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    status_history: List[StatusHistoryOut] = []
    comments: List[CommentOut] = []
    attachments: List[ComplaintAttachmentOut] = []

    class Config:
        from_attributes = True


class StatusUpdateReq(BaseModel):
    status: str
    reason_or_remark: str = ""


class AssignmentReq(BaseModel):
    assigned_to_user_id: uuid.UUID
    department_id: Optional[uuid.UUID] = None
    notes: str = ""


class CommentCreateReq(BaseModel):
    comment: str = Field(..., min_length=1)
    is_internal_note: bool = False


class FeedbackReq(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    feedback: Optional[str] = None
