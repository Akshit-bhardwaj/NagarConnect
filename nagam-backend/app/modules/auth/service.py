from datetime import datetime, timezone
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_password_hash,
    verify_password,
)
from app.modules.auth.schemas import LoginRequest, RegisterCitizenRequest
from app.modules.users.models import User, CitizenProfile, Role, UserRole, RefreshToken
from app.modules.cities.models import City
from app.common.permissions import RoleEnum, UserType


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def authenticate(self, req: LoginRequest) -> tuple[User, str, str]:
        stmt = (
            select(User)
            .options(
                selectinload(User.roles).selectinload(UserRole.role),
                selectinload(User.citizen_profile),
                selectinload(User.staff_profile),
                selectinload(User.organization),
            )
            .where(User.email == req.email.lower().strip())
        )
        res = await self.db.execute(stmt)
        user = res.scalar_one_or_none()

        if not user or not verify_password(req.password, user.hashed_password):
            raise UnauthorizedError("Invalid email or password")
        if not user.is_active:
            raise UnauthorizedError("Account has been disabled")

        # Create tokens
        access_token = create_access_token({"sub": str(user.id), "email": user.email, "type": "access"})
        refresh_token = create_refresh_token({"sub": str(user.id), "type": "refresh"})

        # Save refresh token in DB
        decoded_refresh = decode_token(refresh_token)
        expires_at = datetime.fromtimestamp(decoded_refresh["exp"], tz=timezone.utc)
        rf_entry = RefreshToken(user_id=user.id, token=refresh_token, expires_at=expires_at)
        self.db.add(rf_entry)
        await self.db.commit()

        return user, access_token, refresh_token

    async def register_citizen(self, req: RegisterCitizenRequest) -> tuple[User, str, str]:
        email_clean = req.email.lower().strip()
        existing = await self.db.execute(select(User).where(User.email == email_clean))
        if existing.scalar_one_or_none():
            raise ConflictError(f"Email '{email_clean}' is already registered")

        if req.phone:
            existing_phone = await self.db.execute(select(User).where(User.phone == req.phone))
            if existing_phone.scalar_one_or_none():
                raise ConflictError(f"Phone number '{req.phone}' is already registered")

        # Associate organization if city_id provided
        org_id = None
        if req.city_id:
            city_res = await self.db.execute(select(City).where(City.id == req.city_id))
            city = city_res.scalar_one_or_none()
            if city:
                org_id = city.organization_id

        # Create user
        new_user = User(
            organization_id=org_id,
            email=email_clean,
            phone=req.phone,
            hashed_password=get_password_hash(req.password),
            user_type=UserType.CITIZEN.value,
            is_active=True,
            is_verified=True,
        )
        self.db.add(new_user)
        await self.db.flush()

        # Create citizen profile
        profile = CitizenProfile(
            user_id=new_user.id,
            first_name=req.first_name,
            last_name=req.last_name,
            address=req.address,
            city_id=req.city_id,
            ward_id=req.ward_id,
            preferred_language=req.preferred_language,
        )
        self.db.add(profile)

        # Assign Citizen role
        role_res = await self.db.execute(select(Role).where(Role.code == RoleEnum.CITIZEN.value))
        citizen_role = role_res.scalar_one_or_none()
        if citizen_role:
            self.db.add(UserRole(user_id=new_user.id, role_id=citizen_role.id))

        access_token = create_access_token({"sub": str(new_user.id), "email": new_user.email, "type": "access"})
        refresh_token = create_refresh_token({"sub": str(new_user.id), "type": "refresh"})

        decoded_refresh = decode_token(refresh_token)
        expires_at = datetime.fromtimestamp(decoded_refresh["exp"], tz=timezone.utc)
        rf_entry = RefreshToken(user_id=new_user.id, token=refresh_token, expires_at=expires_at)
        self.db.add(rf_entry)

        await self.db.commit()

        # Reload user with relationships
        stmt = (
            select(User)
            .options(
                selectinload(User.roles).selectinload(UserRole.role),
                selectinload(User.citizen_profile),
                selectinload(User.staff_profile),
                selectinload(User.organization),
            )
            .where(User.id == new_user.id)
        )
        res = await self.db.execute(stmt)
        user_loaded = res.scalar_one()

        return user_loaded, access_token, refresh_token

    async def refresh_tokens(self, refresh_token_str: str) -> tuple[User, str, str]:
        payload = decode_token(refresh_token_str)
        if payload.get("type") != "refresh":
            raise UnauthorizedError("Invalid refresh token")

        stmt = select(RefreshToken).where(RefreshToken.token == refresh_token_str, RefreshToken.revoked == False)
        res = await self.db.execute(stmt)
        stored_rf = res.scalar_one_or_none()
        if not stored_rf:
            raise UnauthorizedError("Refresh token revoked or invalid")

        # Mark previous as revoked
        stored_rf.revoked = True

        user_id = uuid.UUID(payload["sub"])
        user_stmt = (
            select(User)
            .options(
                selectinload(User.roles).selectinload(UserRole.role),
                selectinload(User.citizen_profile),
                selectinload(User.staff_profile),
                selectinload(User.organization),
            )
            .where(User.id == user_id)
        )
        user_res = await self.db.execute(user_stmt)
        user = user_res.scalar_one_or_none()
        if not user or not user.is_active:
            raise UnauthorizedError("User is no longer active")

        # Issue new pair
        new_access = create_access_token({"sub": str(user.id), "email": user.email, "type": "access"})
        new_refresh = create_refresh_token({"sub": str(user.id), "type": "refresh"})

        decoded_new_rf = decode_token(new_refresh)
        expires_at = datetime.fromtimestamp(decoded_new_rf["exp"], tz=timezone.utc)
        new_rf_entry = RefreshToken(user_id=user.id, token=new_refresh, expires_at=expires_at)
        self.db.add(new_rf_entry)
        await self.db.commit()

        return user, new_access, new_refresh

    async def logout(self, refresh_token_str: str) -> None:
        if not refresh_token_str:
            return
        stmt = select(RefreshToken).where(RefreshToken.token == refresh_token_str)
        res = await self.db.execute(stmt)
        stored_rf = res.scalar_one_or_none()
        if stored_rf:
            stored_rf.revoked = True
            await self.db.commit()
