'''Импорты и параметры демо'''
from datetime import date, time, timedelta
import random


from app.core.db import Base, SessionLocal, engine
from app.core.security import get_password_hash, ROLE_ADMIN, ROLE_TEACHER, ROLE_STUDENT
from app.models.attendance import Attendance, AttendanceStatus
from app.models.course import Course
from app.models.feedback import Feedback
from app.models.lesson import Lesson
from app.models.user import User

DEMO_COURSES = 5
LESSONS_PER_COURSE = 10
STUDENTS_PER_COURSE = 25

SEED_LESSONS = 42
SEED_ATTENDANCE = 1337
SEED_FEEDBACK = 2025

FEEDBACK_TARGET = 300
FEEDBACK_STUDENTS = 40

def run_seed() -> None:
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    ''' Данные пользователей (admin/teachers/students) '''
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
                        {
                "email": "teacher.alexey.gromov@example.com",
                "full_name": "Профессор (д.ф.-м.н.): Алексей Громов",
                "password": "123",
                "role": ROLE_TEACHER,
            },
            {
                "email": "teacher.svetlana.mironova@example.com",
                "full_name": "Доцент (к.т.н.): Светлана Миронова",
                "password": "123",
                "role": ROLE_TEACHER,
            },
            {
                "email": "teacher.sergey.ivanov@example.com",
                "full_name": "Доцент (к.ф.-м.н.): Сергей Иванов",
                "password": "123",
                "role": ROLE_TEACHER,
            },
            {
                "email": "teacher.elena.kuznetsova@example.com",
                "full_name": "Кандидат наук: Елена Кузнецова",
                "password": "123",
                "role": ROLE_TEACHER,
            },
            {
                "email": "teacher.maxim.sidorov@example.com",
                "full_name": "Старший преподаватель: Максим Сидоров",
                "password": "123",
                "role": ROLE_TEACHER,
            },
            {
                "email": "teacher.natalia.belyaeva@example.com",
                "full_name": "Доцент кафедры информационной безопасности: Наталья Беляева",
                "password": "123",
                "role": ROLE_TEACHER,
            },
            {
                "email": "teacher.pavel.smolin@example.com",
                "full_name": "Кандидат наук: Павел Смолин",
                "password": "123",
                "role": ROLE_TEACHER,
            },
            {
                "email": "teacher.olga.fedorova@example.com",
                "full_name": "Преподаватель-практик: Ольга Фёдорова",
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

            # МИВТ-21 (Информатика и вычислительная техника)
            {
                "email": "student.maria.vasileva@example.com",
                "full_name": "Мария Васильева",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 1, 24),
                "nationality": "Россия",
                "study_course": "Магистратура: Информатика и вычислительная техника",
                "study_group": "МИВТ-21",
                "phone": "+7 900 000-00-03",
                "social_links": "Telegram: @m_vasileva",
            },
            {
                "email": "student.ilya.melnikov@example.com",
                "full_name": "Илья Мельников",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 9, 7),
                "nationality": "Россия",
                "study_course": "Магистратура: Информатика и вычислительная техника",
                "study_group": "МИВТ-21",
                "phone": "+7 900 000-00-04",
                "social_links": "GitHub: github.com/i-melnikov",
            },
            {
                "email": "student.ekaterina.morozova@example.com",
                "full_name": "Екатерина Морозова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 6, 12),
                "nationality": "Россия",
                "study_course": "Магистратура: Информатика и вычислительная техника",
                "study_group": "МИВТ-21",
                "phone": "+7 900 000-00-05",
                "social_links": "Telegram: @katya_morozova",
            },
            {
                "email": "student.nikita.smirnov@example.com",
                "full_name": "Никита Смирнов",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 12, 19),
                "nationality": "Россия",
                "study_course": "Магистратура: Информатика и вычислительная техника",
                "study_group": "МИВТ-21",
                "phone": "+7 900 000-00-06",
                "social_links": "GitHub: github.com/n-smirnov",
            },
            {
                "email": "student.alisa.belova@example.com",
                "full_name": "Алиса Белова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 10, 3),
                "nationality": "Беларусь",
                "study_course": "Магистратура: Информатика и вычислительная техника",
                "study_group": "МИВТ-21",
                "phone": "+7 900 000-00-07",
                "social_links": "Telegram: @alisa_belova",
            },
            {
                "email": "student.artem.kuzmin@example.com",
                "full_name": "Артём Кузьмин",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 3, 28),
                "nationality": "Россия",
                "study_course": "Магистратура: Информатика и вычислительная техника",
                "study_group": "МИВТ-21",
                "phone": "+7 900 000-00-08",
                "social_links": "GitHub: github.com/a-kuzmin",
            },
            {
                "email": "student.polina.sergeeva@example.com",
                "full_name": "Полина Сергеева",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 7, 9),
                "nationality": "Россия",
                "study_course": "Магистратура: Информатика и вычислительная техника",
                "study_group": "МИВТ-21",
                "phone": "+7 900 000-00-09",
                "social_links": "Telegram: @polina_sergeeva",
            },
            {
                "email": "student.roman.nikitin@example.com",
                "full_name": "Роман Никитин",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 5, 16),
                "nationality": "Россия",
                "study_course": "Магистратура: Информатика и вычислительная техника",
                "study_group": "МИВТ-21",
                "phone": "+7 900 000-00-10",
                "social_links": "GitHub: github.com/r-nikitin",
            },
            {
                "email": "student.veronika.lebedeva@example.com",
                "full_name": "Вероника Лебедева",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 8, 21),
                "nationality": "Казахстан",
                "study_course": "Магистратура: Информатика и вычислительная техника",
                "study_group": "МИВТ-21",
                "phone": "+7 900 000-00-11",
                "social_links": "Telegram: @v_lebedeva",
            },
            {
                "email": "student.egor.filippov@example.com",
                "full_name": "Егор Филиппов",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 2, 14),
                "nationality": "Россия",
                "study_course": "Магистратура: Информатика и вычислительная техника",
                "study_group": "МИВТ-21",
                "phone": "+7 900 000-00-12",
                "social_links": "GitHub: github.com/e-filippov",
            },

            # АДМО-11 (Анализ данных и машинное обучение)
            {
                "email": "student.olga.korneeva@example.com",
                "full_name": "Ольга Корнеева",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 2, 5),
                "nationality": "Россия",
                "study_course": "Магистратура: Анализ данных и машинное обучение",
                "study_group": "АДМО-11",
                "phone": "+7 900 000-00-13",
                "social_links": "GitHub: github.com/o-korneeva",
            },
            {
                "email": "student.kirill.pavlov@example.com",
                "full_name": "Кирилл Павлов",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 6, 30),
                "nationality": "Россия",
                "study_course": "Магистратура: Анализ данных и машинное обучение",
                "study_group": "АДМО-11",
                "phone": "+7 900 000-00-14",
                "social_links": "Telegram: @kirill_pavlov",
            },
            {
                "email": "student.daria.kiseleva@example.com",
                "full_name": "Дарья Киселёва",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 9, 11),
                "nationality": "Россия",
                "study_course": "Магистратура: Анализ данных и машинное обучение",
                "study_group": "АДМО-11",
                "phone": "+7 900 000-00-15",
                "social_links": "GitHub: github.com/d-kiseleva",
            },
            {
                "email": "student.timur.yusupov@example.com",
                "full_name": "Тимур Юсупов",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 10, 22),
                "nationality": "Узбекистан",
                "study_course": "Магистратура: Анализ данных и машинное обучение",
                "study_group": "АДМО-11",
                "phone": "+7 900 000-00-16",
                "social_links": "Telegram: @timur_yusupov",
            },
            {
                "email": "student.anastasia.romanova@example.com",
                "full_name": "Анастасия Романова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 4, 8),
                "nationality": "Россия",
                "study_course": "Магистратура: Анализ данных и машинное обучение",
                "study_group": "АДМО-11",
                "phone": "+7 900 000-00-17",
                "social_links": "GitHub: github.com/a-romanova",
            },
            {
                "email": "student.vladislav.nazarov@example.com",
                "full_name": "Владислав Назаров",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 7, 27),
                "nationality": "Россия",
                "study_course": "Магистратура: Анализ данных и машинное обучение",
                "study_group": "АДМО-11",
                "phone": "+7 900 000-00-18",
                "social_links": "Telegram: @v_nazarov",
            },
            {
                "email": "student.ksenia.bogdanova@example.com",
                "full_name": "Ксения Богданова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 11, 6),
                "nationality": "Беларусь",
                "study_course": "Магистратура: Анализ данных и машинное обучение",
                "study_group": "АДМО-11",
                "phone": "+7 900 000-00-19",
                "social_links": "GitHub: github.com/k-bogdanova",
            },
            {
                "email": "student.ivan.zaitsev@example.com",
                "full_name": "Иван Зайцев",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 1, 17),
                "nationality": "Россия",
                "study_course": "Магистратура: Анализ данных и машинное обучение",
                "study_group": "АДМО-11",
                "phone": "+7 900 000-00-20",
                "social_links": "GitHub: github.com/i-zaitsev",
            },
            {
                "email": "student.sofia.makarova@example.com",
                "full_name": "София Макарова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 3, 2),
                "nationality": "Россия",
                "study_course": "Магистратура: Анализ данных и машинное обучение",
                "study_group": "АДМО-11",
                "phone": "+7 900 000-00-21",
                "social_links": "Telegram: @sofia_makarova",
            },
            {
                "email": "student.andrey.popov@example.com",
                "full_name": "Андрей Попов",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 9, 29),
                "nationality": "Россия",
                "study_course": "Магистратура: Анализ данных и машинное обучение",
                "study_group": "АДМО-11",
                "phone": "+7 900 000-00-22",
                "social_links": "GitHub: github.com/a-popov",
            },

            # ИБ-31 (Информационная безопасность и криптография)
            {
                "email": "student.mikhail.karpov@example.com",
                "full_name": "Михаил Карпов",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 5, 4),
                "nationality": "Россия",
                "study_course": "Магистратура: Информационная безопасность и криптография",
                "study_group": "ИБ-31",
                "phone": "+7 900 000-00-23",
                "social_links": "Telegram: @mikhail_karpov",
            },
            {
                "email": "student.yana.frolova@example.com",
                "full_name": "Яна Фролова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 8, 13),
                "nationality": "Россия",
                "study_course": "Магистратура: Информационная безопасность и криптография",
                "study_group": "ИБ-31",
                "phone": "+7 900 000-00-24",
                "social_links": "GitHub: github.com/y-frolova",
            },
            {
                "email": "student.arseniy.volkov@example.com",
                "full_name": "Арсений Волков",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 2, 25),
                "nationality": "Россия",
                "study_course": "Магистратура: Информационная безопасность и криптография",
                "study_group": "ИБ-31",
                "phone": "+7 900 000-00-25",
                "social_links": "Telegram: @arseniy_volkov",
            },
            {
                "email": "student.madina.ahmedova@example.com",
                "full_name": "Мадина Ахмедова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 12, 9),
                "nationality": "Казахстан",
                "study_course": "Магистратура: Информационная безопасность и криптография",
                "study_group": "ИБ-31",
                "phone": "+7 900 000-00-26",
                "social_links": "Telegram: @madina_ahmedova",
            },
            {
                "email": "student.denис.baranov@example.com".replace("denис", "denis"),
                "full_name": "Денис Баранов",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 6, 18),
                "nationality": "Россия",
                "study_course": "Магистратура: Информационная безопасность и криптография",
                "study_group": "ИБ-31",
                "phone": "+7 900 000-00-27",
                "social_links": "GitHub: github.com/d-baranov",
            },
            {
                "email": "student.alina.koroleva@example.com",
                "full_name": "Алина Королёва",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 5, 26),
                "nationality": "Россия",
                "study_course": "Магистратура: Информационная безопасность и криптография",
                "study_group": "ИБ-31",
                "phone": "+7 900 000-00-28",
                "social_links": "Telegram: @alina_koroleva",
            },
            {
                "email": "student.stepan.bykov@example.com",
                "full_name": "Степан Быков",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 7, 1),
                "nationality": "Россия",
                "study_course": "Магистратура: Информационная безопасность и криптография",
                "study_group": "ИБ-31",
                "phone": "+7 900 000-00-29",
                "social_links": "GitHub: github.com/s-bykov",
            },
            {
                "email": "student.lidia.guseva@example.com",
                "full_name": "Лидия Гусева",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 9, 30),
                "nationality": "Армения",
                "study_course": "Магистратура: Информационная безопасность и криптография",
                "study_group": "ИБ-31",
                "phone": "+7 900 000-00-30",
                "social_links": "Telegram: @lidia_guseva",
            },
            {
                "email": "student.petr.safonov@example.com",
                "full_name": "Пётр Сафонов",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 11, 12),
                "nationality": "Россия",
                "study_course": "Магистратура: Информационная безопасность и криптография",
                "study_group": "ИБ-31",
                "phone": "+7 900 000-00-31",
                "social_links": "GitHub: github.com/p-safonov",
            },
            {
                "email": "student.karina.novikova@example.com",
                "full_name": "Карина Новикова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 3, 6),
                "nationality": "Россия",
                "study_course": "Магистратура: Информационная безопасность и криптография",
                "study_group": "ИБ-31",
                "phone": "+7 900 000-00-32",
                "social_links": "Telegram: @karina_novikova",
            },

            # РСО-12 (Распределённые системы и облачные платформы)
            {
                "email": "student.alexander.tikhonov@example.com",
                "full_name": "Александр Тихонов",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 4, 20),
                "nationality": "Россия",
                "study_course": "Магистратура: Распределённые системы и облачные платформы",
                "study_group": "РСО-12",
                "phone": "+7 900 000-00-33",
                "social_links": "GitHub: github.com/a-tikhonov",
            },
            {
                "email": "student.elizaveta.sazonova@example.com",
                "full_name": "Елизавета Сазонова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 12, 1),
                "nationality": "Россия",
                "study_course": "Магистратура: Распределённые системы и облачные платформы",
                "study_group": "РСО-12",
                "phone": "+7 900 000-00-34",
                "social_links": "Telegram: @liza_sazonova",
            },
            {
                "email": "student.daniel.ibragimov@example.com",
                "full_name": "Даниил Ибрагимов",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 10, 10),
                "nationality": "Россия",
                "study_course": "Магистратура: Распределённые системы и облачные платформы",
                "study_group": "РСО-12",
                "phone": "+7 900 000-00-35",
                "social_links": "GitHub: github.com/d-ibragimov",
            },
            {
                "email": "student.marina.litvinova@example.com",
                "full_name": "Марина Литвинова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 6, 4),
                "nationality": "Беларусь",
                "study_course": "Магистратура: Распределённые системы и облачные платформы",
                "study_group": "РСО-12",
                "phone": "+7 900 000-00-36",
                "social_links": "Telegram: @marina_litvinova",
            },
            {
                "email": "student.fedor.golubev@example.com",
                "full_name": "Фёдор Голубев",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 8, 8),
                "nationality": "Россия",
                "study_course": "Магистратура: Распределённые системы и облачные платформы",
                "study_group": "РСО-12",
                "phone": "+7 900 000-00-37",
                "social_links": "GitHub: github.com/f-golubev",
            },
            {
                "email": "student.valeria.kudryavtseva@example.com",
                "full_name": "Валерия Кудрявцева",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 2, 9),
                "nationality": "Россия",
                "study_course": "Магистратура: Распределённые системы и облачные платформы",
                "study_group": "РСО-12",
                "phone": "+7 900 000-00-38",
                "social_links": "Telegram: @valeria_kudryavtseva",
            },
            {
                "email": "student.oleg.sobolev@example.com",
                "full_name": "Олег Соболев",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 1, 30),
                "nationality": "Россия",
                "study_course": "Магистратура: Распределённые системы и облачные платформы",
                "study_group": "РСО-12",
                "phone": "+7 900 000-00-39",
                "social_links": "GitHub: github.com/o-sobolev",
            },
            {
                "email": "student.irina.solovyova@example.com",
                "full_name": "Ирина Соловьёва",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 7, 23),
                "nationality": "Казахстан",
                "study_course": "Магистратура: Распределённые системы и облачные платформы",
                "study_group": "РСО-12",
                "phone": "+7 900 000-00-40",
                "social_links": "Telegram: @irina_solovyova",
            },
            {
                "email": "student.gleb.maltsev@example.com",
                "full_name": "Глеб Мальцев",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 4, 15),
                "nationality": "Россия",
                "study_course": "Магистратура: Распределённые системы и облачные платформы",
                "study_group": "РСО-12",
                "phone": "+7 900 000-00-41",
                "social_links": "GitHub: github.com/g-maltsev",
            },
            {
                "email": "student.tatyana.krylova@example.com",
                "full_name": "Татьяна Крылова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 3, 19),
                "nationality": "Россия",
                "study_course": "Магистратура: Распределённые системы и облачные платформы",
                "study_group": "РСО-12",
                "phone": "+7 900 000-00-42",
                "social_links": "Telegram: @t_krylova",
            },

            # САУП-22 (Системная аналитика и управление продуктом)
            {
                "email": "student.sergey.konovalov@example.com",
                "full_name": "Сергей Коновалов",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 9, 3),
                "nationality": "Россия",
                "study_course": "Магистратура: Системная аналитика и управление продуктом",
                "study_group": "САУП-22",
                "phone": "+7 900 000-00-43",
                "social_links": "Telegram: @s_konovalov",
            },
            {
                "email": "student.vera.danilova@example.com",
                "full_name": "Вера Данилова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 10, 14),
                "nationality": "Россия",
                "study_course": "Магистратура: Системная аналитика и управление продуктом",
                "study_group": "САУП-22",
                "phone": "+7 900 000-00-44",
                "social_links": "VK: vk.com/vera_danilova",
            },
            {
                "email": "student.anton.grachev@example.com",
                "full_name": "Антон Грачёв",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 6, 7),
                "nationality": "Россия",
                "study_course": "Магистратура: Системная аналитика и управление продуктом",
                "study_group": "САУП-22",
                "phone": "+7 900 000-00-45",
                "social_links": "Telegram: @anton_grachev",
            },
            {
                "email": "student.kristina.babkina@example.com",
                "full_name": "Кристина Бабкина",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 2, 27),
                "nationality": "Беларусь",
                "study_course": "Магистратура: Системная аналитика и управление продуктом",
                "study_group": "САУП-22",
                "phone": "+7 900 000-00-46",
                "social_links": "Telegram: @kristina_babkina",
            },
            {
                "email": "student.nazar.kim@example.com",
                "full_name": "Назар Ким",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 11, 18),
                "nationality": "Казахстан",
                "study_course": "Магистратура: Системная аналитика и управление продуктом",
                "study_group": "САУП-22",
                "phone": "+7 900 000-00-47",
                "social_links": "LinkedIn: linkedin.com/in/nazar-kim",
            },
            {
                "email": "student.larisa.pankratova@example.com",
                "full_name": "Лариса Панкратова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 5, 10),
                "nationality": "Россия",
                "study_course": "Магистратура: Системная аналитика и управление продуктом",
                "study_group": "САУП-22",
                "phone": "+7 900 000-00-48",
                "social_links": "Telegram: @larisa_pankratova",
            },
            {
                "email": "student.victor.ryabov@example.com",
                "full_name": "Виктор Рябов",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 3, 5),
                "nationality": "Россия",
                "study_course": "Магистратура: Системная аналитика и управление продуктом",
                "study_group": "САУП-22",
                "phone": "+7 900 000-00-49",
                "social_links": "GitHub: github.com/v-ryabov",
            },
            {
                "email": "student.snezhana.kalashnikova@example.com",
                "full_name": "Снежана Калашникова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 8, 28),
                "nationality": "Россия",
                "study_course": "Магистратура: Системная аналитика и управление продуктом",
                "study_group": "САУП-22",
                "phone": "+7 900 000-00-50",
                "social_links": "Telegram: @snezhana_kalashnikova",
            },
                        {
                "email": "student.vladimir.pankov@example.com",
                "full_name": "Владимир Панков",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 4, 11),
                "nationality": "Россия",
                "study_course": "Магистратура: Информатика и вычислительная техника (профиль: программная инженерия)",
                "study_group": "МИВТ-22",
                "phone": "+7 900 000-00-51",
                "social_links": "Telegram: @v_pankov",
            },
            {
                "email": "student.ksenia.zakharova@example.com",
                "full_name": "Ксения Захарова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 9, 20),
                "nationality": "Россия",
                "study_course": "Магистратура: Информатика и вычислительная техника (профиль: программная инженерия)",
                "study_group": "МИВТ-22",
                "phone": "+7 900 000-00-52",
                "social_links": "Telegram: @ksenia_zakharova",
            },
            {
                "email": "student.pavel.korshunov@example.com",
                "full_name": "Павел Коршунов",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 12, 6),
                "nationality": "Беларусь",
                "study_course": "Магистратура: Информатика и вычислительная техника (профиль: программная инженерия)",
                "study_group": "МИВТ-22",
                "phone": "+7 900 000-00-53",
                "social_links": "GitHub: github.com/p-korshunov",
            },
            {
                "email": "student.anastasia.gavrilova@example.com",
                "full_name": "Анастасия Гаврилова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 2, 14),
                "nationality": "Россия",
                "study_course": "Магистратура: Информатика и вычислительная техника (профиль: программная инженерия)",
                "study_group": "МИВТ-22",
                "phone": "+7 900 000-00-54",
                "social_links": "Telegram: @a_gavrilova",
            },
            {
                "email": "student.denis.chernov@example.com",
                "full_name": "Денис Чернов",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 7, 29),
                "nationality": "Россия",
                "study_course": "Магистратура: Информатика и вычислительная техника (профиль: программная инженерия)",
                "study_group": "МИВТ-22",
                "phone": "+7 900 000-00-55",
                "social_links": "GitHub: github.com/d-chernov",
            },
            {
                "email": "student.margarita.lukina@example.com",
                "full_name": "Маргарита Лукина",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 5, 8),
                "nationality": "Казахстан",
                "study_course": "Магистратура: Информатика и вычислительная техника (профиль: программная инженерия)",
                "study_group": "МИВТ-22",
                "phone": "+7 900 000-00-56",
                "social_links": "Telegram: @m_lukina",
            },
            {
                "email": "student.igor.maksimov@example.com",
                "full_name": "Игорь Максимов",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 3, 17),
                "nationality": "Россия",
                "study_course": "Магистратура: Информатика и вычислительная техника (профиль: программная инженерия)",
                "study_group": "МИВТ-22",
                "phone": "+7 900 000-00-57",
                "social_links": "GitHub: github.com/i-maksimov",
            },
            {
                "email": "student.elena.dorofeeva@example.com",
                "full_name": "Елена Дорофеева",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 10, 1),
                "nationality": "Армения",
                "study_course": "Магистратура: Информатика и вычислительная техника (профиль: программная инженерия)",
                "study_group": "МИВТ-22",
                "phone": "+7 900 000-00-58",
                "social_links": "Telegram: @elena_dorofeeva",
            },
            {
                "email": "student.artem.vinogradov@example.com",
                "full_name": "Артём Виноградов",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 1, 22),
                "nationality": "Россия",
                "study_course": "Магистратура: Информатика и вычислительная техника (профиль: программная инженерия)",
                "study_group": "МИВТ-22",
                "phone": "+7 900 000-00-59",
                "social_links": "GitHub: github.com/a-vinogradov",
            },
            {
                "email": "student.daria.tarasova@example.com",
                "full_name": "Дарья Тарасова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 7, 12),
                "nationality": "Россия",
                "study_course": "Магистратура: Информатика и вычислительная техника (профиль: программная инженерия)",
                "study_group": "МИВТ-22",
                "phone": "+7 900 000-00-60",
                "social_links": "Telegram: @d_tarasova",
            },

            {
                "email": "student.konstantin.egorov@example.com",
                "full_name": "Константин Егоров",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 9, 9),
                "nationality": "Россия",
                "study_course": "Магистратура: Анализ данных и машинное обучение (профиль: промышленный ML)",
                "study_group": "АДМО-12",
                "phone": "+7 900 000-00-61",
                "social_links": "GitHub: github.com/k-egorov",
            },
            {
                "email": "student.sofya.rudneva@example.com",
                "full_name": "Софья Руднева",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 11, 3),
                "nationality": "Россия",
                "study_course": "Магистратура: Анализ данных и машинное обучение (профиль: промышленный ML)",
                "study_group": "АДМО-12",
                "phone": "+7 900 000-00-62",
                "social_links": "Telegram: @sofya_rudneva",
            },
            {
                "email": "student.timofey.gusev@example.com",
                "full_name": "Тимофей Гусев",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 6, 25),
                "nationality": "Россия",
                "study_course": "Магистратура: Анализ данных и машинное обучение (профиль: промышленный ML)",
                "study_group": "АДМО-12",
                "phone": "+7 900 000-00-63",
                "social_links": "GitHub: github.com/t-gusev",
            },
            {
                "email": "student.valeria.fomina@example.com",
                "full_name": "Валерия Фомина",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 4, 6),
                "nationality": "Беларусь",
                "study_course": "Магистратура: Анализ данных и машинное обучение (профиль: промышленный ML)",
                "study_group": "АДМО-12",
                "phone": "+7 900 000-00-64",
                "social_links": "Telegram: @valeria_fomina",
            },
            {
                "email": "student.nikita.belov@example.com",
                "full_name": "Никита Белов",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 2, 2),
                "nationality": "Россия",
                "study_course": "Магистратура: Анализ данных и машинное обучение (профиль: промышленный ML)",
                "study_group": "АДМО-12",
                "phone": "+7 900 000-00-65",
                "social_links": "GitHub: github.com/n-belov",
            },
            {
                "email": "student.polina.yakovleva@example.com",
                "full_name": "Полина Яковлева",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 8, 19),
                "nationality": "Казахстан",
                "study_course": "Магистратура: Анализ данных и машинное обучение (профиль: промышленный ML)",
                "study_group": "АДМО-12",
                "phone": "+7 900 000-00-66",
                "social_links": "Telegram: @polina_yakovleva",
            },
            {
                "email": "student.arseniy.kotov@example.com",
                "full_name": "Арсений Котов",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 12, 15),
                "nationality": "Россия",
                "study_course": "Магистратура: Анализ данных и машинное обучение (профиль: промышленный ML)",
                "study_group": "АДМО-12",
                "phone": "+7 900 000-00-67",
                "social_links": "GitHub: github.com/a-kotov",
            },
            {
                "email": "student.maria.grishina@example.com",
                "full_name": "Мария Гришина",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 1, 28),
                "nationality": "Россия",
                "study_course": "Магистратура: Анализ данных и машинное обучение (профиль: промышленный ML)",
                "study_group": "АДМО-12",
                "phone": "+7 900 000-00-68",
                "social_links": "Telegram: @maria_grishina",
            },
            {
                "email": "student.roman.zhukov@example.com",
                "full_name": "Роман Жуков",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 5, 31),
                "nationality": "Россия",
                "study_course": "Магистратура: Анализ данных и машинное обучение (профиль: промышленный ML)",
                "study_group": "АДМО-12",
                "phone": "+7 900 000-00-69",
                "social_links": "GitHub: github.com/r-zhukov",
            },
            {
                "email": "student.elizaveta.sukhanova@example.com",
                "full_name": "Елизавета Суханова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 9, 7),
                "nationality": "Армения",
                "study_course": "Магистратура: Анализ данных и машинное обучение (профиль: промышленный ML)",
                "study_group": "АДМО-12",
                "phone": "+7 900 000-00-70",
                "social_links": "Telegram: @elizaveta_sukhanova",
            },

            {
                "email": "student.alexander.safronov@example.com",
                "full_name": "Александр Сафронов",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 10, 4),
                "nationality": "Россия",
                "study_course": "Магистратура: Информационная безопасность и криптография (профиль: безопасная разработка)",
                "study_group": "ИБ-32",
                "phone": "+7 900 000-00-71",
                "social_links": "GitHub: github.com/a-safronov",
            },
            {
                "email": "student.kira.fedoseeva@example.com",
                "full_name": "Кира Федосеева",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 3, 13),
                "nationality": "Россия",
                "study_course": "Магистратура: Информационная безопасность и криптография (профиль: безопасная разработка)",
                "study_group": "ИБ-32",
                "phone": "+7 900 000-00-72",
                "social_links": "Telegram: @kira_fedoseeva",
            },
            {
                "email": "student.vadim.nesterov@example.com",
                "full_name": "Вадим Нестеров",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 8, 24),
                "nationality": "Россия",
                "study_course": "Магистратура: Информационная безопасность и криптография (профиль: безопасная разработка)",
                "study_group": "ИБ-32",
                "phone": "+7 900 000-00-73",
                "social_links": "GitHub: github.com/v-nesterov",
            },
            {
                "email": "student.alina.ershova@example.com",
                "full_name": "Алина Ершова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 6, 21),
                "nationality": "Беларусь",
                "study_course": "Магистратура: Информационная безопасность и криптография (профиль: безопасная разработка)",
                "study_group": "ИБ-32",
                "phone": "+7 900 000-00-74",
                "social_links": "Telegram: @alina_ershova",
            },
            {
                "email": "student.matvey.kulikov@example.com",
                "full_name": "Матвей Куликов",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 1, 26),
                "nationality": "Россия",
                "study_course": "Магистратура: Информационная безопасность и криптография (профиль: безопасная разработка)",
                "study_group": "ИБ-32",
                "phone": "+7 900 000-00-75",
                "social_links": "GitHub: github.com/m-kulikov",
            },
            {
                "email": "student.veronika.antipova@example.com",
                "full_name": "Вероника Антипова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 12, 2),
                "nationality": "Казахстан",
                "study_course": "Магистратура: Информационная безопасность и криптография (профиль: безопасная разработка)",
                "study_group": "ИБ-32",
                "phone": "+7 900 000-00-76",
                "social_links": "Telegram: @veronika_antipova",
            },
            {
                "email": "student.danila.prokhorov@example.com",
                "full_name": "Данила Прохоров",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 2, 18),
                "nationality": "Россия",
                "study_course": "Магистратура: Информационная безопасность и криптография (профиль: безопасная разработка)",
                "study_group": "ИБ-32",
                "phone": "+7 900 000-00-77",
                "social_links": "GitHub: github.com/d-prokhorov",
            },
            {
                "email": "student.olga.sinitsyna@example.com",
                "full_name": "Ольга Синицына",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 4, 29),
                "nationality": "Россия",
                "study_course": "Магистратура: Информационная безопасность и криптография (профиль: безопасная разработка)",
                "study_group": "ИБ-32",
                "phone": "+7 900 000-00-78",
                "social_links": "Telegram: @olga_sinitsyna",
            },
            {
                "email": "student.ilya.kartashev@example.com",
                "full_name": "Илья Карташев",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 7, 14),
                "nationality": "Россия",
                "study_course": "Магистратура: Информационная безопасность и криптография (профиль: безопасная разработка)",
                "study_group": "ИБ-32",
                "phone": "+7 900 000-00-79",
                "social_links": "GitHub: github.com/i-kartashev",
            },
            {
                "email": "student.kamilla.abdullina@example.com",
                "full_name": "Камилла Абдуллина",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 9, 16),
                "nationality": "Узбекистан",
                "study_course": "Магистратура: Информационная безопасность и криптография (профиль: безопасная разработка)",
                "study_group": "ИБ-32",
                "phone": "+7 900 000-00-80",
                "social_links": "Telegram: @kamilla_abdullina",
            },

            {
                "email": "student.sergey.loginov@example.com",
                "full_name": "Сергей Логинов",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 11, 20),
                "nationality": "Россия",
                "study_course": "Магистратура: Распределённые системы и облачные платформы (профиль: SRE и отказоустойчивость)",
                "study_group": "РСО-13",
                "phone": "+7 900 000-00-81",
                "social_links": "GitHub: github.com/s-loginov",
            },
            {
                "email": "student.ekaterina.tikhonova@example.com",
                "full_name": "Екатерина Тихонова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 2, 7),
                "nationality": "Россия",
                "study_course": "Магистратура: Распределённые системы и облачные платформы (профиль: SRE и отказоустойчивость)",
                "study_group": "РСО-13",
                "phone": "+7 900 000-00-82",
                "social_links": "Telegram: @e_tikhonova",
            },
            {
                "email": "student.gleb.sorokin@example.com",
                "full_name": "Глеб Сорокин",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 5, 3),
                "nationality": "Беларусь",
                "study_course": "Магистратура: Распределённые системы и облачные платформы (профиль: SRE и отказоустойчивость)",
                "study_group": "РСО-13",
                "phone": "+7 900 000-00-83",
                "social_links": "GitHub: github.com/g-sorokin",
            },
            {
                "email": "student.natalia.kotova@example.com",
                "full_name": "Наталья Котова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 8, 5),
                "nationality": "Россия",
                "study_course": "Магистратура: Распределённые системы и облачные платформы (профиль: SRE и отказоустойчивость)",
                "study_group": "РСО-13",
                "phone": "+7 900 000-00-84",
                "social_links": "Telegram: @n_kotova",
            },
            {
                "email": "student.alexey.zhdanov@example.com",
                "full_name": "Алексей Жданов",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 4, 14),
                "nationality": "Россия",
                "study_course": "Магистратура: Распределённые системы и облачные платформы (профиль: SRE и отказоустойчивость)",
                "study_group": "РСО-13",
                "phone": "+7 900 000-00-85",
                "social_links": "GitHub: github.com/a-zhdanov",
            },
            {
                "email": "student.yulia.blinova@example.com",
                "full_name": "Юлия Блинова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 1, 10),
                "nationality": "Казахстан",
                "study_course": "Магистратура: Распределённые системы и облачные платформы (профиль: SRE и отказоустойчивость)",
                "study_group": "РСО-13",
                "phone": "+7 900 000-00-86",
                "social_links": "Telegram: @yulia_blinova",
            },
            {
                "email": "student.andrey.seleznev@example.com",
                "full_name": "Андрей Селезнёв",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 9, 27),
                "nationality": "Россия",
                "study_course": "Магистратура: Распределённые системы и облачные платформы (профиль: SRE и отказоустойчивость)",
                "study_group": "РСО-13",
                "phone": "+7 900 000-00-87",
                "social_links": "GitHub: github.com/a-seleznev",
            },
            {
                "email": "student.ksenia.nikolaeva@example.com",
                "full_name": "Ксения Николаева",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 6, 30),
                "nationality": "Россия",
                "study_course": "Магистратура: Распределённые системы и облачные платформы (профиль: SRE и отказоустойчивость)",
                "study_group": "РСО-13",
                "phone": "+7 900 000-00-88",
                "social_links": "Telegram: @ksenia_nikolaeva",
            },
            {
                "email": "student.fedor.fadeev@example.com",
                "full_name": "Фёдор Фадеев",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 6, 6),
                "nationality": "Армения",
                "study_course": "Магистратура: Распределённые системы и облачные платформы (профиль: SRE и отказоустойчивость)",
                "study_group": "РСО-13",
                "phone": "+7 900 000-00-89",
                "social_links": "GitHub: github.com/f-fadeev",
            },
            {
                "email": "student.anna.klimova@example.com",
                "full_name": "Анна Климова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 10, 18),
                "nationality": "Россия",
                "study_course": "Магистратура: Распределённые системы и облачные платформы (профиль: SRE и отказоустойчивость)",
                "study_group": "РСО-13",
                "phone": "+7 900 000-00-90",
                "social_links": "Telegram: @anna_klimova",
            },

            {
                "email": "student.viktoria.melnikova@example.com",
                "full_name": "Виктория Мельникова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 3, 1),
                "nationality": "Россия",
                "study_course": "Магистратура: Системная аналитика и управление продуктом (профиль: продуктовая аналитика)",
                "study_group": "САУП-23",
                "phone": "+7 900 000-00-91",
                "social_links": "Telegram: @v_melnikova",
            },
            {
                "email": "student.maxim.dubrovin@example.com",
                "full_name": "Максим Дубровин",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 8, 12),
                "nationality": "Россия",
                "study_course": "Магистратура: Системная аналитика и управление продуктом (профиль: продуктовая аналитика)",
                "study_group": "САУП-23",
                "phone": "+7 900 000-00-92",
                "social_links": "LinkedIn: linkedin.com/in/maxim-dubrovin",
            },
            {
                "email": "student.irina.lazareva@example.com",
                "full_name": "Ирина Лазарева",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 9, 9),
                "nationality": "Беларусь",
                "study_course": "Магистратура: Системная аналитика и управление продуктом (профиль: продуктовая аналитика)",
                "study_group": "САУП-23",
                "phone": "+7 900 000-00-93",
                "social_links": "VK: vk.com/irina_lazareva",
            },
            {
                "email": "student.artem.kalinin@example.com",
                "full_name": "Артём Калинин",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 1, 5),
                "nationality": "Россия",
                "study_course": "Магистратура: Системная аналитика и управление продуктом (профиль: продуктовая аналитика)",
                "study_group": "САУП-23",
                "phone": "+7 900 000-00-94",
                "social_links": "Telegram: @artem_kalinin",
            },
            {
                "email": "student.diana.sergeeva@example.com",
                "full_name": "Диана Сергеева",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 6, 11),
                "nationality": "Казахстан",
                "study_course": "Магистратура: Системная аналитика и управление продуктом (профиль: продуктовая аналитика)",
                "study_group": "САУП-23",
                "phone": "+7 900 000-00-95",
                "social_links": "Telegram: @diana_sergeeva",
            },
            {
                "email": "student.kirill.osipov@example.com",
                "full_name": "Кирилл Осипов",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 2, 23),
                "nationality": "Россия",
                "study_course": "Магистратура: Системная аналитика и управление продуктом (профиль: продуктовая аналитика)",
                "study_group": "САУП-23",
                "phone": "+7 900 000-00-96",
                "social_links": "GitHub: github.com/k-osipov",
            },
            {
                "email": "student.polina.vorobyova@example.com",
                "full_name": "Полина Воробьёва",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 12, 21),
                "nationality": "Россия",
                "study_course": "Магистратура: Системная аналитика и управление продуктом (профиль: продуктовая аналитика)",
                "study_group": "САУП-23",
                "phone": "+7 900 000-00-97",
                "social_links": "Telegram: @polina_vorobyova",
            },
            {
                "email": "student.denis.ryabinin@example.com",
                "full_name": "Денис Рябинин",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2001, 6, 2),
                "nationality": "Армения",
                "study_course": "Магистратура: Системная аналитика и управление продуктом (профиль: продуктовая аналитика)",
                "study_group": "САУП-23",
                "phone": "+7 900 000-00-98",
                "social_links": "LinkedIn: linkedin.com/in/denis-ryabinin",
            },
            {
                "email": "student.maria.kulikova@example.com",
                "full_name": "Мария Куликова",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2002, 4, 30),
                "nationality": "Россия",
                "study_course": "Магистратура: Системная аналитика и управление продуктом (профиль: продуктовая аналитика)",
                "study_group": "САУП-23",
                "phone": "+7 900 000-00-99",
                "social_links": "Telegram: @maria_kulikova",
            },
            {
                "email": "student.nikita.komarov@example.com",
                "full_name": "Никита Комаров",
                "password": "123",
                "role": ROLE_STUDENT,
                "birthday": date(2000, 9, 14),
                "nationality": "Россия",
                "study_course": "Магистратура: Системная аналитика и управление продуктом (профиль: продуктовая аналитика)",
                "study_group": "САУП-23",
                "phone": "+7 900 000-01-00",
                "social_links": "GitHub: github.com/n-komarov",
            }
        ]

        ''' Создание пользователей в БД + алиасы преподавателей '''
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

        ''' Курсы: список courses_data + вставка в БД '''
        teacher_b = users["b@b.com"]
        teacher_irina = users["teacher.irina@example.com"]
        teacher_gromov = users["teacher.alexey.gromov@example.com"]
        teacher_mironova = users["teacher.svetlana.mironova@example.com"]
        teacher_ivanov = users["teacher.sergey.ivanov@example.com"]
        teacher_kuznetsova = users["teacher.elena.kuznetsova@example.com"]
        teacher_sidorov = users["teacher.maxim.sidorov@example.com"]
        teacher_belyaeva = users["teacher.natalia.belyaeva@example.com"]
        teacher_smolin = users["teacher.pavel.smolin@example.com"]
        teacher_fedorova = users["teacher.olga.fedorova@example.com"]

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
            {
                "name": "AI-агенты: планирование, инструменты и исполнение задач (магистратура)",
                "description": "Архитектуры агентных систем: декомпозиция задач, планирование, вызовы инструментов (tool-use), управление контекстом и памятью. Разбор типовых провалов (галлюцинации, циклы, деградация контекста) и практики трассировки/логирования для воспроизводимых экспериментов.",
                "start_date": date(2025, 9, 22),
                "end_date": date(2025, 12, 2),
                "teacher_id": teacher_gromov.id,
            },
            {
                "name": "RAG и векторный поиск для LLM-приложений (магистратура)",
                "description": "Retrieval-Augmented Generation: построение индексов, эмбеддинги, чанкинг, фильтрация, reranking, оценка качества выдачи. Проектирование пайплайна «данные → индекс → ответ», контроль цитирований, борьба с устареванием знаний и конфликтующими источниками.",
                "start_date": date(2025, 9, 23),
                "end_date": date(2025, 12, 3),
                "teacher_id": teacher_smolin.id,
            },
            {
                "name": "Оценка LLM и агентных систем: метрики, тесты, red teaming (магистратура)",
                "description": "Метрики качества для генерации и инструментальных агентов: точность фактов, полнота, стабильность, cost/latency, успешность сценариев. Автотесты, «золотые» наборы, проверка регрессий, отрицательные тесты и red teaming. Практика: сбор датасета проверок под конкретный продукт.",
                "start_date": date(2025, 9, 24),
                "end_date": date(2025, 12, 4),
                "teacher_id": teacher_sidorov.id,
            },
            {
                "name": "NLP на трансформерах: от токенизации до instruction-tuning (магистратура)",
                "description": "Современный NLP-стек: токенизация, архитектуры на self-attention, тонкая настройка под задачу, prompt/instruction-подходы. Разбор ошибок: смещения данных, утечки, некорректная оценка. Практикум на задачах классификации, извлечения сущностей и суммаризации.",
                "start_date": date(2025, 9, 25),
                "end_date": date(2025, 12, 5),
                "teacher_id": teacher_ivanov.id,
            },
            {
                "name": "Диалоговые системы и память агента (магистратура)",
                "description": "Проектирование диалогового контура: управление контекстом, краткосрочная/долгосрочная память, профили пользователя, политики хранения данных. Дизайн state machine, обработка ошибок инструментов, кэширование и контроль качества ответов в многотуровом диалоге.",
                "start_date": date(2025, 9, 26),
                "end_date": date(2025, 12, 8),
                "teacher_id": teacher_gromov.id,
            },
            {
                "name": "Компьютерное зрение: детекция и сегментация в реальных проектах (магистратура)",
                "description": "Практический CV: детекция объектов, сегментация, трекинг, метрики (mAP/IoU), ошибки разметки и смещение доменов. Подготовка датасета, аугментации, анализ качества по классам и сценариям. Итог: мини-проект под прикладной кейс.",
                "start_date": date(2025, 9, 29),
                "end_date": date(2025, 12, 9),
                "teacher_id": teacher_mironova.id,
            },
            {
                "name": "Segment Anything и promptable-сегментация (магистратура)",
                "description": "Подходы к «подсказочной» сегментации: интерактивные промпты (точки/боксы), перенос на новые домены, качество масок и устойчивость к шуму. Практика: использование foundation-модели для ускорения разметки и построения пайплайна улучшения данных.",
                "start_date": date(2025, 9, 30),
                "end_date": date(2025, 12, 10),
                "teacher_id": teacher_mironova.id,
            },
            {
                "name": "Мультимодальные модели: текст–изображение и VLM-пайплайны (магистратура)",
                "description": "Vision-Language подходы: объединение признаков текста и изображения, постановка задач VQA, captioning, мультимодальный поиск. Конструирование датасетов, негативные примеры, оценка качества и типовые сбои (доменные артефакты, ложные корреляции).",
                "start_date": date(2025, 10, 1),
                "end_date": date(2025, 12, 11),
                "teacher_id": teacher_kuznetsova.id,
            },
            {
                "name": "MLOps для ML/LLM: деплой, мониторинг, дрейф и A/B (магистратура)",
                "description": "Промышленный цикл ML/LLM: эксперимент-менеджмент, версии данных/моделей, CI/CD, мониторинг качества и дрейфа, алерты, канареечные релизы, A/B-тестирование. Разбор инцидентов: деградация качества после релиза, невалидные данные, «тихие» ошибки.",
                "start_date": date(2025, 10, 2),
                "end_date": date(2025, 12, 12),
                "teacher_id": teacher_kuznetsova.id,
            },
            {
                "name": "Безопасность LLM-систем: prompt injection, RAG-атаки и доступ (магистратура)",
                "description": "Модели угроз для LLM/агентов: prompt injection, утечки данных из контекста, атаки через внешние источники (RAG), злоупотребление инструментами. Политики доступа, изоляция инструментов, валидация входов/выходов, журналирование и расследование инцидентов.",
                "start_date": date(2025, 10, 3),
                "end_date": date(2025, 12, 15),
                "teacher_id": teacher_belyaeva.id,
            },
            {
                "name": "Информационный поиск и ранжирование для агентных систем (магистратура)",
                "description": "Поиск как компонент агента: BM25 vs dense retrieval, гибридный поиск, reranking, фильтрация по метаданным, оценка релевантности. Практика: построение «поискового слоя» под RAG и измерение влияния качества retrieval на итоговый ответ.",
                "start_date": date(2025, 10, 6),
                "end_date": date(2025, 12, 16),
                "teacher_id": teacher_smolin.id,
            },
            {
                "name": "Эффективное обучение и инференс: квантование, дистилляция, оптимизация (магистратура)",
                "description": "Оптимизация вычислений: смешанная точность, квантование, дистилляция, профилирование узких мест, батчинг и кэширование. Практика: сравнение компромиссов «скорость/память/качество» на одном и том же наборе задач.",
                "start_date": date(2025, 10, 7),
                "end_date": date(2025, 12, 17),
                "teacher_id": teacher_sidorov.id,
            },
            {
                "name": "RLHF и обучение по предпочтениям (магистратура)",
                "description": "Обучение моделей по предпочтениям: сбор парных сравнений, reward-модели, методы оптимизации политики и альтернативные подходы (DPO и др.). Риски: смещение разметчиков, «перевоспитание» модели, деградация по скрытым метрикам. Практика: мини-пайплайн предпочтений на учебном датасете.",
                "start_date": date(2025, 10, 8),
                "end_date": date(2025, 12, 18),
                "teacher_id": teacher_gromov.id,
            },
            {
                "name": "Инженерия данных для ML/LLM: качество, разметка и data contracts (магистратура)",
                "description": "Качество данных как ядро ML: схемы, валидация, дедупликация, контроль дрейфа, разметка и активное обучение. Практика: создание чек-листов качества, выявление утечек таргета и построение воспроизводимого датасета под NLP/CV-задачу.",
                "start_date": date(2025, 10, 9),
                "end_date": date(2025, 12, 19),
                "teacher_id": teacher_fedorova.id,
            },
            {
                "name": "Семинар-практикум: прототипирование агентного продукта (магистратура)",
                "description": "Командный практикум: от постановки задачи и метрик успеха до прототипа агентного сервиса. Обязательные компоненты: оценка качества, наблюдаемость (tracing), политика доступа, план отката релиза. Защита проекта: демонстрация сценариев и отчёт по экспериментам.",
                "start_date": date(2025, 10, 10),
                "end_date": date(2025, 12, 22),
                "teacher_id": teacher_fedorova.id,
            },
            {
                "name": "ReAct-агенты: рассуждение и действие в LLM-пайплайнах (магистратура)",
                "description": "Шаблон Reason+Act: построение траекторий «наблюдение → мысль → действие → наблюдение». Практика: агенты, которые выбирают инструменты, уточняют данные и корректируют план при ошибках. Отладка: логирование шагов, детект циклов и «ложной уверенности».",
                "start_date": date(2026, 2, 2),
                "end_date": date(2026, 5, 18),
                "teacher_id": teacher_gromov.id,
            },
            {
                "name": "Инструментальные LLM: когда и как вызывать API (магистратура)",
                "description": "Функциональные вызовы и API-оркестрация: схемы аргументов, валидация, обработка исключений, стратегии ретраев/таймаутов. Проектирование безопасного слоя инструментов и контрактов данных. Практикум: калькулятор/поиск/БД как инструменты агента.",
                "start_date": date(2026, 2, 3),
                "end_date": date(2026, 5, 19),
                "teacher_id": teacher_smolin.id,
            },
            {
                "name": "Tree-of-Thoughts: поиск по дереву рассуждений (магистратура)",
                "description": "Планирование с разветвлением: генерация нескольких «веток» мыслей, самопроверка, отсев слабых путей, бэктрекинг. Настройка бюджета вычислений и критериев остановки. Практика: задачные сценарии, где линейный CoT часто проваливается.",
                "start_date": date(2026, 2, 4),
                "end_date": date(2026, 5, 20),
                "teacher_id": teacher_sidorov.id,
            },
            {
                "name": "Мультиагентные системы: роли, координация и переговоры (магистратура)",
                "description": "Дизайн многоагентных конфигураций: распределение ролей (planner/executor/critic), протоколы обмена сообщениями, консенсус и арбитраж. Метрики командной эффективности и диагностика деградации (споры, «эхо-камеры», дублирование работы).",
                "start_date": date(2026, 2, 5),
                "end_date": date(2026, 5, 21),
                "teacher_id": teacher_gromov.id,
            },
            {
                "name": "Оркестрация агентных workflow: графы, состояния и контроль выполнения (магистратура)",
                "description": "Агент как управляемый процесс: state machine/граф действий, контроль переходов, чекпойнты, идемпотентность шагов. Практика: построение воспроизводимого пайплайна «сбор данных → анализ → отчёт» с журналированием и откатами.",
                "start_date": date(2026, 2, 6),
                "end_date": date(2026, 5, 22),
                "teacher_id": teacher_fedorova.id,
            },
            {
                "name": "Надёжность LLM/агентов: таймауты, ретраи, деградация и SLO (магистратура)",
                "description": "Инженерия надёжности агентных сервисов: классы сбоев, ретраи с джиттером, дедлайны, фолбэки, деградационные режимы. Наблюдаемость: трассировка шагов, метрики latency/cost/success-rate, инцидент-репорты и регресс-тесты.",
                "start_date": date(2026, 2, 9),
                "end_date": date(2026, 5, 25),
                "teacher_id": teacher_kuznetsova.id,
            },
            {
                "name": "RAG-проекты: от baseline до адаптивного retrieval (магистратура)",
                "description": "Углублённый RAG: продвинутый чанкинг, фильтрация, reranking, адаптивная глубина поиска, контроль цитирований и конфликтов источников. Оценка: влияние retrieval на итоговый ответ, диагностика провалов «нет в индексе» и «нашли не то».",
                "start_date": date(2026, 2, 10),
                "end_date": date(2026, 5, 26),
                "teacher_id": teacher_smolin.id,
            },
            {
                "name": "Знания агента: графы знаний, извлечение фактов и связей (магистратура)",
                "description": "Извлечение сущностей/отношений, нормализация и дедупликация фактов, построение графа знаний как источника для RAG/агентов. Практика: конвейер «документы → факты → граф → ответы», контроль качества и версионирование.",
                "start_date": date(2026, 2, 11),
                "end_date": date(2026, 5, 27),
                "teacher_id": teacher_ivanov.id,
            },
            {
                "name": "Синтетические данные для NLP и агентов (магистратура)",
                "description": "Генерация синтетических примеров: шаблоны, вариативность, негативные примеры, фильтрация качества. Риски: утечка подсказок, «стерильные» данные, переобучение на искусственных паттернах. Практика: улучшение датасета для классификации и диалога.",
                "start_date": date(2026, 2, 12),
                "end_date": date(2026, 5, 28),
                "teacher_id": teacher_fedorova.id,
            },
            {
                "name": "PEFT и адаптация моделей: LoRA/адаптеры/промпт-тюнинг (магистратура)",
                "description": "Параметро-эффективное дообучение: когда достаточно частичной адаптации, как контролировать качество и не «сломать» базовые навыки. Практика: подбор гиперпараметров, сравнение с полным fine-tuning, хранение и версионирование адаптеров.",
                "start_date": date(2026, 2, 13),
                "end_date": date(2026, 5, 29),
                "teacher_id": teacher_sidorov.id,
            },
            {
                "name": "Vision Transformers в компьютерном зрении (магистратура)",
                "description": "CV-бекбоны на трансформерах: патчи, позиционные кодировки, предобучение и перенос на прикладные задачи. Практика: fine-tuning под классификацию/детекцию, анализ ошибок и устойчивости к доменному сдвигу.",
                "start_date": date(2026, 2, 16),
                "end_date": date(2026, 6, 1),
                "teacher_id": teacher_mironova.id,
            },
            {
                "name": "CLIP и кросс-модальные эмбеддинги: поиск и zero-shot (магистратура)",
                "description": "Связка текст–изображение: обучение совместных представлений, zero-shot классификация, мультимодальный поиск, построение витрины «текст → релевантные изображения/видео». Практика: оценка качества retrieval и калибровка порогов.",
                "start_date": date(2026, 2, 17),
                "end_date": date(2026, 6, 2),
                "teacher_id": teacher_kuznetsova.id,
            },
            {
                "name": "Генеративное CV: диффузионные модели и управление качеством (магистратура)",
                "description": "Диффузионные подходы: базовая теория, условная генерация, guidance, контроль качества и артефактов. Практика: генерация данных для обучения/аугментаций, оценка пригодности синтетики для downstream-задач.",
                "start_date": date(2026, 2, 18),
                "end_date": date(2026, 6, 3),
                "teacher_id": teacher_mironova.id,
            },
            {
                "name": "Видеоаналитика: сегментация и трекинг с памятью (магистратура)",
                "description": "Видео как последовательность кадров: трекинг объектов, устойчивость масок, работа с окклюзиями и быстрыми движениями. Практика: «promptable» сегментация и перенос на видео-сценарии, оценка стабильности и скорости.",
                "start_date": date(2026, 2, 19),
                "end_date": date(2026, 6, 4),
                "teacher_id": teacher_mironova.id,
            },
            {
                "name": "Document AI: извлечение структуры из PDF и сканов (магистратура)",
                "description": "Понимание документов: заголовки/таблицы/списки, извлечение сущностей, связывание полей, контроль ошибок. Практика: конвейер «документ → структурированные данные → проверка качества → отчёт» для корпоративных кейсов.",
                "start_date": date(2026, 2, 20),
                "end_date": date(2026, 6, 5),
                "teacher_id": teacher_ivanov.id,
            },
            {
                "name": "Агентный поиск по документам: тематическая навигация и ответы (магистратура)",
                "description": "Сочетание NLP и retrieval: тематическое моделирование/классификация, маршрутизация запросов, многошаговый поиск, построение ответов с ссылками на фрагменты. Практика: «вопрос → план поиска → выбор источников → ответ с цитатами».",
                "start_date": date(2026, 2, 23),
                "end_date": date(2026, 6, 8),
                "teacher_id": teacher_smolin.id,
            },
            {
                "name": "Безопасная разработка LLM-приложений и агентов (магистратура)",
                "description": "Угрозы и меры защиты: prompt injection, подмена источников, утечки через контекст, опасные аргументы инструментов. Практика: строгие схемы ввода/вывода, политики доступа, журналирование, изоляция инструментов и безопасные фолбэки.",
                "start_date": date(2026, 2, 24),
                "end_date": date(2026, 6, 9),
                "teacher_id": teacher_belyaeva.id,
            },
            {
                "name": "Этика и качество данных в ML/LLM: приватность, лицензии, bias (магистратура)",
                "description": "Практические вопросы качества и ответственности: приватность, минимизация данных, правомерность источников, смещения и справедливость метрик. Разбор кейсов: что логировать, что хранить, как обосновывать решения и менять процесс, а не «косметику».",
                "start_date": date(2026, 2, 25),
                "end_date": date(2026, 6, 10),
                "teacher_id": teacher_fedorova.id,
            },
            {
                "name": "On-device ML: оптимизация инференса и ограничения ресурсов (магистратура)",
                "description": "Инференс под ограничениями: квантование, компрессия, кэширование, выбор архитектур под CPU/GPU/NPU. Практика: оценка «качество/скорость/память», профилирование и настройка параметров для edge-сценариев.",
                "start_date": date(2026, 2, 26),
                "end_date": date(2026, 6, 11),
                "teacher_id": teacher_sidorov.id,
            },
            {
                "name": "Экономика LLM/агентов: cost, latency, маршрутизация и кэширование (магистратура)",
                "description": "Управление затратами: batching, кеши ответов, семантическое кэширование, роутинг по моделям (cheap vs strong), ограничение контекста. Практика: бюджетирование и SLA, отчётность по стоимости сценариев и оптимизация без потери качества.",
                "start_date": date(2026, 2, 27),
                "end_date": date(2026, 6, 12),
                "teacher_id": teacher_kuznetsova.id,
            },
            {
                "name": "Капстоун: агентный ассистент для учебного процесса (магистратура)",
                "description": "Командный проект: агент, который помогает студенту (поиск материалов, планирование, проверка результата) и преподавателю (аналитика, отчёты, обратная связь). Обязательные артефакты: метрики, тестовый набор, наблюдаемость, безопасность и демо-сценарии.",
                "start_date": date(2026, 3, 2),
                "end_date": date(2026, 6, 15),
                "teacher_id": teacher_fedorova.id,
            }
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


        ''' План уроков lessons_plan (темы/даты/аудитории) '''
        lessons_plan = [
            ("Лекция 1: Архитектуры AI-агентов — роли, память, планирование, контроль выполнения", date(2025, 10, 13), "Аудитория 210"),
            ("Семинар 1: Декомпозиция задач агента — план, критерии остановки, анти-циклы и fallback", date(2025, 10, 20), "Аудитория 210"),

            ("Лекция 2: ReAct — рассуждение и действие, интерпретируемые траектории решения", date(2025, 10, 14), "Аудитория 305"),
            ("Семинар 2: Реализация ReAct-цикла — логирование шагов, обработка ошибок инструментов", date(2025, 10, 21), "Аудитория 305"),

            ("Лекция 3: Tool-use и API-оркестрация — схемы аргументов, валидация, таймауты", date(2025, 10, 15), "Аудитория 220"),
            ("Семинар 3: Контракты инструментов — allowlist, валидация выходов, ретраи с джиттером", date(2025, 10, 22), "Аудитория 220"),

            ("Лекция 4: Tree-of-Thoughts — поиск по дереву рассуждений и самопроверка веток", date(2025, 10, 16), "Аудитория 410"),
            ("Семинар 4: ToT на практике — генерация веток, оценка, отсев, бэктрекинг, бюджет вычислений", date(2025, 10, 23), "Аудитория 410"),

            ("Лекция 5: RAG — retrieval, индексация, чанкинг, контроль источников и цитирований", date(2025, 10, 17), "Аудитория 112"),
            ("Семинар 5: Построение RAG baseline — чанкинг, эмбеддинги, фильтрация, качество выдачи", date(2025, 10, 24), "Аудитория 112"),

            ("Лекция 6: Векторный поиск и reranking — гибридный retrieval и влияние на итоговый ответ", date(2025, 10, 18), "Аудитория 112"),
            ("Семинар 6: Оценка retrieval — релевантность, hard negatives, разбор «нашли не то»", date(2025, 10, 25), "Аудитория 112"),

            ("Лекция 7: Оценка LLM/агентов — метрики качества, регрессии, cost/latency и SLO", date(2025, 10, 19), "Аудитория 201"),
            ("Семинар 7: Автотестирование агента — сценарии, «золотой» набор, детект деградаций", date(2025, 10, 26), "Аудитория 201"),

            ("Лекция 8: Red teaming — негативные тесты, провокации, устойчивость и отчёт по рискам", date(2025, 10, 20), "Аудитория 410"),
            ("Семинар 8: Набор атакующих промптов — injection, jailbreak, конфликты источников, защита", date(2025, 10, 27), "Аудитория 410"),

            ("Лекция 9: Безопасность LLM-систем — prompt injection, RAG-атаки, утечки контекста", date(2025, 10, 21), "Аудитория 220"),
            ("Семинар 9: Защитный слой — изоляция инструментов, политики доступа, аудит и трассировка", date(2025, 10, 28), "Аудитория 220"),

            ("Лекция 10: MLOps для ML/LLM — деплой, мониторинг качества, дрейф данных и модели", date(2025, 10, 22), "Аудитория 318"),
            ("Семинар 10: Инциденты в проде — алерты, канареечные релизы, откат и постмортем", date(2025, 10, 29), "Аудитория 318"),

            ("Лекция 11: PEFT/LoRA — параметро-эффективная адаптация и контроль качества", date(2025, 10, 23), "Аудитория 318"),
            ("Семинар 11: Настройка fine-tuning — гиперпараметры, сравнение с baseline, отчёт эксперимента", date(2025, 10, 30), "Аудитория 318"),

            ("Лекция 12: RLHF и обучение по предпочтениям — reward-модель и оптимизация политики", date(2025, 10, 24), "Аудитория 507"),
            ("Семинар 12: Качество предпочтений — смещения разметки, sanity-checks, устойчивость метрик", date(2025, 10, 31), "Аудитория 507"),

            ("Лекция 13: NLP на трансформерах — токенизация, attention, instruction/prompting", date(2025, 10, 25), "Аудитория 305"),
            ("Семинар 13: Ошибки NLP-экспериментов — утечки, смещение данных, неверная валидация", date(2025, 11, 1), "Аудитория 305"),

            ("Лекция 14: Извлечение информации — NER/RE, нормализация фактов и качество разметки", date(2025, 10, 26), "Аудитория 112"),
            ("Семинар 14: Пайплайн «документы → сущности/связи» — разбор ошибок и правила нормализации", date(2025, 11, 2), "Аудитория 112"),

            ("Лекция 15: Графы знаний для агентов — хранение фактов, версии, конфликтующие источники", date(2025, 10, 27), "Аудитория 410"),
            ("Семинар 15: Построение мини-KG — дедупликация, слияние сущностей, проверка консистентности", date(2025, 11, 3), "Аудитория 410"),

            ("Лекция 16: Компьютерное зрение — детекция, сегментация, метрики IoU/mAP, устойчивость", date(2025, 10, 28), "Аудитория 144"),
            ("Семинар 16: Разбор CV-качества — ошибки разметки, смещение домена, анализ по классам", date(2025, 11, 4), "Аудитория 144"),

            ("Лекция 17: Segment Anything — promptable segmentation и перенос на новые домены", date(2025, 10, 29), "Аудитория 144"),
            ("Семинар 17: Стратегии промптов — точки/боксы, уточнение, контроль «дыр» и артефактов маски", date(2025, 11, 5), "Аудитория 144"),

            ("Лекция 18: Мультимодальные модели — VLM, VQA, captioning и мультимодальный поиск", date(2025, 10, 30), "Аудитория 305"),
            ("Семинар 18: Мультимодальный retrieval — эмбеддинги, hard negatives, оценка релевантности", date(2025, 11, 6), "Аудитория 305"),

            ("Лекция 19: CLIP-подход — zero-shot, кросс-модальные эмбеддинги и калибровка уверенности", date(2025, 10, 31), "Аудитория 305"),
            ("Семинар 19: Калибровка порогов и ошибки zero-shot — ложные корреляции и доменные артефакты", date(2025, 11, 7), "Аудитория 305"),

            ("Лекция 20: Диффузионные модели — генерация изображений и применение синтетики в CV", date(2025, 11, 1), "Аудитория 112"),
            ("Семинар 20: Синтетические данные — фильтрация качества, разнообразие, проверка пригодности", date(2025, 11, 8), "Аудитория 112"),

            ("Лекция 21: Видеоаналитика — трекинг, сегментация во времени, работа с окклюзиями", date(2025, 11, 2), "Аудитория 410"),
            ("Семинар 21: Видеокейсы — стабильность масок, скорость, деградации при шуме и движении", date(2025, 11, 9), "Аудитория 410"),

            ("Лекция 22: Document AI — извлечение структуры (таблицы/поля), качество и валидация", date(2025, 11, 3), "Аудитория 220"),
            ("Семинар 22: Конвейер документов — «PDF → структура → проверка → выгрузка», обработка крайних случаев", date(2025, 11, 10), "Аудитория 220"),

            ("Лекция 23: Экономика LLM/агентов — cost, latency, кэширование и маршрутизация по моделям", date(2025, 11, 4), "Аудитория 201"),
            ("Семинар 23: Оптимизация стоимости — семантический кэш, batching, лимиты контекста, профилирование", date(2025, 11, 11), "Аудитория 201"),

            ("Лекция 24: On-device ML — квантование, компрессия, профилирование и ограничения ресурсов", date(2025, 11, 5), "Аудитория 318"),
            ("Семинар 24: Сравнение компромиссов — «качество/скорость/память» на одном сценарии инференса", date(2025, 11, 12), "Аудитория 318"),

            ("Лекция 25: Капстоун — проектирование агентного продукта: метрики, тесты, безопасность, демо", date(2025, 11, 6), "Аудитория 507"),
            ("Семинар 25: Защита решения — демонстрация сценариев, отчёт экспериментов и план эксплуатационных рисков", date(2025, 11, 13), "Аудитория 507"),
                        ("Лекция 26: Управление контекстом и памятью агента — краткосрочная/долгосрочная память, суммаризация, политики хранения", date(2025, 11, 10), "Аудитория 210"),
            ("Семинар 26: Практика памяти — профили пользователя, векторная память, контроль «забывания», тесты на стабильность диалога", date(2025, 11, 13), "Аудитория 210"),

            ("Лекция 27: Prompt engineering для агентов — системные инструкции, спецификации инструментов, guardrails и контроль стиля ответа", date(2025, 11, 17), "Аудитория 305"),
            ("Семинар 27: Шаблоны промптов — библиотека промптов, негативные примеры, автопроверки и регрессии на сценариях", date(2025, 11, 20), "Аудитория 305"),

            ("Лекция 28: RAG — продвинутый чанкинг и подготовка корпуса: семантические сегменты, метаданные, дедупликация, версии", date(2025, 11, 24), "Аудитория 112"),
            ("Семинар 28: Чанкинг-эксперименты — сравнение стратегий, абляции, влияние на retrieval и итоговую точность ответа", date(2025, 11, 27), "Аудитория 112"),

            ("Лекция 29: Ранжирование и гибридный поиск — BM25 + dense retrieval, cross-encoder reranking, фильтрация источников", date(2025, 12, 1), "Аудитория 112"),
            ("Семинар 29: Абляции retrieval — hybrid vs dense, rerank on/off, анализ провалов «нашли не то/не нашли вовсе»", date(2025, 12, 4), "Аудитория 112"),

            ("Лекция 30: Фактуальность и цитирования — grounded generation, атрибуция, конфликт источников и контроль уверенности", date(2025, 12, 8), "Аудитория 220"),
            ("Семинар 30: Проверка фактов — разметка утверждений, авто-оценка «faithfulness», протоколы спорных источников", date(2025, 12, 11), "Аудитория 220"),

            ("Лекция 31: Оценка LLM/агентов на масштабе — тест-наборы, регрессии, метрики качества, стоимость и задержки", date(2025, 12, 15), "Аудитория 201"),
            ("Семинар 31: Тестовый стенд — сценарные тесты, «золотые» ответы, детект деградаций и отчёты по метрикам", date(2025, 12, 18), "Аудитория 201"),

            ("Лекция 32: Оркестрация агентных workflow — графы, state machine, чекпойнты, идемпотентность шагов", date(2025, 12, 22), "Аудитория 410"),
            ("Семинар 32: Практика workflow — ретраи, дедлайны, фолбэки, журналирование шагов и воспроизводимость запусков", date(2025, 12, 25), "Аудитория 410"),

            ("Лекция 33: Human-in-the-loop — подтверждения, очереди ревью, обучение на обратной связи, контроль качества разметки", date(2025, 12, 29), "Аудитория 318"),
            ("Семинар 33: Контур ревью — правила эскалации, интерфейс проверки, сбор фидбека и «закрытие» кейсов", date(2026, 1, 1), "Аудитория 318"),

            ("Лекция 34: Prompt injection и атаки на агентов — типовые паттерны, подмена инструкций, инъекции через документы", date(2026, 1, 5), "Аудитория 220"),
            ("Семинар 34: Red-team лабораторная — атаки на RAG/инструменты, оценка ущерба, настройка контрмер и логирование", date(2026, 1, 8), "Аудитория 220"),

            ("Лекция 35: Приватность и PII — минимизация данных, маскирование, политики хранения, базовые принципы приватной обработки", date(2026, 1, 12), "Аудитория 201"),
            ("Семинар 35: PII-пайплайн — редактирование/маскирование, правила доступа, тест-кейсы на утечки и аудит логов", date(2026, 1, 15), "Аудитория 201"),

            ("Лекция 36: Мультимодальные агенты — VLM, понимание изображений, инструментальные действия по визуальному вводу", date(2026, 1, 19), "Аудитория 144"),
            ("Семинар 36: Мультимодальный сценарий — вопрос по изображению + поиск источников + ответ с ссылками на контент", date(2026, 1, 22), "Аудитория 144"),

            ("Лекция 37: CV-пайплайны — детекция/сегментация, метрики IoU/mAP, доменный сдвиг и качество разметки", date(2026, 1, 26), "Аудитория 144"),
            ("Семинар 37: Разбор ошибок CV — анализ по классам, типы провалов, стратегия улучшения датасета и аугментаций", date(2026, 1, 29), "Аудитория 144"),

            ("Лекция 38: Контрастивные эмбеддинги — self-supervised обучение для текста/изображений и retrieval-задачи", date(2026, 2, 2), "Аудитория 305"),
            ("Семинар 38: Retrieval-оценка эмбеддингов — hard negatives, калибровка порогов, метрики качества поиска", date(2026, 2, 5), "Аудитория 305"),

            ("Лекция 39: Выбор стратегии: prompting vs RAG vs fine-tuning — критерии, риски, стоимость и поддерживаемость", date(2026, 2, 9), "Аудитория 210"),
            ("Семинар 39: Decision matrix — разбор кейсов, выбор подхода, план экспериментов и критерии успеха", date(2026, 2, 12), "Аудитория 210"),

            ("Лекция 40: PEFT на практике — LoRA/адаптеры, стабильность обучения, контроль деградации базовых навыков", date(2026, 2, 16), "Аудитория 318"),
            ("Семинар 40: LoRA-эксперимент — настройка гиперпараметров, сравнение с baseline, отчёт и воспроизводимость", date(2026, 2, 19), "Аудитория 318"),

            ("Лекция 41: Эффективный инференс — batching, кэширование, управление контекстом, оптимизация latency/cost", date(2026, 2, 23), "Аудитория 201"),
            ("Семинар 41: Профилирование инференса — замеры задержек, влияние размера батча/контекста, рекомендации по оптимизации", date(2026, 2, 26), "Аудитория 201"),

            ("Лекция 42: Edge/on-device ML — квантование, компрессия, профилирование и ограничения вычислительных ресурсов", date(2026, 3, 2), "Аудитория 507"),
            ("Семинар 42: Бенчмарк на edge — сравнение «качество/скорость/память», выбор параметров и формат отчёта", date(2026, 3, 5), "Аудитория 507"),

            ("Лекция 43: Наблюдаемость агентных систем — трассировка шагов, метрики, алерты, постмортем и SLO", date(2026, 3, 9), "Аудитория 410"),
            ("Семинар 43: Tracing-практикум — структура логов, корреляция шагов, анализ инцидентов и регрессионные отчёты", date(2026, 3, 12), "Аудитория 410"),

            ("Лекция 44: Разметка и качество данных — гайдлайны, согласованность разметчиков, контроль ошибок и дрейфа", date(2026, 3, 16), "Аудитория 112"),
            ("Семинар 44: Процедуры качества — чек-листы разметки, spot-check, adjudication и отчёт о согласованности", date(2026, 3, 19), "Аудитория 112"),

            ("Лекция 45: Синтетические данные — генерация, разнообразие, фильтрация, риски утечек и «стерильных» паттернов", date(2026, 3, 23), "Аудитория 305"),
            ("Семинар 45: Синтетика в пайплайне — генерация + валидация + абляции, оценка влияния на downstream-метрики", date(2026, 3, 26), "Аудитория 305"),

            ("Лекция 46: Knowledge Graph для RAG — entity linking, relation extraction, консистентность и версии фактов", date(2026, 3, 30), "Аудитория 220"),
            ("Семинар 46: Mini-KG на практике — извлечение сущностей/связей, дедупликация, запросы и интеграция в ответы", date(2026, 4, 2), "Аудитория 220"),

            ("Лекция 47: Document AI и структурированные выходы — схемы данных, валидация, обработка крайних случаев", date(2026, 4, 6), "Аудитория 112"),
            ("Семинар 47: Извлечение в структуру — строгие схемы, проверка полей, обработка ошибок и качество на сложных документах", date(2026, 4, 9), "Аудитория 112"),

            ("Лекция 48: Робастность ML/LLM — OOD, стресс-тесты, устойчивость к шуму и атакующим входам", date(2026, 4, 13), "Аудитория 410"),
            ("Семинар 48: Stress testing — генерация «плохих» примеров, измерение деградации и план мер по устойчивости", date(2026, 4, 16), "Аудитория 410"),

            ("Лекция 49: Этика и bias-аудит — риски смещений, fairness-метрики, практики оценки и документирования", date(2026, 4, 20), "Аудитория 201"),
            ("Семинар 49: План bias-аудита — выбор метрик, протокол экспериментов, отчётность и меры по снижению рисков", date(2026, 4, 23), "Аудитория 201"),

            ("Лекция 50: Итоговый модуль — дизайн агентного продукта: требования, метрики, тесты, безопасность и демонстрация", date(2026, 4, 27), "Аудитория 507"),
            ("Семинар 50: Репетиция защиты — демонстрация сценариев, отчёт экспериментов, риск-регистр и план эксплуатации", date(2026, 4, 30), "Аудитория 507"),
        ]

        ''' Генерация уроков (Lesson) по курсам '''
        lessons = []
        rng_lessons = random.Random(SEED_LESSONS)

        demo_course_ids = {c.id for c in courses[:DEMO_COURSES]}

        for course in courses:
            n_lessons = LESSONS_PER_COURSE if course.id in demo_course_ids else 2
            base_date = course.start_date

            for n in range(n_lessons):
                topic, _, room = lessons_plan[(course.id + n) % len(lessons_plan)]
                d = base_date + timedelta(days=7 * n)

                slot = rng_lessons.randrange(3)
                if slot == 0:
                    st, et = time(9, 0), time(10, 30)
                elif slot == 1:
                    st, et = time(10, 0), time(11, 30)
                else:
                    st, et = time(11, 0), time(12, 30)

                l = Lesson(
                    course_id=course.id,
                    topic=topic,
                    date=d,
                    room=room,
                    start_time=st,
                    end_time=et,
                )
                db.add(l)
                db.flush()
                lessons.append(l)

        db.commit()

        ''' Посещаемость (Attendance): выбор студентов, статусы, генерация отметок '''
        rng_att = random.Random(SEED_ATTENDANCE)

        all_students = sorted(
            [u for u in users.values() if u.role == ROLE_STUDENT],
            key=lambda u: u.id,
        )

        demo_courses = courses[:DEMO_COURSES]
        demo_course_ids = {c.id for c in demo_courses}

        students_by_course = {}

        k_students = min(STUDENTS_PER_COURSE, len(all_students))
        for c in demo_courses:
            students_by_course[c.id] = rng_att.sample(all_students, k=k_students)

        students = all_students[:k_students]


        status_matrix = [
            (AttendanceStatus.present, "Присутствовал, активно участвовал в обсуждении, задавал вопросы."),
            (AttendanceStatus.present, "Присутствовал, корректно выполнил задания на семинаре."),
            (AttendanceStatus.present, "Присутствовал, предложил альтернативный подход к решению кейса."),
            (AttendanceStatus.present, "Присутствовал, помог группе с разбором ошибок в решении."),

            (AttendanceStatus.late, "Опоздание на 5 минут, причина: транспорт."),
            (AttendanceStatus.late, "Опоздание на 10 минут, причина: задержка на проходной."),
            (AttendanceStatus.late, "Опоздание на 15 минут, причина: пересадка/пробки."),
            (AttendanceStatus.late, "Опоздание на 7 минут, причина: технические проблемы (подключение/ноутбук)."),

            (AttendanceStatus.absent, "Отсутствовал без уважительной причины."),
            (AttendanceStatus.absent, "Не явился, предварительно не предупредил преподавателя."),
            (AttendanceStatus.absent, "Отсутствовал, причину не сообщил."),
            (AttendanceStatus.absent, "Не присутствовал, самостоятельная работа не была сдана в срок."),

            (AttendanceStatus.excused, "Отсутствовал по уважительной причине (справка)."),
            (AttendanceStatus.excused, "Отсутствовал по уважительной причине (семейные обстоятельства)."),
            (AttendanceStatus.excused, "Отсутствовал по уважительной причине (участие в конференции/олимпиаде)."),
            (AttendanceStatus.excused, "Отсутствовал по уважительной причине (оформление документов)."),
        ]



        demo_course_ids = set(students_by_course.keys())

        lessons_by_course = {}
        for lesson in lessons:
            if lesson.course_id in demo_course_ids:
                lessons_by_course.setdefault(lesson.course_id, []).append(lesson)

        comments_by_status = {}
        for st, comment in status_matrix:
            comments_by_status.setdefault(st, []).append(comment)

        rng_status = random.Random(SEED_ATTENDANCE + 99)

        profile = {}
        for s in all_students:
            r = rng_status.random()
            if r < 0.10:
                profile[s.id] = (0.55, 0.10, 0.25, 0.10)
            elif r < 0.35:
                profile[s.id] = (0.78, 0.10, 0.08, 0.04)
            else:
                profile[s.id] = (0.90, 0.06, 0.03, 0.01)

        def pick_status(student_id, is_event, last_status, streak_absent, streak_late):
            p_present, p_late, p_absent, p_excused = profile[student_id]

            w_present = p_present
            w_late = p_late
            w_absent = p_absent
            w_excused = p_excused

            if is_event:
                w_present *= 0.75
                w_late *= 1.25
                w_absent *= 1.60
                w_excused *= 1.10

            if last_status == AttendanceStatus.absent:
                w_present *= 0.65
                w_absent *= (1.40 + 0.20 * min(streak_absent, 3))
                w_late *= 1.05

            if last_status == AttendanceStatus.late:
                w_present *= 0.80
                w_late *= (1.25 + 0.10 * min(streak_late, 3))
                w_absent *= 1.10

            total = w_present + w_late + w_absent + w_excused
            x = rng_status.random() * total

            if x < w_present:
                return AttendanceStatus.present
            x -= w_present
            if x < w_late:
                return AttendanceStatus.late
            x -= w_late
            if x < w_absent:
                return AttendanceStatus.absent
            return AttendanceStatus.excused

        for course_id, course_lessons in lessons_by_course.items():
            course_lessons = sorted(course_lessons, key=lambda x: x.date)
            course_students = students_by_course.get(course_id, [])
            if not course_students:
                continue

            event_k = 2 if len(course_lessons) >= 9 else 1
            event_idxs = set(rng_status.sample(range(len(course_lessons)), k=event_k))

            for student in course_students:
                last = None
                streak_absent = 0
                streak_late = 0

                for idx, lesson in enumerate(course_lessons):
                    st = pick_status(
                        student.id,
                        idx in event_idxs,
                        last,
                        streak_absent,
                        streak_late,
                    )

                    comment = rng_status.choice(comments_by_status[st])

                    a = Attendance(
                        lesson_id=lesson.id,
                        student_id=student.id,
                        status=st,
                        comment=comment,
                    )
                    db.add(a)

                    if st == AttendanceStatus.absent:
                        streak_absent += 1
                        streak_late = 0
                    elif st == AttendanceStatus.late:
                        streak_late += 1
                        streak_absent = 0
                    else:
                        streak_absent = 0
                        streak_late = 0

                    last = st

        db.commit()

        ''' Фидбек (Feedback): шаблоны, рейтинги, комменты, генерация записей '''
        feedback_samples = [
            (4.9, "Очень структурная подача: цели, метрики и ограничения обозначены заранее. Хороший акцент на воспроизводимость."),
            (4.6, "Понравилось, что показали типовые сбои агента (циклы/ошибки инструментов) и способы диагностики через логи."),
            (4.8, "Сильный разбор RAG: стало понятно, где ломается retrieval и почему reranking критичен."),
            (4.1, "Темп высокий. Хотелось бы больше времени на разбор ошибок и корректировку решения по шагам."),
            (5.0, "Отличная связка теории и практики: можно сразу применять в курсовом/продуктовом прототипе."),
            (4.3, "Полезно, но не хватило примеров с оценкой качества (регрессии/автотесты) на реальном датасете."),
            (4.7, "Хорошо объяснили, как выбирать между prompting, RAG и fine-tuning под разные ограничения проекта."),
            (3.9, "Тема сложная; нужен дополнительный разбор типовых кейсов и чек-лист по отладке."),
            (4.5, "Понравились практические рекомендации по безопасному tool-use: валидация аргументов и allowlist."),
            (4.0, "Хотелось бы больше примеров по мультимодальным задачам (текст–изображение) и их метрикам качества."),
            (4.8, "Круто, что обсуждали стоимость и задержки: наконец-то стало понятно, как оптимизировать cost/latency без потери качества."),
            (4.2, "Интересно, но хотелось бы больше самостоятельных заданий и разбор решений после."),
            (4.9, "Отличный разбор наблюдаемости: трассировка шагов агента реально помогает ловить регрессии."),
            (4.4, "Хорошо зашли абляции: наглядно видно, какие компоненты пайплайна дают вклад в качество."),
            (4.7, "Понравилась тема с конфликтующими источниками и правилами цитирования — полезно для RAG-систем."),
            (4.1, "Не хватило времени на практику: хотелось бы больше задач на семинаре и меньше «сквозного» повествования."),
            (4.6, "Сильный блок по качеству данных: ошибки разметки и доменный сдвиг разобраны на понятных примерах."),
            (3.8, "Некоторые термины были введены слишком быстро. Нужен небольшой словарь/конспект в конце занятия."),
            (4.8, "Понравился подход к оценке: сценарные тесты и «золотые» наборы — это то, чего обычно не хватает."),
            (4.3, "Хотелось бы увидеть больше примеров проектирования API для агентных сервисов и типовых ошибок интеграции."),
            (4.7, "Классный разбор PEFT/LoRA: понятно, как контролировать деградацию и что логировать при обучении."),
            (4.2, "Интересно, но хотелось бы больше примеров по защите от prompt injection на конкретных сценариях."),
            (4.9, "Очень полезный семинар: разобрали решения по шагам и показали, как оформлять отчёт по экспериментам."),
            (4.0, "Материал хороший, но нужно больше времени на вопросы и обсуждение альтернативных подходов."),
        ]

        rng_fb = random.Random(SEED_FEEDBACK)

        demo_course_ids = {c.id for c in courses[:DEMO_COURSES]}

        demo_lessons = [l for l in lessons if l.course_id in demo_course_ids]
        demo_lessons = sorted(demo_lessons, key=lambda x: (x.course_id, x.date, x.id))

        demo_students_map = {}
        for cid, lst in students_by_course.items():
            for s in lst:
                demo_students_map[s.id] = s
        demo_students = sorted(demo_students_map.values(), key=lambda u: u.id)

        students_for_feedback = demo_students[: min(FEEDBACK_STUDENTS, len(demo_students))]
        lessons_for_feedback = demo_lessons

        base_comments = [c for _, c in feedback_samples]

        prefixes = [
            "",
            "В целом: ",
            "Коротко: ",
            "По делу: ",
            "Если честно: ",
            "Из плюсов: ",
            "Наблюдение: ",
        ]

        suffixes = [
            "",
            " Хотелось бы больше практики.",
            " Было бы круто добавить больше примеров.",
            " Спасибо за разбор ошибок.",
            " Полезно для проекта.",
            " Темп местами высокий.",
            " Хорошо бы дать чек-лист после занятия.",
        ]

        def gen_comment():
            base = rng_fb.choice(base_comments)
            pre = rng_fb.choice(prefixes) if rng_fb.random() < 0.35 else ""
            suf = rng_fb.choice(suffixes) if rng_fb.random() < 0.35 else ""
            return (pre + base + suf).strip()

        created_fb = 0
        k = 0

        if lessons_for_feedback and students_for_feedback:
            for lesson in lessons_for_feedback:
                for student in students_for_feedback:
                    if rng_fb.random() < 0.35:
                        continue

                    base_rating, _ = feedback_samples[k % len(feedback_samples)]
                    k += 1

                    p = profile.get(student.id)
                    if p:
                        p_present = p[0]
                        if p_present < 0.70:
                            mu = min(base_rating, 4.2) - 0.2
                        elif p_present < 0.85:
                            mu = min(base_rating, 4.6)
                        else:
                            mu = max(base_rating, 4.3)
                    else:
                        mu = base_rating

                    if rng_fb.random() < 0.07:
                        mu -= rng_fb.uniform(0.6, 1.0)
                    if rng_fb.random() < 0.06:
                        mu += rng_fb.uniform(0.2, 0.5)

                    rating = round(max(1.0, min(5.0, rng_fb.gauss(mu, 0.25))), 1)
                    comment = gen_comment()

                    f = Feedback(
                        lesson_id=lesson.id,
                        student_id=student.id,
                        rating=rating,
                        comment=comment,
                        is_hidden=False,
                    )
                    db.add(f)

                    created_fb += 1
                    if created_fb >= FEEDBACK_TARGET:
                        break
                if created_fb >= FEEDBACK_TARGET:
                    break

        db.commit()


    except Exception:
        db.rollback()
        raise
    finally:
        db.close()



if __name__ == "__main__":
    run_seed()