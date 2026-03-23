from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from sqlalchemy.orm import sessionmaker
from .config import settings
from Orta.backend.app.models.user import Base

engine = create_async_engine(settings.DATABASE_URL, echo=True, pool_pre_ping=True, pool_recycle=300)

async_session = async_sessionmaker(engine, expire_on_commit=False)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)