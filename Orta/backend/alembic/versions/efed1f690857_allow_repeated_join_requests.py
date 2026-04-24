"""allow repeated join requests

Revision ID: efed1f690857
Revises: 7e324811400a
Create Date: 2026-04-24 21:20:51.079369

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'efed1f690857'
down_revision: Union[str, Sequence[str], None] = '7e324811400a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.drop_constraint(
        "uq_user_team_join_request",
        "join_requests",
        type_="unique",
    )


def downgrade():
    op.create_unique_constraint(
        "uq_user_team_join_request",
        "join_requests",
        ["user_id", "team_id"],
    )
