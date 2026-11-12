from datetime import datetime, timezone
from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import ForbiddenError, NotFoundError, ValidationError
from app.db.dependencies import get_db
from app.core.sse import broadcaster
from app.modules.auth.dependencies import require_staff
from app.modules.users.models import User, CitizenProfile
from app.modules.notifications.models import Notification
from app.modules.complaints.models import (
    Complaint,
    ComplaintStatusHistory,
    ComplaintAssignment,
    ComplaintComment,
)
from app.modules.complaints.schemas import (
    ComplaintOut,
    StatusUpdateReq,
    AssignmentReq,
    CommentCreateReq,
    StatusHistoryOut,
    CommentOut,
)
from app.modules.applications.models import (
    ServiceApplication,
    ApplicationStatusHistory,
)
from app.modules.applications.schemas import (
    ServiceApplicationOut,
    ApplicationDecisionReq,
)
from app.modules.notices.models import Notice
from app.modules.notices.schemas import NoticeCreate, NoticeOut
from app.modules.audit.models import AuditLog
from app.modules.departments.models import Department
from app.modules.departments.schemas import DepartmentOut
from app.modules.wards.models import Ward
from app.modules.wards.schemas import WardOut
from app.common.permissions import ComplaintStatus, NoticeStatus

router = APIRouter(prefix="/admin", tags=["Municipal Operations"])


def _format_admin_complaint(c: Complaint) -> ComplaintOut:
    status_histories = []
    for h in c.status_history or []:
        status_histories.append(
            StatusHistoryOut(
                id=h.id,
                from_status=h.from_status,
                to_status=h.to_status,
                reason_or_remark=h.reason_or_remark,
                is_citizen_visible=h.is_citizen_visible,
                created_at=h.created_at,
                changed_by_name=h.changed_by.email.split("@")[0] if h.changed_by else "Staff",
            )
        )

    all_comments = []
    for com in c.comments or []:
        all_comments.append(
            CommentOut(
                id=com.id,
                comment=com.comment,
                is_internal_note=com.is_internal_note,
                created_at=com.created_at,
                author_name=com.author.email.split("@")[0] if com.author else "Staff",
            )
        )

    return ComplaintOut(
        id=c.id,
        reference_no=c.reference_no,
        organization_id=c.organization_id,
        citizen_id=c.citizen_id,
        city_id=c.city_id,
        ward_id=c.ward_id,
        locality_id=c.locality_id,
        department_id=c.department_id,
        category=c.category,
        title=c.title,
        description=c.description,
        address_text=c.address_text,
        latitude=c.latitude,
        longitude=c.longitude,
        status=c.status,
        priority=c.priority,
        assigned_to_user_id=c.assigned_to_user_id,
        assigned_officer_name=c.assigned_to.email.split("@")[0] if c.assigned_to else None,
        department_name=c.department.name if c.department else None,
        ward_name=c.ward.ward_name if c.ward else None,
        city_name=c.city.name if c.city else None,
        sla_due_at=c.sla_due_at,
        resolved_at=c.resolved_at,
        citizen_rating=c.citizen_rating,
        citizen_feedback=c.citizen_feedback,
        created_at=c.created_at,
        updated_at=c.updated_at,
        status_history=status_histories,
        comments=all_comments,
        attachments=[],
    )


@router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    org_id = current_user.organization_id
    base_query = select(Complaint)
    if org_id:
        base_query = base_query.where(Complaint.organization_id == org_id)

    # Scoped if Department Officer
    staff = current_user.staff_profile
    if staff and staff.department_id:
        base_query = base_query.where(Complaint.department_id == staff.department_id)
    elif staff and staff.ward_id:
        base_query = base_query.where(Complaint.ward_id == staff.ward_id)

    res = await db.execute(base_query)
    all_complaints = res.scalars().all()

    total = len(all_complaints)
    submitted = sum(1 for c in all_complaints if c.status == ComplaintStatus.SUBMITTED.value)
    triaged = sum(1 for c in all_complaints if c.status == ComplaintStatus.TRIAGED.value)
    in_progress = sum(1 for c in all_complaints if c.status == ComplaintStatus.IN_PROGRESS.value)
    resolved = sum(1 for c in all_complaints if c.status in [ComplaintStatus.RESOLVED.value, ComplaintStatus.CLOSED.value])

    now = datetime.now(timezone.utc)
    sla_breaches = sum(1 for c in all_complaints if c.sla_due_at and c.sla_due_at < now and c.status not in [ComplaintStatus.RESOLVED.value, ComplaintStatus.CLOSED.value])

    sla_compliance = round(((total - sla_breaches) / total * 100), 1) if total > 0 else 100.0

    return {
        "total_complaints": total,
        "submitted": submitted,
        "triaged": triaged,
        "in_progress": in_progress,
        "resolved": resolved,
        "sla_breaches": sla_breaches,
        "sla_compliance_rate": sla_compliance,
    }


