from datetime import datetime, date
from typing import Optional

from pydantic import BaseModel, confloat


class FeedbackBase(BaseModel):
    lesson_id: int
    student_id: int
    rating: confloat(ge=0, le=5)
    comment: Optional[str] = None
    is_hidden: bool = False


class FeedbackCreate(FeedbackBase):
    pass


class FeedbackUpdate(BaseModel):
    rating: Optional[confloat(ge=0, le=5)] = None
    comment: Optional[str] = None
    is_hidden: Optional[bool] = None


class FeedbackRead(FeedbackBase):
    id: int
    created_at: datetime
    student_name: Optional[str] = None
    course_name: Optional[str] = None
    lesson_topic: Optional[str] = None
    lesson_date: Optional[date] = None

    class Config:
        from_attributes = True
