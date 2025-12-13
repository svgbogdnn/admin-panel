from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_active: bool = True
    is_superuser: bool = False
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
    is_superuser: Optional[bool] = None
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
    role: str = "student"  # Computed: "admin", "teacher", or "student"

    class Config:
        from_attributes = True
