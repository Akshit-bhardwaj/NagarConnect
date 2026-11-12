from datetime import datetime
from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "users"

    organization_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    user_type: Mapped[str] = mapped_column(String(30), default="CITIZEN", nullable=False) # CITIZEN, STAFF, PLATFORM_ADMIN
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    organization = relationship("Organization", back_populates="users")
    citizen_profile = relationship("CitizenProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    staff_profile = relationship("StaffProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    roles = relationship("UserRole", back_populates="user", cascade="all, delete-orphan")


class CitizenProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "citizen_profiles"

    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )
    first_name: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    address: Mapped[str] = mapped_column(Text, default="", nullable=False)
    city_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cities.id", ondelete="SET NULL"), nullable=True)
    ward_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("wards.id", ondelete="SET NULL"), nullable=True)
    locality_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("localities.id", ondelete="SET NULL"), nullable=True)
    preferred_language: Mapped[str] = mapped_column(String(10), default="en", nullable=False)

    user = relationship("User", back_populates="citizen_profile")


class StaffProfile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "staff_profiles"

    user_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )
    employee_id: Mapped[str] = mapped_column(String(50), default="", nullable=False)
    designation: Mapped[str] = mapped_column(String(100), default="", nullable=False)
    department_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    ward_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("wards.id", ondelete="SET NULL"), nullable=True)

    user = relationship("User", back_populates="staff_profile")


class Role(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "roles"

    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)


class UserRole(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "user_roles"

    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("roles.id", ondelete="CASCADE"), nullable=False, index=True)

    user = relationship("User", back_populates="roles")
    role = relationship("Role")


class RefreshToken(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "refresh_tokens"

    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    token: Mapped[str] = mapped_column(String(512), unique=True, index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
