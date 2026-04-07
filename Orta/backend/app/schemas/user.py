from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from app.models.enums import UserRole

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    full_name: str | None
    role: UserRole
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}

class UserUpdateSchema(BaseModel):
    username: str | None = Field(default=None, min_length=3, max_length=50)
    full_name: str | None = Field(default=None, max_length=100)