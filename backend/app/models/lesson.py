from datetime import datetime, date, time

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Time
from sqlalchemy.orm import relationship

from app.core.db import Base


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    topic = Column(String(255), nullable=False)
    date = Column(Date, nullable=False, index=True)
    room = Column(String(100), nullable=True)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    course = relationship("Course", back_populates="lessons")
    attendances = relationship("Attendance", back_populates="lesson", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="lesson", cascade="all, delete-orphan")
