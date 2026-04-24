from typing import Annotated
from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.ws_manager import team_chat_manager
from app.core.dependencies import get_current_user, get_current_user_optional, get_user_from_websocket_token
from app.models.user import User
from app.schemas.team_chat import TeamMessageResponse
from app.schemas.team import (
    MemberRoleUpdateSchema,
    TeamCreateSchema,
    TeamMemberResponse,
    TeamResponse,
    TeamUpdateSchema,
    TeamMemberDetailsResponse,
)
from app.services.team_service import team_service
from app.services.team_chat_service import team_chat_service


router = APIRouter(prefix="/teams", tags=["Teams"])

@router.post("/", response_model=TeamResponse)
async def create_team(data: TeamCreateSchema,db: Annotated[AsyncSession, Depends(get_db)],current_user: Annotated[User, Depends(get_current_user)],):
    return await team_service.create_team(db, current_user, data)

@router.get("/", response_model=list[TeamResponse])
async def get_teams(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User | None, Depends(get_current_user_optional)],
    search: str | None = Query(default=None),
):
    return await team_service.get_all_teams(db, search, current_user)


@router.get("/me", response_model=list[TeamResponse])
async def get_my_teams(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await team_service.get_my_teams(db, current_user)


@router.get("/{team_id}", response_model=TeamResponse)
async def get_team(
    team_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User | None, Depends(get_current_user_optional)],
):
    return await team_service.get_team_by_id(db, team_id, current_user)


@router.patch("/{team_id}", response_model=TeamResponse)
async def update_team(
    team_id: int,
    data: TeamUpdateSchema,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await team_service.update_team(db, current_user, team_id, data)

@router.post("/{team_id}/join")
async def join_team(
    team_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await team_service.join_team(db, current_user, team_id)

@router.delete("/{team_id}/leave")
async def leave_team(
    team_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await team_service.leave_team(db, current_user, team_id)

@router.delete("/{team_id}/members/{member_user_id}")
async def remove_member(
    team_id: int,   
    member_user_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await team_service.remove_member(db, current_user, team_id, member_user_id)

@router.patch("/{team_id}/members/{member_user_id}/role", response_model=TeamMemberResponse)
async def update_member_role(
    team_id: int,
    member_user_id: int,
    data: MemberRoleUpdateSchema,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await team_service.update_member_role(
        db=db,
        current_user=current_user,
        team_id=team_id,
        member_user_id=member_user_id,
        new_role=data.role,
    )

@router.get("/{team_id}/workspace", response_model=TeamResponse)
async def get_team_workspace(
    team_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await team_service.get_team_workspace(db, current_user, team_id)


@router.get("/{team_id}/members", response_model=list[TeamMemberDetailsResponse])
async def get_team_members(
    team_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return await team_service.list_team_members_detailed(db, current_user, team_id)


@router.get("/{team_id}/messages", response_model=list[TeamMessageResponse])
async def get_team_messages(
    team_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await team_chat_service.get_team_messages(db, current_user, team_id)


@router.websocket("/{team_id}/ws")
async def team_chat_ws(
    websocket: WebSocket,
    team_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    token = websocket.query_params.get("token")
    user = await get_user_from_websocket_token(db, token)

    if not user:
        await websocket.close(code=1008)
        return

    try:
        await team_chat_service.ensure_member(db, user, team_id)
    except HTTPException:
        await websocket.close(code=1008)
        return

    await team_chat_manager.connect(team_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            content = str(data.get("content", "")).strip()

            if not content:
                await websocket.send_json({
                    "type": "error",
                    "detail": "Message cannot be empty",
                })
                continue

            message = await team_chat_service.create_message(
                db=db,
                current_user=user,
                team_id=team_id,
                content=content,
            )

            await team_chat_manager.broadcast(
                team_id,
                {
                    "type": "new_message",
                    "message": message,
                },
            )

    except WebSocketDisconnect:
        team_chat_manager.disconnect(team_id, websocket)
    except Exception:
        team_chat_manager.disconnect(team_id, websocket)
        try:
            await websocket.close()
        except Exception:
            pass