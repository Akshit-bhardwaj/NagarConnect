from datetime import datetime, timedelta, timezone
from typing import List
import uuid
from fastapi import APIRouter, Depends, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.exceptions import ForbiddenError, NotFoundError, ValidationError
from app.core.sse import broadcaster
from app.db.dependencies import get_db
from app.modules.auth.dependencies import get_current_user, require_citizen
from app.modules.users.models import User, CitizenProfile
from app.modules.users.schemas import CitizenProfileOut, CitizenProfileUpdate
from app.modules.complaints.models import (
    Complaint,
    ComplaintStatusHistory,
    ComplaintComment,
)
from app.modules.complaints.schemas import (
    ComplaintCreate,
    ComplaintOut,
    FeedbackReq,
    CommentCreateReq,
    StatusHistoryOut,
    CommentOut,
)
from app.modules.applications.models import (
    ServiceDefinition,
    ServiceApplication,
    ApplicationStatusHistory,
)
from app.modules.applications.schemas import (
    ApplicationCreate,
    ServiceApplicationOut,
)
from app.modules.notifications.models import Notification
from app.modules.notifications.schemas import NotificationOut
from app.modules.cities.models import City
from app.common.permissions import ComplaintStatus, ApplicationStatus

router = APIRouter(prefix="/citizen", tags=["Citizen Portal"])


