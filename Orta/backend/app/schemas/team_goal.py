from datetime import datetime
from pydantic import BaseModel, ConfigDict


class TeamGoalCreate(BaseModel):
    title: str
    note: str | None = None
    priority: str = "Medium"


class TeamGoalUpdate(BaseModel):
    title: str | None = None
    note: str | None = None
    priority: str | None = None
    completed: bool | None = None


class TeamGoalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    team_id: int
    created_by_id: int
    title: str
    note: str | None
    priority: str
    completed: bool
    created_at: datetime