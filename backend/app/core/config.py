import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()

class Settings:
    def __init__(self):
        self.app_name = os.getenv("APP_NAME", "Admin Panel Attendance API")
        self.debug = os.getenv("DEBUG", "true").lower() == "true"
        self.secret_key = os.getenv("SECRET_KEY", "change_me")
        self.algorithm = os.getenv("JWT_ALGORITHM", "HS256")
        self.access_token_expire_minutes = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
        self.database_url = os.getenv("DATABASE_URL", "sqlite:///./app.db")
        origins = os.getenv("BACKEND_CORS_ORIGINS", "")
        self.backend_cors_origins = [o.strip() for o in origins.split(",") if o.strip()]

@lru_cache
def get_settings() -> Settings:
    return Settings()
