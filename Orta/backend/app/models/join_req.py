from datetime import datetime
from typing import TYPE_CHECKING
from sqlalchemy import DateTime, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base
from .enums import JoinRequestStatus
if TYPE_CHECKING:
    from .team import Team
    from .user import User

class JoinRequest(Base):
    __tablename__ = "join_requests"
    __table_args__ = (UniqueConstraint("user_id", "team_id", name="uq_user_team_join_request"),)

    id:Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id:Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"),nullable=False)
    team_id:Mapped[int] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"),nullable=False)
    status:Mapped[JoinRequestStatus] = mapped_column(Enum(JoinRequestStatus, name="join_request_status"),default=JoinRequestStatus.PENDING,nullable=False)
    requested_at:Mapped[datetime] = mapped_column(DateTime, default=datetime.now, nullable=False)
    reviewed_at:Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    user:Mapped["User"] = relationship(back_populates="join_requests")
    team:Mapped["Team"] = relationship(back_populates="join_requests")