import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Input,
  Progress,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  BookOutlined,
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  FireOutlined,
  PauseCircleOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { type Course, getCourses } from "../api/courses";
import { useAuth } from "../context/AuthContext";

const { Title, Text } = Typography;

const toLower = (v: unknown) => String(v ?? "").toLowerCase();

const roleLabel = (role?: string) => {
  if (role === "admin") return "Администратор";
  if (role === "teacher") return "Преподаватель";
  if (role === "student") return "Студент";
  return "Пользователь";
};

const roleTagStyle = (role?: string) => {
  if (role === "admin") {
    return {
      background: "rgba(168, 85, 247, 0.14)",
      borderColor: "rgba(168, 85, 247, 0.35)",
      color: "rgba(216, 180, 254, 0.95)",
    } as const;
  }
  if (role === "teacher") {
    return {
      background: "rgba(59, 130, 246, 0.14)",
      borderColor: "rgba(59, 130, 246, 0.35)",
      color: "rgba(147, 197, 253, 0.95)",
    } as const;
  }
  return {
    background: "rgba(34, 197, 94, 0.12)",
    borderColor: "rgba(34, 197, 94, 0.32)",
    color: "rgba(134, 239, 172, 0.95)",
  } as const;
};

const isEndingSoon = (course: Course, days = 14) => {
  const end = dayjs(course.end_date);
  if (!end.isValid()) return false;
  const diff = end.startOf("day").diff(dayjs().startOf("day"), "day");
  return diff >= 0 && diff <= days;
};

const formatDate = (v: unknown) => {
  const d = dayjs(String(v ?? ""));
  return d.isValid() ? d.format("DD.MM.YYYY") : String(v ?? "");
};

