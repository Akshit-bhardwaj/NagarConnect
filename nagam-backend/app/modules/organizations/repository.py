from typing import List, Optional
import uuid
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.organizations.models import Organization, OrganizationSetting


class OrganizationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, org_id: uuid.UUID) -> Optional[Organization]:
        stmt = select(Organization).where(Organization.id == org_id)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def get_by_code(self, code: str) -> Optional[Organization]:
        stmt = select(Organization).where(Organization.code == code)
        res = await self.db.execute(stmt)
        return res.scalar_one_or_none()

    async def list_all(self, only_active: bool = True) -> List[Organization]:
        stmt = select(Organization)
        if only_active:
            stmt = stmt.where(Organization.is_active == True)
        res = await self.db.execute(stmt)
        return list(res.scalars().all())

    async def create(self, org: Organization) -> Organization:
        self.db.add(org)
        await self.db.flush()
        # Create default settings
        settings = OrganizationSetting(organization_id=org.id)
        self.db.add(settings)
        await self.db.flush()
        await self.db.refresh(org)
        return org
