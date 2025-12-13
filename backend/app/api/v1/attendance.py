from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, selectinload

from app.core.db import get_db
from app.core.security import get_current_user, require_admin, check_course_owner
from app.models.attendance import Attendance
from app.models.lesson import Lesson
from app.models.course import Course
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

    # Always join Lesson to filter by dates / course_id later, 
    # and for teacher filtering.
    query = query.join(Lesson, Attendance.lesson_id == Lesson.id)

    # Access control:
    # 1. Admin sees everything (no extra filter)
    # 2. Teachers see attendance only for their courses
    # 3. Students see only their own attendance records

    if not current_user.is_superuser:
        from app.core.security import is_teacher
        if is_teacher(current_user, db):
            # Teacher: filter to courses they own
            # Join Course to check teacher_id
            query = query.join(Course, Lesson.course_id == Course.id)
            query = query.filter(Course.teacher_id == current_user.id)
        else:
            # Student: filter to only their own records
            query = query.filter(Attendance.student_id == current_user.id)

    if lesson_id is not None:
        query = query.filter(Attendance.lesson_id == lesson_id)
    if student_id is not None:
        query = query.filter(Attendance.student_id == student_id)
    
    # Filters that depend on Lesson (already joined)
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
    
    # Students can only view their own attendance
    if not current_user.is_superuser:
        from app.core.security import is_teacher
        if not is_teacher(current_user, db) and record.student_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only view your own attendance",
            )
    
    return record


@router.post("/", response_model=AttendanceRead, status_code=status.HTTP_201_CREATED)
def create_attendance(
    attendance_in: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AttendanceRead:
    # Get the lesson to check course ownership
    lesson = db.get(Lesson, attendance_in.lesson_id)
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        )
    
    # Check permission: admin or course teacher
    if not check_course_owner(current_user, lesson.course_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to create attendance for this course",
        )
    
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
    
    # Get the lesson to check course ownership
    lesson = db.get(Lesson, record.lesson_id)
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        )
    
    # Check permission: admin or course teacher
    if not check_course_owner(current_user, lesson.course_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to edit attendance for this course",
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
    current_user: User = Depends(require_admin),  # Admin only
) -> None:
    record = db.get(Attendance, attendance_id)
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Attendance record not found",
        )
    db.delete(record)
    db.commit()
