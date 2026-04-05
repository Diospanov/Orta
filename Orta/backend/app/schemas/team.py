from datetime import datetime
from pydantic import BaseModel, Field

from app.models.enums import TeamRole, TeamStatus


class TeamCreateSchema(BaseModel):
    name:str = Field(min_length=2, max_length=100)
    description:str | None = Field(default=None, max_length=1000)
    max_members:int = Field(default=10, ge=1)
    is_public:bool = True


class TeamUpdateSchema(BaseModel):
    name:str | None = Field(default=None, min_length=2, max_length=100)
    description:str | None = Field(default=None, max_length=1000)
    max_members:int | None = Field(default=None, ge=1)
    is_public:bool | None = None
    status:TeamStatus | None = None


class TeamResponse(BaseModel):
    id:int
    name:str
    description:str | None
    owner_id:int
    max_members:int
    is_public:bool
    status:TeamStatus
    created_at:datetime

    model_config = {"from_attributes": True}


class TeamMemberResponse(BaseModel):
    id:int
    user_id:int
    team_id:int
    role:TeamRole
    joined_at:datetime

    model_config = {"from_attributes": True}