from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.dependencies import get_team_membership
from app.models.team import Team
from app.models.team_message import TeamMessage
from app.models.user import User


class TeamChatService:
    async def ensure_member(self, db: AsyncSession, current_user: User, team_id: int):
        team_result = await db.execute(select(Team).where(Team.id == team_id))
        team = team_result.scalar_one_or_none()

        if not team:
            raise HTTPException(status_code=404, detail="Team not found")

        membership = await get_team_membership(db, current_user.id, team_id)
        if not membership:
            raise HTTPException(
                status_code=403,
                detail="Only team members can access this chat",
            )

        return team

    async def get_team_messages(
        self,
        db: AsyncSession,
        current_user: User,
        team_id: int,
        limit: int = 50,
    ):
        await self.ensure_member(db, current_user, team_id)

        safe_limit = max(1, min(limit, 100))

        result = await db.execute(
            select(TeamMessage)
            .options(selectinload(TeamMessage.user))
            .where(TeamMessage.team_id == team_id)
            .order_by(TeamMessage.created_at.desc())
            .limit(safe_limit)
        )
        messages = result.scalars().all()
        messages = list(reversed(messages))

        return [
            {
                "id": message.id,
                "team_id": message.team_id,
                "user_id": message.user_id,
                "username": message.user.username if message.user else None,
                "content": message.content,
                "created_at": message.created_at,
            }
            for message in messages
        ]

    async def create_message(
        self,
        db: AsyncSession,
        current_user: User,
        team_id: int,
        content: str,
    ):
        await self.ensure_member(db, current_user, team_id)

        cleaned = (content or "").strip()
        if not cleaned:
            raise HTTPException(status_code=400, detail="Message cannot be empty")

        if len(cleaned) > 2000:
            raise HTTPException(status_code=400, detail="Message is too long")

        message = TeamMessage(
            team_id=team_id,
            user_id=current_user.id,
            content=cleaned,
        )
        db.add(message)
        await db.commit()
        await db.refresh(message)

        return {
            "id": message.id,
            "team_id": message.team_id,
            "user_id": current_user.id,
            "username": current_user.username,
            "content": message.content,
            "created_at": message.created_at.isoformat(),
        }


team_chat_service = TeamChatService()