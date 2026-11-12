from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import NotFoundError
from app.db.dependencies import get_db
from app.modules.cities.models import City
from app.modules.cities.schemas import CityOut
from app.modules.wards.models import Ward
from app.modules.wards.schemas import WardOut
from app.modules.departments.models import Department
from app.modules.departments.schemas import DepartmentOut
from app.modules.applications.models import ServiceDefinition
from app.modules.applications.schemas import ServiceDefinitionOut
from app.modules.notices.models import Notice
from app.modules.notices.schemas import NoticeOut
from app.modules.organizations.models import Organization
from app.common.permissions import NoticeStatus

router = APIRouter(prefix="/public", tags=["Public Portal"])


@router.get("/cities", response_model=List[CityOut])
async def list_public_cities(db: AsyncSession = Depends(get_db)):
    # Query cities with count of wards
    stmt = (
        select(City, func.count(Ward.id).label("ward_count"))
        .outerjoin(Ward, City.id == Ward.city_id)
        .where(City.is_active == True)
        .group_by(City.id)
        .order_by(City.name)
    )
    res = await db.execute(stmt)
    results = []
    for city, count in res.all():
        city_out = CityOut(
            id=city.id,
            organization_id=city.organization_id,
            name=city.name,
            state=city.state,
            pin_code=city.pin_code,
            latitude=city.latitude,
            longitude=city.longitude,
            description=city.description,
            photo_url=city.photo_url,
            is_active=city.is_active,
            created_at=city.created_at,
            updated_at=city.updated_at,
            ward_count=count or 0,
        )
        results.append(city_out)
    return results


@router.get("/cities/{city_id}")
async def get_public_city_details(city_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(City)
        .options(selectinload(City.organization).selectinload(Organization.settings))
        .where(City.id == city_id, City.is_active == True)
    )
    res = await db.execute(stmt)
    city = res.scalar_one_or_none()
    if not city:
        raise NotFoundError("City", city_id)

    settings = city.organization.settings if city.organization else None
    return {
        "city": CityOut.model_validate(city),
        "organization": {
            "id": city.organization.id,
            "name": city.organization.name,
            "code": city.organization.code,
            "branding": city.organization.branding,
            "config": city.organization.config,
        } if city.organization else None,
        "contacts": {
            "helpline": settings.helpline_number if settings else "1800-180-1553",
            "email": settings.contact_email if settings else "contact@nagarconnect.gov.in",
            "office_address": settings.office_address if settings else "Municipal Corporation",
            "emergency_contacts": settings.emergency_contacts if settings else {},
        } if settings else {},
    }


@router.get("/wards", response_model=List[WardOut])
async def list_public_wards(
    city_id: Optional[uuid.UUID] = Query(None, description="Filter by city ID"),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Ward).options(selectinload(Ward.localities)).order_by(Ward.ward_number)
    if city_id:
        stmt = stmt.where(Ward.city_id == city_id)
    res = await db.execute(stmt)
    wards = res.scalars().all()
    return list(wards)


@router.get("/departments", response_model=List[DepartmentOut])
async def list_public_departments(
    org_id: Optional[uuid.UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Department).where(Department.is_active == True).order_by(Department.name)
    if org_id:
        stmt = stmt.where(Department.organization_id == org_id)
    res = await db.execute(stmt)
    return list(res.scalars().all())


@router.get("/services", response_model=List[ServiceDefinitionOut])
async def list_public_services(
    org_id: Optional[uuid.UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(ServiceDefinition)
        .options(selectinload(ServiceDefinition.department))
        .where(ServiceDefinition.is_active == True)
        .order_by(ServiceDefinition.title)
    )
    if org_id:
        stmt = stmt.where(ServiceDefinition.organization_id == org_id)
    res = await db.execute(stmt)
    results = []
    for srv in res.scalars().all():
        out = ServiceDefinitionOut.model_validate(srv)
        out.department_name = srv.department.name if srv.department else None
        results.append(out)
    return results


@router.get("/notices", response_model=List[NoticeOut])
async def list_public_notices(
    category: Optional[str] = Query(None, description="Category filter (TENDER, ADVISORY, WATER, etc.)"),
    org_id: Optional[uuid.UUID] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Notice)
        .options(selectinload(Notice.department))
        .where(Notice.status == NoticeStatus.PUBLISHED.value)
        .order_by(Notice.published_at.desc())
    )
    if category:
        stmt = stmt.where(Notice.category == category.upper())
    if org_id:
        stmt = stmt.where(Notice.organization_id == org_id)
    res = await db.execute(stmt)
    results = []
    for n in res.scalars().all():
        out = NoticeOut.model_validate(n)
        out.department_name = n.department.name if n.department else None
        results.append(out)
    return results


@router.get("/notices/{notice_id}", response_model=NoticeOut)
async def get_public_notice_detail(notice_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(Notice)
        .options(selectinload(Notice.department))
        .where(Notice.id == notice_id, Notice.status == NoticeStatus.PUBLISHED.value)
    )
    res = await db.execute(stmt)
    n = res.scalar_one_or_none()
    if not n:
        raise NotFoundError("Notice", notice_id)
    out = NoticeOut.model_validate(n)
    out.department_name = n.department.name if n.department else None
    return out


@router.get("/search")
async def public_search(
    q: str = Query(..., min_length=1),
    db: AsyncSession = Depends(get_db),
):
    query_str = f"%{q.strip().lower()}%"

    cities_res = await db.execute(
        select(City).where(func.lower(City.name).like(query_str))
    )
    matching_cities = cities_res.scalars().all()

    wards_res = await db.execute(
        select(Ward).options(selectinload(Ward.city)).where(
            func.lower(Ward.ward_name).like(query_str) |
            func.lower(Ward.ward_number).like(query_str)
        )
    )
    matching_wards = wards_res.scalars().all()

    services_res = await db.execute(
        select(ServiceDefinition).where(func.lower(ServiceDefinition.title).like(query_str))
    )
    matching_services = services_res.scalars().all()

    return {
        "query": q,
        "results": {
            "cities": [{"id": str(c.id), "name": c.name, "state": c.state} for c in matching_cities],
            "wards": [{"id": str(w.id), "ward_number": w.ward_number, "ward_name": w.ward_name, "city_name": w.city.name if w.city else None} for w in matching_wards],
            "services": [{"id": str(s.id), "title": s.title, "sla_days": s.sla_days} for s in matching_services],
        }
    }
