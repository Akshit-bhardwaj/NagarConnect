from datetime import datetime
import uuid
from pydantic import BaseModel


class DepartmentBase(BaseModel):
    code: str
    name: str
    description: str = ""
    head_officer_name: str = ""
    email: str = ""
    helpline_phone: str = ""
    is_active: bool = True


class DepartmentCreate(DepartmentBase):
    organization_id: uuid.UUID


class DepartmentOut(DepartmentBase):
    id: uuid.UUID
    organization_id: uuid.UUID
    created_at: datetime

    class Config:
        from_attributes = True
