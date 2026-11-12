from typing import Any, Generic, Optional, TypeVar
from pydantic import BaseModel

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    success: bool = True
    message: str = "Operation successful"
    data: Optional[T] = None


class ErrorDetail(BaseModel):
    code: str
    message: str
    extra: Optional[dict[str, Any]] = None


class APIErrorResponse(BaseModel):
    success: bool = False
    error: ErrorDetail
