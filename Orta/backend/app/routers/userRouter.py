from typing import AsyncGenerator, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel.ext.asyncio.session import AsyncSession

router = APIRouter(prefix='/users', tags=['users'])


