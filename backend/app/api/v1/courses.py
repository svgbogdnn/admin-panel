from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_user, require_admin_or_teacher, require_admin, check_course_owner, ROLE_ADMIN, ROLE_TEACHER
from app.models.course import Course
from app.models.user import User
from app.schemas.course import CourseCreate, CourseRead, CourseUpdate

router = APIRouter(prefix="/courses", tags=["courses"])


@router.get("/", response_model=List[CourseRead])
def list_courses(
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[CourseRead]:
    query = db.query(Course)
    if is_active is not None:
        query = query.filter(Course.is_active == is_active)

    if current_user.role == ROLE_TEACHER:
        query = query.filter(Course.teacher_id == current_user.id)

    courses = query.order_by(Course.start_date.nulls_last()).all()
    return courses


@router.get("/{course_id}", response_model=CourseRead)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CourseRead:
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if current_user.role == ROLE_TEACHER and course.teacher_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")
    return course


@router.post("/", response_model=CourseRead, status_code=status.HTTP_201_CREATED)
def create_course(
    course_in: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_teacher),
) -> CourseRead:
    teacher_id = course_in.teacher_id
    if current_user.role == ROLE_TEACHER:
        teacher_id = current_user.id

    course = Course(
        name=course_in.name,
        description=course_in.description,
        start_date=course_in.start_date,
        end_date=course_in.end_date,
        is_active=course_in.is_active,
        teacher_id=teacher_id,
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.patch("/{course_id}", response_model=CourseRead)
def update_course(
    course_id: int,
    course_in: CourseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_teacher),
) -> CourseRead:
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    if current_user.role == ROLE_TEACHER and not check_course_owner(current_user, course_id, db):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    if course_in.name is not None:
        course.name = course_in.name
    if course_in.description is not None:
        course.description = course_in.description
    if course_in.start_date is not None:
        course.start_date = course_in.start_date
    if course_in.end_date is not None:
        course.end_date = course_in.end_date
    if course_in.is_active is not None:
        course.is_active = course_in.is_active
    if course_in.teacher_id is not None:
        if current_user.role != ROLE_ADMIN:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only admin can change course teacher")
        course.teacher_id = course_in.teacher_id

    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin_or_teacher),
) -> None:
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    if current_user.role == ROLE_TEACHER and course.teacher_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not enough permissions")

    db.delete(course)
    db.commit()
