from datetime import date, time, datetime
from typing import Optional

from pydantic import BaseModel


class LessonBase(BaseModel):
    course_id: int
    topic: str
    date: date
    room: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None


class LessonCreate(LessonBase):
    pass


class LessonUpdate(BaseModel):
    topic: Optional[str] = None
    date: Optional[date] = None
    room: Optional[str] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None


class LessonRead(LessonBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
