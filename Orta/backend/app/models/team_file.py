from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class TeamFile(Base):
    __tablename__ = "team_files"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)

    team_id: Mapped[int] = mapped_column(
        ForeignKey("teams.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    uploaded_by_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    filename: Mapped[str] = mapped_column(nullable=False)
    file_url: Mapped[str] = mapped_column(nullable=False)
    storage_path: Mapped[str] = mapped_column(nullable=False)

    file_type: Mapped[str | None] = mapped_column(nullable=True)
    file_size: Mapped[int | None] = mapped_column(nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    team = relationship("Team")
    uploaded_by = relationship("User")