from datetime import datetime
from typing import List, Optional
import uuid
from pydantic import BaseModel, EmailStr


class CitizenProfileOut(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    address: str
    city_id: Optional[uuid.UUID] = None
    ward_id: Optional[uuid.UUID] = None
    locality_id: Optional[uuid.UUID] = None
    preferred_language: str

    class Config:
        from_attributes = True


class StaffProfileOut(BaseModel):
    id: uuid.UUID
    employee_id: str
    designation: str
    department_id: Optional[uuid.UUID] = None
    ward_id: Optional[uuid.UUID] = None

    class Config:
        from_attributes = True


class UserOut(BaseModel):
    id: uuid.UUID
    organization_id: Optional[uuid.UUID] = None
    email: EmailStr
    phone: Optional[str] = None
    user_type: str
    is_active: bool
    is_verified: bool
    roles: List[str] = []
    citizen_profile: Optional[CitizenProfileOut] = None
    staff_profile: Optional[StaffProfileOut] = None
    created_at: datetime

    class Config:
        from_attributes = True


class CitizenProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    address: Optional[str] = None
    city_id: Optional[uuid.UUID] = None
    ward_id: Optional[uuid.UUID] = None
    locality_id: Optional[uuid.UUID] = None
    preferred_language: Optional[str] = None
