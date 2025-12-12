from datetime import date
from fastapi import APIRouter, Depends, Query, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import csv
import io
import json

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.attendance import Attendance
from app.models.lesson import Lesson
from app.models.user import User
from app.schemas.attendance import AttendanceRead

router = APIRouter(prefix="/export", tags=["export"])


@router.get("/attendance")
def export_attendance(
    response_format: str = Query(..., regex="^(csv|json)$"),
    course_id: int = Query(None),
    student_id: int = Query(None),
    from_date: date = Query(None),
    to_date: date = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Attendance).join(User).join(Lesson)

    if course_id is not None:
        query = query.filter(Lesson.course_id == course_id)
    if student_id is not None:
        query = query.filter(Attendance.student_id == student_id)
    if from_date is not None:
        query = query.filter(Lesson.date >= from_date)
    if to_date is not None:
        query = query.filter(Lesson.date <= to_date)

    records = query.all()

    if response_format == "json":
        out = []
        for r in records:
            out.append({
                "ФИО студента": r.student.full_name or r.student.email,
                "Курс": r.lesson.course.name if r.lesson and r.lesson.course else "",
                "Дата занятия": str(r.lesson.date) if r.lesson else "",
                "Статус": r.status.value
            })
        return out

    # CSV формат:
    stream = io.StringIO()
    writer = csv.writer(stream)
    writer.writerow([
        "ФИО студента",
        "Курс",
        "Дата занятия",
        "Статус"
    ])

    for r in records:
        writer.writerow([
            r.student.full_name or r.student.email,
            r.lesson.course.name if r.lesson and r.lesson.course else "",
            r.lesson.date.isoformat() if r.lesson else "",
            r.status.value
        ])

    stream.seek(0)
    return StreamingResponse(
        iter([stream.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=attendance_export.csv"
        }
    )
