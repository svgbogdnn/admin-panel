from __future__ import annotations

from pathlib import Path

OUTPUT_FILE = "PROJECT_ALL.txt"

FILES_TEXT = r"""


# .github/workflows/publish-images.yml
# .gitignore
# backend/Dockerfile
# backend/alembic.ini
# backend/alembic/env.py
# backend/app/__init__.py
# backend/app/api/__init__.py
# backend/output.txt
# backend/requirements.txt
# backend/app/main.py


# backend/app/api/v1/__init__.py
# backend/app/api/v1/analytics.py
# backend/app/api/v1/attendance.py
# backend/app/api/v1/auth.py
# backend/app/api/v1/courses.py
# backend/app/api/v1/export.py
# backend/app/api/v1/feedback.py
# backend/app/api/v1/lessons.py
# backend/app/api/v1/users.py


# backend/app/core/__init__.py
# backend/app/core/config.py
# backend/app/core/db.py
# backend/app/core/security.py
# backend/app/core/seed.py
# backend/app/core/bigseed.py

# backend/app/models/__init__.py
# backend/app/models/attendance.py
# backend/app/models/course.py
# backend/app/models/feedback.py
# backend/app/models/lesson.py
# backend/app/models/user.py


# backend/app/schemas/__init__.py
# backend/app/schemas/analytics.py
# backend/app/schemas/attendance.py
# backend/app/schemas/auth.py
# backend/app/schemas/course.py
# backend/app/schemas/feedback.py
# backend/app/schemas/lesson.py
# backend/app/schemas/user.py


# backend/app/services/__init__.py
# backend/app/services/attendance_service.py
# backend/app/services/export_service.py
# backend/app/services/feedback_service.py


# frontend/.env
# frontend/.gitignore
# frontend/Dockerfile
# frontend/README.md
# frontend/eslint.config.js
# frontend/index.html
# frontend/package-lock.json
# frontend/package.json
# frontend/public/vite.svg
# frontend/src/assets/react.svg


# frontend/src/api/analytics.ts
# frontend/src/api/attendance.ts
# frontend/src/api/auth.ts
# frontend/src/api/client.ts
# frontend/src/api/courses.ts
# frontend/src/api/export.ts
# frontend/src/api/feedback.ts
# frontend/src/api/lessons.ts
# frontend/src/api/users.ts


# frontend/src/components/layout/AppLayout.tsx
# frontend/src/context/AuthContext.tsx
# frontend/src/index.css
# frontend/src/main.tsx
# frontend/src/App.css
# frontend/src/App.tsx
# frontend/src/router/index.tsx


# frontend/src/pages/AnalyticsPage.tsx
# frontend/src/pages/AttendancePage.tsx
# frontend/src/pages/CourseCreatePage.tsx
# frontend/src/pages/CourseDetailPage.tsx
# frontend/src/pages/CourseEditPage.tsx
# frontend/src/pages/CoursesPage.tsx
# frontend/src/pages/ExportPage.tsx
# frontend/src/pages/FeedbackPage.tsx
# frontend/src/pages/LoginPage.tsx
# frontend/src/pages/ProfilePage.tsx
# frontend/src/pages/RegisterPage.tsx


# frontend/tsconfig.app.json
# frontend/tsconfig.json
# frontend/tsconfig.node.json
# frontend/vite.config.ts


""".strip()


def normalize_path(line: str) -> Path:
    s = line.strip().strip('"').strip("'").replace("\\", "/")
    return Path(s)


def is_probably_binary(path: Path) -> bool:
    # SVG — текст, пусть проходит
    if path.suffix.lower() == ".svg":
        return False
    try:
        with path.open("rb") as f:
            chunk = f.read(4096)
        return b"\x00" in chunk
    except Exception:
        return True


def main() -> None:
    root = Path(".").resolve()
    files = [normalize_path(x) for x in FILES_TEXT.splitlines() if x.strip()]

    missing: list[str] = []
    skipped_binary: list[str] = []

    out_path = Path(r"D:\shit delete\proj\frontend_config.txt")
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8", newline="\n") as out:
        for rel in files:
            full = root / rel
            out.write(f"===== FILE: {rel.as_posix()} =====\n")

            if not full.exists() or not full.is_file():
                missing.append(rel.as_posix())
                continue

            if is_probably_binary(full):
                skipped_binary.append(rel.as_posix())
                continue

            text = full.read_text(encoding="utf-8", errors="replace")
            out.write(text)
            out.write("\n\n")

    print(f"Готово: {out_path}")
    if missing:
        print(f"Не найдены: {len(missing)}")
    if skipped_binary:
        print(f"Пропущены бинарные: {len(skipped_binary)}")


if __name__ == "__main__":
    main()