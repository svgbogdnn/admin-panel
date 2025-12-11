from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.db import get_db
from app.core.security import (
    verify_password,
    get_password_hash,
    get_current_user,
    create_access_token,
)
from app.models.user import User
from app.schemas.auth import LoginRequest, Token, UserCreate, UserRead

router = APIRouter(tags=["auth"])

settings = get_settings()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)) -> UserRead:
    existing = db.query(User).filter(User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already exists",
        )
    hashed_password = get_password_hash(user_in.password)
    user = User(
        email=user_in.email,
        full_name=user_in.full_name,
        hashed_password=hashed_password,
        is_active=user_in.is_active,
        is_superuser=user_in.is_superuser,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(data: LoginRequest, db: Session = Depends(get_db)) -> Token:
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )
    expires_delta = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(str(user.id), expires_delta=expires_delta)
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserRead)
async def read_current_user(current_user: User = Depends(get_current_user)) -> UserRead:
    return current_user
