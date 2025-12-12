from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import (
    get_current_user,
    get_password_hash,
    verify_password,
)
from app.models.user import User
from app.schemas.user import UserCreate, UserRead, UserUpdate

router = APIRouter(prefix="/users", tags=["users"])


def ensure_superuser(current_user: User = Depends(get_current_user)) -> User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return current_user


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    birthday: Optional[date] = None
    nationality: Optional[str] = None
    study_course: Optional[str] = None
    study_group: Optional[str] = None
    phone: Optional[str] = None
    social_links: Optional[str] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str


@router.get("/me", response_model=UserRead)
def read_me(
    current_user: User = Depends(get_current_user),
) -> UserRead:
    return current_user


@router.patch("/me", response_model=UserRead)
def update_me(
    profile_in: UserProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UserRead:
    if profile_in.full_name is not None:
        current_user.full_name = profile_in.full_name
    if profile_in.birthday is not None:
        current_user.birthday = profile_in.birthday
    if profile_in.nationality is not None:
        current_user.nationality = profile_in.nationality
    if profile_in.study_course is not None:
        current_user.study_course = profile_in.study_course
    if profile_in.study_group is not None:
        current_user.study_group = profile_in.study_group
    if profile_in.phone is not None:
        current_user.phone = profile_in.phone
    if profile_in.social_links is not None:
        current_user.social_links = profile_in.social_links

    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password_me(
    payload: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )

    current_user.hashed_password = get_password_hash(payload.new_password)
    db.add(current_user)
    db.commit()


@router.get(
    "/",
    response_model=List[UserRead],
    dependencies=[Depends(ensure_superuser)],
)
def list_users(
    db: Session = Depends(get_db),
) -> List[UserRead]:
    users = db.query(User).order_by(User.id).all()
    return users


@router.get(
    "/{user_id}",
    response_model=UserRead,
    dependencies=[Depends(ensure_superuser)],
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
) -> UserRead:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    return user


@router.post(
    "/",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(ensure_superuser)],
)
def create_user(
    user_in: UserCreate,
    db: Session = Depends(get_db),
) -> UserRead:
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )

    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        is_active=user_in.is_active,
        is_superuser=user_in.is_superuser,
        hashed_password=get_password_hash(user_in.password),
        birthday=user_in.birthday,
        nationality=user_in.nationality,
        study_course=user_in.study_course,
        study_group=user_in.study_group,
        phone=user_in.phone,
        social_links=user_in.social_links,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.patch(
    "/{user_id}",
    response_model=UserRead,
    dependencies=[Depends(ensure_superuser)],
)
def update_user(
    user_id: int,
    user_in: UserUpdate,
    db: Session = Depends(get_db),
) -> UserRead:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user_in.full_name is not None:
        user.full_name = user_in.full_name
    if user_in.is_active is not None:
        user.is_active = user_in.is_active
    if user_in.is_superuser is not None:
        user.is_superuser = user_in.is_superuser
    if user_in.password is not None:
        user.hashed_password = get_password_hash(user_in.password)
    if user_in.birthday is not None:
        user.birthday = user_in.birthday
    if user_in.nationality is not None:
        user.nationality = user_in.nationality
    if user_in.study_course is not None:
        user.study_course = user_in.study_course
    if user_in.study_group is not None:
        user.study_group = user_in.study_group
    if user_in.phone is not None:
        user.phone = user_in.phone
    if user_in.social_links is not None:
        user.social_links = user_in.social_links

    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.delete(
    "/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    dependencies=[Depends(ensure_superuser)],
)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
) -> None:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )
    db.delete(user)
    db.commit()
