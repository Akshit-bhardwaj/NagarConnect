from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class AppException(HTTPException):
    def __init__(
        self,
        status_code: int,
        detail: str,
        error_code: Optional[str] = None,
        extra: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code or "APP_ERROR"
        self.extra = extra or {}


class NotFoundError(AppException):
    def __init__(self, resource: str, identifier: Any):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource} with ID '{identifier}' not found",
            error_code="NOT_FOUND",
        )


class UnauthorizedError(AppException):
    def __init__(self, detail: str = "Invalid or expired credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            error_code="UNAUTHORIZED",
        )


class ForbiddenError(AppException):
    def __init__(self, detail: str = "Insufficient permissions to perform this operation"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
            error_code="FORBIDDEN",
        )


class ConflictError(AppException):
    def __init__(self, detail: str = "Resource conflict detected"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=detail,
            error_code="CONFLICT",
        )


class ValidationError(AppException):
    def __init__(self, detail: str = "Validation failed", extra: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail,
            error_code="VALIDATION_ERROR",
            extra=extra,
        )
