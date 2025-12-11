# from datetime import datetime
# import enum

# from sqlalchemy import Column, DateTime, Enum, ForeignKey, Integer, String, UniqueConstraint
# from sqlalchemy.orm import relationship

# from app.core.db import Base


# class AttendanceStatus(str, enum.Enum):
#     present = "present"
#     absent = "absent"
#     late = "late"
#     excused = "excused"


# class Attendance(Base):
#     __tablename__ = "attendance"

#     id = Column(Integer, primary_key=True, index=True)
#     lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True)
#     student_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
#     status = Column(Enum(AttendanceStatus), default=AttendanceStatus.present, nullable=False)
#     comment = Column(String(255), nullable=True)
#     created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
#     updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

#     lesson = relationship("Lesson", back_populates="attendances")
#     student = relationship("User", back_populates="attendances")

#     __table_args__ = (
#         UniqueConstraint("lesson_id", "student_id", name="uq_attendance_lesson_student"),
#     )

from datetime import datetime, date
import enum
from typing import Optional

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
    lesson_id = Column(
        Integer,
        ForeignKey("lessons.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    student_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    status = Column(
        Enum(AttendanceStatus),
        default=AttendanceStatus.present,
        nullable=False,
    )
    comment = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    lesson = relationship("Lesson", back_populates="attendances")
    student = relationship("User", back_populates="attendances")

    __table_args__ = (
        UniqueConstraint(
            "lesson_id",
            "student_id",
            name="uq_attendance_lesson_student",
        ),
    )

    # --------- Вычисляемые поля для фронта ---------

    @property
    def student_name(self) -> Optional[str]:
        """
        Полное имя студента для колонки 'Студент'.
        Если full_name нет — подстрахуемся email-ом.
        """
        if self.student is None:
            return None
        return self.student.full_name or self.student.email

    @property
    def course_name(self) -> Optional[str]:
        """
        Название курса для колонки 'Курс'.
        """
        if self.lesson is None or self.lesson.course is None:
            return None
        return self.lesson.course.name

    @property
    def lesson_date(self) -> Optional[date]:
        """
        Дата занятия для колонки 'Дата'.
        """
        if self.lesson is None:
            return None
        return self.lesson.date
