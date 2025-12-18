import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Progress,
  Rate,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import Table from "antd/es/table";
import {
  CalendarOutlined,
  EditOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FilterOutlined,
  MessageOutlined,
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
import { useAuth, type UserRole } from "../context/AuthContext";

const { Title, Text } = Typography;

type SortMode = "newest" | "oldest" | "rating_desc" | "rating_asc";
type RatingFilter = "all" | "5" | "4plus" | "3plus" | "2minus";

type CreateFormValues = FeedbackCreate & {
  course_id: number;
};

type CourseOption = { value: number; label: string };
type LessonOption = { value: number; label: string };

const CHART_COLORS = {
  blue: "#1677ff",
  purple: "#722ed1",
  magenta: "#eb2f96",
  orange: "#fa8c16",
  volcano: "#fa541c",
  green: "#52c41a",
  cyan: "#13c2c2",
  gold: "#fadb14",
  red: "#f5222d",
};

function clamp01(x: number) {
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

function formatDate(value: string | Date | undefined | null) {
  if (!value) return "—";
  const d = dayjs(value);
  if (!d.isValid()) return "—";
  return d.format("DD.MM.YYYY");
}

function safeText(v: unknown) {
  return String(v ?? "").trim().toLowerCase();
}

function roleLabel(role: UserRole | null | undefined) {
  if (role === "admin") return "Администратор";
  if (role === "teacher") return "Преподаватель";
  return "Студент";
}

function kpiStyle(from: string, to: string): CSSProperties {
  return {
    borderRadius: 16,
    border: `1px solid ${from}33`,
    background: `radial-gradient(900px 240px at 10% 0%, ${from}3a 0%, transparent 60%),
                 radial-gradient(700px 220px at 90% 0%, ${to}2f 0%, transparent 55%),
                 linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.25) 100%)`,
    boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset",
    overflow: "hidden",
  };
}

function panelStyle(accent: string): CSSProperties {
  return {
    borderRadius: 16,
    border: `1px solid ${accent}2b`,
    background: `radial-gradient(900px 260px at 15% 0%, ${accent}22 0%, transparent 60%),
                 linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.25) 100%)`,
    boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset",
  };
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
          .sort((a, b) => a.label.localeCompare(b.label, "ru"))
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

    const hiddenRate = total ? hidden / total : 0;
    const last7Rate = total ? last7 / total : 0;
    const avgRate = clamp01(avg / 5);

    return { total, avg, hidden, last7, hiddenRate, last7Rate, avgRate };
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

  const columns = useMemo<ColumnsType<Feedback>>(() => {
    return [
      {
        title: "Студент",
        dataIndex: "student_name",
        key: "student_name",
        ellipsis: true,
        render: (_: unknown, record: Feedback) => {
          const name =
            (record as any).student_name || (record as any).student_full_name || `ID ${record.student_id}`;
          const hidden = !!(record as any).is_hidden;
          return (
            <Space size={10}>
              <Text strong ellipsis style={{ maxWidth: 240, display: "inline-block" }}>
                {name}
              </Text>
              {hidden ? (
                <Tag className="pill-tag" color="orange" icon={<EyeInvisibleOutlined />}>
                  Скрыт
                </Tag>
              ) : null}
            </Space>
          );
        },
      },
      {
        title: "Оценка",
        dataIndex: "rating",
        key: "rating",
        width: 200,
        render: (value: number) => {
          const v = Number(value ?? 0);
          return (
            <Space size={10} align="center">
              <Text strong style={{ width: 44, textAlign: "right" }}>
                {Number.isFinite(v) ? v.toFixed(1) : "—"}
              </Text>
              <Rate disabled allowHalf value={v} style={{ fontSize: 16 }} />
            </Space>
          );
        },
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
            <Tooltip title={v}>
              <Text style={{ display: "inline-block", maxWidth: 560 }} ellipsis>
                {v}
              </Text>
            </Tooltip>
          );
        },
      },
      {
        title: "Курс",
        key: "course",
        ellipsis: true,
        render: (_: unknown, record: Feedback) => {
          const name = (record as any).course_name || courseNameById.get((record as any).course_id);
          return name ? (
            <Tooltip title={name}>
              <Text ellipsis style={{ maxWidth: 320, display: "inline-block" }}>
                {name}
              </Text>
            </Tooltip>
          ) : (
            <Text type="secondary">—</Text>
          );
        },
      },
      {
        title: "Урок",
        key: "lesson",
        ellipsis: true,
        render: (_: unknown, record: Feedback) => {
          const v = (record as any).lesson_topic || (record as any).topic;
          return v ? (
            <Tooltip title={String(v)}>
              <Text ellipsis style={{ maxWidth: 320, display: "inline-block" }}>
                {String(v)}
              </Text>
            </Tooltip>
          ) : (
            <Text type="secondary">—</Text>
          );
        },
      },
      {
        title: "Дата",
        key: "date",
        width: 140,
        className: "mono",
        render: (_: unknown, record: Feedback) => formatDate((record as any).lesson_date ?? (record as any).created_at),
      },
      {
        title: "Видимость",
        key: "visibility",
        width: 160,
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
        width: 170,
        render: (_: unknown, record: Feedback) => {
          if (!canEditFeedbackRow(record)) return <Text type="secondary">—</Text>;
          return (
            <Button size="small" icon={<EditOutlined />} className="pill-action" onClick={() => handleOpenEdit(record)}>
              Редактировать
            </Button>
          );
        },
      },
    ];
  }, [courseNameById, isAdmin, isTeacher, user]);

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

  const filtersActive = !!q.trim() || ratingFilter !== "all" || !!courseFilterId;
  const shownText = useMemo(() => {
    const shown = filtered.length;
    const total = items.length;
    if (shown === total) return `Показано: ${shown}`;
    return `Показано: ${shown} / ${total}`;
  }, [filtered.length, items.length]);

  return (
    <div className="page-wrap feedback-page">
      <style>
        {`
          .feedback-page .page-head{
            display:flex;
            align-items:flex-start;
            justify-content:space-between;
            gap:14px;
          }
          .feedback-page .page-head-left{
            display:flex;
            flex-direction:column;
            gap:8px;
            min-width:0;
          }
          .feedback-page .page-sub{
            display:flex;
            align-items:center;
            gap:10px;
            flex-wrap:wrap;
          }
          .feedback-page .role-tag{
            border-radius:999px;
            padding:4px 10px;
          }
          .feedback-page .head-meta{
            display:flex;
            align-items:center;
            gap:10px;
            flex-wrap:wrap;
          }
          .feedback-page .head-actions{
            display:flex;
            align-items:center;
            gap:10px;
            flex-wrap:wrap;
            justify-content:flex-end;
          }
          .feedback-page .btn-ghost{
            border-radius:999px;
            background:rgba(255,255,255,0.03);
            border:1px solid rgba(255,255,255,0.10);
          }
          .feedback-page .btn-ghost:hover{
            border-color:rgba(22,119,255,0.45);
            box-shadow:0 0 0 2px rgba(22,119,255,0.10);
          }
          .feedback-page .btn-primary{
            border-radius:999px;
            border:0;
            background:linear-gradient(135deg, rgba(22,119,255,0.95) 0%, rgba(114,46,209,0.95) 50%, rgba(19,194,194,0.90) 100%);
            box-shadow:0 10px 30px rgba(22,119,255,0.16);
          }
          .feedback-page .btn-primary:hover{
            filter:brightness(1.06);
          }
          .feedback-page .filters-hint{
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:12px;
            margin-top:10px;
          }
          .feedback-page .filters-hint-left{
            display:flex;
            align-items:center;
            gap:10px;
            flex-wrap:wrap;
            min-width:0;
          }
          .feedback-page .hint-chip{
            border-radius:999px;
            padding:4px 10px;
            background:rgba(255,255,255,0.03);
            border:1px solid rgba(255,255,255,0.10);
          }
          .feedback-page .kpi-sub{
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:10px;
            margin-top:8px;
          }
          .feedback-page .kpi-sub .ant-progress{
            margin:0;
          }
          .feedback-page .pill-tag{
            border-radius:999px;
          }
          .feedback-page .pill-action{
            border-radius:999px;
            background:rgba(255,255,255,0.03);
            border:1px solid rgba(255,255,255,0.10);
          }
          .feedback-page .pill-action:hover{
            border-color:rgba(114,46,209,0.55);
            box-shadow:0 0 0 2px rgba(114,46,209,0.10);
          }
          .feedback-page .feedback-table .ant-table,
          .feedback-page .feedback-table .ant-table-container,
          .feedback-page .feedback-table .ant-table-content{
            background:transparent;
          }
          .feedback-page .feedback-table .ant-table-thead > tr > th{
            background:rgba(255,255,255,0.03);
            border-bottom:1px solid rgba(255,255,255,0.08);
          }
          .feedback-page .feedback-table .ant-table-tbody > tr > td{
            border-bottom:1px solid rgba(255,255,255,0.06);
          }
          .feedback-page .feedback-table .ant-table-tbody > tr.table-row-alt > td{
            background:rgba(255,255,255,0.015);
          }
          .feedback-page .feedback-table .ant-table-tbody > tr:hover > td{
            background:rgba(22,119,255,0.08) !important;
          }
          .feedback-page .mono{
            font-variant-numeric: tabular-nums;
          }
        `}
      </style>

      <div className="page-head">
        <div className="page-head-left">
          <Title level={2} style={{ margin: 0 }}>
            Фидбэк
          </Title>

          <div className="page-sub">
            <Tag className="role-tag" color={role === "admin" ? "purple" : role === "teacher" ? "blue" : "green"}>
              {roleLabel(role)}
            </Tag>
            <Text type="secondary">Отзывы по занятиям: фильтры, сортировка, видимость.</Text>
          </div>

          <div className="head-meta">
            <Text type="secondary" className="hint-chip">
              {shownText}
            </Text>
            {filtersActive ? (
              <Tag className="pill-tag" color="blue" icon={<FilterOutlined />}>
                Фильтры активны
              </Tag>
            ) : (
              <Tag className="pill-tag">Все отзывы</Tag>
            )}
          </div>
        </div>

        <div className="head-actions">
          <Button className="btn-ghost" icon={<ReloadOutlined />} onClick={() => void loadFeedback()} loading={loading}>
            Обновить
          </Button>

          {canCreateFeedback && (
            <Button className="btn-primary" type="primary" icon={<PlusOutlined />} onClick={handleOpenCreate}>
              Создать
            </Button>
          )}
        </div>
      </div>

      <div style={{ height: 12 }} />

      <Card className="card-surface" bordered={false} style={panelStyle(CHART_COLORS.blue)}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} lg={10}>
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Поиск: студент, курс, урок, комментарий"
            />
          </Col>

          <Col xs={24} sm={12} lg={7}>
            <Select
              placeholder="Курс"
              value={courseFilterId}
              loading={coursesLoading}
              options={courseOptions}
              onChange={(v) => setCourseFilterId(typeof v === "number" ? v : undefined)}
              showSearch
              optionFilterProp="label"
              allowClear
              style={{ width: "100%" }}
            />
          </Col>

          <Col xs={24} sm={12} lg={4}>
            <Select
              value={ratingFilter}
              onChange={(v) => setRatingFilter(v as RatingFilter)}
              suffixIcon={<StarOutlined />}
              options={[
                { value: "all", label: "Любая оценка" },
                { value: "5", label: "Только 5" },
                { value: "4plus", label: "4 и выше" },
                { value: "3plus", label: "3 и выше" },
                { value: "2minus", label: "2 и ниже" },
              ]}
              style={{ width: "100%" }}
            />
          </Col>

          <Col xs={24} sm={12} lg={3}>
            <Select
              value={sortMode}
              onChange={(v) => setSortMode(v as SortMode)}
              suffixIcon={<FilterOutlined />}
              options={[
                { value: "newest", label: "Сначала новые" },
                { value: "oldest", label: "Сначала старые" },
                { value: "rating_desc", label: "Рейтинг: ↓" },
                { value: "rating_asc", label: "Рейтинг: ↑" },
              ]}
              style={{ width: "100%" }}
            />
          </Col>

          {isAdmin ? (
            <Col xs={24} sm={12} lg={6}>
              <div className="filters-hint">
                <div className="filters-hint-left">
                  <Text type="secondary">Показывать скрытые</Text>
                </div>
                <Switch checked={includeHidden} onChange={setIncludeHidden} />
              </div>
            </Col>
          ) : null}
        </Row>
      </Card>

      <div style={{ height: 14 }} />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="card-surface" bordered={false} style={kpiStyle(CHART_COLORS.blue, CHART_COLORS.purple)}>
            <Statistic
              title="Показано отзывов"
              value={stats.total}
              prefix={<MessageOutlined style={{ color: CHART_COLORS.blue }} />}
              valueStyle={{ fontWeight: 700 }}
            />
            <div className="kpi-sub">
              <Text type="secondary">В текущих фильтрах</Text>
              <div style={{ width: 120 }}>
                <Progress
                  percent={Math.round((items.length ? stats.total / items.length : 0) * 100)}
                  size="small"
                  showInfo={false}
                  status="active"
                  strokeColor={{ from: CHART_COLORS.blue, to: CHART_COLORS.purple }}
                />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="card-surface" bordered={false} style={kpiStyle(CHART_COLORS.purple, CHART_COLORS.magenta)}>
            <Statistic
              title="Средняя оценка"
              value={stats.total ? Number(stats.avg.toFixed(2)) : 0}
              prefix={<StarOutlined style={{ color: CHART_COLORS.purple }} />}
              valueStyle={{ fontWeight: 700 }}
              suffix={<Text type="secondary">/ 5</Text>}
            />
            <div className="kpi-sub">
              <Text type="secondary">Качество по выборке</Text>
              <div style={{ width: 120 }}>
                <Progress
                  percent={Math.round(stats.avgRate * 100)}
                  size="small"
                  showInfo={false}
                  status="active"
                  strokeColor={{ from: CHART_COLORS.purple, to: CHART_COLORS.magenta }}
                />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="card-surface" bordered={false} style={kpiStyle(CHART_COLORS.orange, CHART_COLORS.volcano)}>
            <Statistic
              title="Скрытых"
              value={stats.hidden}
              prefix={<EyeInvisibleOutlined style={{ color: CHART_COLORS.orange }} />}
              valueStyle={{ fontWeight: 700 }}
            />
            <div className="kpi-sub">
              <Text type="secondary">Доля скрытых</Text>
              <div style={{ width: 120 }}>
                <Progress
                  percent={Math.round(stats.hiddenRate * 100)}
                  size="small"
                  showInfo={false}
                  status="active"
                  strokeColor={{ from: CHART_COLORS.orange, to: CHART_COLORS.volcano }}
                />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card className="card-surface" bordered={false} style={kpiStyle(CHART_COLORS.green, CHART_COLORS.cyan)}>
            <Statistic
              title="За 7 дней"
              value={stats.last7}
              prefix={<CalendarOutlined style={{ color: CHART_COLORS.green }} />}
              valueStyle={{ fontWeight: 700 }}
            />
            <div className="kpi-sub">
              <Text type="secondary">Свежие отзывы</Text>
              <div style={{ width: 120 }}>
                <Progress
                  percent={Math.round(stats.last7Rate * 100)}
                  size="small"
                  showInfo={false}
                  status="active"
                  strokeColor={{ from: CHART_COLORS.green, to: CHART_COLORS.cyan }}
                />
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <div style={{ height: 14 }} />

      <Card className="card-surface" bordered={false} style={panelStyle(CHART_COLORS.purple)} bodyStyle={{ padding: 0 }}>
        <Table
          className="feedback-table"
          rowKey={(r) => r.id}
          rowClassName={(_, idx) => (idx % 2 ? "table-row-alt" : "")}
          columns={columns}
          dataSource={filtered}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          locale={{
            emptyText: (
              <Empty
                description={
                  q.trim() || ratingFilter !== "all" || courseFilterId ? "Нет отзывов по выбранным фильтрам" : "Пока нет отзывов"
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
            <Form.Item label="Студент ID" name="student_id" rules={[{ required: true, message: "Укажите ID студента" }]}>
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>
          )}

          <Form.Item label="Курс" name="course_id" rules={[{ required: true, message: "Выберите курс" }]}>
            <Select
              placeholder="Выберите курс"
              loading={coursesLoading}
              options={courseOptions}
              onChange={(v) => handleCourseChange(Number(v))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item label="Урок" name="lesson_id" rules={[{ required: true, message: "Выберите урок" }]}>
            <Select
              placeholder={selectedCourseId ? "Выберите урок" : "Сначала выберите курс"}
              disabled={!selectedCourseId}
              options={lessonOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item label="Оценка" name="rating" rules={[{ required: true, message: "Укажите оценку" }]}>
            <Rate allowHalf />
          </Form.Item>

          <Form.Item label="Комментарий" name="comment">
            <Input.TextArea rows={4} placeholder="Что понравилось / что улучшить" />
          </Form.Item>

          <Form.Item label="Скрытый" name="is_hidden" valuePropName="checked">
            <Switch />
          </Form.Item>

          {!isAdmin && <Text type="secondary">Фидбэк будет создан от имени текущего пользователя.</Text>}
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
          <Form.Item label="Оценка" name="rating" rules={[{ required: true, message: "Укажите оценку" }]}>
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
