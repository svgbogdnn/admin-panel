from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True
    role: str = "student"
    birthday: Optional[date] = None
    nationality: Optional[str] = None
    study_course: Optional[str] = None
    study_group: Optional[str] = None
    phone: Optional[str] = None
    social_links: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    role: Optional[str] = None
    password: Optional[str] = None
    birthday: Optional[date] = None
    nationality: Optional[str] = None
    study_course: Optional[str] = None
    study_group: Optional[str] = None
    phone: Optional[str] = None
    social_links: Optional[str] = None


class UserRead(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
