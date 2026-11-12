from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Organization(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "organizations"

    code: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    branding: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    config: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    settings = relationship("OrganizationSetting", back_populates="organization", uselist=False, cascade="all, delete-orphan")
    cities = relationship("City", back_populates="organization", cascade="all, delete-orphan")
    departments = relationship("Department", back_populates="organization", cascade="all, delete-orphan")
    users = relationship("User", back_populates="organization", cascade="all, delete-orphan")


class OrganizationSetting(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "organization_settings"

    organization_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True
    )
    helpline_number: Mapped[str] = mapped_column(String(50), default="1800-180-1553")
    contact_email: Mapped[str] = mapped_column(String(255), default="contact@nagarconnect.gov.in")
    office_address: Mapped[str] = mapped_column(Text, default="Municipal Headquarters")
    emergency_contacts: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    sla_default_hours: Mapped[int] = mapped_column(Integer, default=72, nullable=False)

    organization = relationship("Organization", back_populates="settings")
