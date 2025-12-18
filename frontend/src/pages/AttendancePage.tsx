import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Progress,
  Row,
  Col,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  ReloadOutlined,
  SearchOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

import {
  type AttendanceRecord,
  type AttendanceStatus,
  getAttendance,
  updateAttendance,
} from "../api/attendance";
import { getCourses } from "../api/courses";
import { useAuth, type UserRole } from "../context/AuthContext";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface AttendanceRow extends AttendanceRecord {
  student_name?: string | null;
  course_name?: string | null;
  lesson_date?: string | null;
  student_full_name?: string | null;
}

const CHART_COLORS = {
  cyan: "#13c2c2",
  blue: "#1677ff",
  purple: "#722ed1",
  magenta: "#eb2f96",
  orange: "#fa8c16",
  volcano: "#fa541c",
  green: "#52c41a",
  gold: "#fadb14",
  red: "#f5222d",
};

const statusColor: Record<AttendanceStatus, string> = {
  present: "green",
  absent: "red",
  late: "orange",
  excused: "blue",
};

const statusLabel: Record<AttendanceStatus, string> = {
  present: "Присутствовал",
  absent: "Отсутствовал",
  late: "Опоздал",
  excused: "Уважительная причина",
};

type FiltersState = {
  course_id?: number;
  student_id?: number;
  from_date?: string;
  to_date?: string;
};

type EditFormValues = {
  status: AttendanceStatus;
  comment: string;
};

function roleLabel(role: UserRole | null | undefined) {
  if (role === "admin") return "Администратор";
  if (role === "teacher") return "Преподаватель";
  return "Студент";
}

