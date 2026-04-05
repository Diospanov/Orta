from datetime import datetime
from sqlalchemy import DateTime, ForeignKey, Enum, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base
from .enums import TeamRole
from .user import User
from .team import Team

class TeamMember(Base):
    __tablename__ = "team_members"
    __table_args__ = (UniqueConstraint("user_id", "team_id", name="uq_user_team_membership"))
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"),nullable=False)
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    # роль в команде
    role: Mapped[TeamRole] = mapped_column(Enum(TeamRole, name="team_role"),default=TeamRole.MEMBER,nullable=False)

    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, nullable=False)
    user: Mapped["User"] = relationship(back_populates="team_memberships")
    team: Mapped["Team"] = relationship(back_populates="members")