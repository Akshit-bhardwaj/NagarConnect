from typing import List
import uuid
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import ConflictError, NotFoundError
from app.core.security import get_password_hash
from app.db.dependencies import get_db
from app.modules.auth.dependencies import require_platform_admin
from app.modules.organizations.models import Organization, OrganizationSetting
from app.modules.organizations.schemas import OrganizationCreate, OrganizationOut, OrganizationUpdate
from app.modules.users.models import User, StaffProfile, Role, UserRole
from app.modules.users.schemas import UserOut
from app.modules.complaints.models import Complaint
from app.modules.wards.models import Ward
from app.common.permissions import RoleEnum, UserType

router = APIRouter(prefix="/super-admin", tags=["Platform Super-Admin"])


class CreateMunicipalAdminReq(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    phone: str = ""
    employee_id: str = "ADMIN-01"
    designation: str = "Municipal Commissioner"


@router.get("/organizations", response_model=List[OrganizationOut])
async def list_all_organizations(
    current_user: User = Depends(require_platform_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Organization).order_by(Organization.name)
    res = await db.execute(stmt)
    return list(res.scalars().all())


@router.post("/organizations", response_model=OrganizationOut, status_code=status.HTTP_201_CREATED)
async def create_organization(
    req: OrganizationCreate,
    current_user: User = Depends(require_platform_admin),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(select(Organization).where(Organization.code == req.code.upper()))
    if existing.scalar_one_or_none():
        raise ConflictError(f"Organization code '{req.code}' already exists")

    org = Organization(
        code=req.code.upper(),
        name=req.name,
        state=req.state,
        branding=req.branding,
        config=req.config,
        is_active=req.is_active,
    )
    db.add(org)
    await db.flush()

    settings = OrganizationSetting(organization_id=org.id)
    db.add(settings)
    await db.commit()
    await db.refresh(org)

    return org


@router.patch("/organizations/{org_id}", response_model=OrganizationOut)
async def update_organization(
    org_id: uuid.UUID,
    req: OrganizationUpdate,
    current_user: User = Depends(require_platform_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Organization).where(Organization.id == org_id)
    res = await db.execute(stmt)
    org = res.scalar_one_or_none()
    if not org:
        raise NotFoundError("Organization", org_id)

    for field, val in req.model_dump(exclude_unset=True).items():
        setattr(org, field, val)

    await db.commit()
    await db.refresh(org)
    return org


@router.post("/organizations/{org_id}/admin", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_municipal_admin(
    org_id: uuid.UUID,
    req: CreateMunicipalAdminReq,
    current_user: User = Depends(require_platform_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Organization).where(Organization.id == org_id)
    res = await db.execute(stmt)
    org = res.scalar_one_or_none()
    if not org:
        raise NotFoundError("Organization", org_id)

    email_clean = req.email.lower().strip()
    existing_user = await db.execute(select(User).where(User.email == email_clean))
    if existing_user.scalar_one_or_none():
        raise ConflictError(f"Email '{email_clean}' is already registered")

    user = User(
        organization_id=org.id,
        email=email_clean,
        phone=req.phone or None,
        hashed_password=get_password_hash(req.password),
        user_type=UserType.STAFF.value,
        is_active=True,
        is_verified=True,
    )
    db.add(user)
    await db.flush()

    staff_profile = StaffProfile(
        user_id=user.id,
        employee_id=req.employee_id,
        designation=req.designation,
    )
    db.add(staff_profile)

    role_res = await db.execute(select(Role).where(Role.code == RoleEnum.MUNICIPAL_SUPER_ADMIN.value))
    admin_role = role_res.scalar_one_or_none()
    if admin_role:
        db.add(UserRole(user_id=user.id, role_id=admin_role.id))

    await db.commit()

    # Reload user
    stmt_reload = (
        select(User)
        .options(
            selectinload(User.roles).selectinload(UserRole.role),
            selectinload(User.staff_profile),
        )
        .where(User.id == user.id)
    )
    res_reload = await db.execute(stmt_reload)
    user_loaded = res_reload.scalar_one()

    roles = [ur.role.code for ur in user_loaded.roles if ur.role]
    return UserOut(
        id=user_loaded.id,
        organization_id=user_loaded.organization_id,
        email=user_loaded.email,
        phone=user_loaded.phone,
        user_type=user_loaded.user_type,
        is_active=user_loaded.is_active,
        is_verified=user_loaded.is_verified,
        roles=roles,
        staff_profile=user_loaded.staff_profile,
        created_at=user_loaded.created_at,
    )


@router.get("/metrics")
async def get_platform_metrics(
    current_user: User = Depends(require_platform_admin),
    db: AsyncSession = Depends(get_db),
):
    total_orgs_res = await db.execute(select(func.count(Organization.id)))
    total_orgs = total_orgs_res.scalar() or 0

    active_orgs_res = await db.execute(select(func.count(Organization.id)).where(Organization.is_active == True))
    active_orgs = active_orgs_res.scalar() or 0

    total_users_res = await db.execute(select(func.count(User.id)))
    total_users = total_users_res.scalar() or 0

    total_citizens_res = await db.execute(select(func.count(User.id)).where(User.user_type == "CITIZEN"))
    total_citizens = total_citizens_res.scalar() or 0

    total_staff_res = await db.execute(select(func.count(User.id)).where(User.user_type == "STAFF"))
    total_staff = total_staff_res.scalar() or 0

    total_complaints_res = await db.execute(select(func.count(Complaint.id)))
    total_complaints = total_complaints_res.scalar() or 0

    resolved_complaints_res = await db.execute(
        select(func.count(Complaint.id)).where(Complaint.status.in_(["RESOLVED", "CLOSED"]))
    )
    resolved_complaints = resolved_complaints_res.scalar() or 0

    total_wards_res = await db.execute(select(func.count(Ward.id)))
    total_wards = total_wards_res.scalar() or 0

    return {
        "total_organizations": total_orgs,
        "active_organizations": active_orgs,
        "total_users": total_users,
        "total_citizens": total_citizens,
        "total_staff": total_staff,
        "total_complaints": total_complaints,
        "resolved_complaints": resolved_complaints,
        "total_wards": total_wards,
        "platform_uptime": "99.98%",
        "active_tenants": [
            {"code": "LMC", "name": "Lucknow Municipal Corporation", "status": "ACTIVE"},
            {"code": "VNN", "name": "Varanasi Nagar Nigam", "status": "ACTIVE"},
            {"code": "ANN", "name": "Agra Nagar Nigam", "status": "ACTIVE"},
            {"code": "PNN", "name": "Prayagraj Nagar Nigam", "status": "ACTIVE"},
        ],
    }


@router.get("/users")
async def list_all_platform_users(
    user_type: str = None,
    current_user: User = Depends(require_platform_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(User)
        .options(
            selectinload(User.roles).selectinload(UserRole.role),
            selectinload(User.staff_profile),
            selectinload(User.organization),
        )
        .order_by(User.created_at.desc())
    )
    if user_type:
        stmt = stmt.where(User.user_type == user_type.upper())
    res = await db.execute(stmt)
    users = res.scalars().all()

    out = []
    for u in users:
        roles = [ur.role.code for ur in u.roles if ur.role]
        out.append({
            "id": str(u.id),
            "email": u.email,
            "phone": u.phone,
            "user_type": u.user_type,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "organization_name": u.organization.name if u.organization else "Platform Global",
            "organization_code": u.organization.code if u.organization else "GLOBAL",
            "roles": roles,
            "designation": u.staff_profile.designation if u.staff_profile else None,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        })
    return out


@router.patch("/users/{user_id}/status")
async def toggle_user_status(
    user_id: uuid.UUID,
    current_user: User = Depends(require_platform_admin),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(User).where(User.id == user_id)
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()
    if not user:
        raise NotFoundError("User", user_id)
    user.is_active = not user.is_active
    await db.commit()
    return {"id": str(user.id), "is_active": user.is_active}