export default function CoursesPage() {
  const nav = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");

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
    const endingSoon = filtered.filter((c) => isEndingSoon(c, 14)).length;
    return { total, active, inactive, endingSoon };
  }, [filtered]);

  const canCreateCourse = user?.role === "admin" || user?.role === "teacher";

  const canEditCourse = (course: Course) => {
    if (user?.role === "admin") return true;
    if (user?.role === "teacher") return String(course.teacher_id) === String(user.id);
    return false;
  };

  const kpi = useMemo(() => {
    const total = Math.max(stats.total, 1);
    const activePct = Math.round((stats.active / total) * 100);
    const inactivePct = Math.round((stats.inactive / total) * 100);
    const soonPct = Math.round((stats.endingSoon / total) * 100);
    return { activePct, inactivePct, soonPct };
  }, [stats]);

  const columns: ColumnsType<Course> = [
    {
      title: "Курс",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => toLower(a.name).localeCompare(toLower(b.name)),
      render: (value: string, record: Course) => {
        const soon = isEndingSoon(record, 14);
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 6, minWidth: 280 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <Text style={{ fontSize: 15, fontWeight: 600 }}>{value}</Text>

              {soon && (
                <Tag
                  style={{
                    marginInlineEnd: 0,
                    borderRadius: 999,
                    padding: "2px 10px",
                    borderWidth: 1,
                    background: "rgba(245,158,11,0.14)",
                    borderColor: "rgba(245,158,11,0.35)",
                    color: "rgba(253,230,138,0.95)",
                  }}
                >
                  ≤ 14 дней до конца
                </Tag>
              )}
            </div>

            <Text type="secondary" style={{ fontSize: 12, opacity: 0.85 }}>
              <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                <UserOutlined style={{ fontSize: 12 }} />
                ID преподавателя: {String(record.teacher_id)}
              </span>
              <span style={{ marginInline: 10, opacity: 0.55 }}>•</span>
              {formatDate(record.start_date)} — {formatDate(record.end_date)}
            </Text>

            {(record as any).description ? (
              <Text type="secondary" style={{ fontSize: 12, opacity: 0.8 }}>
                {String((record as any).description)}
              </Text>
            ) : null}
          </div>
        );
      },
    },
    {
      title: "Старт",
      dataIndex: "start_date",
      key: "start_date",
      sorter: (a, b) => dayjs(a.start_date).valueOf() - dayjs(b.start_date).valueOf(),
      render: (v) => formatDate(v),
      width: 130,
    },
    {
      title: "Конец",
      dataIndex: "end_date",
      key: "end_date",
      sorter: (a, b) => dayjs(a.end_date).valueOf() - dayjs(b.end_date).valueOf(),
      render: (v) => formatDate(v),
      width: 130,
    },
    {
      title: "Статус",
      dataIndex: "is_active",
      key: "is_active",
      sorter: (a, b) => Number(!!a.is_active) - Number(!!b.is_active),
      width: 150,
      render: (value: boolean, record: Course) => {
        const active = !!value;
        const soon = isEndingSoon(record, 14);
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <Tag
              style={{
                marginInlineEnd: 0,
                borderRadius: 999,
                padding: "2px 10px",
                borderWidth: 1,
                background: active ? "rgba(34,197,94,0.12)" : "rgba(244,63,94,0.12)",
                borderColor: active ? "rgba(34,197,94,0.35)" : "rgba(244,63,94,0.35)",
                color: active ? "rgba(134,239,172,0.95)" : "rgba(254,202,202,0.95)",
                width: "fit-content",
              }}
            >
              {active ? "Активный" : "Неактивный"}
            </Tag>

            {soon && (
              <Text style={{ fontSize: 12, opacity: 0.75, color: "rgba(253,230,138,0.95)" }}>
                скоро закончится
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: "Действия",
      key: "actions",
      width: 240,
      render: (_: unknown, record: Course) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => nav(`/courses/${record.id}`)}
            style={{
              borderRadius: 999,
              borderColor: "rgba(59,130,246,0.35)",
              background: "rgba(59,130,246,0.12)",
              color: "rgba(147,197,253,0.95)",
            }}
          >
            Подробнее
          </Button>

          {canEditCourse(record) && (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => nav(`/courses/${record.id}/edit`)}
              style={{
                borderRadius: 999,
                borderColor: "rgba(168,85,247,0.35)",
                background: "rgba(168,85,247,0.12)",
                color: "rgba(216,180,254,0.95)",
              }}
            >
              Редактировать
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const rowClassName = (record: Course, index: number) => {
    const zebra = index % 2 === 1 ? "row-zebra" : "";
    const inactive = !record.is_active ? "row-inactive" : "";
    const soon = isEndingSoon(record, 14) ? "row-soon" : "";
    return [zebra, inactive, soon].filter(Boolean).join(" ");
  };

  return (
    <div className="page-wrap">
      <style>
        {`
          .courses-surface .ant-card-body { padding: 18px; }
          .courses-kpi-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 14px;
            margin-top: 14px;
          }
          .courses-kpi-card {
            position: relative;
            overflow: hidden;
            border-radius: 18px;
            border: 1px solid rgba(255,255,255,0.08);
            box-shadow: 0 14px 34px rgba(0,0,0,0.35);
            backdrop-filter: blur(10px);
            transform: translateZ(0);
            transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
          }
          .courses-kpi-card:hover {
            transform: translateY(-2px);
            border-color: rgba(255,255,255,0.16);
            box-shadow: 0 18px 44px rgba(0,0,0,0.45);
          }
          .courses-kpi-inner {
            position: relative;
            padding: 16px 16px 14px 16px;
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .courses-kpi-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
          }
          .courses-kpi-left {
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 0;
          }
          .courses-kpi-icon {
            width: 38px;
            height: 38px;
            border-radius: 14px;
            display: grid;
            place-items: center;
            border: 1px solid rgba(255,255,255,0.12);
            box-shadow: 0 10px 20px rgba(0,0,0,0.35);
            flex: 0 0 auto;
          }
          .courses-kpi-title {
            font-size: 12px;
            opacity: 0.82;
            letter-spacing: 0.2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .courses-kpi-value {
            font-size: 26px;
            font-weight: 700;
            line-height: 1.05;
          }
          .courses-kpi-sub {
            font-size: 12px;
            opacity: 0.8;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 10px;
          }
          .courses-toolbar {
            display: grid;
            grid-template-columns: 1fr 200px;
            gap: 12px;
            align-items: center;
          }
          .courses-toolbar-left {
            display: grid;
            grid-template-columns: 1fr 220px;
            gap: 12px;
            align-items: center;
          }
          @media (max-width: 900px) {
            .courses-toolbar { grid-template-columns: 1fr; }
            .courses-toolbar-left { grid-template-columns: 1fr; }
          }
          .courses-chip {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 6px 10px;
            border-radius: 999px;
            border: 1px solid rgba(255,255,255,0.10);
            background: rgba(255,255,255,0.04);
          }
          .data-table .ant-table-tbody > tr.row-inactive > td {
            box-shadow: inset 4px 0 0 rgba(244,63,94,0.28);
          }
          .data-table .ant-table-tbody > tr.row-soon > td {
            box-shadow: inset 4px 0 0 rgba(245,158,11,0.28);
          }
        `}
      </style>

      <div className="page-head">
        <div className="page-head-left" style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <Title level={2} style={{ margin: 0 }}>
              Курсы
            </Title>
            <Tag
              style={{
                margin: 0,
                borderRadius: 999,
                padding: "2px 10px",
                borderWidth: 1,
                ...roleTagStyle(user?.role),
              }}
            >
              {roleLabel(user?.role)}
            </Tag>
          </div>

          <div
            style={{
              height: 3,
              width: 220,
              borderRadius: 999,
              background:
                "linear-gradient(90deg, rgba(34,197,94,0.9), rgba(59,130,246,0.9), rgba(168,85,247,0.9), rgba(245,158,11,0.9))",
              opacity: 0.85,
            }}
          />
        </div>

        <div className="page-head-right">
          <Space>
            <Tooltip title="Обновить данные">
              <Button icon={<ReloadOutlined />} onClick={() => void loadCourses()}>
                Обновить
              </Button>
            </Tooltip>

            {canCreateCourse && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => nav("/courses/new")}
                style={{
                  borderRadius: 999,
                  border: "none",
                  background: "linear-gradient(135deg, rgba(34,197,94,0.95), rgba(59,130,246,0.95))",
                  boxShadow: "0 12px 26px rgba(0,0,0,0.35)",
                }}
              >
                Добавить курс
              </Button>
            )}
          </Space>
        </div>
      </div>

      <Card className="courses-surface" bordered={false}>
        <div className="courses-toolbar">
          <div className="courses-toolbar-left">
            <Input
              allowClear
              value={q}
              onChange={(e) => setQ(e.target.value)}
              prefix={<SearchOutlined style={{ opacity: 0.75 }} />}
              placeholder="Поиск: название, описание, ID учителя, дата"
            />

            <Select
              value={status}
              onChange={(v) => setStatus(v)}
              options={[
                { value: "all", label: "Все статусы" },
                { value: "active", label: "Активные" },
                { value: "inactive", label: "Неактивные" },
              ]}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <span className="courses-chip">
              <BookOutlined />
              <Text style={{ opacity: 0.85 }}>Показано:</Text>
              <Text style={{ fontWeight: 700 }}>{filtered.length}</Text>
              <Text style={{ opacity: 0.55 }}>/</Text>
              <Text style={{ opacity: 0.85 }}>{courses.length}</Text>
            </span>
          </div>
        </div>

        <div className="courses-kpi-grid">
          <div
            className="courses-kpi-card"
            style={{
              background:
                "linear-gradient(135deg, rgba(14, 165, 233, 0.16), rgba(59, 130, 246, 0.10))",
            }}
          >
            <div className="courses-kpi-inner">
              <div className="courses-kpi-head">
                <div className="courses-kpi-left">
                  <div
                    className="courses-kpi-icon"
                    style={{
                      background: "linear-gradient(135deg, rgba(14,165,233,0.20), rgba(59,130,246,0.12))",
                      color: "rgba(147,197,253,0.95)",
                    }}
                  >
                    <BookOutlined />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="courses-kpi-title">Всего курсов (в фильтре)</div>
                    <div className="courses-kpi-value">{stats.total}</div>
                  </div>
                </div>

                <Text style={{ fontSize: 12, opacity: 0.75 }}>всего: {courses.length}</Text>
              </div>

              <div className="courses-kpi-sub">
                <span style={{ opacity: 0.82 }}>-</span>
                <span style={{ opacity: 0.9 }}>-</span>
              </div>

              <Progress
                percent={Math.min(100, Math.round((stats.total / Math.max(courses.length, 1)) * 100))}
                showInfo={false}
                strokeColor={{ "0%": "rgba(14,165,233,0.95)", "100%": "rgba(59,130,246,0.95)" }}
                trailColor="rgba(255,255,255,0.06)"
              />
            </div>
          </div>

          <div
            className="courses-kpi-card"
            style={{
              background:
                "linear-gradient(135deg, rgba(34, 197, 94, 0.16), rgba(16, 185, 129, 0.08))",
            }}
          >
            <div className="courses-kpi-inner">
              <div className="courses-kpi-head">
                <div className="courses-kpi-left">
                  <div
                    className="courses-kpi-icon"
                    style={{
                      background: "linear-gradient(135deg, rgba(34,197,94,0.18), rgba(16,185,129,0.10))",
                      color: "rgba(134,239,172,0.95)",
                    }}
                  >
                    <CheckCircleOutlined />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="courses-kpi-title">Активные</div>
                    <div className="courses-kpi-value">{stats.active}</div>
                  </div>
                </div>

                <Text style={{ fontSize: 12, opacity: 0.8 }}>{kpi.activePct}%</Text>
              </div>

              <div className="courses-kpi-sub">
                <span>Доля активных</span>
                <span style={{ fontWeight: 700 }}>{kpi.activePct}%</span>
              </div>

              <Progress
                percent={kpi.activePct}
                showInfo={false}
                strokeColor={{ "0%": "rgba(34,197,94,0.95)", "100%": "rgba(16,185,129,0.95)" }}
                trailColor="rgba(255,255,255,0.06)"
              />
            </div>
          </div>

          <div
            className="courses-kpi-card"
            style={{
              background:
                "linear-gradient(135deg, rgba(244, 63, 94, 0.14), rgba(249, 115, 22, 0.08))",
            }}
          >
            <div className="courses-kpi-inner">
              <div className="courses-kpi-head">
                <div className="courses-kpi-left">
                  <div
                    className="courses-kpi-icon"
                    style={{
                      background: "linear-gradient(135deg, rgba(244,63,94,0.16), rgba(249,115,22,0.10))",
                      color: "rgba(254,202,202,0.95)",
                    }}
                  >
                    <PauseCircleOutlined />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="courses-kpi-title">Неактивные</div>
                    <div className="courses-kpi-value">{stats.inactive}</div>
                  </div>
                </div>

                <Text style={{ fontSize: 12, opacity: 0.8 }}>{kpi.inactivePct}%</Text>
              </div>

              <div className="courses-kpi-sub">
                <span>Доля неактивных</span>
                <span style={{ fontWeight: 700 }}>{kpi.inactivePct}%</span>
              </div>

              <Progress
                percent={kpi.inactivePct}
                showInfo={false}
                strokeColor={{ "0%": "rgba(244,63,94,0.95)", "100%": "rgba(249,115,22,0.95)" }}
                trailColor="rgba(255,255,255,0.06)"
              />
            </div>
          </div>

          <div
            className="courses-kpi-card"
            style={{
              background:
                "linear-gradient(135deg, rgba(168, 85, 247, 0.14), rgba(245, 158, 11, 0.08))",
            }}
          >
            <div className="courses-kpi-inner">
              <div className="courses-kpi-head">
                <div className="courses-kpi-left">
                  <div
                    className="courses-kpi-icon"
                    style={{
                      background: "linear-gradient(135deg, rgba(168,85,247,0.14), rgba(245,158,11,0.10))",
                      color: "rgba(216,180,254,0.95)",
                    }}
                  >
                    <FireOutlined />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div className="courses-kpi-title">Заканчиваются ≤ 14 дней</div>
                    <div className="courses-kpi-value">{stats.endingSoon}</div>
                  </div>
                </div>

                <Text style={{ fontSize: 12, opacity: 0.8 }}>{kpi.soonPct}%</Text>
              </div>

              <div className="courses-kpi-sub">
                <span>Доля «заканчиваются скоро»</span>
                <span style={{ fontWeight: 700 }}>{kpi.soonPct}%</span>
              </div>

              <Progress
                percent={kpi.soonPct}
                showInfo={false}
                strokeColor={{ "0%": "rgba(168,85,247,0.95)", "100%": "rgba(245,158,11,0.95)" }}
                trailColor="rgba(255,255,255,0.06)"
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <Table
            className="data-table"
            rowKey="id"
            loading={loading}
            columns={columns}
            dataSource={filtered}
            rowClassName={rowClassName}
            pagination={{ pageSize: 10, showSizeChanger: false }}
          />
        </div>
      </Card>
    </div>
  );
}
