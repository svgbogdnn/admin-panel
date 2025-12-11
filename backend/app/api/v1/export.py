from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.attendance import Attendance
from app.models.lesson import Lesson
from app.models.user import User
from app.schemas.attendance import AttendanceRead

router = APIRouter(prefix="/export", tags=["export"])


@router.get("/attendance", response_model=List[AttendanceRead])
def export_attendance(
    course_id: Optional[int] = None,
    lesson_id: Optional[int] = None,
    student_id: Optional[int] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[AttendanceRead]:
    query = db.query(Attendance)
    if lesson_id is not None:
        query = query.filter(Attendance.lesson_id == lesson_id)
    if student_id is not None:
        query = query.filter(Attendance.student_id == student_id)
    if course_id is not None or from_date is not None or to_date is not None:
        query = query.join(Lesson, Attendance.lesson_id == Lesson.id)
        if course_id is not None:
            query = query.filter(Lesson.course_id == course_id)
        if from_date is not None:
            query = query.filter(Lesson.date >= from_date)
        if to_date is not None:
            query = query.filter(Lesson.date <= to_date)
    records = query.all()
    return records
