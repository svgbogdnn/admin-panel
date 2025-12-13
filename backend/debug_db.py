
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.db import Base
from app.models.user import User
from app.models.course import Course
from app.models.attendance import Attendance
from app.api.v1.attendance import list_attendance
from app.core.security import is_teacher, get_role

# Adjust connection string if needed. Using default from typical FastAPI setup since I can't read .env easily?
# Assuming sqlite for "admin panel" usually, or I need to check how db is initialized.
# File d:\Apps\PyCharm\admin panel\backend\app\core\db.py should have the URL.
# But I can just import get_db or SessionLocal
from app.core.db import SessionLocal

db = SessionLocal()

print("--- Users ---")
users = db.query(User).all()
for u in users:
    role = get_role(u, db)
    print(f"ID: {u.id}, Email: {u.email}, Superuser: {u.is_superuser}, Role: {role}")
    if role == "teacher":
        courses = db.query(Course).filter(Course.teacher_id == u.id).all()
        print(f"  -> Owns courses: {[c.id for c in courses]}")

print("\n--- Courses ---")
courses = db.query(Course).all()
for c in courses:
    print(f"ID: {c.id}, Name: {c.name}, TeacherID: {c.teacher_id}")

print("\n--- Attendance ---")
attendances = db.query(Attendance).all()
print(f"Total attendance records: {len(attendances)}")
if attendances:
    print(f"First 5: {[a.id for a in attendances[:5]]}")
    a = attendances[0]
    print(f"Sample: ID {a.id}, LessonID {a.lesson_id}, StudentID {a.student_id}")

print("\n--- Testing Teacher Attendance Query ---")
teacher_users = [u for u in users if get_role(u, db) == "teacher"]
if teacher_users:
    teacher = teacher_users[0]
    print(f"Testing for teacher: {teacher.email} (ID: {teacher.id})")
    
    # Simulate list_attendance logic
    from app.models.lesson import Lesson
    query = (
        db.query(Attendance)
        .join(Lesson, Attendance.lesson_id == Lesson.id)
        .join(Course, Lesson.course_id == Course.id)
        .filter(Course.teacher_id == teacher.id)
    )
    count = query.count()
    print(f"Query found {count} records for teacher {teacher.id}")
else:
    print("No teacher found.")

