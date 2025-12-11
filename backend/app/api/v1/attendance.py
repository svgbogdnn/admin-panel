# from datetime import date
# from typing import List, Optional

# from fastapi import APIRouter, Depends, HTTPException, status
# from sqlalchemy.orm import Session

# from app.core.db import get_db
# from app.core.security import get_current_user
# from app.models.attendance import Attendance
# from app.models.lesson import Lesson
# from app.models.user import User
# from app.schemas.attendance import AttendanceCreate, AttendanceRead, AttendanceUpdate

# router = APIRouter(prefix="/attendance", tags=["attendance"])


# @router.get("/", response_model=List[AttendanceRead])
# def list_attendance(
#     lesson_id: Optional[int] = None,
#     student_id: Optional[int] = None,
#     course_id: Optional[int] = None,
#     from_date: Optional[date] = None,
#     to_date: Optional[date] = None,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ) -> List[AttendanceRead]:
#     query = db.query(Attendance)
#     if lesson_id is not None:
#         query = query.filter(Attendance.lesson_id == lesson_id)
#     if student_id is not None:
#         query = query.filter(Attendance.student_id == student_id)
#     if course_id is not None or from_date is not None or to_date is not None:
#         query = query.join(Lesson, Attendance.lesson_id == Lesson.id)
#         if course_id is not None:
#             query = query.filter(Lesson.course_id == course_id)
#         if from_date is not None:
#             query = query.filter(Lesson.date >= from_date)
#         if to_date is not None:
#             query = query.filter(Lesson.date <= to_date)
#     records = query.all()
#     return records


# @router.get("/{attendance_id}", response_model=AttendanceRead)
# def get_attendance(
#     attendance_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ) -> AttendanceRead:
#     record = db.get(Attendance, attendance_id)
#     if not record:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance record not found")
#     return record


# @router.post("/", response_model=AttendanceRead, status_code=status.HTTP_201_CREATED)
# def create_attendance(
#     attendance_in: AttendanceCreate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ) -> AttendanceRead:
#     record = Attendance(
#         lesson_id=attendance_in.lesson_id,
#         student_id=attendance_in.student_id,
#         status=attendance_in.status,
#         comment=attendance_in.comment,
#     )
#     db.add(record)
#     db.commit()
#     db.refresh(record)
#     return record


# @router.patch("/{attendance_id}", response_model=AttendanceRead)
# def update_attendance(
#     attendance_id: int,
#     attendance_in: AttendanceUpdate,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ) -> AttendanceRead:
#     record = db.get(Attendance, attendance_id)
#     if not record:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance record not found")
#     if attendance_in.status is not None:
#         record.status = attendance_in.status
#     if attendance_in.comment is not None:
#         record.comment = attendance_in.comment
#     db.add(record)
#     db.commit()
#     db.refresh(record)
#     return record


# @router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
# def delete_attendance(
#     attendance_id: int,
#     db: Session = Depends(get_db),
#     current_user: User = Depends(get_current_user),
# ) -> None:
#     record = db.get(Attendance, attendance_id)
#     if not record:
#         raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Attendance record not found")
#     db.delete(record)
#     db.commit()

from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.attendance import Attendance
from app.models.lesson import Lesson
from app.models.user import User
from app.schemas.attendance import AttendanceCreate, AttendanceRead, AttendanceUpdate

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.get("/", response_model=List[AttendanceRead])
def list_attendance(
    lesson_id: Optional[int] = None,
    student_id: Optional[int] = None,
    course_id: Optional[int] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[AttendanceRead]:
    query = (
        db.query(Attendance)
        .options(
            selectinload(Attendance.student),
            selectinload(Attendance.lesson).selectinload(Lesson.course),
        )
    )

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

    records = query.order_by(Attendance.id).all()
    return records


@router.get("/{attendance_id}", response_model=AttendanceRead)
def get_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AttendanceRead:
    record = db.get(Attendance, attendance_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found",
        )
    return record


@router.post("/", response_model=AttendanceRead, status_code=status.HTTP_201_CREATED)
def create_attendance(
    attendance_in: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AttendanceRead:
    record = Attendance(
        lesson_id=attendance_in.lesson_id,
        student_id=attendance_in.student_id,
        status=attendance_in.status,
        comment=attendance_in.comment,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.patch("/{attendance_id}", response_model=AttendanceRead)
def update_attendance(
    attendance_id: int,
    attendance_in: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AttendanceRead:
    record = db.get(Attendance, attendance_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found",
        )
    if attendance_in.status is not None:
        record.status = attendance_in.status
    if attendance_in.comment is not None:
        record.comment = attendance_in.comment
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.delete("/{attendance_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    record = db.get(Attendance, attendance_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found",
        )
    db.delete(record)
    db.commit()
