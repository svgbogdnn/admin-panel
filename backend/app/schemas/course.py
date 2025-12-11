from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class CourseBase(BaseModel):
    name: str
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: bool = True
    teacher_id: Optional[int] = None


class CourseCreate(CourseBase):
    pass


class CourseUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None
    teacher_id: Optional[int] = None


class CourseRead(CourseBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
