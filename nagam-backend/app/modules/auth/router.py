from fastapi import APIRouter, Cookie, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import UnauthorizedError
from app.db.dependencies import get_db
from app.modules.auth.dependencies import get_current_user
from app.modules.auth.schemas import LoginRequest, RegisterCitizenRequest, TokenResponse, RefreshTokenRequest
from app.modules.auth.service import AuthService
from app.modules.users.models import User
from app.modules.users.schemas import UserOut

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _user_to_out(user: User) -> UserOut:
    roles = [ur.role.code for ur in user.roles if ur.role]
    return UserOut(
        id=user.id,
        organization_id=user.organization_id,
        email=user.email,
        phone=user.phone,
        user_type=user.user_type,
        is_active=user.is_active,
        is_verified=user.is_verified,
        roles=roles,
        citizen_profile=user.citizen_profile,
        staff_profile=user.staff_profile,
        created_at=user.created_at,
    )


@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    user, access_token, refresh_token = await service.authenticate(req)

    # Set secure HttpOnly cookies for browser clients
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=not settings.DEBUG,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=not settings.DEBUG,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
    )

    return TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=_user_to_out(user),
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(req: RegisterCitizenRequest, response: Response, db: AsyncSession = Depends(get_db)):
    service = AuthService(db)
    user, access_token, refresh_token = await service.register_citizen(req)

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        samesite="lax",
        secure=not settings.DEBUG,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        samesite="lax",
        secure=not settings.DEBUG,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
    )

    return TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=_user_to_out(user),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    response: Response,
    body: RefreshTokenRequest = None,
    refresh_token_cookie: str = Cookie(default=None, alias="refresh_token"),
    db: AsyncSession = Depends(get_db),
):
    token_str = (body.refresh_token if body and body.refresh_token else None) or refresh_token_cookie
    if not token_str:
        raise UnauthorizedError("No refresh token provided")

    service = AuthService(db)
    user, new_access, new_refresh = await service.refresh_tokens(token_str)

    response.set_cookie(
        key="access_token",
        value=new_access,
        httponly=True,
        samesite="lax",
        secure=not settings.DEBUG,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    response.set_cookie(
        key="refresh_token",
        value=new_refresh,
        httponly=True,
        samesite="lax",
        secure=not settings.DEBUG,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
    )

    return TokenResponse(
        access_token=new_access,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=_user_to_out(user),
    )


@router.post("/logout")
async def logout(
    response: Response,
    body: RefreshTokenRequest = None,
    refresh_token_cookie: str = Cookie(default=None, alias="refresh_token"),
    db: AsyncSession = Depends(get_db),
):
    token_str = (body.refresh_token if body and body.refresh_token else None) or refresh_token_cookie
    if token_str:
        service = AuthService(db)
        await service.logout(token_str)

    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    return {"success": True, "message": "Successfully logged out"}


@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return _user_to_out(current_user)
