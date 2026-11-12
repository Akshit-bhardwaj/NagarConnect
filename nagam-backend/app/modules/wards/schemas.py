from typing import List
import uuid
from pydantic import BaseModel


class LocalityOut(BaseModel):
    id: uuid.UUID
    ward_id: uuid.UUID
    name: str
    postal_code: str

    class Config:
        from_attributes = True


class WardBase(BaseModel):
    ward_number: str
    ward_name: str
    zone_name: str
    office_address: str = ""
    contact_phone: str = ""


class WardCreate(WardBase):
    city_id: uuid.UUID


class WardOut(WardBase):
    id: uuid.UUID
    city_id: uuid.UUID
    localities: List[LocalityOut] = []

    class Config:
        from_attributes = True
