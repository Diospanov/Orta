from pydantic import BaseModel, Field, EmailStr
from typing import Annotated



class UserRegister(BaseModel):
    nickname: Annotated[str, Field(min_length=2, max_length=50, description="Nickname of user")]
    first_name: Annotated[str, Field(min_length=2, max_length=50, description="First name of user")]
    last_name: Annotated[str, Field(min_length=2, max_length=50, description="Last name of user")]
    email: EmailStr
    password: Annotated[str, Field(min_length=8, max_length=100, pattern=r"^(?=.*[A-Za-z])(?=.*\d).+$", description="Password of the user")]
    
class UserUpdate(BaseModel):
    nickname: Annotated[str, Field(None, min_length=2, max_length=50, description="Nickname of user")] = None
    first_name: Annotated[str|None, Field(None, min_length=2, max_length=50, description="First name of user")] = None
    last_name: Annotated[str|None, Field(None, min_length=2, max_length=50, description="Last name of user")] = None
    email: EmailStr = None


class UserLogin(BaseModel):
    nickname: Annotated[str, Field(min_length=2, max_length=50, description="Nickname of user")] = None
    password: Annotated[str, Field(min_length=8, max_length=100, pattern=r"^(?=.*[A-Za-z])(?=.*\d).+$", description="Password of the user")]


class UserResponse(BaseModel):
    id: int
    nickname: Annotated[str, Field(min_length=2, max_length=50, description="Nickname of user")]
    first_name: Annotated[str, Field(min_length=2, max_length=50, description="First name of user")]
    last_name: Annotated[str, Field(min_length=2, max_length=50, description="Last name of user")]
    email: EmailStr

class ChangePassword(BaseModel):
    old_password: Annotated[str, Field(min_length=8, max_length=100, pattern=r"^(?=.*[A-Za-z])(?=.*\d).+$", description="Old Password of the user")]
    new_password: Annotated[str, Field(min_length=8, max_length=100, pattern=r"^(?=.*[A-Za-z])(?=.*\d).+$", description="New Password of the user")]