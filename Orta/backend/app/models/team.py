from datetime import datetime
from typing import List
from sqlalchemy import String, Text, Integer, Boolean, DateTime, ForeignKey, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base
from .enums import TeamStatus
from .user import User
from .team_member import TeamMember
from .join_req import JoinRequest

class Team(Base):
    __tablename__ = "teams"
    id:Mapped[int] = mapped_column(primary_key=True, index=True)
    owner_id:Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"),nullable=False)

    name:Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    description:Mapped[str | None] = mapped_column(Text, nullable=True)
    max_members:Mapped[int] = mapped_column(Integer, default=10, nullable=False)
    is_public:Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    status:Mapped[TeamStatus] = mapped_column(Enum(TeamStatus, name="team_status"),default=TeamStatus.ACTIVE,nullable=False)
    created_at:Mapped[datetime] = mapped_column(DateTime, default=datetime.now, nullable=False)
    updated_at:Mapped[datetime] = mapped_column(DateTime,default=datetime.now,onupdate=datetime.now,nullable=False)
    owner:Mapped["User"] = relationship(back_populates="owned_teams")
    members:Mapped[List["TeamMember"]] = relationship(back_populates="team", cascade="all, delete-orphan")
    join_requests:Mapped[List["JoinRequest"]] = relationship(back_populates="team",cascade="all, delete-orphan")