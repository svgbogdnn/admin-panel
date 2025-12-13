from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_user, require_admin, check_course_owner, require_admin_or_teacher
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
    return course


@router.post("/", response_model=CourseRead, status_code=status.HTTP_201_CREATED)
def create_course(
    course_in: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),  # Allow any user to create a course
) -> CourseRead:
    # If user is not admin, they can only create courses for themselves
    teacher_id = course_in.teacher_id
    if not current_user.is_superuser:
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
    current_user: User = Depends(get_current_user),
) -> CourseRead:
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    
    # Check permission: admin or course owner
    if not check_course_owner(current_user, course_id, db):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to edit this course",
        )
    
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
        # Only admin can change teacher_id
        if not current_user.is_superuser:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admin can change course teacher",
            )
        course.teacher_id = course_in.teacher_id
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),  # Admin only
) -> None:
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    db.delete(course)
    db.commit()
