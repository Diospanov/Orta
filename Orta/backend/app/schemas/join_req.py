from datetime import datetime
from pydantic import BaseModel

from app.models.enums import JoinRequestStatus


class JoinRequestResponse(BaseModel):
    id:int
    user_id:int
    team_id:int
    status:JoinRequestStatus
    requested_at:datetime
    reviewed_at:datetime | None

    model_config = {"from_attributes": True}