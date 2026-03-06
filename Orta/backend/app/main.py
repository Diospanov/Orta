from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Response
from authx import AuthX, AuthXConfig
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import Mapped, mapped_column, relationship, DeclarativeBase
from sqlmodel import SQLModel, Field, Relationship, select

app = FastAPI()

engine = create_async_engine('sqlite+aiosqlite:///users.db')

new_session = async_sessionmaker(engine, expire_on_commit=False)

async def get_session():
    async with new_session() as session:
        yield session

SessionDep = Annotated[AsyncSession, Depends(get_session)]


class Base(DeclarativeBase):
    pass

class UserModel(Base):
    __tablename__ = 'users'

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str]
    password: Mapped[str]

@app.post('/setup_database')
async def setup_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    return {"ok":True}





config = AuthXConfig()
config.JWT_SECRET_KEY = "SECRET_KEY"
config.JWT_ACCESS_COOKIE_NAME = "my_access_token"
config.JWT_TOKEN_LOCATION = ["cookies"]

security = AuthX(config=config)

class UserLoginSchema(BaseModel):
    username: str
    password: str


class UserAddSchema(BaseModel):
    username: str
    password: str

class UserSchema(UserAddSchema):
    id:int



@app.post('/users')
async def add_users(data:UserAddSchema, session: SessionDep):
    user = UserModel(
        username=data.username,
        password=data.password,
    )
    session.add(user)
    await session.commit()
    return {"ok":True}

@app.get('/users')
async def get_users(session: SessionDep):
    res = await session.execute(select(UserModel))
    return res.scalars().all()



@app.post('/login')
async def login(creds: UserLoginSchema, session: SessionDep, response: Response):
    users = await session.execute(select(UserModel))
    users = users.scalars().all()
    
    for user in users:
        if creds.username == user.username and creds.password == user.password:
            token = security.create_access_token(data={"user_id": user.id}) 
            response.set_cookie(config.JWT_ACCESS_COOKIE_NAME, token, httponly=True)
            return {"access_token": token}
    raise HTTPException(status_code=401, detail="Incorrect credentials")

@app.get('/protected', dependencies=[Depends(security.access_token_required)])
async def protected():
    return{"data": "Secret"}