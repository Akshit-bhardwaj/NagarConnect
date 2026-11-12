from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Ward(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "wards"

    city_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("cities.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    ward_number: Mapped[str] = mapped_column(String(20), nullable=False)
    ward_name: Mapped[str] = mapped_column(String(100), nullable=False)
    zone_name: Mapped[str] = mapped_column(String(100), default="Central Zone", nullable=False)
    office_address: Mapped[str] = mapped_column(Text, default="", nullable=False)
    contact_phone: Mapped[str] = mapped_column(String(50), default="", nullable=False)

    city = relationship("City", back_populates="wards")
    localities = relationship("Locality", back_populates="ward", cascade="all, delete-orphan")


class Locality(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "localities"

    ward_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("wards.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    postal_code: Mapped[str] = mapped_column(String(10), default="", nullable=False)

    ward = relationship("Ward", back_populates="localities")
