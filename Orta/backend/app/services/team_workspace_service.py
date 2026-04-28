from pathlib import Path
from uuid import uuid4

from fastapi import HTTPException, UploadFile
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.models.team_goal import TeamGoal
from app.models.team_schedule import TeamScheduleEvent
from app.models.team_file import TeamFile
from app.models.user import User

from app.schemas.team_goal import TeamGoalCreate, TeamGoalUpdate
from app.schemas.team_schedule import TeamScheduleCreate, TeamScheduleUpdate

from app.services.supabase_storage_service import (
    upload_file_to_supabase,
    delete_file_from_supabase,
)


def make_safe_storage_path(team_id: int, original_filename: str | None) -> str:
    original_filename = original_filename or "uploaded_file"

    extension = Path(original_filename).suffix.lower()

    if len(extension) > 15:
        extension = ""

    safe_filename = f"{uuid4().hex}{extension}"

    return f"teams/{team_id}/{safe_filename}"


# -------------------------
# Goals
# -------------------------

async def get_goals(db: AsyncSession, team_id: int):
    result = await db.execute(
        select(TeamGoal)
        .where(TeamGoal.team_id == team_id)
        .order_by(TeamGoal.created_at.desc())
    )

    return result.scalars().all()


async def create_goal(
    db: AsyncSession,
    team_id: int,
    current_user: User,
    goal_data: TeamGoalCreate,
):
    goal = TeamGoal(
        team_id=team_id,
        created_by_id=current_user.id,
        title=goal_data.title,
        note=goal_data.note,
        priority=goal_data.priority,
    )

    db.add(goal)
    await db.commit()
    await db.refresh(goal)

    return goal


async def update_goal(
    db: AsyncSession,
    team_id: int,
    goal_id: int,
    goal_data: TeamGoalUpdate,
):
    result = await db.execute(
        select(TeamGoal).where(
            TeamGoal.id == goal_id,
            TeamGoal.team_id == team_id,
        )
    )
    goal = result.scalar_one_or_none()

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    update_data = goal_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(goal, key, value)

    await db.commit()
    await db.refresh(goal)

    return goal


async def delete_goal(
    db: AsyncSession,
    team_id: int,
    goal_id: int,
):
    result = await db.execute(
        select(TeamGoal).where(
            TeamGoal.id == goal_id,
            TeamGoal.team_id == team_id,
        )
    )
    goal = result.scalar_one_or_none()

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    await db.delete(goal)
    await db.commit()


# -------------------------
# Schedule
# -------------------------

async def get_schedule(db: AsyncSession, team_id: int):
    result = await db.execute(
        select(TeamScheduleEvent)
        .where(TeamScheduleEvent.team_id == team_id)
        .order_by(TeamScheduleEvent.created_at.desc())
    )

    return result.scalars().all()


async def create_schedule_event(
    db: AsyncSession,
    team_id: int,
    current_user: User,
    event_data: TeamScheduleCreate,
):
    event = TeamScheduleEvent(
        team_id=team_id,
        created_by_id=current_user.id,
        title=event_data.title,
        date_time=event_data.date_time,
        location=event_data.location,
        note=event_data.note,
    )

    db.add(event)
    await db.commit()
    await db.refresh(event)

    return event


async def update_schedule_event(
    db: AsyncSession,
    team_id: int,
    event_id: int,
    event_data: TeamScheduleUpdate,
):
    result = await db.execute(
        select(TeamScheduleEvent).where(
            TeamScheduleEvent.id == event_id,
            TeamScheduleEvent.team_id == team_id,
        )
    )
    event = result.scalar_one_or_none()

    if not event:
        raise HTTPException(status_code=404, detail="Schedule event not found")

    update_data = event_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(event, key, value)

    await db.commit()
    await db.refresh(event)

    return event


async def delete_schedule_event(
    db: AsyncSession,
    team_id: int,
    event_id: int,
):
    result = await db.execute(
        select(TeamScheduleEvent).where(
            TeamScheduleEvent.id == event_id,
            TeamScheduleEvent.team_id == team_id,
        )
    )
    event = result.scalar_one_or_none()

    if not event:
        raise HTTPException(status_code=404, detail="Schedule event not found")

    await db.delete(event)
    await db.commit()


# -------------------------
# Files
# -------------------------

async def get_files(db: AsyncSession, team_id: int):
    result = await db.execute(
        select(TeamFile)
        .where(TeamFile.team_id == team_id)
        .order_by(TeamFile.created_at.desc())
    )

    return result.scalars().all()


async def upload_file(
    db: AsyncSession,
    team_id: int,
    current_user: User,
    file: UploadFile,
):
    original_filename = file.filename or "uploaded_file"
    storage_path = make_safe_storage_path(team_id, original_filename)

    file_bytes = await file.read()
    file_size = len(file_bytes)

    public_url = upload_file_to_supabase(
        bucket=settings.SUPABASE_BUCKET,
        storage_path=storage_path,
        file_bytes=file_bytes,
        content_type=file.content_type,
    )

    file_record = TeamFile(
        team_id=team_id,
        uploaded_by_id=current_user.id,
        filename=original_filename,
        file_url=public_url,
        storage_path=storage_path,
        file_type=file.content_type,
        file_size=file_size,
    )

    db.add(file_record)
    await db.commit()
    await db.refresh(file_record)

    return file_record


async def delete_file(
    db: AsyncSession,
    team_id: int,
    file_id: int,
):
    result = await db.execute(
        select(TeamFile).where(
            TeamFile.id == file_id,
            TeamFile.team_id == team_id,
        )
    )

    file_record = result.scalar_one_or_none()

    if not file_record:
        raise HTTPException(status_code=404, detail="File not found")

    delete_file_from_supabase(
        bucket=settings.SUPABASE_BUCKET,
        storage_path=file_record.storage_path,
    )

    await db.delete(file_record)
    await db.commit()