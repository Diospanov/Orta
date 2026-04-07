from fastapi import HTTPException
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import LoginSchema, RegisterSchema

class AuthService:
    async def register(self, db: AsyncSession, data: RegisterSchema):
        existing_user = await db.execute(select(User).where(or_(User.email == data.email, User.username == data.username)))
        existing_user = existing_user.scalar_one_or_none()
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")

        user = User(
            username=data.username,
            email=data.email,
            password_hash=hash_password(data.password),
            full_name=data.full_name,
        )

        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    async def login(self, db: AsyncSession, data: LoginSchema):
        result = await db.execute(select(User).where(User.email == data.email))
        user = result.scalar_one_or_none()

        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = create_access_token({"sub": str(user.id)})
        return {"access_token": token, "token_type": "bearer"}

auth_service = AuthService()