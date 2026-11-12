from datetime import datetime
from typing import Any, Dict, Optional
import uuid
from pydantic import BaseModel, Field


class OrganizationBase(BaseModel):
    code: str = Field(..., max_length=32, examples=["LMC-UP"])
    name: str = Field(..., max_length=255, examples=["Lucknow Municipal Corporation"])
    state: str = Field(..., max_length=100, examples=["Uttar Pradesh"])
    branding: Dict[str, Any] = Field(default_factory=dict)
    config: Dict[str, Any] = Field(default_factory=dict)
    is_active: bool = True


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    state: Optional[str] = None
    branding: Optional[Dict[str, Any]] = None
    config: Optional[Dict[str, Any]] = None
    is_active: Optional[bool] = None


class OrganizationOut(OrganizationBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrganizationSettingOut(BaseModel):
    id: uuid.UUID
    organization_id: uuid.UUID
    helpline_number: str
    contact_email: str
    office_address: str
    emergency_contacts: Dict[str, Any]
    sla_default_hours: int

    class Config:
        from_attributes = True
