from datetime import datetime
from pydantic import BaseModel, ConfigDict


class TeamScheduleCreate(BaseModel):
    title: str
    date_time: datetime | None = None
    location: str | None = None
    note: str | None = None


class TeamScheduleUpdate(BaseModel):
    title: str | None = None
    date_time: datetime | None = None
    location: str | None = None
    note: str | None = None
    completed: bool | None = None


class TeamScheduleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    team_id: int
    created_by_id: int
    title: str
    date_time: datetime | None
    location: str | None
    note: str | None
    completed: bool
    created_at: datetime