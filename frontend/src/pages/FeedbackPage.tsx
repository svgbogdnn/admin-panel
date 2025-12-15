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
  EyeInvisibleOutlined,
  EyeOutlined,
  FilterOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StarOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import type { Feedback, FeedbackCreate } from "../api/feedback";
import { createFeedbackItem, getFeedback } from "../api/feedback";
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

function normalizeText(v: unknown): string {
  return String(v ?? "").trim().toLowerCase();
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function resolveDateValue(item: Feedback): number {
  const raw = (item as any).lesson_date ?? (item as any).created_at ?? null;
  const d = raw ? new Date(raw) : null;
  return d && !Number.isNaN(d.getTime()) ? d.getTime() : 0;
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

  const { user, role } = useAuth();
  const isAdmin = role === "admin";

  const courseNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of courses) map.set(c.id, c.name);
    return map;
  }, [courses]);

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const data = await getFeedback({ include_hidden: includeHidden });
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
      setLessonOptions(
        data.map((l) => ({
          value: l.id,
          label: `${l.topic || "Урок"}${l.date ? ` — ${l.date}` : ""}`,
        })),
      );
    } catch {
      message.error("Не удалось загрузить список уроков");
      setLessonOptions([]);
    }
  };

  useEffect(() => {
    void loadFeedback();
  }, [includeHidden]);

  useEffect(() => {
    void loadCourses();
  }, []);

  const filtered = useMemo(() => {
    const query = normalizeText(q);
    const courseNameFilter = courseFilterId ? courseNameById.get(courseFilterId) ?? "" : "";

    const base = items.filter((it) => {
      if (courseFilterId) {
        const cn = normalizeText((it as any).course_name);
        if (normalizeText(courseNameFilter) && cn !== normalizeText(courseNameFilter)) return false;
      }

      if (ratingFilter !== "all") {
        const r = Number((it as any).rating ?? 0);
        if (ratingFilter === "5" && r !== 5) return false;
        if (ratingFilter === "4plus" && r < 4) return false;
        if (ratingFilter === "3plus" && r < 3) return false;
        if (ratingFilter === "2minus" && r > 2) return false;
      }

      if (!query) return true;

      const student = normalizeText((it as any).student_name ?? (it as any).student_full_name ?? it.student_id);
      const course = normalizeText((it as any).course_name);
      const lesson = normalizeText((it as any).lesson_topic);
      const comment = normalizeText((it as any).comment);
      const date = normalizeText((it as any).lesson_date ?? (it as any).created_at);

      return (
        student.includes(query) ||
        course.includes(query) ||
        lesson.includes(query) ||
        comment.includes(query) ||
        date.includes(query)
      );
    });

    const sorted = [...base].sort((a, b) => {
      const da = resolveDateValue(a);
      const db = resolveDateValue(b);
      const ra = Number((a as any).rating ?? 0);
      const rb = Number((b as any).rating ?? 0);

      if (sortMode === "newest") return db - da;
      if (sortMode === "oldest") return da - db;
      if (sortMode === "rating_desc") return rb - ra || (db - da);
      return ra - rb || (db - da);
    });

    return sorted;
  }, [items, q, sortMode, ratingFilter, courseFilterId, courseNameById]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const hidden = filtered.filter((x) => !!(x as any).is_hidden).length;
    const sum = filtered.reduce((acc, x) => acc + Number((x as any).rating ?? 0), 0);
    const avg = total > 0 ? sum / total : 0;

    const now = dayjs();
    const last7 = filtered.filter((x) => {
      const t = resolveDateValue(x);
      if (!t) return false;
      const d = dayjs(t);
      return d.isValid() && d.isAfter(now.subtract(7, "day"));
    }).length;

    return { total, hidden, avg, last7 };
  }, [filtered]);

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
          <Text type="secondary" ellipsis={{ tooltip: v }}>
            {v}
          </Text>
        );
      },
    },
    {
      title: "Курс",
      dataIndex: "course_name",
      key: "course_name",
      ellipsis: true,
      width: 260,
      render: (value: string | null | undefined) =>
        value ? value : <Text type="secondary">—</Text>,
    },
    {
      title: "Урок",
      dataIndex: "lesson_topic",
      key: "lesson_topic",
      ellipsis: true,
      width: 260,
      render: (value: string | null | undefined) =>
        value ? value : <Text type="secondary">—</Text>,
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

      const payload: FeedbackCreate = {
        lesson_id: values.lesson_id,
        student_id: values.student_id ?? user?.id,
        rating: values.rating,
        comment: values.comment,
        is_hidden: values.is_hidden ?? false,
      };

      if (!payload.student_id) {
        message.error("Ошибка: не удалось определить ID студента");
        return;
      }

      setCreating(true);
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

          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
            Создать
          </Button>
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
              style={{ width: 360 }}
            />

            <Select
              allowClear
              placeholder="Курс"
              style={{ width: 260 }}
              value={courseFilterId}
              loading={coursesLoading}
              options={courseOptions}
              onChange={(v) => setCourseFilterId(typeof v === "number" ? v : undefined)}
              showSearch
              optionFilterProp="label"
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
            <Space size={10} align="center">
              <Text type="secondary">Показывать скрытые</Text>
              <Switch checked={includeHidden} onChange={setIncludeHidden} />
            </Space>
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

        <Table<Feedback>
          className="data-table"
          rowKey={(r) => String((r as any).id ?? `${r.student_id}_${resolveDateValue(r)}`)}
          dataSource={filtered}
          columns={columns}
          loading={loading}
          tableLayout="fixed"
          pagination={{ pageSize: 12, showSizeChanger: false }}
          rowClassName={(_, index) => (index % 2 === 1 ? "row-zebra" : "")}
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
        okText="Сохранить"
        cancelText="Отмена"
        onOk={handleCreate}
        onCancel={() => setCreateVisible(false)}
        confirmLoading={creating}
        destroyOnClose
      >
        <Form<CreateFormValues> form={form} layout="vertical" initialValues={{ rating: 5, is_hidden: false }}>
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
              options={courseOptions}
              loading={coursesLoading}
              onChange={handleCourseChange}
              value={selectedCourseId}
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
              options={lessonOptions}
              disabled={!selectedCourseId}
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
            <Text type="secondary">
              Фидбэк будет создан от имени текущего пользователя.
            </Text>
          )}
        </Form>
      </Modal>
    </div>
  );
}
