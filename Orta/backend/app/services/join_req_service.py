from datetime import datetime
from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.dependencies import ensure_team_manager, get_team_membership
from app.models.enums import JoinRequestStatus, TeamRole
from app.models.join_req import JoinRequest
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.user import User


class JoinRequestService:
    async def get_team_requests(self, db: AsyncSession, current_user: User, team_id: int):
        team_result = await db.execute(select(Team).where(Team.id == team_id))
        team = team_result.scalar_one_or_none()

        if not team:
            raise HTTPException(status_code=404, detail="Team not found")

        membership = await get_team_membership(db, current_user.id, team_id)
        ensure_team_manager(membership)

        result = await db.execute(
            select(JoinRequest).where(JoinRequest.team_id == team_id)
        )
        return result.scalars().all()

    async def accept_request(self, db: AsyncSession, current_user: User, request_id: int):
        result = await db.execute(select(JoinRequest).where(JoinRequest.id == request_id))
        join_request = result.scalar_one_or_none()

        if not join_request:
            raise HTTPException(status_code=404, detail="Join request not found")

        team_result = await db.execute(select(Team).where(Team.id == join_request.team_id))
        team = team_result.scalar_one_or_none()

        if not team:
            raise HTTPException(status_code=404, detail="Team not found")

        membership = await get_team_membership(db, current_user.id, team.id)
        ensure_team_manager(membership)

        if join_request.status != JoinRequestStatus.PENDING:
            raise HTTPException(status_code=400, detail="This request is already reviewed")

        existing_member_result = await db.execute(
            select(TeamMember).where(
                TeamMember.user_id == join_request.user_id,
                TeamMember.team_id == join_request.team_id,
            )
        )
        existing_member = existing_member_result.scalar_one_or_none()

        if existing_member:
            raise HTTPException(status_code=400, detail="User is already a team member")

        members_count_result = await db.execute(
            select(func.count(TeamMember.id)).where(TeamMember.team_id == team.id)
        )
        members_count = members_count_result.scalar_one()

        if members_count >= team.max_members:
            raise HTTPException(status_code=400, detail="Team is full")

        join_request.status = JoinRequestStatus.ACCEPTED
        join_request.reviewed_at = datetime.utcnow()

        new_member = TeamMember(
            user_id=join_request.user_id,
            team_id=join_request.team_id,
            role=TeamRole.MEMBER,
        )
        db.add(new_member)

        await db.commit()
        await db.refresh(join_request)
        return join_request

    async def reject_request(self, db: AsyncSession, current_user: User, request_id: int):
        result = await db.execute(select(JoinRequest).where(JoinRequest.id == request_id))
        join_request = result.scalar_one_or_none()

        if not join_request:
            raise HTTPException(status_code=404, detail="Join request not found")

        membership = await get_team_membership(db, current_user.id, join_request.team_id)
        ensure_team_manager(membership)

        if join_request.status != JoinRequestStatus.PENDING:
            raise HTTPException(status_code=400, detail="This request is already reviewed")

        join_request.status = JoinRequestStatus.REJECTED
        join_request.reviewed_at = datetime.utcnow()

        await db.commit()
        await db.refresh(join_request)
        return join_request


join_request_service = JoinRequestService()