function clamp01(x: number) {
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

function pct01To100(x: number) {
  const v = Math.round(clamp01(x) * 1000) / 10;
  if (!Number.isFinite(v)) return 0;
  return v;
}

function glassCardStyle(accent: string): CSSProperties {
  return {
    borderRadius: 16,
    border: `1px solid ${accent}2b`,
    background: `radial-gradient(900px 260px at 15% 0%, ${accent}22 0%, transparent 60%),
                 radial-gradient(700px 220px at 90% 0%, rgba(255,255,255,0.06) 0%, transparent 60%),
                 linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.25) 100%)`,
    boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset",
    overflow: "hidden",
  };
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

function safeName(record: AttendanceRow) {
  const a = (record.student_name ?? "").trim();
  if (a) return a;
  const b = (record.student_full_name ?? "").trim();
  if (b) return b;
  const c = ((record as any).student_full_name ?? "").trim();
  if (c) return c;
  return `ID ${record.student_id}`;
}

function safeCourse(record: AttendanceRow) {
  const a = (record.course_name ?? "").trim();
  if (a) return a;
  const b = ((record as any).course_name ?? "").trim();
  if (b) return b;
  return "—";
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  const d = dayjs(value);
  if (!d.isValid()) return "—";
  return d.format("DD.MM.YYYY");
}

export default function AttendancePage() {
  const { role } = useAuth();

  const [records, setRecords] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<FiltersState>({});
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const [courseOptions, setCourseOptions] = useState<{ value: number; label: string }[]>([]);
  const [studentOptions, setStudentOptions] = useState<{ value: number; label: string }[]>([]);
  const [q, setQ] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editing, setEditing] = useState<AttendanceRow | null>(null);
  const [form] = Form.useForm<EditFormValues>();

  const statusOptions = useMemo(
    () =>
      (Object.keys(statusLabel) as AttendanceStatus[]).map((s) => ({
        value: s,
        label: statusLabel[s],
      })),
    [],
  );

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await getCourses();
        setCourseOptions(
          data
            .map((c) => ({ value: c.id, label: c.name }))
            .sort((a, b) => a.label.localeCompare(b.label, "ru")),
        );
      } catch {
        message.destroy();
        message.error("Не удалось загрузить список курсов");
      }
    };

    void loadCourses();
  }, []);

  const buildStudentOptions = (data: AttendanceRow[]) => {
    const studentsMap = new Map<number, string>();
    for (const rec of data) {
      const label = safeName(rec);
      if (!studentsMap.has(rec.student_id)) {
        studentsMap.set(rec.student_id, label);
      }
    }
    setStudentOptions(
      Array.from(studentsMap.entries())
        .map(([value, label]) => ({ value, label }))
        .sort((a, b) => a.label.localeCompare(b.label, "ru")),
    );
  };

  const loadAttendance = async (nextFilters: FiltersState = filters) => {
    setLoading(true);
    try {
      const data = await getAttendance(nextFilters);
      setRecords(data);
      buildStudentOptions(data);
    } catch {
      message.destroy();
      message.error("Не удалось загрузить посещаемость");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAttendance();
  }, []);

  const applyFilters = (next: FiltersState) => {
    setFilters(next);
    void loadAttendance(next);
  };

  const handleDateChange = (values: [Dayjs | null, Dayjs | null] | null) => {
    const [start, end] = values ?? [];
    const next: FiltersState = {
      ...filters,
      from_date: start ? start.format("YYYY-MM-DD") : undefined,
      to_date: end ? end.format("YYYY-MM-DD") : undefined,
    };
    setDateRange(start && end ? [start, end] : null);
    applyFilters(next);
  };

  const handleCourseChange = (value: number | null) => {
    const next: FiltersState = { ...filters, course_id: value ?? undefined };
    applyFilters(next);
  };

  const handleStudentChange = (value: number | null) => {
    const next: FiltersState = { ...filters, student_id: value ?? undefined };
    applyFilters(next);
  };

  const openEdit = (record: AttendanceRow) => {
    setEditing(record);
    form.setFieldsValue({
      status: record.status,
      comment: (record.comment ?? "").toString(),
    });
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const saveEdit = async () => {
    if (!editing) return;

    try {
      setEditSaving(true);
      const values = await form.validateFields();
      const trimmed = (values.comment ?? "").trim();

      const updated = await updateAttendance(editing.id, {
        status: values.status,
        comment: trimmed.length ? trimmed : null,
      });

      setRecords((prev) => prev.map((r) => (r.id === editing.id ? { ...r, ...updated } : r)));

      message.destroy();
      message.success("Запись обновлена");
      closeEdit();
    } catch (err: any) {
      if (err?.errorFields) return;
      message.destroy();
      message.error("Не удалось сохранить изменения");
    } finally {
      setEditSaving(false);
    }
  };

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return records;

    return records.filter((r) => {
      const s = safeName(r).toLowerCase();
      const c = safeCourse(r).toLowerCase();
      return s.includes(query) || c.includes(query);
    });
  }, [records, q]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const present = filtered.filter((r) => r.status === "present").length;
    const absent = filtered.filter((r) => r.status === "absent").length;
    const late = filtered.filter((r) => r.status === "late").length;
    const excused = filtered.filter((r) => r.status === "excused").length;

    const attendanceRate = total ? present / total : 0;
    const absentRate = total ? absent / total : 0;
    const lateExcusedRate = total ? (late + excused) / total : 0;

    return {
      total,
      present,
      absent,
      late,
      excused,
      attendanceRate,
      absentRate,
      lateExcusedRate,
    };
  }, [filtered]);

  const columns: ColumnsType<AttendanceRow> = [
    {
      title: "Студент",
      dataIndex: "student_name",
      key: "student_name",
      ellipsis: true,
      render: (_value, record) => (
        <Tooltip title={safeName(record)}>
          <Text strong ellipsis style={{ maxWidth: 280, display: "inline-block" }}>
            {safeName(record)}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "ID занятия",
      dataIndex: "lesson_id",
      key: "lesson_id",
      width: 110,
      className: "mono",
    },
    {
      title: "Курс",
      dataIndex: "course_name",
      key: "course_name",
      ellipsis: true,
      render: (_value, record) => (
        <Tooltip title={safeCourse(record)}>
          <Text ellipsis style={{ maxWidth: 420, display: "inline-block" }}>
            {safeCourse(record)}
          </Text>
        </Tooltip>
      ),
    },
    {
      title: "Дата",
      dataIndex: "lesson_date",
      key: "lesson_date",
      width: 130,
      className: "mono",
      render: (value: string | null | undefined) => formatDate(value),
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      width: 220,
      render: (_value, record) => (
        <Tag
          className="att-pill-tag"
          color={statusColor[record.status]}
          onClick={() => openEdit(record)}
          style={{ cursor: "pointer", userSelect: "none" }}
        >
          {statusLabel[record.status]}
        </Tag>
      ),
    },
    {
      title: "",
      key: "actions",
      width: 64,
      render: (_value, record) => (
        <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
      ),
    },
  ];

  const activeFiltersText = useMemo(() => {
    const parts: string[] = [];
    if (filters.from_date || filters.to_date) {
      parts.push(
        `${filters.from_date ? dayjs(filters.from_date).format("DD.MM.YYYY") : "…"} — ${
          filters.to_date ? dayjs(filters.to_date).format("DD.MM.YYYY") : "…"
        }`,
      );
    }
    if (filters.course_id) {
      const c = courseOptions.find((x) => x.value === filters.course_id)?.label;
      parts.push(c ? `Курс: ${c}` : `Курс: ID ${filters.course_id}`);
    }
    if (filters.student_id) {
      const s = studentOptions.find((x) => x.value === filters.student_id)?.label;
      parts.push(s ? `Студент: ${s}` : `Студент: ID ${filters.student_id}`);
    }
    return parts.join(" · ");
  }, [filters, courseOptions, studentOptions]);

  return (
    <div className="page-wrap attendance-page">
      <style>{`
        .attendance-page .att-hero {
          padding: 8px 0 6px 0;
        }
        .attendance-page .att-title-row {
          display: flex;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
        }
        .attendance-page .att-role-tag {
          border-radius: 999px;
          padding: 4px 10px;
          border: 1px solid rgba(114,46,209,0.35);
          background: radial-gradient(500px 120px at 20% 0%, rgba(114,46,209,0.25) 0%, transparent 60%),
                      linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.2) 100%);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.04) inset;
        }
        .attendance-page .att-sub {
          margin-top: 4px;
        }
        .attendance-page .att-filter-card .ant-card-body {
          padding: 14px 14px 12px 14px;
        }
        .attendance-page .att-table-card .ant-card-body {
          padding: 0;
        }
        .attendance-page .att-table-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 14px 10px 14px;
          flex-wrap: wrap;
        }
        .attendance-page .att-table-meta {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .attendance-page .att-chip {
          border-radius: 999px;
          padding: 4px 10px;
          border: 1px solid rgba(19,194,194,0.25);
          background: radial-gradient(400px 120px at 10% 0%, rgba(19,194,194,0.18) 0%, transparent 60%),
                      linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.22) 100%);
          box-shadow: 0 0 0 1px rgba(255,255,255,0.04) inset;
          color: rgba(255,255,255,0.75);
          max-width: 100%;
        }
        .attendance-page .att-pill-tag {
          border-radius: 999px;
          padding: 4px 10px;
        }
        .attendance-page .att-pill-tag.ant-tag-green {
          border: 1px solid rgba(82,196,26,0.35);
          background: radial-gradient(500px 160px at 20% 0%, rgba(82,196,26,0.22) 0%, transparent 60%),
                      linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.22) 100%);
        }
        .attendance-page .att-pill-tag.ant-tag-red {
          border: 1px solid rgba(245,34,45,0.35);
          background: radial-gradient(500px 160px at 20% 0%, rgba(245,34,45,0.20) 0%, transparent 60%),
                      linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.22) 100%);
        }
        .attendance-page .att-pill-tag.ant-tag-orange {
          border: 1px solid rgba(250,140,22,0.35);
          background: radial-gradient(500px 160px at 20% 0%, rgba(250,140,22,0.20) 0%, transparent 60%),
                      linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.22) 100%);
        }
        .attendance-page .att-pill-tag.ant-tag-blue {
          border: 1px solid rgba(22,119,255,0.35);
          background: radial-gradient(500px 160px at 20% 0%, rgba(22,119,255,0.18) 0%, transparent 60%),
                      linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.22) 100%);
        }
        .attendance-page .att-table .ant-table-thead > tr > th {
          background: rgba(255,255,255,0.02);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .attendance-page .att-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .attendance-page .att-table .att-row-zebra td {
          background: rgba(255,255,255,0.01);
        }
      `}</style>

      <div className="att-hero">
        <div className="page-head">
          <div className="page-head-left">
            <div className="att-title-row">
              <Title level={2} style={{ margin: 0 }}>
                Посещаемость
              </Title>
              <span className="att-role-tag">{roleLabel(role)}</span>
            </div>
            <div className="att-sub">
              <Text type="secondary">Фильтры сверху, быстрый поиск и краткая статистика по выборке.</Text>
            </div>
          </div>
        </div>
      </div>

      <Card
        className="att-filter-card"
        bordered={false}
        style={glassCardStyle(CHART_COLORS.cyan)}
      >
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} lg={18}>
            <Row gutter={[12, 12]}>
              <Col xs={24} md={12} lg={10}>
                <RangePicker
                  value={dateRange}
                  onChange={handleDateChange}
                  style={{ width: "100%" }}
                  allowClear
                />
              </Col>

              <Col xs={24} md={12} lg={6}>
                <Select
                  placeholder="Курс"
                  allowClear
                  style={{ width: "100%" }}
                  options={courseOptions}
                  value={filters.course_id}
                  onChange={(value) => handleCourseChange(typeof value === "number" ? value : null)}
                  showSearch
                  optionFilterProp="label"
                />
              </Col>

              <Col xs={24} md={12} lg={6}>
                <Select
                  placeholder="Студент"
                  allowClear
                  style={{ width: "100%" }}
                  options={studentOptions}
                  value={filters.student_id}
                  onChange={(value) => handleStudentChange(typeof value === "number" ? value : null)}
                  showSearch
                  optionFilterProp="label"
                />
              </Col>

              <Col xs={24} md={12} lg={8}>
                <Input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  allowClear
                  prefix={<SearchOutlined />}
                  placeholder="Поиск: студент или курс"
                />
              </Col>
            </Row>
          </Col>

          <Col xs={24} lg={6}>
            <Space style={{ width: "100%", justifyContent: "flex-end" }} wrap>
              <Button
                icon={<ReloadOutlined />}
                onClick={() => void loadAttendance()}
                loading={loading}
              >
                Обновить
              </Button>
            </Space>
          </Col>
        </Row>

        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
          <div className="att-chip">
            <Space size={8} wrap>
              <ThunderboltOutlined style={{ color: CHART_COLORS.cyan }} />
              <span style={{ opacity: 0.85 }}>Фильтры:</span>
              <span className="mono" style={{ opacity: 0.95 }}>
                {activeFiltersText || "не выбраны"}
              </span>
            </Space>
          </div>

          <div className="att-chip" style={{ borderColor: "rgba(255,255,255,0.12)" }}>
            <Space size={8} wrap>
              <CalendarOutlined style={{ color: "rgba(255,255,255,0.65)" }} />
              <span style={{ opacity: 0.85 }}>Показано:</span>
              <span className="mono" style={{ opacity: 0.95 }}>
                {filtered.length}
              </span>
              <span style={{ opacity: 0.65 }}>/</span>
              <span className="mono" style={{ opacity: 0.85 }}>
                {records.length}
              </span>
            </Space>
          </div>
        </div>
      </Card>

      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} md={12} lg={6}>
          <Card bordered={false} style={kpiStyle(CHART_COLORS.blue, CHART_COLORS.cyan)}>
            <Space align="start" size={12}>
              <div style={{ fontSize: 18, color: CHART_COLORS.blue, paddingTop: 4 }}>
                <CalendarOutlined />
              </div>
              <div style={{ width: "100%" }}>
                <Statistic title="Всего записей" value={stats.total} />
                <div style={{ marginTop: 10 }}>
                  <Progress percent={Math.round((stats.total ? 1 : 0) * 100)} showInfo={false} />
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card bordered={false} style={kpiStyle(CHART_COLORS.green, CHART_COLORS.cyan)}>
            <Space align="start" size={12}>
              <div style={{ fontSize: 18, color: CHART_COLORS.green, paddingTop: 4 }}>
                <CheckCircleOutlined />
              </div>
              <div style={{ width: "100%" }}>
                <Tooltip title={`Присутствовал: ${stats.present} из ${stats.total}`}>
                  <div>
                    <Statistic title="Посещаемость" value={pct01To100(stats.attendanceRate)} suffix="%" />
                  </div>
                </Tooltip>
                <div style={{ marginTop: 10 }}>
                  <Progress percent={Math.round(stats.attendanceRate * 100)} showInfo={false} />
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card bordered={false} style={kpiStyle(CHART_COLORS.red, CHART_COLORS.volcano)}>
            <Space align="start" size={12}>
              <div style={{ fontSize: 18, color: CHART_COLORS.red, paddingTop: 4 }}>
                <CloseCircleOutlined />
              </div>
              <div style={{ width: "100%" }}>
                <Tooltip title={`Отсутствовал: ${stats.absent} из ${stats.total}`}>
                  <div>
                    <Statistic title="Отсутствовал" value={stats.absent} />
                  </div>
                </Tooltip>
                <div style={{ marginTop: 10 }}>
                  <Progress percent={Math.round(stats.absentRate * 100)} showInfo={false} />
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card bordered={false} style={kpiStyle(CHART_COLORS.orange, CHART_COLORS.purple)}>
            <Space align="start" size={12}>
              <div style={{ fontSize: 18, color: CHART_COLORS.orange, paddingTop: 4 }}>
                <ClockCircleOutlined />
              </div>
              <div style={{ width: "100%" }}>
                <Tooltip title={`Опоздал: ${stats.late} · Уваж.: ${stats.excused}`}>
                  <div>
                    <Statistic title="Опоздал / Уваж." value={`${stats.late} / ${stats.excused}`} />
                  </div>
                </Tooltip>
                <div style={{ marginTop: 10 }}>
                  <Progress percent={Math.round(stats.lateExcusedRate * 100)} showInfo={false} />
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card
        className="att-table-card"
        bordered={false}
        style={{ ...glassCardStyle(CHART_COLORS.blue), marginTop: 12 }}
      >
        <div className="att-table-toolbar">
          <div className="att-table-meta">
            <span className="att-chip" style={{ borderColor: `${CHART_COLORS.blue}33` }}>
              <Space size={8} wrap>
                <CheckCircleOutlined style={{ color: CHART_COLORS.green }} />
                <span>Присутствовал:</span>
                <span className="mono">{stats.present}</span>
              </Space>
            </span>

            <span className="att-chip" style={{ borderColor: `${CHART_COLORS.red}33` }}>
              <Space size={8} wrap>
                <CloseCircleOutlined style={{ color: CHART_COLORS.red }} />
                <span>Отсутствовал:</span>
                <span className="mono">{stats.absent}</span>
              </Space>
            </span>
          </div>

          <div className="att-table-meta">
            <Text type="secondary">
              Нажми на статус, чтобы быстро отредактировать
            </Text>
          </div>
        </div>

        <Table<AttendanceRow>
          className="att-table"
          rowKey="id"
          dataSource={filtered}
          columns={columns}
          loading={loading}
          tableLayout="fixed"
          pagination={{ pageSize: 20, showSizeChanger: false }}
          rowClassName={(_, index) => (index % 2 === 1 ? "att-row-zebra" : "")}
          locale={{
            emptyText:
              q.trim() || filters.course_id || filters.student_id || filters.from_date || filters.to_date
                ? "Нет записей по выбранным фильтрам"
                : "Записей посещаемости пока нет",
          }}
        />
      </Card>

      <Modal
        open={editOpen}
        title="Редактирование посещаемости"
        onCancel={closeEdit}
        onOk={() => void saveEdit()}
        okText="Сохранить"
        cancelText="Отмена"
        confirmLoading={editSaving}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item name="status" label="Статус" rules={[{ required: true, message: "Выберите статус" }]}>
            <Select options={statusOptions} />
          </Form.Item>

          <Form.Item name="comment" label="Комментарий" rules={[{ max: 255, message: "Максимум 255 символов" }]}>
            <Input.TextArea autoSize={{ minRows: 3, maxRows: 6 }} placeholder="Опционально" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
