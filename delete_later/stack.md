Стек проекта

## Backend (API)

* **Язык/рантайм:** Python (в Docker — `python:3.11-slim`). 
* **Веб-фреймворк:** **FastAPI** (ASGI).  ([FastAPI][1])
* **ASGI-сервер:** **Uvicorn** (запуск `uvicorn app.main:app ...`).  ([Uvicorn][2])
* **Валидация/схемы:** **Pydantic** (schemas/*).  ([GeeksforGeeks][3])
* **Авторизация/безопасность:**

  * JWT на **python-jose**  ([Python-JOSE][4])
  * хеширование паролей через **passlib[bcrypt]**  ([Passlib][5])
  * OAuth2PasswordBearer (tokenUrl `/api/v1/login`). 
* **CORS:** FastAPI CORSMiddleware. 
* **Архитектура API:** роутеры `api/v1` (auth, users, courses, lessons, attendance, feedback, export, analytics). 

## База данных

* **ORM/DB слой:** **SQLAlchemy ORM**.  ([SQLAlchemy][6])
* **Миграции:** **Alembic** (есть `alembic.ini`, `alembic/env.py`). 
* **Текущее дефолтное подключение:** **SQLite** файл `app.db` через `DATABASE_URL` (по умолчанию `sqlite:///./app.db`). 
* **Опционально PostgreSQL:** в зависимостях есть `psycopg2-binary`, то есть проект готов переключаться на Postgres через `DATABASE_URL`. 

## Frontend

* **React + TypeScript + Vite** (типичная сборка Vite, `import.meta.env`).  ([React][7])
* **UI библиотека:** **Ant Design (antd)** (по твоим страницам и структуре фронта). ([Ant Design][8])
* **HTTP-клиент:** **Axios** + request interceptor для `Authorization: Bearer <token>`.  ([Axios][9])
* **ENV для API:** `VITE_API_URL` (есть во `frontend/.env`, и используется в `client.ts`).

## Контейнеризация и CI/CD

* **Docker:**

  * backend — отдельный Dockerfile (Python + uvicorn).  ([Docker Documentation][10])
  * frontend — multi-stage build (Node build → Nginx раздаёт статику).  ([Docker Documentation][11])
* **GitHub Actions:** workflow с **jobs/steps**, билд и пуш образов.  ([GitHub Docs][12])
* **Registry:** публикация в **GHCR (GitHub Container Registry)**.  ([GitHub Docs][13])