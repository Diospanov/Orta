from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.team_goal import TeamGoal
from app.models.team_schedule import TeamScheduleEvent
from app.models.team_file import TeamFile
from app.models.user import User
from app.core.dependencies import get_current_user

from app.core.config import settings
from app.services.supabase_storage_service import (
    upload_file_to_supabase,
    delete_file_from_supabase,
)

from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile, File

from app.schemas.team_goal import (
    TeamGoalCreate,
    TeamGoalUpdate,
    TeamGoalResponse,
)
from app.schemas.team_schedule import (
    TeamScheduleCreate,
    TeamScheduleUpdate,
    TeamScheduleResponse,
)
from app.schemas.team_file import (
    TeamFileResponse,
)

router = APIRouter(prefix="/teams", tags=["Team Workspace Features"])


def make_safe_storage_path(team_id: int, original_filename: str | None) -> str:
    original_filename = original_filename or "uploaded_file"

    extension = Path(original_filename).suffix.lower()

    if len(extension) > 15:
        extension = ""

    safe_filename = f"{uuid4().hex}{extension}"

    return f"teams/{team_id}/{safe_filename}"


async def ensure_team_member(
    db: AsyncSession,
    team_id: int,
    current_user: User,
):
    team_result = await db.execute(
        select(Team).where(Team.id == team_id)
    )
    team = team_result.scalar_one_or_none()

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found",
        )

    if team.owner_id == current_user.id:
        return team

    member_result = await db.execute(
        select(TeamMember).where(
            TeamMember.team_id == team_id,
            TeamMember.user_id == current_user.id,
        )
    )
    member = member_result.scalar_one_or_none()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team members can access this feature",
        )

    return team


# -------------------------
# Goals
# -------------------------

@router.get("/{team_id}/goals", response_model=list[TeamGoalResponse])
async def get_team_goals(
    team_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    await ensure_team_member(db, team_id, current_user)

    result = await db.execute(
        select(TeamGoal)
        .where(TeamGoal.team_id == team_id)
        .order_by(TeamGoal.created_at.desc())
    )

    return result.scalars().all()


@router.post("/{team_id}/goals", response_model=TeamGoalResponse, status_code=201)
async def create_team_goal(
    team_id: int,
    goal_data: TeamGoalCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    await ensure_team_member(db, team_id, current_user)

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


@router.patch("/{team_id}/goals/{goal_id}", response_model=TeamGoalResponse)
async def update_team_goal(
    team_id: int,
    goal_id: int,
    goal_data: TeamGoalUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    await ensure_team_member(db, team_id, current_user)

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


@router.delete("/{team_id}/goals/{goal_id}", status_code=204)
async def delete_team_goal(
    team_id: int,
    goal_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    await ensure_team_member(db, team_id, current_user)

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

    return None


# -------------------------
# Schedule
# -------------------------

@router.get("/{team_id}/schedule", response_model=list[TeamScheduleResponse])
async def get_team_schedule(
    team_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    await ensure_team_member(db, team_id, current_user)

    result = await db.execute(
        select(TeamScheduleEvent)
        .where(TeamScheduleEvent.team_id == team_id)
        .order_by(TeamScheduleEvent.created_at.desc())
    )

    return result.scalars().all()


@router.post("/{team_id}/schedule", response_model=TeamScheduleResponse, status_code=201)
async def create_team_schedule_event(
    team_id: int,
    event_data: TeamScheduleCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    await ensure_team_member(db, team_id, current_user)

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


@router.patch("/{team_id}/schedule/{event_id}", response_model=TeamScheduleResponse)
async def update_team_schedule_event(
    team_id: int,
    event_id: int,
    event_data: TeamScheduleUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    await ensure_team_member(db, team_id, current_user)

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


@router.delete("/{team_id}/schedule/{event_id}", status_code=204)
async def delete_team_schedule_event(
    team_id: int,
    event_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    await ensure_team_member(db, team_id, current_user)

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

    return None


# -------------------------
# Files with Supabase Storage
# -------------------------

@router.get("/{team_id}/files", response_model=list[TeamFileResponse])
async def get_team_files(
    team_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    await ensure_team_member(db, team_id, current_user)

    result = await db.execute(
        select(TeamFile)
        .where(TeamFile.team_id == team_id)
        .order_by(TeamFile.created_at.desc())
    )

    return result.scalars().all()


@router.post("/{team_id}/files", response_model=TeamFileResponse, status_code=201)
async def upload_team_file(
    team_id: int,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await ensure_team_member(db, team_id, current_user)

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


@router.delete("/{team_id}/files/{file_id}", status_code=204)
async def delete_team_file(
    team_id: int,
    file_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await ensure_team_member(db, team_id, current_user)

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

    return None