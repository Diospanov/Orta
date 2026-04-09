from contextlib import asynccontextmanager
from fastapi import FastAPI
from app.core.database import engine
from app.models.base import Base
from app.models import user, team, team_member, join_req
from app.routers.auth import router as auth_router
from app.routers.join_reqs import router as join_request_router
from app.routers.teams import router as teams_router
from app.routers.user import router as users_router
from fastapi.middleware.cors import CORSMiddleware

@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="Orta API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(teams_router)
app.include_router(join_request_router)


