from datetime import datetime
from typing import List
from sqlalchemy import String, Boolean, DateTime, Enum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base
from .enums import UserRole
from .team import Team
from .team_member import TeamMember
from .join_req import JoinRequest

class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(100), nullable=True)

    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role"),
        default=UserRole.USER,
        nullable=False
    )

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.now,
        onupdate=datetime.now,
        nullable=False
    )

    # юсердын тимасы
    owned_teams: Mapped[List["Team"]] = relationship(
        back_populates="owner",
        cascade="all, delete-orphan"
    )

    # че за мембер в тиме
    team_memberships: Mapped[List["TeamMember"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )

    # юсердын реквесттеры
    join_requests: Mapped[List["JoinRequest"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan"
    )