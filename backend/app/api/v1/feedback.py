from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.db import get_db
from app.core.security import get_current_user
from app.models.feedback import Feedback
from app.models.lesson import Lesson
from app.models.user import User
from app.schemas.feedback import FeedbackCreate, FeedbackRead, FeedbackUpdate

router = APIRouter(prefix="/feedback", tags=["feedback"])


def enrich_feedback(item: Feedback) -> Feedback:
    student = item.student
    lesson = item.lesson
    if student is not None:
        item.student_name = student.full_name or student.email
    else:
        item.student_name = None
    if lesson is not None:
        item.lesson_topic = lesson.topic
        item.lesson_date = lesson.date
        course = lesson.course
        if course is not None:
            item.course_name = course.name
        else:
            item.course_name = None
    else:
        item.lesson_topic = None
        item.lesson_date = None
        item.course_name = None
    return item


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
    return [enrich_feedback(item) for item in items]


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
    return enrich_feedback(item)


@router.post("/", response_model=FeedbackRead, status_code=status.HTTP_201_CREATED)
def create_feedback(
    feedback_in: FeedbackCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> FeedbackRead:
    item = Feedback(
        lesson_id=feedback_in.lesson_id,
        student_id=feedback_in.student_id,
        rating=feedback_in.rating,
        comment=feedback_in.comment,
        is_hidden=feedback_in.is_hidden,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return enrich_feedback(item)


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
    if feedback_in.rating is not None:
        item.rating = feedback_in.rating
    if feedback_in.comment is not None:
        item.comment = feedback_in.comment
    if feedback_in.is_hidden is not None:
        item.is_hidden = feedback_in.is_hidden
    db.add(item)
    db.commit()
    db.refresh(item)
    return enrich_feedback(item)


@router.delete("/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    item = db.get(Feedback, feedback_id)
    if not item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Feedback not found")
    db.delete(item)
    db.commit()
