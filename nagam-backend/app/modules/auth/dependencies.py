from typing import Optional
import uuid
from fastapi import Depends, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_token
from app.db.dependencies import get_db
from app.modules.users.models import User, UserRole
from app.common.permissions import UserType

security_bearer = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer),
    db: AsyncSession = Depends(get_db),
) -> User:
    token = None
    if credentials:
        token = credentials.credentials
    else:
        # Check cookie or query param fallback for browser clients / EventSource SSE
        token = request.cookies.get("access_token") or request.query_params.get("token")

    if not token:
        raise UnauthorizedError("Authentication token is required")

    payload = decode_token(token)
    if payload.get("type") != "access":
        raise UnauthorizedError("Invalid token type")

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise UnauthorizedError("Invalid token payload")

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise UnauthorizedError("Malformed user ID in token")

    stmt = (
        select(User)
        .options(
            selectinload(User.roles).selectinload(UserRole.role),
            selectinload(User.citizen_profile),
            selectinload(User.staff_profile),
            selectinload(User.organization),
        )
        .where(User.id == user_id)
    )
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if not user:
        raise UnauthorizedError("User no longer exists")
    if not user.is_active:
        raise ForbiddenError("User account is deactivated")

    return user


def require_roles(*allowed_roles: str):
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_role_codes = [ur.role.code for ur in current_user.roles if ur.role]
        if current_user.user_type == UserType.PLATFORM_ADMIN.value:
            return current_user

        has_role = any(r in user_role_codes for r in allowed_roles)
        if not has_role:
            raise ForbiddenError(f"Access requires one of the roles: {', '.join(allowed_roles)}")
        return current_user
    return role_checker


def require_citizen(current_user: User = Depends(get_current_user)) -> User:
    if current_user.user_type != UserType.CITIZEN.value:
        raise ForbiddenError("Access restricted to registered citizens")
    return current_user


def require_staff(current_user: User = Depends(get_current_user)) -> User:
    if current_user.user_type not in [UserType.STAFF.value, UserType.PLATFORM_ADMIN.value]:
        raise ForbiddenError("Access restricted to municipal staff and administrators")
    return current_user


def require_platform_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.user_type != UserType.PLATFORM_ADMIN.value:
        raise ForbiddenError("Access restricted to platform super-administrators")
    return current_user
