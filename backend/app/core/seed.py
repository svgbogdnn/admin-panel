from datetime import date, time

from app.core.db import SessionLocal
from app.core.security import get_password_hash
from app.models.user import User
from app.models.course import Course
from app.models.lesson import Lesson
from app.models.attendance import Attendance, AttendanceStatus
from app.models.feedback import Feedback


def run_seed() -> None:
    db = SessionLocal()
    try:
        db.query(Attendance).delete()
        db.query(Feedback).delete()
        db.query(Lesson).delete()
        db.query(Course).delete()
        db.query(User).delete()
        db.commit()

        teachers_data = [
            {
                "email": "admin@example.com",
                "full_name": "Администратор системы",
                "password": "admin123",
                "is_superuser": True,
            },
            {
                "email": "a@a.com",
                "full_name": "Администратор системы",
                "password": "123",
                "is_superuser": True,
            },
            {
                "email": "teacher.irina@example.com",
                "full_name": "Ирина Петрова",
                "password": "teacher123",
                "is_superuser": False,
            },
            {
                "email": "teacher.alexey@example.com",
                "full_name": "Алексей Смирнов",
                "password": "teacher123",
                "is_superuser": False,
            },
        ]

        students_data = [
            {
                "email": "student.anna@example.com",
                "full_name": "Анна Кузнецова",
                "password": "student123",
            },
            {
                "email": "student.dmitry@example.com",
                "full_name": "Дмитрий Орлов",
                "password": "student123",
            },
            {
                "email": "student.maria@example.com",
                "full_name": "Мария Иванова",
                "password": "student123",
            },
            {
                "email": "student.sergey@example.com",
                "full_name": "Сергей Волков",
                "password": "student123",
            },
            {
                "email": "student.elena@example.com",
                "full_name": "Елена Соколова",
                "password": "student123",
            },
            {
                "email": "student.igor@example.com",
                "full_name": "Игорь Новиков",
                "password": "student123",
            },
            {
                "email": "student.olga@example.com",
                "full_name": "Ольга Романова",
                "password": "student123",
            },
        ]

        teachers = []
        for data in teachers_data:
            user = User(
                email=data["email"],
                full_name=data["full_name"],
                hashed_password=get_password_hash(data["password"]),
                is_active=True,
                is_superuser=data["is_superuser"],
            )
            db.add(user)
            db.flush()
            teachers.append(user)

        students = []
        for data in students_data:
            user = User(
                email=data["email"],
                full_name=data["full_name"],
                hashed_password=get_password_hash(data["password"]),
                is_active=True,
                is_superuser=False,
            )
            db.add(user)
            db.flush()
            students.append(user)

        db.commit()

        courses_data = [
            {
                "name": "Python 101: Основы программирования",
                "description": "Базовый курс по синтаксису Python, типам данных и функциям. Подходит для полного нуля.",
                "start_date": date(2024, 9, 1),
                "end_date": date(2024, 12, 1),
                "teacher": teachers[0],
            },
            {
                "name": "Алгоритмы и структуры данных",
                "description": "Списки, стеки, очереди, деревья и базовые алгоритмы сортировки и поиска.",
                "start_date": date(2024, 9, 2),
                "end_date": date(2024, 12, 2),
                "teacher": teachers[0],
            },
            {
                "name": "Веб-разработка: HTML, CSS, JS",
                "description": "Основы создания веб-интерфейсов, верстка и базовый JavaScript.",
                "start_date": date(2024, 9, 3),
                "end_date": date(2024, 12, 3),
                "teacher": teachers[1],
            },
            {
                "name": "FastAPI для бэкенда",
                "description": "Создание API, работа с БД через SQLAlchemy, авторизация и документация.",
                "start_date": date(2024, 9, 4),
                "end_date": date(2024, 12, 4),
                "teacher": teachers[1],
            },
            {
                "name": "Базы данных и SQL",
                "description": "Проектирование схемы, JOIN-ы, индексы и оптимизация запросов.",
                "start_date": date(2024, 9, 5),
                "end_date": date(2024, 12, 5),
                "teacher": teachers[1],
            },
            {
                "name": "Git и командная разработка",
                "description": "Git flow, pull request-ы, code review и работа с GitHub.",
                "start_date": date(2024, 9, 6),
                "end_date": date(2024, 12, 6),
                "teacher": teachers[2],
            },
            {
                "name": "Тестирование и QA",
                "description": "Юнит-тесты, pytest, основы автоматизированного тестирования.",
                "start_date": date(2024, 9, 7),
                "end_date": date(2024, 12, 7),
                "teacher": teachers[2],
            },
            {
                "name": "Основы компьютерных сетей",
                "description": "Модель OSI, TCP/IP, протоколы и базовая сетевых инфраструктура.",
                "start_date": date(2024, 9, 8),
                "end_date": date(2024, 12, 8),
                "teacher": teachers[2],
            },
            {
                "name": "Основы машинного обучения",
                "description": "Линейная регрессия, классификация, подготовка данных и метрики качества.",
                "start_date": date(2024, 9, 9),
                "end_date": date(2024, 12, 9),
                "teacher": teachers[0],
            },
            {
                "name": "Продвинутый Python",
                "description": "Генераторы, декораторы, контекстные менеджеры и асинхронность.",
                "start_date": date(2024, 9, 10),
                "end_date": date(2024, 12, 10),
                "teacher": teachers[1],
            },
        ]

        courses = []
        for data in courses_data:
            course = Course(
                name=data["name"],
                description=data["description"],
                start_date=data["start_date"],
                end_date=data["end_date"],
                is_active=True,
                teacher_id=data["teacher"].id,
            )
            db.add(course)
            db.flush()
            courses.append(course)

        db.commit()

        lessons = []
        for index, course in enumerate(courses, start=1):
            lesson = Lesson(
                course_id=course.id,
                topic=f"Занятие {index}: Введение в курс «{course.name}»",
                date=course.start_date or date(2024, 9, index),
                room=f"Аудитория {100 + index}",
                start_time=time(10, 0),
                end_time=time(11, 30),
            )
            db.add(lesson)
            db.flush()
            lessons.append(lesson)

        db.commit()

        for lesson in lessons:
            for student in students:
                attendance = Attendance(
                    lesson_id=lesson.id,
                    student_id=student.id,
                    status=AttendanceStatus.present,
                    comment="Присутствовал на занятии",
                )
                db.add(attendance)

        db.commit()

        feedback_texts = [
            "Очень понятное объяснение материала.",
            "Понравилась структура урока и примеры.",
            "Было немного быстро, но в целом хорошо.",
            "Хочется больше практических задач.",
            "Отличная подача, все по делу.",
            "Местами сложно, но преподаватель помог разобраться.",
            "Нравится, что даются реальные кейсы.",
            "Хороший баланс теории и практики.",
            "Иногда не хватает времени на вопросы.",
            "Один из лучших уроков на курсе.",
        ]

        for index in range(10):
            lesson = lessons[index % len(lessons)]
            student = students[index % len(students)]
            rating = 3.0 + float(index % 3)
            feedback = Feedback(
                lesson_id=lesson.id,
                student_id=student.id,
                rating=rating,
                comment=feedback_texts[index],
                is_hidden=False,
            )
            db.add(feedback)

        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
