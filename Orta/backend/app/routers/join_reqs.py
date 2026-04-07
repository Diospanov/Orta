from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.schemas.join_req import JoinRequestResponse
from app.services.join_req_service import join_request_service

router = APIRouter(prefix="/join-requests", tags=["Join Requests"])

@router.get("/team/{team_id}", response_model=list[JoinRequestResponse])
async def get_team_requests(
    team_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await join_request_service.get_team_requests(db, current_user, team_id)

@router.post("/{request_id}/accept", response_model=JoinRequestResponse)
async def accept_request(
    request_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await join_request_service.accept_request(db, current_user, request_id)

@router.post("/{request_id}/reject", response_model=JoinRequestResponse)
async def reject_request(
    request_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await join_request_service.reject_request(db, current_user, request_id)