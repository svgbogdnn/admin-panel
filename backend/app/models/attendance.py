from datetime import datetime
import enum

from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.orm import relationship

from app.core.db import Base


class AttendanceStatus(str, enum.Enum):
    present = "present"
    absent = "absent"
    late = "late"
    excused = "excused"


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True)
    student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(Enum(AttendanceStatus), default=AttendanceStatus.present, nullable=False)
    comment = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    lesson = relationship("Lesson", back_populates="attendances")
    student = relationship("User", back_populates="attendances")

    __table_args__ = (
        UniqueConstraint("lesson_id", "student_id", name="uq_attendance_lesson_student"),
    )
