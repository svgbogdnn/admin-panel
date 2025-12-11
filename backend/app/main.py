# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware

# from app.core.config import get_settings
# from app.core.db import Base, engine

# settings = get_settings()

# Base.metadata.create_all(bind=engine)

# app = FastAPI(title=settings.app_name, debug=settings.debug)

# if settings.backend_cors_origins:
#     origins = settings.backend_cors_origins
# else:
#     origins = ["*"]

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# @app.get("/ping")
# def ping() -> dict:
#     return {"message": "pong"}

# # from app.api.v1.auth import router as auth_router
# # app.include_router(auth_router, prefix="/api/v1")

# from app.api.v1 import router as api_v1_router
# app.include_router(api_v1_router, prefix="/api/v1")


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.db import Base, engine
from app.api.v1 import router as api_v1_router

settings = get_settings()

Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.app_name, debug=settings.debug)

origins = settings.backend_cors_origins or ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/ping")
def ping() -> dict:
    return {"message": "pong"}


app.include_router(api_v1_router, prefix="/api/v1")
