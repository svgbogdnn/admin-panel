from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from app.models.attendance import AttendanceStatus


class AttendanceBase(BaseModel):
    lesson_id: int
    student_id: int
    status: AttendanceStatus = AttendanceStatus.present
    comment: Optional[str] = None


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceUpdate(BaseModel):
    status: Optional[AttendanceStatus] = None
    comment: Optional[str] = None


class AttendanceRead(AttendanceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
