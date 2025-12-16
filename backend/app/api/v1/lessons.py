from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_user, require_admin_or_teacher, check_course_owner, ROLE_TEACHER
from app.models.course import Course
from app.models.lesson import Lesson
from app.models.user import User
from app.schemas.lesson import LessonCreate, LessonRead, LessonUpdate

router = APIRouter(prefix="/lessons", tags=["lessons"])


@router.get("/", response_model=List[LessonRead])
def list_lessons(
    course_id: Optional[int] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[LessonRead]:
    query = db.query(Lesson)

    if current_user.role == ROLE_TEACHER:
        query = query.join(Course, Lesson.course_id == Course.id)
        query = query.filter(Course.teacher_id == current_user.id)

    if course_id is not None:
        query = query.filter(Lesson.course_id == course_id)
    if from_date is not None:
        query = query.filter(Lesson.date >= from_date)
    if to_date is not None:
        query = query.filter(Lesson.date <= to_date)

    lessons = query.order_by(Lesson.date).all()
    return lessons


@router.get("/{lesson_id}", response_model=LessonRead)
def get_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> LessonRead:
    lesson = db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    if current_user.role == ROLE_TEACHER:
        course = db.get(Course, lesson.course_id)
        if not course or course.teacher_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    return lesson


@router.post("/", response_model=LessonRead, status_code=status.HTTP_201_CREATED)
def create_lesson(
    lesson_in: LessonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_teacher),
) -> LessonRead:
    if not check_course_owner(current_user, lesson_in.course_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to create lessons for this course",
        )

    lesson = Lesson(
        course_id=lesson_in.course_id,
        topic=lesson_in.topic,
        date=lesson_in.date,
        room=lesson_in.room,
        start_time=lesson_in.start_time,
        end_time=lesson_in.end_time,
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.patch("/{lesson_id}", response_model=LessonRead)
def update_lesson(
    lesson_id: int,
    lesson_in: LessonUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_teacher),
) -> LessonRead:
    lesson = db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    if not check_course_owner(current_user, lesson.course_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to edit this lesson",
        )

    if lesson_in.topic is not None:
        lesson.topic = lesson_in.topic
    if lesson_in.date is not None:
        lesson.date = lesson_in.date
    if lesson_in.room is not None:
        lesson.room = lesson_in.room
    if lesson_in.start_time is not None:
        lesson.start_time = lesson_in.start_time
    if lesson_in.end_time is not None:
        lesson.end_time = lesson_in.end_time

    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.delete("/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_teacher),
) -> None:
    lesson = db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    if not check_course_owner(current_user, lesson.course_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this lesson",
        )

    db.delete(lesson)
    db.commit()
