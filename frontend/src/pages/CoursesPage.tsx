import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import { type Course, getCourses } from "../api/courses";
import { useAuth } from "../context/AuthContext";

const { Title, Text } = Typography;

type StatusFilter = "all" | "active" | "inactive";

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function toLower(value: unknown): string {
  return String(value ?? "").toLowerCase();
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const navigate = useNavigate();
  const { user, role } = useAuth();

  const isAdmin = role === "admin";
  const canCreateCourse = role === "admin" || role === "teacher";

  const canEditCourse = (course: Course): boolean => {
    if (isAdmin) return true;
    if (user && course.teacher_id === user.id) return true;
    return false;
  };

  const loadCourses = async () => {
    setLoading(true);
    try {
      const data = await getCourses();
      setCourses(data);
    } catch {
      message.error("Не удалось загрузить курсы");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCourses();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return courses.filter((c) => {
      const byStatus =
        status === "all" ? true : status === "active" ? !!c.is_active : !c.is_active;

      if (!byStatus) return false;
      if (!query) return true;

      const name = toLower(c.name);
      const desc = toLower((c as any).description);
      const teacher = toLower(c.teacher_id);
      const start = toLower(c.start_date);
      const end = toLower(c.end_date);

      return (
        name.includes(query) ||
        desc.includes(query) ||
        teacher.includes(query) ||
        start.includes(query) ||
        end.includes(query)
      );
    });
  }, [courses, q, status]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const active = filtered.filter((c) => !!c.is_active).length;
    const inactive = total - active;

    const now = dayjs();
    const endingSoon = filtered.filter((c) => {
      if (!c.end_date) return false;
      const d = dayjs(c.end_date);
      if (!d.isValid()) return false;
      const diff = d.startOf("day").diff(now.startOf("day"), "day");
      return diff >= 0 && diff <= 14;
    }).length;

    return { total, active, inactive, endingSoon };
  }, [filtered]);

  const columns: ColumnsType<Course> = [
    {
      title: "Курс",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => String(a.name ?? "").localeCompare(String(b.name ?? ""), "ru"),
      render: (_value: unknown, record: Course) => {
        const description = (record as any).description as string | null | undefined;
        const meta =
          (description && description.trim().length > 0 ? description.trim() : null) ??
          (record.teacher_id ? `Учитель ID: ${record.teacher_id}` : "—");

        return (
          <div className="cell-title">
            <div className="cell-title-main">{record.name}</div>
            <Text className="cell-title-sub" type="secondary" ellipsis={{ tooltip: meta }}>
              {meta}
            </Text>
          </div>
        );
      },
    },
    {
      title: "Старт",
      dataIndex: "start_date",
      key: "start_date",
      width: 140,
      className: "mono",
      sorter: (a, b) => {
        const da = a.start_date ? dayjs(a.start_date) : null;
        const db = b.start_date ? dayjs(b.start_date) : null;
        const va = da && da.isValid() ? da.valueOf() : -Infinity;
        const vb = db && db.isValid() ? db.valueOf() : -Infinity;
        return va - vb;
      },
      render: (value: string | null) => formatDate(value),
    },
    {
      title: "Конец",
      dataIndex: "end_date",
      key: "end_date",
      width: 140,
      className: "mono",
      sorter: (a, b) => {
        const da = a.end_date ? dayjs(a.end_date) : null;
        const db = b.end_date ? dayjs(b.end_date) : null;
        const va = da && da.isValid() ? da.valueOf() : Infinity;
        const vb = db && db.isValid() ? db.valueOf() : Infinity;
        return va - vb;
      },
      render: (value: string | null) => formatDate(value),
    },
    {
      title: "Статус",
      dataIndex: "is_active",
      key: "is_active",
      width: 140,
      render: (value: boolean) =>
        value ? (
          <Tag className="pill-tag" color="green">
            Активный
          </Tag>
        ) : (
          <Tag className="pill-tag" color="red">
            Неактивный
          </Tag>
        ),
    },
    {
      title: "",
      key: "actions",
      width: 220,
      render: (_: unknown, record: Course) => {
        const canEdit = canEditCourse(record);
        return (
          <Space size={10}>
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/courses/${record.id}`);
              }}
            >
              Подробнее
            </Button>

            <Button
              type="link"
              icon={<EditOutlined />}
              disabled={!canEdit}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/courses/${record.id}/edit`);
              }}
            >
              Редактировать
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="page-wrap">
      <div className="page-head">
        <div className="page-head-left">
          <Title level={2} style={{ margin: 0 }}>
            Курсы
          </Title>
        </div>

        <div className="page-head-actions">
          <Button icon={<ReloadOutlined />} onClick={() => void loadCourses()} loading={loading}>
            Обновить
          </Button>

          {canCreateCourse && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/courses/new")}>
              Добавить курс
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
              placeholder="Поиск: название, описание, ID учителя, дата"
              style={{ width: 380 }}
            />

            <Select
              value={status}
              onChange={(v) => setStatus(v as StatusFilter)}
              style={{ width: 220 }}
              options={[
                { value: "all", label: "Все статусы" },
                { value: "active", label: "Только активные" },
                { value: "inactive", label: "Только неактивные" },
              ]}
            />
          </div>

          <div className="table-toolbar-right">
            <Text type="secondary">
              Показано: <span className="mono">{filtered.length}</span> /{" "}
              <span className="mono">{courses.length}</span>
            </Text>
          </div>
        </div>

        <div className="stats">
          <div className="stat-item">
            <div className="stat-label">Всего</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Активные</div>
            <div className="stat-value">{stats.active}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Неактивные</div>
            <div className="stat-value">{stats.inactive}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Заканчиваются ≤ 14 дней</div>
            <div className="stat-value">{stats.endingSoon}</div>
          </div>
        </div>

        <Table<Course>
          className="data-table"
          rowKey="id"
          dataSource={filtered}
          columns={columns}
          loading={loading}
          tableLayout="fixed"
          pagination={{ pageSize: 10, showSizeChanger: false }}
          rowClassName={(_, index) => (index % 2 === 1 ? "row-zebra" : "")}
          onRow={(record) => ({
            onClick: () => navigate(`/courses/${record.id}`),
          })}
          locale={{
            emptyText: q.trim() || status !== "all" ? "Нет курсов по выбранным фильтрам" : "Курсов пока нет",
          }}
        />
      </Card>
    </div>
  );
}
