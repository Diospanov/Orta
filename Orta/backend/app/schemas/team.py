from datetime import datetime
from pydantic import BaseModel, Field, field_validator
from app.models.enums import TeamRole, TeamStatus


class TeamCreateSchema(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=1000)
    category: str | None = Field(default=None, max_length=100)

    max_members: int = Field(default=10, ge=1)
    is_public: bool = True

    conditions_to_join: list[str] = Field(default_factory=list)
    communication_method: str | None = Field(default=None, max_length=100)
    meeting_frequency: str | None = Field(default=None, max_length=100)
    timezone: str | None = Field(default=None, max_length=100)
    collaboration_method: str | None = Field(default=None, max_length=100)

    @field_validator("conditions_to_join")
    @classmethod
    def clean_conditions(cls, values: list[str]) -> list[str]:
        return [item.strip() for item in values if item and item.strip()]


class TeamUpdateSchema(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = Field(default=None, max_length=1000)
    category: str | None = Field(default=None, max_length=100)

    max_members: int | None = Field(default=None, ge=1)
    is_public: bool | None = None

    conditions_to_join: list[str] | None = None
    communication_method: str | None = Field(default=None, max_length=100)
    meeting_frequency: str | None = Field(default=None, max_length=100)
    timezone: str | None = Field(default=None, max_length=100)
    collaboration_method: str | None = Field(default=None, max_length=100)

    status: TeamStatus | None = None

    @field_validator("conditions_to_join")
    @classmethod
    def clean_conditions(cls, values: list[str] | None) -> list[str] | None:
        if values is None:
            return None
        return [item.strip() for item in values if item and item.strip()]


class TeamResponse(BaseModel):
    id: int
    name: str
    description: str | None
    category: str | None

    owner_id: int
    owner_name: str | None

    max_members: int
    member_count: int
    is_public: bool

    conditions_to_join: list[str] = Field(default_factory=list)
    communication_method: str | None = None
    meeting_frequency: str | None = None
    timezone: str | None = None
    collaboration_method: str | None = None

    status: TeamStatus
    created_at: datetime
    is_member: bool = False

    model_config = {"from_attributes": True}


class TeamMemberResponse(BaseModel):
    id: int
    user_id: int
    team_id: int
    role: TeamRole
    joined_at: datetime

    model_config = {"from_attributes": True}


class MemberRoleUpdateSchema(BaseModel):
    role: TeamRole