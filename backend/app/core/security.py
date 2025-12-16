from datetime import datetime, timedelta
from typing import Optional
import hashlib

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.db import get_db
from app.models.user import User

ROLE_ADMIN = "admin"
ROLE_TEACHER = "teacher"
ROLE_STUDENT = "student"

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/login")


def hash_password_raw(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password_raw(plain_password) == hashed_password


def get_password_hash(password: str) -> str:
    return hash_password_raw(password)


def create_access_token(subject: str, expires_delta: Optional[timedelta] = None) -> str:
    settings = get_settings()
    if expires_delta is None:
        expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
    expire = datetime.utcnow() + expires_delta
    to_encode = {"sub": subject, "exp": expire}
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    settings = get_settings()
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        subject = payload.get("sub")
        if subject is None:
            raise credentials_exception
        user_id = int(subject)
    except (JWTError, ValueError):
        raise credentials_exception
    user = get_user_by_id(db, user_id)
    if user is None or not user.is_active:
        raise credentials_exception
    return user


def get_role(user: User) -> str:
    role = (user.role or "").strip().lower()
    if role in (ROLE_ADMIN, ROLE_TEACHER, ROLE_STUDENT):
        return role
    return ROLE_STUDENT


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if get_role(current_user) != ROLE_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


def require_admin_or_teacher(
    current_user: User = Depends(get_current_user),
) -> User:
    role = get_role(current_user)
    if role in (ROLE_ADMIN, ROLE_TEACHER):
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Admin or teacher access required",
    )


def check_course_owner(user: User, course_id: int, db: Session) -> bool:
    if get_role(user) == ROLE_ADMIN:
        return True
    if get_role(user) != ROLE_TEACHER:
        return False
    from app.models.course import Course
    course = db.get(Course, course_id)
    if course is None:
        return False
    return course.teacher_id == user.id
