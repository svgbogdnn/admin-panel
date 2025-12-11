from fastapi import APIRouter

from .auth import router as auth_router
from .users import router as users_router
from .courses import router as courses_router
from .lessons import router as lessons_router
from .attendance import router as attendance_router
from .feedback import router as feedback_router
from .export import router as export_router

router = APIRouter()
router.include_router(auth_router)
router.include_router(users_router)
router.include_router(courses_router)
router.include_router(lessons_router)
router.include_router(attendance_router)
router.include_router(feedback_router)
router.include_router(export_router)