@router.get("/complaints", response_model=List[ComplaintOut])
async def list_admin_complaints(
    status_filter: Optional[str] = Query(None, alias="status"),
    department_id: Optional[uuid.UUID] = None,
    ward_id: Optional[uuid.UUID] = None,
    current_user: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Complaint)
        .options(
            selectinload(Complaint.status_history).selectinload(ComplaintStatusHistory.changed_by),
            selectinload(Complaint.comments).selectinload(ComplaintComment.author),
            selectinload(Complaint.department),
            selectinload(Complaint.city),
            selectinload(Complaint.ward),
            selectinload(Complaint.assigned_to),
        )
        .order_by(Complaint.created_at.desc())
    )

    # Multi-tenant isolation: bound by organization
    if current_user.organization_id:
        stmt = stmt.where(Complaint.organization_id == current_user.organization_id)

    # Enforce scope boundary for specialized staff
    staff = current_user.staff_profile
    if staff:
        if staff.department_id:
            stmt = stmt.where(Complaint.department_id == staff.department_id)
        if staff.ward_id:
            stmt = stmt.where(Complaint.ward_id == staff.ward_id)

    if status_filter:
        stmt = stmt.where(Complaint.status == status_filter.upper())
    if department_id:
        stmt = stmt.where(Complaint.department_id == department_id)
    if ward_id:
        stmt = stmt.where(Complaint.ward_id == ward_id)

    res = await db.execute(stmt)
    complaints = res.scalars().all()
    return [_format_admin_complaint(c) for c in complaints]


@router.get("/complaints/{complaint_id}", response_model=ComplaintOut)
async def get_admin_complaint(
    complaint_id: uuid.UUID,
    current_user: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Complaint)
        .options(
            selectinload(Complaint.status_history).selectinload(ComplaintStatusHistory.changed_by),
            selectinload(Complaint.comments).selectinload(ComplaintComment.author),
            selectinload(Complaint.department),
            selectinload(Complaint.city),
            selectinload(Complaint.ward),
            selectinload(Complaint.assigned_to),
        )
        .where(Complaint.id == complaint_id)
    )
    res = await db.execute(stmt)
    c = res.scalar_one_or_none()
    if not c:
        raise NotFoundError("Complaint", complaint_id)

    # Multi-tenant guard
    if current_user.organization_id and c.organization_id != current_user.organization_id:
        raise ForbiddenError("Cross-tenant access prohibited")

    # Scope guard
    staff = current_user.staff_profile
    if staff:
        if staff.department_id and c.department_id != staff.department_id:
            raise ForbiddenError("Grievance outside your assigned department")
        if staff.ward_id and c.ward_id != staff.ward_id:
            raise ForbiddenError("Grievance outside your assigned ward")

    return _format_admin_complaint(c)


