from datetime import date, time

from app.core.db import Base, SessionLocal, engine
from app.core.security import get_password_hash, ROLE_ADMIN, ROLE_TEACHER, ROLE_STUDENT
from app.models.attendance import Attendance, AttendanceStatus
from app.models.course import Course
from app.models.feedback import Feedback
from app.models.lesson import Lesson
from app.models.user import User


def run_seed() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        admin_data = [
            {
                "email": "a@a.com",
                "full_name": "Администратор системы (демо)",
                "password": "123",
                "role": ROLE_ADMIN,
            }
        ]

        teacher_data = [
            {
                "email": "b@b.com",
                "full_name": "Доцент кафедры ИТ: Борис Ковалёв",
                "password": "123",
                "role": ROLE_TEACHER,
            },
            {
                "email": "teacher.irina@example.com",
                "full_name": "Кандидат наук: Ирина Петрова",
                "password": "123",
                "role": ROLE_TEACHER,
            },
        ]

        student_data = [
            {
                "email": "c@c.com",
                "full_name": "Анна Соколова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 4, 18),
                "nationality": "Россия",
                "study_course": "Магистратура: Информатика и вычислительная техника",
                "study_group": "МИВТ-21",
                "phone": "+7 900 000-00-01",
                "social_links": "Telegram: @anna_sokolova",
            },
            {
                "email": "student.dmitry@example.com",
                "full_name": "Дмитрий Орлов",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 11, 2),
                "nationality": "Россия",
                "study_course": "Магистратура: Анализ данных и машинное обучение",
                "study_group": "АДМО-11",
                "phone": "+7 900 000-00-02",
                "social_links": "GitHub: github.com/d-orlov",
            },
        ]

        users = {}

        for data in admin_data + teacher_data + student_data:
            u = User(
                email=data["email"],
                full_name=data["full_name"],
                hashed_password=get_password_hash(data["password"]),
                is_active=True,
                role=data["role"],
                birthday=data.get("birthday"),
                nationality=data.get("nationality"),
                study_course=data.get("study_course"),
                study_group=data.get("study_group"),
                phone=data.get("phone"),
                social_links=data.get("social_links"),
            )
            db.add(u)
            db.flush()
            users[u.email] = u

        db.commit()

        teacher_b = users["b@b.com"]
        teacher_irina = users["teacher.irina@example.com"]

        courses_data = [
            {
                "name": "Методы машинного обучения (магистратура)",
                "description": "Регрессия и классификация, регуляризация, кросс-валидация, метрики качества, интерпретируемость моделей. Фокус на корректной постановке задачи и воспроизводимых экспериментах.",
                "start_date": date(2025, 9, 8),
                "end_date": date(2025, 12, 1),
                "teacher_id": teacher_irina.id,
            },
            {
                "name": "Статистический вывод и байесовские методы",
                "description": "Оценивание параметров, доверительные интервалы, проверка гипотез, байесовский вывод, апостериорные распределения, MCMC-интуиция. Практика на прикладных кейсах.",
                "start_date": date(2025, 9, 9),
                "end_date": date(2025, 12, 2),
                "teacher_id": teacher_b.id,
            },
            {
                "name": "Инженерия данных и ETL-пайплайны",
                "description": "Проектирование потоков данных, качество данных, версионирование схем, дедупликация, инкрементальные загрузки, мониторинг пайплайнов. Подготовка датасетов для аналитики и ML.",
                "start_date": date(2025, 9, 10),
                "end_date": date(2025, 12, 3),
                "teacher_id": teacher_b.id,
            },
            {
                "name": "Распределённые системы и отказоустойчивость",
                "description": "Консистентность и доступность, репликация, идемпотентность, ретраи. Практика проектирования сервисов под нагрузкой и сбои.",
                "start_date": date(2025, 9, 11),
                "end_date": date(2025, 12, 4),
                "teacher_id": teacher_irina.id,
            },
            {
                "name": "Проектирование API и безопасность (FastAPI)",
                "description": "REST-дизайн, схемы данных, контроль доступа, аудит действий, обработка ошибок, пагинация и фильтры. Отдельно: модели угроз и практики безопасной разработки.",
                "start_date": date(2025, 9, 12),
                "end_date": date(2025, 12, 5),
                "teacher_id": teacher_irina.id,
            },
        ]

        courses = []
        for c in courses_data:
            course = Course(
                name=c["name"],
                description=c["description"],
                start_date=c["start_date"],
                end_date=c["end_date"],
                is_active=True,
                teacher_id=c["teacher_id"],
            )
            db.add(course)
            db.flush()
            courses.append(course)

        db.commit()

        lessons_plan = [
            ("Лекция 1: Постановка задачи обучения, разбиение данных, метрики качества", date(2025, 9, 8), "Аудитория 201"),
            ("Семинар 1: Кросс-валидация, регуляризация, диагностика переобучения", date(2025, 9, 15), "Аудитория 201"),
            ("Лекция 1: Проверка гипотез и доверительные интервалы на практике", date(2025, 9, 9), "Аудитория 305"),
            ("Семинар 1: Байесовский вывод и апостериорные оценки в прикладных задачах", date(2025, 9, 16), "Аудитория 305"),
            ("Лекция 1: Архитектура ETL, качество данных и типовые ошибки", date(2025, 9, 10), "Аудитория 112"),
            ("Семинар 1: Инкрементальные загрузки и дедупликация на реальных данных", date(2025, 9, 17), "Аудитория 112"),
            ("Лекция 1: Репликация, консистентность, модель сбоев", date(2025, 9, 11), "Аудитория 410"),
            ("Семинар 1: Идемпотентность, ретраи и проектирование под нестабильные сети", date(2025, 9, 18), "Аудитория 410"),
            ("Лекция 1: Дизайн REST-API, схемы данных и ошибки интерфейса", date(2025, 9, 12), "Аудитория 220"),
            ("Семинар 1: Контроль доступа и базовые практики безопасной разработки", date(2025, 9, 19), "Аудитория 220"),
        ]

        lessons = []
        for course, (topic1, d1, room1), (topic2, d2, room2) in zip(courses, lessons_plan[0::2], lessons_plan[1::2]):
            l1 = Lesson(
                course_id=course.id,
                topic=topic1,
                date=d1,
                room=room1,
                start_time=time(10, 0),
                end_time=time(11, 30),
            )
            db.add(l1)
            db.flush()
            lessons.append(l1)

            l2 = Lesson(
                course_id=course.id,
                topic=topic2,
                date=d2,
                room=room2,
                start_time=time(10, 0),
                end_time=time(11, 30),
            )
            db.add(l2)
            db.flush()
            lessons.append(l2)

        db.commit()

        students = [users["c@c.com"], users["student.dmitry@example.com"]]

        status_matrix = [
            (AttendanceStatus.present, "Присутствовал, активно участвовал в обсуждении."),
            (AttendanceStatus.late, "Опоздание на 10 минут, причина: транспорт."),
            (AttendanceStatus.absent, "Отсутствовал без уважительной причины."),
            (AttendanceStatus.excused, "Отсутствовал по уважительной причине (справка)."),
        ]

        for i, lesson in enumerate(lessons):
            for j, student in enumerate(students):
                st, comment = status_matrix[(i + j) % len(status_matrix)]
                a = Attendance(
                    lesson_id=lesson.id,
                    student_id=student.id,
                    status=st,
                    comment=comment,
                )
                db.add(a)

        db.commit()

        feedback_samples = [
            (4.8, "Материал изложен структурно, примеры помогли закрепить ключевые идеи."),
            (4.2, "Темп высокий, но после семинара стало понятнее. Хотелось бы больше практики."),
            (5.0, "Отличная связка теории и реальных кейсов. Полезно для курсового проекта."),
            (3.9, "Тема сложная, нужен дополнительный разбор задач на следующем занятии."),
        ]

        feedback_pairs = [
            (lessons[0], students[0], feedback_samples[0]),
            (lessons[1], students[0], feedback_samples[1]),
            (lessons[2], students[1], feedback_samples[2]),
            (lessons[3], students[1], feedback_samples[0]),
            (lessons[6], students[0], feedback_samples[2]),
            (lessons[9], students[1], feedback_samples[3]),
        ]

        for lesson, student, (rating, comment) in feedback_pairs:
            f = Feedback(
                lesson_id=lesson.id,
                student_id=student.id,
                rating=rating,
                comment=comment,
                is_hidden=False,
            )
            db.add(f)

        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
