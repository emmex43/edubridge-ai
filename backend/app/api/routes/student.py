from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.database import get_db
from app.models.progress import Progress
from app.models.schemas import (
    ProgressItem,
    ProgressListResponse,
    ProgressRequest,
    ProgressResponse,
)
from app.models.user import User

router = APIRouter()


@router.get("/progress", response_model=ProgressListResponse)
def list_progress(
    module_id: Optional[str] = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Read back the authenticated student's progress.

    The API could previously only *write* progress, so the dashboard had no way
    to load real numbers and fell back to hardcoded mock data. Pass module_id to
    narrow it to one module.
    """
    query = db.query(Progress).filter(Progress.user_id == user.id)
    if module_id:
        query = query.filter(Progress.module_id == module_id)

    rows = query.order_by(Progress.module_id).all()

    return ProgressListResponse(
        status="success",
        progress=[
            ProgressItem(
                module_id=row.module_id,
                time_spent_seconds=row.time_spent_seconds,
                completion_percentage=row.completion_percentage,
                updated_at=row.updated_at,
            )
            for row in rows
        ],
    )


@router.put("/progress", response_model=ProgressResponse)
def update_progress(
    payload: ProgressRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    """Upsert this module's progress for the authenticated user.

    Identity comes from the Bearer token, never from the payload. The old code
    did `int(payload.student_id)`, which turned the README's own documented
    example ("student_id": "user_123") into a ValueError and a 500 — and the
    endpoint had no auth dependency at all, so anyone could write progress for
    any student id they liked.
    """
    db_progress = (
        db.query(Progress)
        .filter(Progress.user_id == user.id, Progress.module_id == payload.module_id)
        .first()
    )

    if db_progress:
        db_progress.time_spent_seconds = payload.time_spent_seconds
        db_progress.completion_percentage = payload.completion_percentage
    else:
        db_progress = Progress(
            user_id=user.id,
            module_id=payload.module_id,
            time_spent_seconds=payload.time_spent_seconds,
            completion_percentage=payload.completion_percentage,
        )
        db.add(db_progress)

    db.commit()
    db.refresh(db_progress)

    return ProgressResponse(
        status="success",
        module_id=db_progress.module_id,
        time_spent_seconds=db_progress.time_spent_seconds,
        completion_percentage=db_progress.completion_percentage,
    )
