from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.auth import router as auth_router
from app.routers.join_reqs import router as join_request_router
from app.routers.teams import router as teams_router
from app.routers.user import router as users_router


app = FastAPI(title="Orta API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://orta-tau.vercel.app/",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users_router)
app.include_router(teams_router)
app.include_router(join_request_router)

print("CORS READY FOR:", [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://orta-tau.vercel.app",
])