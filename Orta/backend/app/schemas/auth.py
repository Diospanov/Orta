from pydantic import BaseModel, EmailStr, Field


class RegisterSchema(BaseModel):
    username:str = Field(min_length=3, max_length=50)
    email:EmailStr
    password:str = Field(min_length=6, max_length=100)
    full_name:str | None = Field(default=None, max_length=100)


class LoginSchema(BaseModel):
    email:EmailStr
    password:str = Field(min_length=6, max_length=100)


class TokenResponse(BaseModel):
    access_token:str
    token_type:str = "bearer"