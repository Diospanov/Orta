from datetime import datetime
from pydantic import BaseModel, ConfigDict


class TeamFileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    team_id: int
    uploaded_by_id: int
    filename: str
    file_url: str
    storage_path: str
    file_type: str | None
    file_size: int | None
    created_at: datetime