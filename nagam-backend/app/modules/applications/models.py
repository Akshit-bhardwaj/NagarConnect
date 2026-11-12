from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class ServiceDefinition(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "service_definitions"

    organization_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    department_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False, index=True)
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    form_schema: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    required_documents: Mapped[list] = mapped_column(JSONB, default=list, nullable=False)
    sla_days: Mapped[int] = mapped_column(Integer, default=7, nullable=False)
    fee_amount: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    department = relationship("Department")
    applications = relationship("ServiceApplication", back_populates="service_definition", cascade="all, delete-orphan")


class ServiceApplication(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "service_applications"

    reference_no: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    organization_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False, index=True)
    service_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("service_definitions.id", ondelete="RESTRICT"), nullable=False, index=True)
    citizen_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    form_data: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)
    status: Mapped[str] = mapped_column(String(30), default="SUBMITTED", index=True, nullable=False)
    reviewer_user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    remarks: Mapped[str] = mapped_column(Text, default="", nullable=False)

    service_definition = relationship("ServiceDefinition", back_populates="applications")
    citizen = relationship("User", foreign_keys=[citizen_id])
    reviewer = relationship("User", foreign_keys=[reviewer_user_id])
    documents = relationship("ApplicationDocument", back_populates="application", cascade="all, delete-orphan")
    status_history = relationship("ApplicationStatusHistory", back_populates="application", cascade="all, delete-orphan", order_by="ApplicationStatusHistory.created_at.desc()")


class ApplicationDocument(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "application_documents"

    application_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("service_applications.id", ondelete="CASCADE"), nullable=False, index=True)
    document_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)

    application = relationship("ServiceApplication", back_populates="documents")


class ApplicationStatusHistory(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "application_status_history"

    application_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("service_applications.id", ondelete="CASCADE"), nullable=False, index=True)
    from_status: Mapped[str] = mapped_column(String(30), nullable=False)
    to_status: Mapped[str] = mapped_column(String(30), nullable=False)
    changed_by_user_id: Mapped[UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    remarks: Mapped[str] = mapped_column(Text, default="", nullable=False)

    application = relationship("ServiceApplication", back_populates="status_history")
    changed_by = relationship("User")
