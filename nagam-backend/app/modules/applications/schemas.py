from datetime import datetime
from typing import Any, Dict, List, Optional
import uuid
from pydantic import BaseModel, Field


class ServiceDefinitionOut(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    department_id: uuid.UUID
    code: str
    title: str
    description: str
    form_schema: Dict[str, Any]
    required_documents: List[Any]
    sla_days: int
    fee_amount: float
    is_active: bool
    department_name: Optional[str] = None

    class Config:
        from_attributes = True


class ApplicationDocumentOut(BaseModel):
    id: uuid.UUID
    document_type: str
    file_name: str
    file_path: str
    file_size: int
    mime_type: str
    created_at: datetime

    class Config:
        from_attributes = True


class ApplicationCreate(BaseModel):
    service_id: uuid.UUID
    form_data: Dict[str, Any] = Field(default_factory=dict)


class ServiceApplicationOut(BaseModel):
    id: uuid.UUID
    reference_no: str
    organization_id: uuid.UUID
    service_id: uuid.UUID
    citizen_id: uuid.UUID
    service_title: Optional[str] = None
    form_data: Dict[str, Any]
    status: str
    reviewer_user_id: Optional[uuid.UUID] = None
    remarks: str
    created_at: datetime
    updated_at: datetime
    documents: List[ApplicationDocumentOut] = []

    class Config:
        from_attributes = True


class ApplicationDecisionReq(BaseModel):
    status: str
    remarks: str = ""
