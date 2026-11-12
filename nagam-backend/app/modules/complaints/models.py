from datetime import datetime
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Complaint(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "complaints"

    reference_no: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    organization_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    citizen_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    city_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("cities.id", ondelete="RESTRICT"), nullable=False, index=True)
    ward_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("wards.id", ondelete="RESTRICT"), nullable=False, index=True)
    locality_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("localities.id", ondelete="SET NULL"), nullable=True)
    department_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True, index=True)

    category: Mapped[str] = mapped_column(String(100), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    address_text: Mapped[str] = mapped_column(Text, default="", nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)

    status: Mapped[str] = mapped_column(String(30), default="SUBMITTED", index=True, nullable=False)
    priority: Mapped[str] = mapped_column(String(20), default="MEDIUM", nullable=False)
    assigned_to_user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)

    sla_due_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    resolved_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=True)
    citizen_rating: Mapped[int] = mapped_column(Integer, nullable=True)
    citizen_feedback: Mapped[str] = mapped_column(Text, nullable=True)

    # Relationships
    citizen = relationship("User", foreign_keys=[citizen_id])
    assigned_to = relationship("User", foreign_keys=[assigned_to_user_id])
    department = relationship("Department")
    city = relationship("City")
    ward = relationship("Ward")
    locality = relationship("Locality")
    status_history = relationship("ComplaintStatusHistory", back_populates="complaint", cascade="all, delete-orphan", order_by="ComplaintStatusHistory.created_at.desc()")
    assignments = relationship("ComplaintAssignment", back_populates="complaint", cascade="all, delete-orphan")
    comments = relationship("ComplaintComment", back_populates="complaint", cascade="all, delete-orphan", order_by="ComplaintComment.created_at.asc()")
    attachments = relationship("ComplaintAttachment", back_populates="complaint", cascade="all, delete-orphan")


class ComplaintStatusHistory(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "complaint_status_history"

    complaint_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    from_status: Mapped[str] = mapped_column(String(30), nullable=False)
    to_status: Mapped[str] = mapped_column(String(30), nullable=False)
    changed_by_user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    reason_or_remark: Mapped[str] = mapped_column(Text, default="", nullable=False)
    is_citizen_visible: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    complaint = relationship("Complaint", back_populates="status_history")
    changed_by = relationship("User")


class ComplaintAssignment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "complaint_assignments"

    complaint_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_by_user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    assigned_to_user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    department_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="", nullable=False)

    complaint = relationship("Complaint", back_populates="assignments")
    assigned_to = relationship("User", foreign_keys=[assigned_to_user_id])


class ComplaintComment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "complaint_comments"

    complaint_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    comment: Mapped[str] = mapped_column(Text, nullable=False)
    is_internal_note: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    complaint = relationship("Complaint", back_populates="comments")
    author = relationship("User")


class ComplaintAttachment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "complaint_attachments"

    complaint_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("complaints.id", ondelete="CASCADE"), nullable=False, index=True)
    uploader_user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    is_resolution_proof: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    complaint = relationship("Complaint", back_populates="attachments")
