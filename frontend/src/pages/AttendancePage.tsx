import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Input,
  Select,
  Space,
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

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<FiltersState>({});
  const [courseOptions, setCourseOptions] = useState<{ value: number; label: string }[]>([]);
  const [studentOptions, setStudentOptions] = useState<{ value: number; label: string }[]>([]);
  const [q, setQ] = useState("");

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
    _dateStrings: [string, string],
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

  const toggleStatusValue = (status: AttendanceStatus): AttendanceStatus => {
    if (status === "present") return "absent";
    if (status === "absent") return "present";
    return "present";
  };

  const handleToggleStatus = async (record: AttendanceRow) => {
    const newStatus = toggleStatusValue(record.status);
    try {
      const updated = await updateAttendance(record.id, { status: newStatus });
      setRecords((prev) => prev.map((r) => (r.id === record.id ? { ...r, ...updated } : r)));
    } catch {
      message.error("Не удалось обновить статус");
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
      render: (value: string | null | undefined) => (value ? new Date(value).toLocaleDateString() : "—"),
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
          onClick={() => handleToggleStatus(record)}
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
      render: () => (
        <Button
          type="text"
          icon={<EditOutlined />}
          onClick={() => message.info("Точную форму редактирования статуса/комментария добавим позже")}
        />
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
              onChange={(value) => handleCourseChange(value as number | null)}
            />
            <Select
              placeholder="Студент"
              allowClear
              style={{ width: 260 }}
              options={studentOptions}
              value={filters.student_id}
              onChange={(value) => handleStudentChange(value as number | null)}
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
    </div>
  );
}
