import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Rate,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import Table from "antd/es/table";
import {
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import type { Feedback, FeedbackCreate, FeedbackUpdate } from "../api/feedback";
import { createFeedbackItem, getFeedback, updateFeedbackItem } from "../api/feedback";
import type { Course } from "../api/courses";
import { getCourses } from "../api/courses";
import type { Lesson } from "../api/lessons";
import { getLessons } from "../api/lessons";
import { useAuth } from "../context/AuthContext";

const { Title, Text } = Typography;

type SortMode = "newest" | "oldest" | "rating_desc" | "rating_asc";
type RatingFilter = "all" | "5" | "4plus" | "3plus" | "2minus";

type CreateFormValues = FeedbackCreate & {
  course_id: number;
};

type CourseOption = { value: number; label: string };
type LessonOption = { value: number; label: string };

function formatDate(value: string | Date | undefined | null) {
  if (!value) return "—";
  const d = dayjs(value);
  if (!d.isValid()) return "—";
  return d.format("DD.MM.YYYY");
}

function safeText(v: unknown) {
  return String(v ?? "").trim().toLowerCase();
}

export default function FeedbackPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);

  const [includeHidden, setIncludeHidden] = useState(false);
  const [q, setQ] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [ratingFilter, setRatingFilter] = useState<RatingFilter>("all");
  const [courseFilterId, setCourseFilterId] = useState<number | undefined>();

  const [createVisible, setCreateVisible] = useState(false);
  const [creating, setCreating] = useState(false);

  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [lessonOptions, setLessonOptions] = useState<LessonOption[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>();

  const [form] = Form.useForm<CreateFormValues>();
  const [editForm] = Form.useForm<FeedbackUpdate>();

  const { user, role } = useAuth();
  const isAdmin = role === "admin";
  const isTeacher = role === "teacher";
  const canCreateFeedback = !isTeacher;

  const [editVisible, setEditVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<Feedback | null>(null);

  const courseNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of courses) map.set(c.id, c.name);
    return map;
  }, [courses]);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const data = await getFeedback({ include_hidden: isAdmin ? includeHidden : false });
      setItems(data);
    } catch {
      message.error("Не удалось загрузить фидбэк");
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async () => {
    setCoursesLoading(true);
    try {
      const data: Course[] = await getCourses({ is_active: true });
      setCourses(data);
      setCourseOptions(
        data
          .map((c) => ({ value: c.id, label: c.name }))
          .sort((a, b) => a.label.localeCompare(b.label, "ru")),
      );
    } catch {
      message.error("Не удалось загрузить список курсов");
      setCourses([]);
      setCourseOptions([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  const loadLessonsForCourse = async (courseId: number) => {
    try {
      const data: Lesson[] = await getLessons({ course_id: courseId });
      const options: LessonOption[] = data
        .map((l) => ({
          value: l.id,
          label: `${formatDate((l as any).date)} — ${(l as any).topic || `Урок #${l.id}`}`,
        }))
        .sort((a, b) => a.label.localeCompare(b.label, "ru"));
      setLessonOptions(options);
    } catch {
      message.error("Не удалось загрузить уроки");
      setLessonOptions([]);
    }
  };

  useEffect(() => {
    void loadFeedback();
    void loadCourses();
  }, []);

  useEffect(() => {
    void loadFeedback();
  }, [includeHidden]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    const base = items.filter((it) => {
      if (!courseFilterId) return true;
      const courseName = (it as any).course_name || courseNameById.get(courseFilterId) || "";
      const itCourseName = (it as any).course_name || courseNameById.get((it as any).course_id) || "";
      return safeText(itCourseName) === safeText(courseName) || (it as any).course_id === courseFilterId;
    });

    const byRating = base.filter((it) => {
      const r = Number((it as any).rating ?? 0);
      if (ratingFilter === "all") return true;
      if (ratingFilter === "5") return r >= 4.75;
      if (ratingFilter === "4plus") return r >= 4.0;
      if (ratingFilter === "3plus") return r >= 3.0;
      if (ratingFilter === "2minus") return r <= 2.0;
      return true;
    });

    const byQuery = byRating.filter((it) => {
      if (!query) return true;

      const student = safeText((it as any).student_name || (it as any).student_full_name || it.student_id);
      const course = safeText((it as any).course_name || courseNameById.get((it as any).course_id));
      const lesson = safeText((it as any).lesson_topic || (it as any).topic);
      const comment = safeText((it as any).comment);

      return student.includes(query) || course.includes(query) || lesson.includes(query) || comment.includes(query);
    });

    const sorted = [...byQuery].sort((a, b) => {
      const aDate = dayjs((a as any).created_at || (a as any).lesson_date);
      const bDate = dayjs((b as any).created_at || (b as any).lesson_date);
      const aRating = Number((a as any).rating ?? 0);
      const bRating = Number((b as any).rating ?? 0);

      if (sortMode === "newest") return bDate.valueOf() - aDate.valueOf();
      if (sortMode === "oldest") return aDate.valueOf() - bDate.valueOf();
      if (sortMode === "rating_desc") return bRating - aRating;
      if (sortMode === "rating_asc") return aRating - bRating;
      return 0;
    });

    return sorted;
  }, [items, q, ratingFilter, sortMode, courseFilterId, courseNameById]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const sum = filtered.reduce((acc, it) => acc + Number((it as any).rating ?? 0), 0);
    const avg = total ? sum / total : 0;
    const hidden = filtered.filter((it) => !!(it as any).is_hidden).length;
    const last7 = filtered.filter((it) => {
      const d = dayjs((it as any).created_at || (it as any).lesson_date);
      return d.isValid() && d.isAfter(dayjs().subtract(7, "day"));
    }).length;
    return { total, avg, hidden, last7 };
  }, [filtered]);

  function canEditFeedbackRow(record: Feedback) {
    if (isTeacher) return false;
    if (isAdmin) return true;
    if (!user) return false;
    return record.student_id === user.id;
  }

  function handleOpenEdit(record: Feedback) {
    if (!canEditFeedbackRow(record)) return;
    setEditingItem(record);
    editForm.resetFields();
    editForm.setFieldsValue({
      rating: Number((record as any).rating ?? 0),
      comment: (record as any).comment ?? null,
      ...(isAdmin ? { is_hidden: !!(record as any).is_hidden } : {}),
    } as any);
    setEditVisible(true);
  }

  async function handleUpdate() {
    if (!editingItem) return;
    setEditing(true);
    try {
      const values = await editForm.validateFields();
      const payload: FeedbackUpdate = {
        rating: Number(values.rating),
        comment: (values as any).comment ?? null,
        ...(isAdmin ? { is_hidden: !!(values as any).is_hidden } : {}),
      };
      const updated = await updateFeedbackItem(editingItem.id, payload);
      setItems((prev) => prev.map((it) => (it.id === updated.id ? updated : it)));
      setEditVisible(false);
      setEditingItem(null);
      message.success("Фидбэк обновлён");
    } catch {
      message.error("Не удалось обновить фидбэк");
    } finally {
      setEditing(false);
    }
  }

  const columns: ColumnsType<Feedback> = [
    {
      title: "Студент",
      dataIndex: "student_name",
      key: "student_name",
      ellipsis: true,
      render: (_: unknown, record: Feedback) =>
        (record as any).student_name ||
        (record as any).student_full_name ||
        `ID ${record.student_id}`,
    },
    {
      title: "Оценка",
      dataIndex: "rating",
      key: "rating",
      width: 170,
      render: (value: number) => (
        <Rate disabled allowHalf value={Number(value ?? 0)} style={{ fontSize: 16 }} />
      ),
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      key: "comment",
      ellipsis: true,
      render: (value: string | null | undefined) => {
        const v = String(value ?? "").trim();
        if (!v) return <Text type="secondary">—</Text>;
        return (
          <Text title={v} style={{ display: "inline-block", maxWidth: 520 }}>
            {v}
          </Text>
        );
      },
    },
    {
      title: "Курс",
      key: "course",
      ellipsis: true,
      render: (_: unknown, record: Feedback) => {
        const name = (record as any).course_name || courseNameById.get((record as any).course_id);
        return name ? name : <Text type="secondary">—</Text>;
      },
    },
    {
      title: "Урок",
      key: "lesson",
      ellipsis: true,
      render: (_: unknown, record: Feedback) =>
        (record as any).lesson_topic || (record as any).topic || <Text type="secondary">—</Text>,
    },
    {
      title: "Дата",
      key: "date",
      width: 140,
      className: "mono",
      render: (_: unknown, record: Feedback) =>
        formatDate((record as any).lesson_date ?? (record as any).created_at),
    },
    {
      title: "Видимость",
      key: "visibility",
      width: 150,
      render: (_: unknown, record: Feedback) => {
        const hidden = !!(record as any).is_hidden;
        return hidden ? (
          <Tag className="pill-tag" color="orange" icon={<EyeInvisibleOutlined />}>
            Скрытый
          </Tag>
        ) : (
          <Tag className="pill-tag" color="green" icon={<EyeOutlined />}>
            Видимый
          </Tag>
        );
      },
    },
    {
      title: "Действия",
      key: "actions",
      width: 140,
      render: (_: unknown, record: Feedback) => {
        if (!canEditFeedbackRow(record)) return <Text type="secondary">—</Text>;
        return (
          <Button size="small" icon={<EditOutlined />} onClick={() => handleOpenEdit(record)}>
            Изменить
          </Button>
        );
      },
    },
  ];

  const handleOpenCreate = () => {
    setCreateVisible(true);
    setSelectedCourseId(undefined);
    setLessonOptions([]);
    form.resetFields();
    form.setFieldsValue({ rating: 5, is_hidden: false } as any);
  };

  const handleCourseChange = (courseId: number) => {
    setSelectedCourseId(courseId);
    form.setFieldsValue({ lesson_id: undefined as unknown as number });
    void loadLessonsForCourse(courseId);
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setCreating(true);

      const payload: FeedbackCreate = {
        lesson_id: values.lesson_id,
        student_id: isAdmin ? values.student_id : user?.id,
        rating: Number(values.rating),
        comment: values.comment ?? null,
        is_hidden: !!values.is_hidden,
      };

      const created = await createFeedbackItem(payload);
      setItems((prev) => [created, ...prev]);
      setCreateVisible(false);
      message.success("Фидбэк создан");
    } catch {
      message.error("Не удалось создать фидбэк");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page-wrap">
      <div className="page-head">
        <div className="page-head-left">
          <Title level={2} style={{ margin: 0 }}>
            Фидбэк
          </Title>
        </div>

        <div className="page-head-actions">
          <Button icon={<ReloadOutlined />} onClick={() => void loadFeedback()} loading={loading}>
            Обновить
          </Button>

          {canCreateFeedback && (
            <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
              Создать
            </Button>
          )}
        </div>
      </div>

      <Card className="card-surface" bordered={false} bodyStyle={{ padding: 0 }}>
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Поиск: студент, курс, урок, комментарий"
              style={{ width: 320 }}
            />

            <Select
              placeholder="Курс"
              style={{ width: 260 }}
              value={courseFilterId}
              loading={coursesLoading}
              options={courseOptions}
              onChange={(v) => setCourseFilterId(typeof v === "number" ? v : undefined)}
              showSearch
              optionFilterProp="label"
              allowClear
            />

            <Select
              value={ratingFilter}
              onChange={(v) => setRatingFilter(v as RatingFilter)}
              style={{ width: 220 }}
              suffixIcon={<StarOutlined />}
              options={[
                { value: "all", label: "Любая оценка" },
                { value: "5", label: "Только 5" },
                { value: "4plus", label: "4 и выше" },
                { value: "3plus", label: "3 и выше" },
                { value: "2minus", label: "2 и ниже" },
              ]}
            />

            <Select
              value={sortMode}
              onChange={(v) => setSortMode(v as SortMode)}
              style={{ width: 220 }}
              suffixIcon={<FilterOutlined />}
              options={[
                { value: "newest", label: "Сначала новые" },
                { value: "oldest", label: "Сначала старые" },
                { value: "rating_desc", label: "Рейтинг: по убыванию" },
                { value: "rating_asc", label: "Рейтинг: по возрастанию" },
              ]}
            />
          </div>

          <div className="table-toolbar-right">
            {isAdmin && (
              <Space size={10} align="center">
                <Text type="secondary">Показывать скрытые</Text>
                <Switch checked={includeHidden} onChange={setIncludeHidden} />
              </Space>
            )}
          </div>
        </div>

        <div className="stats">
          <div className="stat-item">
            <div className="stat-label">Показано отзывов</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Средняя оценка</div>
            <div className="stat-value">{stats.total ? stats.avg.toFixed(2) : "—"}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Скрытых</div>
            <div className="stat-value">{stats.hidden}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">За 7 дней</div>
            <div className="stat-value">{stats.last7}</div>
          </div>
        </div>

        <Table
          rowKey={(r) => r.id}
          columns={columns}
          dataSource={filtered}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          locale={{
            emptyText: (
              <Empty
                description={
                  q.trim() || ratingFilter !== "all" || courseFilterId
                    ? "Нет отзывов по выбранным фильтрам"
                    : "Пока нет отзывов"
                }
              />
            ),
          }}
        />
      </Card>

      <Modal
        open={createVisible}
        title="Создать фидбэк"
        onCancel={() => setCreateVisible(false)}
        okText="Создать"
        cancelText="Отмена"
        confirmLoading={creating}
        onOk={() => void handleCreate()}
        destroyOnClose
      >
        <Form form={form} layout="vertical" initialValues={{ rating: 5, is_hidden: false }}>
          {isAdmin && (
            <Form.Item
              label="Студент ID"
              name="student_id"
              rules={[{ required: true, message: "Укажите ID студента" }]}
            >
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>
          )}

          <Form.Item
            label="Курс"
            name="course_id"
            rules={[{ required: true, message: "Выберите курс" }]}
          >
            <Select
              placeholder="Выберите курс"
              loading={coursesLoading}
              options={courseOptions}
              onChange={(v) => handleCourseChange(Number(v))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            label="Урок"
            name="lesson_id"
            rules={[{ required: true, message: "Выберите урок" }]}
          >
            <Select
              placeholder={selectedCourseId ? "Выберите урок" : "Сначала выберите курс"}
              disabled={!selectedCourseId}
              options={lessonOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            label="Оценка"
            name="rating"
            rules={[{ required: true, message: "Укажите оценку" }]}
          >
            <Rate allowHalf />
          </Form.Item>

          <Form.Item label="Комментарий" name="comment">
            <Input.TextArea rows={4} placeholder="Что понравилось / что улучшить" />
          </Form.Item>

          <Form.Item label="Скрытый" name="is_hidden" valuePropName="checked">
            <Switch />
          </Form.Item>

          {!isAdmin && (
            <Text type="secondary">Фидбэк будет создан от имени текущего пользователя.</Text>
          )}
        </Form>
      </Modal>

      <Modal
        open={editVisible}
        title="Редактировать фидбэк"
        onCancel={() => {
          setEditVisible(false);
          setEditingItem(null);
        }}
        okText="Сохранить"
        cancelText="Отмена"
        confirmLoading={editing}
        onOk={() => void handleUpdate()}
        destroyOnClose
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            label="Оценка"
            name="rating"
            rules={[{ required: true, message: "Укажите оценку" }]}
          >
            <Rate allowHalf />
          </Form.Item>

          <Form.Item label="Комментарий" name="comment">
            <Input.TextArea rows={4} placeholder="Что понравилось / что улучшить" />
          </Form.Item>

          {isAdmin && (
            <Form.Item label="Скрытый" name="is_hidden" valuePropName="checked">
              <Switch />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