def _format_complaint(c: Complaint) -> ComplaintOut:
    status_histories = []
    for h in c.status_history or []:
        if h.is_citizen_visible:
            status_histories.append(
                StatusHistoryOut(
                    id=h.id,
                    from_status=h.from_status,
                    to_status=h.to_status,
                    reason_or_remark=h.reason_or_remark,
                    is_citizen_visible=h.is_citizen_visible,
                    created_at=h.created_at,
                    changed_by_name=h.changed_by.email.split("@")[0] if h.changed_by else "System",
                )
            )

    public_comments = []
    for com in c.comments or []:
        if not com.is_internal_note:
            public_comments.append(
                CommentOut(
                    id=com.id,
                    comment=com.comment,
                    is_internal_note=com.is_internal_note,
                    created_at=com.created_at,
                    author_name=com.author.email.split("@")[0] if com.author else "Citizen",
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
        comments=public_comments,
        attachments=[],
    )


@router.get("/profile", response_model=CitizenProfileOut)
async def get_citizen_profile(
    current_user: User = Depends(require_citizen),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CitizenProfile).where(CitizenProfile.user_id == current_user.id)
    res = await db.execute(stmt)
    profile = res.scalar_one_or_none()
    if not profile:
        raise NotFoundError("Citizen Profile", current_user.id)
    return profile


@router.patch("/profile", response_model=CitizenProfileOut)
async def update_citizen_profile(
    req: CitizenProfileUpdate,
    current_user: User = Depends(require_citizen),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(CitizenProfile).where(CitizenProfile.user_id == current_user.id)
    res = await db.execute(stmt)
    profile = res.scalar_one_or_none()
    if not profile:
        raise NotFoundError("Citizen Profile", current_user.id)

    for field, val in req.model_dump(exclude_unset=True).items():
        setattr(profile, field, val)

    await db.commit()
    await db.refresh(profile)
    return profile


@router.post("/complaints", response_model=ComplaintOut, status_code=status.HTTP_201_CREATED)
async def submit_complaint(
    req: ComplaintCreate,
    current_user: User = Depends(require_citizen),
    db: AsyncSession = Depends(get_db),
):
    # Lookup city to derive organization
    city_res = await db.execute(select(City).where(City.id == req.city_id))
    city = city_res.scalar_one_or_none()
    if not city:
        raise ValidationError(f"Invalid city_id '{req.city_id}'")

    org_id = city.organization_id

    # Generate unique human-readable reference number
    count_res = await db.execute(select(func.count(Complaint.id)).where(Complaint.organization_id == org_id))
    total_count = count_res.scalar() or 0
    ref_no = f"CMP-{datetime.now().year}-{city.name[:3].upper()}-{total_count + 101:05d}"

    now = datetime.now(timezone.utc)
    sla_due = now + timedelta(hours=48)

    complaint = Complaint(
        reference_no=ref_no,
        organization_id=org_id,
        citizen_id=current_user.id,
        city_id=req.city_id,
        ward_id=req.ward_id,
        locality_id=req.locality_id,
        department_id=req.department_id,
        category=req.category,
        title=req.title,
        description=req.description,
        address_text=req.address_text,
        latitude=req.latitude,
        longitude=req.longitude,
        status=ComplaintStatus.SUBMITTED.value,
        priority=req.priority,
        sla_due_at=sla_due,
    )
    db.add(complaint)
    await db.flush()

    # Initial Status History
    status_entry = ComplaintStatusHistory(
        complaint_id=complaint.id,
        from_status="NONE",
        to_status=ComplaintStatus.SUBMITTED.value,
        changed_by_user_id=current_user.id,
        reason_or_remark="Grievance filed by citizen via NagarConnect Portal.",
        is_citizen_visible=True,
    )
    db.add(status_entry)

    # Citizen Notification
    notif = Notification(
        user_id=current_user.id,
        title="Grievance Submitted",
        message=f"Your complaint '{complaint.title}' has been registered with reference ID {ref_no}.",
        link=f"/citizen/complaints/{complaint.id}",
    )
    db.add(notif)
    await db.commit()

    await broadcaster.broadcast_to_user(
        str(current_user.id),
        "COMPLAINT_SUBMITTED",
        {
            "id": str(notif.id),
            "complaint_id": str(complaint.id),
            "reference_no": ref_no,
            "title": notif.title,
            "message": notif.message,
            "link": notif.link,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    )

    # Re-fetch populated
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
        .where(Complaint.id == complaint.id)
    )
    res = await db.execute(stmt)
    return _format_complaint(res.scalar_one())


@router.get("/complaints", response_model=List[ComplaintOut])
async def list_citizen_complaints(
    current_user: User = Depends(require_citizen),
    db: AsyncSession = Depends(get_db),
):
    # Enforce strict citizen isolation: ONLY current_user.id
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
        .where(Complaint.citizen_id == current_user.id)
        .order_by(Complaint.created_at.desc())
    )
    res = await db.execute(stmt)
    complaints = res.scalars().all()
    return [_format_complaint(c) for c in complaints]


@router.get("/complaints/{complaint_id}", response_model=ComplaintOut)
async def get_citizen_complaint(
    complaint_id: uuid.UUID,
    current_user: User = Depends(require_citizen),
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

    # Zero-trust verification: citizen cannot view another citizen's complaint
    if c.citizen_id != current_user.id:
        raise ForbiddenError("You are not authorized to view this grievance")

    return _format_complaint(c)


@router.post("/complaints/{complaint_id}/feedback")
async def give_complaint_feedback(
    complaint_id: uuid.UUID,
    req: FeedbackReq,
    current_user: User = Depends(require_citizen),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Complaint).where(Complaint.id == complaint_id)
    res = await db.execute(stmt)
    c = res.scalar_one_or_none()
    if not c or c.citizen_id != current_user.id:
        raise NotFoundError("Complaint", complaint_id)

    c.citizen_rating = req.rating
    c.citizen_feedback = req.feedback
    c.status = ComplaintStatus.CLOSED.value

    # Append to status history
    h = ComplaintStatusHistory(
        complaint_id=c.id,
        from_status=c.status,
        to_status=ComplaintStatus.CLOSED.value,
        changed_by_user_id=current_user.id,
        reason_or_remark=f"Citizen verified resolution and rated {req.rating}/5 stars.",
        is_citizen_visible=True,
    )
    db.add(h)
    await db.commit()

    return {"success": True, "message": "Feedback submitted and grievance closed."}


@router.post("/complaints/{complaint_id}/comments")
async def add_citizen_comment(
    complaint_id: uuid.UUID,
    req: CommentCreateReq,
    current_user: User = Depends(require_citizen),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Complaint).where(Complaint.id == complaint_id)
    res = await db.execute(stmt)
    c = res.scalar_one_or_none()
    if not c or c.citizen_id != current_user.id:
        raise NotFoundError("Complaint", complaint_id)

    comment = ComplaintComment(
        complaint_id=c.id,
        user_id=current_user.id,
        comment=req.comment,
        is_internal_note=False,
    )
    db.add(comment)
    await db.commit()
    return {"success": True, "message": "Comment posted successfully"}


@router.post("/applications", response_model=ServiceApplicationOut, status_code=status.HTTP_201_CREATED)
async def submit_service_application(
    req: ApplicationCreate,
    current_user: User = Depends(require_citizen),
    db: AsyncSession = Depends(get_db),
):
    srv_res = await db.execute(select(ServiceDefinition).where(ServiceDefinition.id == req.service_id))
    srv = srv_res.scalar_one_or_none()
    if not srv or not srv.is_active:
        raise NotFoundError("Service Definition", req.service_id)

    count_res = await db.execute(
        select(func.count(ServiceApplication.id)).where(ServiceApplication.organization_id == srv.organization_id)
    )
    total_count = count_res.scalar() or 0
    ref_no = f"APP-{datetime.now().year}-SRV-{total_count + 101:05d}"

    app = ServiceApplication(
        reference_no=ref_no,
        organization_id=srv.organization_id,
        service_id=srv.id,
        citizen_id=current_user.id,
        form_data=req.form_data,
        status=ApplicationStatus.SUBMITTED.value,
        remarks="Application submitted online by citizen.",
    )
    db.add(app)
    await db.flush()

    # History
    h = ApplicationStatusHistory(
        application_id=app.id,
        from_status="NONE",
        to_status=ApplicationStatus.SUBMITTED.value,
        changed_by_user_id=current_user.id,
        remarks="Online citizen submission.",
    )
    db.add(h)

    # Notification
    notif = Notification(
        user_id=current_user.id,
        title="Application Submitted",
        message=f"Your application for '{srv.title}' was submitted with reference {ref_no}.",
        link=f"/citizen/applications/{app.id}",
    )
    db.add(notif)
    await db.commit()

    await broadcaster.broadcast_to_user(
        str(current_user.id),
        "APPLICATION_SUBMITTED",
        {
            "id": str(notif.id),
            "application_id": str(app.id),
            "reference_no": ref_no,
            "title": notif.title,
            "message": notif.message,
            "link": notif.link,
            "created_at": datetime.now(timezone.utc).isoformat(),
        },
    )

    return ServiceApplicationOut(
        id=app.id,
        reference_no=app.reference_no,
        organization_id=app.organization_id,
        service_id=app.service_id,
        citizen_id=app.citizen_id,
        service_title=srv.title,
        form_data=app.form_data,
        status=app.status,
        remarks=app.remarks,
        created_at=app.created_at,
        updated_at=app.updated_at,
        documents=[],
    )


@router.get("/applications", response_model=List[ServiceApplicationOut])
async def list_citizen_applications(
    current_user: User = Depends(require_citizen),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(ServiceApplication)
        .options(selectinload(ServiceApplication.service_definition))
        .where(ServiceApplication.citizen_id == current_user.id)
        .order_by(ServiceApplication.created_at.desc())
    )
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


@router.get("/notifications", response_model=List[NotificationOut])
async def list_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
    )
    res = await db.execute(stmt)
    return list(res.scalars().all())


@router.patch("/notifications/{notif_id}/read")
async def mark_notification_read(
    notif_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Notification).where(Notification.id == notif_id, Notification.user_id == current_user.id)
    res = await db.execute(stmt)
    notif = res.scalar_one_or_none()
    if notif:
        notif.is_read = True
        await db.commit()
    return {"success": True}
