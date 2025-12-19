### Посещаемость в проекте (как реализовано)

**1) Сущность “Attendance” (что хранится)**

* Запись посещаемости привязана к **уроку** (`lesson_id`) и **студенту** (`student_id`).
* Статус посещения — enum из 4 значений: `present / absent / late / excused` (по умолчанию `present`).
* Есть поле `comment`, а также `created_at / updated_at`.
* На уровне БД стоит уникальность **(lesson_id, student_id)** — нельзя создать две записи посещаемости одному студенту на один урок. 
* Для удобства в ответах есть вычисляемые поля: `student_name`, `course_name`, `lesson_date` (берутся через связи Attendance → Lesson → Course).

**2) API-эндпоинты посещаемости (backend)**
Роутер: `/api/v1/attendance`. 

* `GET /attendance` — список записей с фильтрами: `lesson_id`, `student_id`, `course_id`, `from_date`, `to_date`. 

  * Для **teacher** выборка автоматически ограничивается только его курсами (`Course.teacher_id == current_user.id`). 
  * Подгрузка связанных данных сделана через `selectinload`, чтобы сразу получить student + lesson + course без N+1 запросов.  ([SQLAlchemy][1])
  * Важно: в текущем коде **для student нет отдельного ограничения** на просмотр (кроме того, что он должен быть авторизован) — то есть студент теоретически может запросить общий список. 

* `GET /attendance/{attendance_id}` — получить одну запись; для teacher есть проверка “это запись по моему курсу”, иначе 403.

* `POST /attendance` — создать запись (доступ **admin/teacher**).

  * проверяется существование урока
  * и проверяется право на курс через `check_course_owner` (teacher может создавать только для своих курсов).

* `PATCH /attendance/{attendance_id}` — частичное обновление (доступ **admin/teacher**): можно менять `status` и/или `comment` без пересылки всего объекта.  ([MDN Web Docs][2])

* `DELETE /attendance/{attendance_id}` — удаление (только **admin**). 

**3) Как это используется на фронтенде**

* `frontend/src/api/attendance.ts` содержит методы: `getAttendance()`, `getAttendanceRecord()`, `createAttendance()`, `updateAttendance()`, `deleteAttendance()` и типы данных для страницы. 
* Страница `AttendancePage.tsx`:

  * показывает таблицу записей, сверху фильтры: диапазон дат, курс, студент, плюс строка поиска по студенту/курсу
  * список курсов подтягивается через `getCourses()`, а список студентов формируется из полученных записей (по `student_id` + имени).
  * редактирование записи происходит через модалку и `updateAttendance()`.
* Авторизация на фронте: токен берётся из `localStorage` и автоматически добавляется как `Authorization: Bearer ...` через axios interceptor, поэтому все запросы посещаемости идут уже “под пользователем”.  ([FastAPI][3])