@router.post("/complaints/{complaint_id}/status")
async def update_complaint_status(
    complaint_id: uuid.UUID,
    req: StatusUpdateReq,
    current_user: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Complaint).where(Complaint.id == complaint_id)
    res = await db.execute(stmt)
    c = res.scalar_one_or_none()
    if not c:
        raise NotFoundError("Complaint", complaint_id)

    if current_user.organization_id and c.organization_id != current_user.organization_id:
        raise ForbiddenError("Cross-tenant access prohibited")

    old_status = c.status
    new_status = req.status.upper()

    # Allowed state machine transitions
    valid_transitions = {
        ComplaintStatus.SUBMITTED.value: [ComplaintStatus.TRIAGED.value, ComplaintStatus.REJECTED.value],
        ComplaintStatus.TRIAGED.value: [ComplaintStatus.ASSIGNED.value, ComplaintStatus.IN_PROGRESS.value, ComplaintStatus.REJECTED.value],
        ComplaintStatus.ASSIGNED.value: [ComplaintStatus.IN_PROGRESS.value, ComplaintStatus.NEEDS_INFORMATION.value],
        ComplaintStatus.IN_PROGRESS.value: [ComplaintStatus.RESOLVED.value, ComplaintStatus.NEEDS_INFORMATION.value],
        ComplaintStatus.NEEDS_INFORMATION.value: [ComplaintStatus.IN_PROGRESS.value, ComplaintStatus.REJECTED.value],
        ComplaintStatus.RESOLVED.value: [ComplaintStatus.CLOSED.value, ComplaintStatus.REOPENED.value],
        ComplaintStatus.REOPENED.value: [ComplaintStatus.IN_PROGRESS.value],
        ComplaintStatus.REJECTED.value: [],
        ComplaintStatus.CLOSED.value: [],
    }

    if new_status not in valid_transitions.get(old_status, []):
        raise ValidationError(f"Invalid state transition from '{old_status}' to '{new_status}'")

    c.status = new_status
    if new_status == ComplaintStatus.RESOLVED.value:
        c.resolved_at = datetime.now(timezone.utc)

    # Append to immutable status history in same transaction
    h = ComplaintStatusHistory(
        complaint_id=c.id,
        from_status=old_status,
        to_status=new_status,
        changed_by_user_id=current_user.id,
        reason_or_remark=req.reason_or_remark or f"Status changed to {new_status} by staff",
        is_citizen_visible=True,
    )
    db.add(h)

    # Audit log
    audit = AuditLog(
        organization_id=c.organization_id,
        user_id=current_user.id,
        action="COMPLAINT_STATUS_UPDATE",
        entity_type="Complaint",
        entity_id=str(c.id),
        old_state={"status": old_status},
        new_state={"status": new_status, "reason": req.reason_or_remark},
    )
    db.add(audit)

    # Trigger Notification & SSE Broadcast for Citizen
    if c.citizen_id:
        notif = Notification(
            user_id=c.citizen_id,
            title=f"Grievance #{c.reference_no} Status Updated",
            message=f"Your grievance status transitioned from {old_status} to {new_status}. {req.reason_or_remark or ''}".strip(),
            link=f"/citizen/complaints/{c.id}",
            is_read=False,
        )
        db.add(notif)
        await db.commit()
        await broadcaster.broadcast_to_user(
            str(c.citizen_id),
            "COMPLAINT_STATUS_UPDATED",
            {
                "id": str(notif.id),
                "complaint_id": str(c.id),
                "reference_no": c.reference_no,
                "old_status": old_status,
                "new_status": new_status,
                "title": notif.title,
                "message": notif.message,
                "link": notif.link,
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
        )
    else:
        await db.commit()

    return {"success": True, "message": f"Complaint transitioned to {new_status}"}


@router.post("/complaints/{complaint_id}/assign")
async def assign_complaint(
    complaint_id: uuid.UUID,
    req: AssignmentReq,
    current_user: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Complaint).where(Complaint.id == complaint_id)
    res = await db.execute(stmt)
    c = res.scalar_one_or_none()
    if not c:
        raise NotFoundError("Complaint", complaint_id)

    if current_user.organization_id and c.organization_id != current_user.organization_id:
        raise ForbiddenError("Cross-tenant access prohibited")

    c.assigned_to_user_id = req.assigned_to_user_id
    if req.department_id:
        c.department_id = req.department_id
    c.status = ComplaintStatus.ASSIGNED.value

    assignment = ComplaintAssignment(
        complaint_id=c.id,
        assigned_by_user_id=current_user.id,
        assigned_to_user_id=req.assigned_to_user_id,
        department_id=req.department_id,
        notes=req.notes,
    )
    db.add(assignment)

    h = ComplaintStatusHistory(
        complaint_id=c.id,
        from_status=c.status,
        to_status=ComplaintStatus.ASSIGNED.value,
        changed_by_user_id=current_user.id,
        reason_or_remark=f"Assigned to field officer. Notes: {req.notes}",
        is_citizen_visible=True,
    )
    db.add(h)

    # Trigger Notification & SSE Broadcast for Citizen
    if c.citizen_id:
        notif = Notification(
            user_id=c.citizen_id,
            title=f"Grievance #{c.reference_no} Assigned to Field Officer",
            message=f"Your complaint has been assigned to a nodal municipal officer for resolution. {req.notes or ''}".strip(),
            link=f"/citizen/complaints/{c.id}",
            is_read=False,
        )
        db.add(notif)
        await db.commit()
        await broadcaster.broadcast_to_user(
            str(c.citizen_id),
            "COMPLAINT_ASSIGNED",
            {
                "id": str(notif.id),
                "complaint_id": str(c.id),
                "reference_no": c.reference_no,
                "title": notif.title,
                "message": notif.message,
                "link": notif.link,
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
        )
    else:
        await db.commit()

    return {"success": True, "message": "Grievance assigned successfully"}


@router.post("/complaints/{complaint_id}/notes")
async def add_internal_note(
    complaint_id: uuid.UUID,
    req: CommentCreateReq,
    current_user: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Complaint).where(Complaint.id == complaint_id)
    res = await db.execute(stmt)
    c = res.scalar_one_or_none()
    if not c:
        raise NotFoundError("Complaint", complaint_id)

    note = ComplaintComment(
        complaint_id=c.id,
        user_id=current_user.id,
        comment=req.comment,
        is_internal_note=True, # Staff-only internal note
    )
    db.add(note)
    await db.commit()
    return {"success": True, "message": "Internal note recorded"}


@router.get("/applications", response_model=List[ServiceApplicationOut])
async def list_admin_applications(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(ServiceApplication)
        .options(selectinload(ServiceApplication.service_definition))
        .order_by(ServiceApplication.created_at.desc())
    )
    if current_user.organization_id:
        stmt = stmt.where(ServiceApplication.organization_id == current_user.organization_id)
    if status_filter:
        stmt = stmt.where(ServiceApplication.status == status_filter.upper())

    res = await db.execute(stmt)
    apps = res.scalars().all()
    results = []
    for a in apps:
        results.append(
            ServiceApplicationOut(
                id=a.id,
                reference_no=a.reference_no,
                organization_id=a.organization_id,
                service_id=a.service_id,
                citizen_id=a.citizen_id,
                service_title=a.service_definition.title if a.service_definition else "Civic Service",
                form_data=a.form_data,
                status=a.status,
                remarks=a.remarks,
                created_at=a.created_at,
                updated_at=a.updated_at,
                documents=[],
            )
        )
    return results


@router.post("/applications/{app_id}/decide")
async def decide_service_application(
    app_id: uuid.UUID,
    req: ApplicationDecisionReq,
    current_user: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ServiceApplication).where(ServiceApplication.id == app_id)
    res = await db.execute(stmt)
    app = res.scalar_one_or_none()
    if not app:
        raise NotFoundError("Service Application", app_id)

    old_status = app.status
    new_status = req.status.upper()
    app.status = new_status
    app.remarks = req.remarks
    app.reviewer_user_id = current_user.id

    h = ApplicationStatusHistory(
        application_id=app.id,
        from_status=old_status,
        to_status=new_status,
        changed_by_user_id=current_user.id,
        remarks=req.remarks,
    )
    db.add(h)

    # Look up citizen profile to get citizen's user_id
    cit_stmt = select(CitizenProfile).where(CitizenProfile.id == app.citizen_id)
    cit_res = await db.execute(cit_stmt)
    cit = cit_res.scalar_one_or_none()
    if cit:
        notif = Notification(
            user_id=cit.user_id,
            title=f"Civic Application #{app.reference_no} Decision",
            message=f"Your application status is now {new_status}. {req.remarks or ''}".strip(),
            link=f"/citizen/applications/{app.id}",
            is_read=False,
        )
        db.add(notif)
        await db.commit()
        await broadcaster.broadcast_to_user(
            str(cit.user_id),
            "APPLICATION_DECISION",
            {
                "id": str(notif.id),
                "application_id": str(app.id),
                "reference_no": app.reference_no,
                "title": notif.title,
                "message": notif.message,
                "link": notif.link,
                "status": new_status,
                "created_at": datetime.now(timezone.utc).isoformat(),
            },
        )
    else:
        await db.commit()

    return {"success": True, "message": f"Application marked as {new_status}"}


@router.post("/notices", response_model=NoticeOut, status_code=status.HTTP_201_CREATED)
async def create_notice(
    req: NoticeCreate,
    current_user: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    notice = Notice(
        organization_id=current_user.organization_id,
        department_id=req.department_id,
        title=req.title,
        summary=req.summary,
        content=req.content,
        category=req.category.upper(),
        status=req.status.upper(),
        published_at=datetime.now(timezone.utc) if req.status.upper() == NoticeStatus.PUBLISHED.value else None,
        expires_at=req.expires_at,
        attachment_name=req.attachment_name,
        attachment_path=req.attachment_path,
        created_by_user_id=current_user.id,
    )
    db.add(notice)
    await db.commit()
    await db.refresh(notice)
    return NoticeOut.model_validate(notice)


@router.get("/notices", response_model=List[NoticeOut])
async def list_admin_notices(
    category: Optional[str] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Notice).order_by(Notice.created_at.desc())
    if current_user.organization_id:
        stmt = stmt.where(Notice.organization_id == current_user.organization_id)
    if category:
        stmt = stmt.where(Notice.category == category.upper())
    if status_filter:
        stmt = stmt.where(Notice.status == status_filter.upper())
    res = await db.execute(stmt)
    return list(res.scalars().all())


@router.get("/departments", response_model=List[DepartmentOut])
async def list_admin_departments(
    current_user: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Department).order_by(Department.name)
    if current_user.organization_id:
        stmt = stmt.where(Department.organization_id == current_user.organization_id)
    res = await db.execute(stmt)
    return list(res.scalars().all())


@router.get("/wards", response_model=List[WardOut])
async def list_admin_wards(
    current_user: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Ward).options(selectinload(Ward.localities)).order_by(Ward.ward_number)
    res = await db.execute(stmt)
    return list(res.scalars().all())


@router.get("/audit-logs")
async def list_audit_logs(
    current_user: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(AuditLog).order_by(AuditLog.created_at.desc()).limit(100)
    if current_user.organization_id:
        stmt = stmt.where(AuditLog.organization_id == current_user.organization_id)
    res = await db.execute(stmt)
    logs = res.scalars().all()
    return logs
