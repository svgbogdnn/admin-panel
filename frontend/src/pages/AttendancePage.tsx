import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import { EditOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";

import {
  type AttendanceRecord,
  type AttendanceStatus,
  getAttendance,
  updateAttendance,
} from "../api/attendance";
import { getCourses } from "../api/courses";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface AttendanceRow extends AttendanceRecord {
  student_name?: string | null;
  course_name?: string | null;
  lesson_date?: string | null;
}

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

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<FiltersState>({});
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
          data.map((c) => ({
            value: c.id,
            label: c.name,
          })),
        );
      } catch {
        message.destroy();
        message.error("Не удалось загрузить список курсов");
      }
    };

    void loadCourses();
  }, []);

  const loadAttendance = async (nextFilters: FiltersState = filters) => {
    setLoading(true);
    try {
      const data = await getAttendance(nextFilters);
      setRecords(data);

      const studentsMap = new Map<number, string>();
      data.forEach((rec) => {
        const label =
          rec.student_name ||
          (rec as any).student_full_name ||
          `ID ${rec.student_id}`;
        if (!studentsMap.has(rec.student_id)) {
          studentsMap.set(rec.student_id, label);
        }
      });

      setStudentOptions(
        Array.from(studentsMap.entries()).map(([value, label]) => ({
          value,
          label,
        })),
      );
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

  const handleDateChange = (
    values: [Dayjs | null, Dayjs | null] | null,
  ) => {
    const [start, end] = values ?? [];
    const next: FiltersState = {
      ...filters,
      from_date: start ? start.format("YYYY-MM-DD") : undefined,
      to_date: end ? end.format("YYYY-MM-DD") : undefined,
    };
    setFilters(next);
    void loadAttendance(next);
  };

  const handleCourseChange = (value: number | null) => {
    const next: FiltersState = { ...filters, course_id: value ?? undefined };
    setFilters(next);
    void loadAttendance(next);
  };

  const handleStudentChange = (value: number | null) => {
    const next: FiltersState = { ...filters, student_id: value ?? undefined };
    setFilters(next);
    void loadAttendance(next);
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
      const s = (r.student_name || "").toLowerCase();
      const c = (r.course_name || "").toLowerCase();
      return s.includes(query) || c.includes(query);
    });
  }, [records, q]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const present = filtered.filter((r) => r.status === "present").length;
    const absent = filtered.filter((r) => r.status === "absent").length;
    const late = filtered.filter((r) => r.status === "late").length;
    const excused = filtered.filter((r) => r.status === "excused").length;
    return { total, present, absent, late, excused };
  }, [filtered]);

  const columns: ColumnsType<AttendanceRow> = [
    {
      title: "Студент",
      dataIndex: "student_name",
      key: "student_name",
      ellipsis: true,
      render: (_value, record) => record.student_name || `ID ${record.student_id}`,
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
      render: (value: string | null | undefined) => value || "—",
    },
    {
      title: "Дата",
      dataIndex: "lesson_date",
      key: "lesson_date",
      width: 130,
      className: "mono",
      render: (value: string | null | undefined) =>
        value ? new Date(value).toLocaleDateString() : "—",
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      width: 190,
      render: (_value, record) => (
        <Tag
          className="pill-tag"
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
      width: 60,
      render: (_value, record) => (
        <Button type="text" icon={<EditOutlined />} onClick={() => openEdit(record)} />
      ),
    },
  ];

  return (
    <div className="page-wrap">
      <div className="page-head">
        <div className="page-head-left">
          <Title level={2} style={{ margin: 0 }}>
            Посещаемость
          </Title>
          <Text type="secondary">Фильтры сверху, быстрый поиск, и краткая статистика по выборке.</Text>
        </div>
      </div>

      <Card className="card-surface" bordered={false} bodyStyle={{ padding: 0 }}>
        <div className="table-toolbar">
          <div className="table-toolbar-left">
            <RangePicker onChange={handleDateChange} />
            <Select
              placeholder="Курс"
              allowClear
              style={{ width: 260 }}
              options={courseOptions}
              value={filters.course_id}
              onChange={(value) => handleCourseChange(typeof value === "number" ? value : null)}
            />
            <Select
              placeholder="Студент"
              allowClear
              style={{ width: 260 }}
              options={studentOptions}
              value={filters.student_id}
              onChange={(value) => handleStudentChange(typeof value === "number" ? value : null)}
            />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Поиск: студент или курс"
              style={{ width: 260 }}
            />
          </div>

          <div className="table-toolbar-right">
            <Button icon={<ReloadOutlined />} onClick={() => void loadAttendance()} loading={loading}>
              Обновить
            </Button>
          </div>
        </div>

        <div className="stats">
          <div className="stat-item">
            <div className="stat-label">Всего записей</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Присутствовал</div>
            <div className="stat-value">{stats.present}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Отсутствовал</div>
            <div className="stat-value">{stats.absent}</div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Опоздал / Уваж.</div>
            <div className="stat-value">
              {stats.late} / {stats.excused}
            </div>
          </div>
        </div>

        <Table<AttendanceRow>
          className="data-table"
          rowKey="id"
          dataSource={filtered}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 20, showSizeChanger: false }}
          rowClassName={(_, index) => (index % 2 === 1 ? "row-zebra" : "")}
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

          <Form.Item
            name="comment"
            label="Комментарий"
            rules={[{ max: 255, message: "Максимум 255 символов" }]}
          >
            <Input.TextArea autoSize={{ minRows: 3, maxRows: 6 }} placeholder="Опционально" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
