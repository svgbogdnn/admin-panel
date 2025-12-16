from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, Text, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.db import Base


class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    rating = Column(Float, nullable=False)
    comment = Column(Text, nullable=True)
    is_hidden = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    lesson = relationship("Lesson", back_populates="feedbacks")
    student = relationship("User", back_populates="feedbacks")

    __table_args__ = (
        UniqueConstraint("lesson_id", "student_id", name="uq_feedback_lesson_student"),
    )

    @property
    def student_name(self) -> Optional[str]:
        if self.student is None:
            return None
        return self.student.full_name or self.student.email

    @property
    def course_name(self) -> Optional[str]:
        if self.lesson is None or self.lesson.course is None:
            return None
        return self.lesson.course.name

    @property
    def lesson_topic(self) -> Optional[str]:
        if self.lesson is None:
            return None
        return self.lesson.topic

    @property
    def lesson_date(self) -> Optional[str]:
        if self.lesson is None or self.lesson.date is None:
            return None
        return self.lesson.date.isoformat()