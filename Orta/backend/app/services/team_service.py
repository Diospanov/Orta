from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import ensure_team_manager, ensure_team_owner, get_team_membership
from app.models.enums import JoinRequestStatus, TeamRole, TeamStatus, UserRole
from app.models.join_req import JoinRequest
from app.models.team import Team
from app.models.team_member import TeamMember
from app.models.user import User
from app.schemas.team import TeamCreateSchema, TeamUpdateSchema, TeamResponse


class TeamService:
    async def _build_team_response(
        self,
        db: AsyncSession,
        team: Team,
        current_user: User | None = None,
    ) -> TeamResponse:
        member_count_result = await db.execute(
            select(func.count(TeamMember.id)).where(TeamMember.team_id == team.id)
        )
        member_count = member_count_result.scalar_one()

        is_member = False
        if current_user:
            membership_result = await db.execute(
                select(TeamMember).where(
                    TeamMember.team_id == team.id,
                    TeamMember.user_id == current_user.id,
                )
            )
            is_member = membership_result.scalar_one_or_none() is not None

        owner_name = team.owner.username if team.owner else None

        return TeamResponse(
            id=team.id,
            name=team.name,
            description=team.description,
            category=team.category,
            owner_id=team.owner_id,
            owner_name=owner_name,
            max_members=team.max_members,
            member_count=member_count,
            is_public=team.is_public,
            conditions_to_join=team.conditions_to_join or [],
            communication_method=team.communication_method,
            meeting_frequency=team.meeting_frequency,
            timezone=team.timezone,
            collaboration_method=team.collaboration_method,
            status=team.status,
            created_at=team.created_at,
            is_member=is_member,
        )

    async def _get_team_model(self, db: AsyncSession, team_id: int) -> Team:
        result = await db.execute(
            select(Team)
            .options(selectinload(Team.owner))
            .where(Team.id == team_id)
        )
        team = result.scalar_one_or_none()

        if not team:
            raise HTTPException(status_code=404, detail="Team tabylmad")

        return team

    async def create_team(self, db: AsyncSession, current_user: User, data: TeamCreateSchema):
        existing_team = await db.execute(select(Team).where(Team.name == data.name))
        if existing_team.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Team with this name already exists")

        cleaned_conditions = [item.strip() for item in data.conditions_to_join if item.strip()]

        team = Team(
            name=data.name,
            description=data.description,
            category=data.category,
            owner_id=current_user.id,
            max_members=data.max_members,
            is_public=data.is_public,
            conditions_to_join=cleaned_conditions,
            communication_method=data.communication_method,
            meeting_frequency=data.meeting_frequency,
            timezone=data.timezone,
            collaboration_method=data.collaboration_method,
        )
        db.add(team)
        await db.flush()

        membership = TeamMember(
            user_id=current_user.id,
            team_id=team.id,
            role=TeamRole.OWNER,
        )
        db.add(membership)

        await db.commit()
        await db.refresh(team, attribute_names=["owner"])
        return await self._build_team_response(db, team, current_user)

    async def update_team(
        self,
        db: AsyncSession,
        current_user: User,
        team_id: int,
        data: TeamUpdateSchema,
    ):
        team = await self._get_team_model(db, team_id)

        if team.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Sende permission jok updateqa")

        update_data = data.model_dump(exclude_unset=True)

        if "name" in update_data and update_data["name"] != team.name:
            existing_team = await db.execute(
                select(Team).where(
                    Team.name == update_data["name"],
                    Team.id != team.id,
                )
            )
            if existing_team.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="Team with this name already exists")

        if "conditions_to_join" in update_data and update_data["conditions_to_join"] is not None:
            update_data["conditions_to_join"] = [
                item.strip()
                for item in update_data["conditions_to_join"]
                if item and item.strip()
            ]

        for field, value in update_data.items():
            setattr(team, field, value)

        await db.commit()
        await db.refresh(team, attribute_names=["owner"])
        return await self._build_team_response(db, team, current_user)

    async def get_all_teams(
        self,
        db: AsyncSession,
        search: str | None = None,
        current_user: User | None = None,
    ):
        query = (
            select(Team)
            .options(selectinload(Team.owner))
            .where(Team.status == TeamStatus.ACTIVE)
        )

        if search:
            query = query.where(Team.name.ilike(f"%{search}%"))

        result = await db.execute(query)
        teams = result.scalars().all()

        return [
            await self._build_team_response(db, team, current_user)
            for team in teams
        ]
    

    async def get_my_teams(
        self,
        db: AsyncSession,
        current_user: User,
    ):
        result = await db.execute(
            select(Team)
            .join(TeamMember, TeamMember.team_id == Team.id)
            .options(selectinload(Team.owner))
            .where(TeamMember.user_id == current_user.id)
            .where(Team.status == TeamStatus.ACTIVE)
        )
        teams = result.scalars().unique().all()

        return [
            await self._build_team_response(db, team, current_user)
            for team in teams
        ]


    async def get_team_by_id(
        self,
        db: AsyncSession,
        team_id: int,
        current_user: User | None = None,
    ):
        result = await db.execute(
            select(Team)
            .options(selectinload(Team.owner))
            .where(Team.id == team_id)
        )
        team = result.scalar_one_or_none()

        if not team:
            raise HTTPException(status_code=404, detail="Team tabylmad")

        return await self._build_team_response(db, team, current_user)

    async def list_team_members(self, db: AsyncSession, team_id: int):
        await self.get_team_by_id(db, team_id)

        result = await db.execute(
            select(TeamMember).where(TeamMember.team_id == team_id)
        )
        return result.scalars().all()

    async def update_team(self, db: AsyncSession, current_user: User, team_id: int, data: TeamUpdateSchema):
        team = await self._get_team_model(db, team_id)

        if team.owner_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise HTTPException(status_code=403, detail="Sende permission jok updateqa")

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(team, field, value)

        await db.commit()
        await db.refresh(team, attribute_names=["owner"])
        return await self._build_team_response(db, team, current_user)

    async def join_team(self, db: AsyncSession, current_user: User, team_id: int):
        team = await self._get_team_model(db, team_id)

        member_result = await db.execute(
            select(TeamMember).where(
                TeamMember.user_id == current_user.id,
                TeamMember.team_id == team_id,
            )
        )
        existing_member = member_result.scalar_one_or_none()

        if existing_member:
            raise HTTPException(status_code=400, detail="Sen membersyn uzhe")

        members_count_result = await db.execute(
            select(func.count(TeamMember.id)).where(TeamMember.team_id == team_id)
        )
        members_count = members_count_result.scalar_one()

        if members_count >= team.max_members:
            raise HTTPException(status_code=400, detail="Team is full")

        if team.is_public:
            membership = TeamMember(
                user_id=current_user.id,
                team_id=team_id,
                role=TeamRole.MEMBER,
            )
            db.add(membership)
            await db.commit()
            await db.refresh(membership)
            return {"message": "Joined team successfully", "membership": membership}

        request_result = await db.execute(
            select(JoinRequest).where(
                JoinRequest.user_id == current_user.id,
                JoinRequest.team_id == team_id,
            )
        )
        existing_request = request_result.scalar_one_or_none()

        if existing_request:
            raise HTTPException(status_code=400, detail="Join request already bar")

        join_request = JoinRequest(
            user_id=current_user.id,
            team_id=team_id,
            status=JoinRequestStatus.PENDING,
        )
        db.add(join_request)
        await db.commit()
        await db.refresh(join_request)

        return {"message": "Join request sent", "join_request": join_request}

    async def leave_team(self, db: AsyncSession, current_user: User, team_id: int):
        team = await self._get_team_model(db, team_id)

        membership = await get_team_membership(db, current_user.id, team_id)
        if not membership:
            raise HTTPException(status_code=404, detail="Sen bul team member emessin")

        owner_count_result = await db.execute(
            select(func.count(TeamMember.id)).where(
                TeamMember.team_id == team_id,
                TeamMember.role == TeamRole.OWNER,
            )
        )
        owner_count = owner_count_result.scalar_one()

        if membership.role == TeamRole.OWNER and owner_count < 2:
            raise HTTPException(
                status_code=400,
                detail="Owner cannot leave the team without transferring ownership or deleting the team",
            )


        await db.delete(membership)
        await db.commit()

        return {"message": f"You left team '{team.name}'"}

    async def remove_member(
        self,
        db: AsyncSession,
        current_user: User,
        team_id: int,
        member_user_id: int,
    ):
        await self.get_team_by_id(db, team_id)

        current_membership = await get_team_membership(db, current_user.id, team_id)
        ensure_team_manager(current_membership)

        target_membership = await get_team_membership(db, member_user_id, team_id)
        if not target_membership:
            raise HTTPException(status_code=404, detail="Target member not found in team")

        if target_membership.role == TeamRole.OWNER:
            raise HTTPException(status_code=400, detail="Owner cannot be removed")

        if (
            current_membership.role == TeamRole.ADMIN
            and target_membership.role == TeamRole.ADMIN
        ):
            raise HTTPException(
                status_code=403,
                detail="Team admin cannot remove another admin",
            )

        await db.delete(target_membership)
        await db.commit()

        return {"message": "Member removed successfully"}

    async def update_member_role(
        self,
        db: AsyncSession,
        current_user: User,
        team_id: int,
        member_user_id: int,
        new_role: TeamRole,
    ):
        await self.get_team_by_id(db, team_id)

        current_membership = await get_team_membership(db, current_user.id, team_id)
        ensure_team_owner(current_membership)

        target_membership = await get_team_membership(db, member_user_id, team_id)
        if not target_membership:
            raise HTTPException(status_code=404, detail="Target member not found in team")

        if target_membership.role == TeamRole.OWNER:
            raise HTTPException(status_code=400, detail="Cannot change owner role this way")

        target_membership.role = new_role
        await db.commit()
        await db.refresh(target_membership)

        return target_membership


team_service = TeamService()