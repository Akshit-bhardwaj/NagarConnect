from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Notice(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "notices"

    organization_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    department_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    summary: Mapped[str] = mapped_column(Text, default="", nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="GENERAL", index=True, nullable=False) # GENERAL, TENDER, ADVISORY, SANITATION, WATER
    status: Mapped[str] = mapped_column(String(30), default="DRAFT", index=True, nullable=False) # DRAFT, REVIEW, PUBLISHED, ARCHIVED
    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    attachment_name: Mapped[str] = mapped_column(String(255), default="", nullable=False)
    attachment_path: Mapped[str] = mapped_column(String(512), default="", nullable=False)
    created_by_user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)

    department = relationship("Department")
    created_by = relationship("User")
