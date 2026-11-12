from fastapi import APIRouter
from app.modules.auth.router import router as auth_router
from app.api.v1.public import router as public_router
from app.api.v1.citizen import router as citizen_router
from app.api.v1.admin import router as admin_router
from app.api.v1.super_admin import router as super_admin_router
from app.api.v1.health import router as health_router
from app.api.v1.notifications import router as notifications_router

api_v1_router = APIRouter()

api_v1_router.include_router(health_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(public_router)
api_v1_router.include_router(citizen_router)
api_v1_router.include_router(admin_router)
api_v1_router.include_router(super_admin_router)
api_v1_router.include_router(notifications_router)
