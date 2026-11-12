from datetime import datetime
from typing import Optional
import uuid
from pydantic import BaseModel, Field


class CityBase(BaseModel):
    name: str = Field(..., max_length=100)
    state: str = Field(..., max_length=100)
    pin_code: str = Field(..., max_length=10)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: str = ""
    photo_url: str = ""
    is_active: bool = True


class CityCreate(CityBase):
    organization_id: uuid.UUID


class CityOut(CityBase):
    id: uuid.UUID
    organization_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    ward_count: Optional[int] = 0

    class Config:
        from_attributes = True
