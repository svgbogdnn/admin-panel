import sys
import os
import traceback

try:
    # Ensure the current directory is in sys.path
    sys.path.append(os.getcwd())

    from app.core.db import SessionLocal
    from app.models.user import User
    from app.models.course import Course
    from app.core.security import is_teacher as security_is_teacher

    def check_users():
        db = SessionLocal()
        try:
            users = db.query(User).all()
            print(f"Found {len(users)} users.")
            for u in users:
                courses_owned = db.query(Course).filter(Course.teacher_id == u.id).count()
                is_t = security_is_teacher(u, db)
                print(f"User: {u.email}, ID: {u.id}, IsSuperuser: {u.is_superuser}")
                print(f"  - Owned Courses: {courses_owned}")
                print(f"  - Calculated is_teacher: {is_t}")
                
        finally:
            db.close()

    if __name__ == "__main__":
        check_users()

except Exception:
    traceback.print_exc()
