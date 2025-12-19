### Курсы в проекте (как реализовано)

**1) Сущность “Курс” (что хранится)**

* Основные поля: `name`, `description`, `start_date`, `end_date`, `is_active`, `teacher_id`, плюс `created_at/updated_at`.  
* `teacher_id` — привязка курса к преподавателю (владельцу курса).  

**2) API-эндпоинты по курсам (backend)**
Роутер: `/api/v1/courses` (FastAPI `APIRouter`).  ([FastAPI][1])

* `GET /courses` — список курсов

  * есть фильтр `is_active` (активные/неактивные) 
  * если пользователь — **teacher**, он видит **только свои** курсы (`Course.teacher_id == current_user.id`) 
  * сортировка: по `start_date` (NULL значения уходят в конец через `nulls_last()`).  ([SQLAlchemy][2])

* `GET /courses/{course_id}` — получить один курс

  * teacher не может открыть чужой курс (403). 

* `POST /courses` — создать курс (доступ: **admin/teacher**)

  * если создаёт **teacher**, `teacher_id` принудительно становится `current_user.id` (то есть преподаватель не может “создать курс на другого”).

* `PATCH /courses/{course_id}` — частичное обновление (доступ: **admin/teacher**)

  * teacher может править **только свой** курс (проверка владельца)
  * менять `teacher_id` может **только admin** (иначе 403).
  * PATCH используется именно как “обновить только переданные поля”, что соответствует общему REST-подходу. ([Microsoft Learn][3])

* `DELETE /courses/{course_id}` — удалить курс (доступ: **admin/teacher**)

  * teacher может удалить только свой курс.

**3) Права доступа (логика ролей)**

* Просмотр списка/деталей курса требует авторизованного пользователя (`get_current_user`). 
* Создание/изменение/удаление — через зависимость `require_admin_or_teacher`.

**4) Как это используется на фронтенде (страницы и вызовы API)**

* Основные страницы:

  * `/courses` — список курсов (поиск/фильтр по статусу, кнопки “просмотр/редактирование”, “добавить курс” для admin/teacher).
  * `/courses/new` — создание курса.
  * `/courses/:id` — карточка курса (описание, даты, статус, teacher_id).
  * `/courses/:id/edit` — редактирование курса.

* Вызовы API во фронте:

  * `getCourses({ is_active? })`, `getCourse(id)`, `createCourse(payload)`, `updateCourse(id, payload)` — всё ходит на `/api/v1/courses...` и добавляет `Authorization: Bearer <token>`. 

**5) Демо-данные**

* `seed.py` создаёт набор курсов с описаниями, датами и `teacher_id` (для демонстрации работы списка/деталей/фильтров). 


