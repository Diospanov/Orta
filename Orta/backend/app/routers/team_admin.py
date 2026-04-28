from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.user import User
from app.models.enums import TeamRole
from app.core.dependencies import get_current_user 


router = APIRouter(prefix="/teams", tags=["Team Admin"])


class TeamUpdateRequest(BaseModel):
    name: str | None = None
    description: str | None = None
    category: str | None = None
    max_members: int | None = None
    is_public: bool | None = None
    conditions_to_join: list[str] | None = None
    communication_method: str | None = None
    meeting_frequency: str | None = None
    timezone: str | None = None
    collaboration_method: str | None = None


class TeamRoleUpdateRequest(BaseModel):
    role: TeamRole

class TransferOwnershipRequest(BaseModel):
    new_owner_member_id: int

async def ensure_team_owner(
    db: AsyncSession,
    team_id: int,
    current_user: User,
) -> Team:
    result = await db.execute(
        select(Team).where(Team.id == team_id)
    )
    team = result.scalar_one_or_none()

    if not team:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Team not found",
        )

    if team.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only team owner can manage this team",
        )

    return team


@router.patch("/{team_id}")
async def update_team_by_owner(
    team_id: int,
    team_data: TeamUpdateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    team = await ensure_team_owner(db, team_id, current_user)

    update_data = team_data.model_dump(exclude_unset=True)

    if "name" in update_data and update_data["name"]:
        existing_result = await db.execute(
            select(Team).where(
                Team.name == update_data["name"],
                Team.id != team_id,
            )
        )
        existing_team = existing_result.scalar_one_or_none()

        if existing_team:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Team name already exists",
            )

    if "max_members" in update_data and update_data["max_members"] is not None:
        if update_data["max_members"] < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Max members must be at least 1",
            )

    for key, value in update_data.items():
        setattr(team, key, value)

    await db.commit()
    await db.refresh(team)

    return team


@router.patch("/{team_id}/members/{member_id}/role")
async def update_team_member_role(
    team_id: int,
    member_id: int,
    role_data: TeamRoleUpdateRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    team = await ensure_team_owner(db, team_id, current_user)

    result = await db.execute(
        select(TeamMember).where(
            TeamMember.id == member_id,
            TeamMember.team_id == team_id,
        )
    )
    member = result.scalar_one_or_none()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found",
        )

    if member.user_id == team.owner_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change the owner's role",
        )

    member.role = role_data.role

    await db.commit()
    await db.refresh(member)

    return member


@router.delete("/{team_id}/members/{member_id}", status_code=204)
async def remove_team_member(
    team_id: int,
    member_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    team = await ensure_team_owner(db, team_id, current_user)

    result = await db.execute(
        select(TeamMember).where(
            TeamMember.id == member_id,
            TeamMember.team_id == team_id,
        )
    )
    member = result.scalar_one_or_none()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member not found",
        )

    if member.user_id == team.owner_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove the team owner",
        )

    await db.delete(member)
    await db.commit()

    return None

@router.patch("/{team_id}/transfer-ownership")
async def transfer_team_ownership(
    team_id: int,
    transfer_data: TransferOwnershipRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    team = await ensure_team_owner(db, team_id, current_user)

    new_owner_result = await db.execute(
        select(TeamMember).where(
            TeamMember.id == transfer_data.new_owner_member_id,
            TeamMember.team_id == team_id,
        )
    )
    new_owner_member = new_owner_result.scalar_one_or_none()

    if not new_owner_member:
        raise HTTPException(status_code=404, detail="New owner member not found")

    if new_owner_member.user_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You are already the owner",
        )

    old_owner_result = await db.execute(
        select(TeamMember).where(
            TeamMember.team_id == team_id,
            TeamMember.user_id == current_user.id,
        )
    )
    old_owner_member = old_owner_result.scalar_one_or_none()

    team.owner_id = new_owner_member.user_id

    if old_owner_member:
        old_owner_member.role = TeamRole.MEMBER

    new_owner_member.role = TeamRole.OWNER

    await db.commit()
    await db.refresh(team)

    return {
        "message": "Ownership transferred successfully",
        "new_owner_id": new_owner_member.user_id,
    }