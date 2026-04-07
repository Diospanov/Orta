from typing import Annotated
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.auth import LoginSchema, RegisterSchema, TokenResponse
from app.schemas.user import UserResponse
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    data: RegisterSchema,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await auth_service.register(db, data)

@router.post("/login", response_model=TokenResponse)
async def login(
    data: LoginSchema,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    return await auth_service.login(db, data)