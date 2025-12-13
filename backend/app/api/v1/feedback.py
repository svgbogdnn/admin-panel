from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.db import get_db
from app.core.security import get_current_user, require_admin, is_teacher
from app.models.feedback import Feedback
from app.models.lesson import Lesson
from app.models.user import User
from app.schemas.feedback import FeedbackCreate, FeedbackRead, FeedbackUpdate

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.get("/", response_model=List[FeedbackRead])
def list_feedback(
    lesson_id: Optional[int] = None,
    course_id: Optional[int] = None,
    include_hidden: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> List[FeedbackRead]:
    query = db.query(Feedback).options(
        joinedload(Feedback.student),
        joinedload(Feedback.lesson).joinedload(Lesson.course),
    )
    if lesson_id is not None:
        query = query.filter(Feedback.lesson_id == lesson_id)
    if course_id is not None:
        query = query.join(Lesson, Feedback.lesson_id == Lesson.id)
        query = query.filter(Lesson.course_id == course_id)
    if not include_hidden:
        query = query.filter(Feedback.is_hidden.is_(False))
    items = query.order_by(Feedback.created_at.desc()).all()
    return items


@router.get("/{feedback_id}", response_model=FeedbackRead)
def get_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FeedbackRead:
    item = db.query(Feedback).options(
        joinedload(Feedback.student),
        joinedload(Feedback.lesson).joinedload(Lesson.course),
    ).get(feedback_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found")
    return item


@router.post("/", response_model=FeedbackRead, status_code=status.HTTP_201_CREATED)
def create_feedback(
    feedback_in: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FeedbackRead:
    # Only students can create feedback (not teachers or admins)
    # Admin can create for management purposes
    # Verify lesson exists
    lesson = db.get(Lesson, feedback_in.lesson_id)
    if not lesson:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Lesson not found",
        )

    if not current_user.is_superuser:
        # Check if user is the teacher of this course
        if lesson.course.teacher_id == current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Teachers cannot leave feedback on their own courses.",
            )
            
        # Students can only create feedback for themselves
        if feedback_in.student_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only write feedback for yourself.",
            )
    
    item = Feedback(
        lesson_id=feedback_in.lesson_id,
        student_id=feedback_in.student_id,
        rating=feedback_in.rating,
        comment=feedback_in.comment,
        is_hidden=feedback_in.is_hidden if current_user.is_superuser else False,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.patch("/{feedback_id}", response_model=FeedbackRead)
def update_feedback(
    feedback_id: int,
    feedback_in: FeedbackUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FeedbackRead:
    item = db.query(Feedback).options(
        joinedload(Feedback.student),
        joinedload(Feedback.lesson).joinedload(Lesson.course),
    ).get(feedback_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found")
    
    # Only admin or the student who wrote the feedback can update it
    if not current_user.is_superuser and item.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own feedback.",
        )
    
    if feedback_in.rating is not None:
        item.rating = feedback_in.rating
    if feedback_in.comment is not None:
        item.comment = feedback_in.comment
    # Only admin can change is_hidden
    if feedback_in.is_hidden is not None and current_user.is_superuser:
        item.is_hidden = feedback_in.is_hidden
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),  # Admin only
) -> None:
    item = db.get(Feedback, feedback_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found")
    db.delete(item)
    db.commit()
