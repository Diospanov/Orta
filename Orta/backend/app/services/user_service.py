from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User
from app.schemas.user import UserUpdateSchema


class UserService:
    async def get_me(self, current_user: User) -> User:
        return current_user

    async def update_me(self,db: AsyncSession,current_user: User,data: UserUpdateSchema) -> User:
        if data.username and data.username != current_user.username:
            existing_user = await db.execute(
                select(User).where(User.username == data.username)
            )
            if existing_user.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="Username bos emes")

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(current_user, field, value)

        await db.commit()
        await db.refresh(current_user)
        return current_user

user_service = UserService()