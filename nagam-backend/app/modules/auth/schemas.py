from typing import Optional
import uuid
from pydantic import BaseModel, EmailStr, Field
from app.modules.users.schemas import UserOut


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)


class RegisterCitizenRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    city_id: Optional[uuid.UUID] = None
    ward_id: Optional[uuid.UUID] = None
    address: str = ""
    preferred_language: str = "en"


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserOut


class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = None
