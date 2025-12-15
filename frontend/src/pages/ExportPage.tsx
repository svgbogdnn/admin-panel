import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  DatePicker,
  Empty,
  Form,
  InputNumber,
  Row,
  Col,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ClearOutlined,
  DownloadOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { getAttendance, type AttendanceRecord } from "../api/attendance";
import { getCourses, type Course } from "../api/courses";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type ExportType = "csv" | "json";

interface ExportFormValues {
  course_id?: number;
  lesson_id?: number;
  student_id?: number;
  range?: [dayjs.Dayjs, dayjs.Dayjs];
  export_type: ExportType;
}

type SelectOption = { value: number; label: string };

type ExportRow = {
  course_name: string;
  lesson_date: string;
  lesson_id: number | string;
  student_name: string;
  status: string;
  comment: string;
};

function escapeCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  const needsQuotes = /[",\n\r]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function buildCsv(rows: Record<string, unknown>[], headers: { key: string; label: string }[]): string {
  const head = headers.map((h) => escapeCsvValue(h.label)).join(",");
  const lines = rows.map((row) => headers.map((h) => escapeCsvValue(row[h.key])).join(","));
  return [head, ...lines].join("\r\n");
}

function downloadTextFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function makeBuildKey(values: ExportFormValues): string {
  const from_date = values.range?.[0]?.format("YYYY-MM-DD") ?? "";
  const to_date = values.range?.[1]?.format("YYYY-MM-DD") ?? "";
  return JSON.stringify({
    course_id: values.course_id ?? null,
    lesson_id: values.lesson_id ?? null,
    student_id: values.student_id ?? null,
    from_date,
    to_date,
  });
}

const statusColor: Record<string, string> = {
  present: "green",
  absent: "red",
  late: "orange",
  excused: "blue",
};

const statusLabel: Record<string, string> = {
  present: "Присутствовал",
  absent: "Отсутствовал",
  late: "Опоздал",
  excused: "Уважительная причина",
};

export default function ExportPage() {
  const [form] = Form.useForm<ExportFormValues>();

  const [loading, setLoading] = useState(false);

  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);

  const [studentsLoading, setStudentsLoading] = useState(false);
  const [students, setStudents] = useState<SelectOption[]>([]);

  const [count, setCount] = useState<number | null>(null);
  const [rows, setRows] = useState<ExportRow[] | null>(null);
  const [lastBuildKey, setLastBuildKey] = useState<string | null>(null);
  const [lastFilename, setLastFilename] = useState<string | null>(null);

  const courseId = Form.useWatch("course_id", form);

  const courseNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of courses) map.set(c.id, c.name);
    return map;
  }, [courses]);

  const courseOptions = useMemo(() => courses.map((c) => ({ value: c.id, label: c.name })), [courses]);

  const loadCourses = async () => {
    setCoursesLoading(true);
    try {
      const data = await getCourses();
      setCourses(data);
    } catch {
      message.error("Не удалось загрузить курсы");
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  };

  const loadStudentsFromAttendance = async (selectedCourseId?: number) => {
    setStudentsLoading(true);
    try {
      const records = await getAttendance(selectedCourseId ? { course_id: selectedCourseId } : undefined);
      const map = new Map<number, string>();
      for (const r of records) {
        if (r.student_id === undefined || r.student_id === null) continue;
        const name = (r.student_name ?? "").trim();
        map.set(r.student_id, name.length > 0 ? name : String(r.student_id));
      }
      const options = Array.from(map.entries())
        .map(([value, label]) => ({ value, label }))
        .sort((a, b) => a.label.localeCompare(b.label, "ru"));
      setStudents(options);
    } catch {
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    void loadCourses();
    form.setFieldsValue({ export_type: "csv" });
  }, []);

  useEffect(() => {
    form.setFieldValue("student_id", undefined);
    const id = typeof courseId === "number" ? courseId : undefined;
    void loadStudentsFromAttendance(id);
  }, [courseId]);

  const buildRowsFromRecords = (records: AttendanceRecord[], values: ExportFormValues): ExportRow[] => {
    const courseNameFallback = values.course_id ? courseNameById.get(values.course_id) ?? "" : "";
    return records.map((r) => ({
      course_name: r.course_name ?? courseNameFallback,
      lesson_date: r.lesson_date ?? "",
      lesson_id: (r.lesson_id ?? "") as any,
      student_name: r.student_name ?? "",
      status: r.status ?? "",
      comment: r.comment ?? "",
    }));
  };

  const buildPreview = async (values: ExportFormValues): Promise<{ key: string; built: ExportRow[]; filename: string }> => {
    const from_date = values.range?.[0]?.format("YYYY-MM-DD");
    const to_date = values.range?.[1]?.format("YYYY-MM-DD");

    const records = await getAttendance({
      course_id: values.course_id,
      lesson_id: values.lesson_id,
      student_id: values.student_id,
      from_date,
      to_date,
    });

    const built = buildRowsFromRecords(records, values);
    const stamp = dayjs().format("YYYYMMDD_HHmmss");
    const ext = values.export_type === "csv" ? "csv" : "json";
    const filename = `attendance_export_${stamp}.${ext}`;

    const key = makeBuildKey(values);
    return { key, built, filename };
  };

  const handleBuild = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const result = await buildPreview(values);

      setRows(result.built);
      setCount(result.built.length);
      setLastBuildKey(result.key);
      setLastFilename(result.filename);

      message.success(result.built.length > 0 ? `Найдено записей: ${result.built.length}` : "По выбранным фильтрам нет данных");
    } catch {
      message.error("Не удалось сформировать выгрузку");
      setRows(null);
      setCount(null);
      setLastBuildKey(null);
      setLastFilename(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const currentKey = makeBuildKey(values);

      let dataRows = rows;
      let filename = lastFilename ?? `attendance_export_${dayjs().format("YYYYMMDD_HHmmss")}.${values.export_type}`;

      if (!dataRows || lastBuildKey !== currentKey) {
        const result = await buildPreview(values);
        dataRows = result.built;
        filename = result.filename;
        setRows(result.built);
        setCount(result.built.length);
        setLastBuildKey(result.key);
        setLastFilename(result.filename);
      }

      if (!dataRows || dataRows.length === 0) {
        message.info("Нет данных для скачивания");
        return;
      }

      if (values.export_type === "csv") {
        const headers = [
          { key: "course_name", label: "Курс" },
          { key: "lesson_date", label: "Дата занятия" },
          { key: "lesson_id", label: "ID занятия" },
          { key: "student_name", label: "ФИО студента" },
          { key: "status", label: "Статус" },
          { key: "comment", label: "Комментарий" },
        ];
        const csv = "\ufeff" + buildCsv(dataRows, headers);
        downloadTextFile(filename, csv, "text/csv;charset=utf-8");
      } else {
        const json = JSON.stringify(dataRows, null, 2);
        downloadTextFile(filename, json, "application/json;charset=utf-8");
      }

      message.success("Файл скачан");
    } catch {
      message.error("Не удалось скачать файл");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    form.setFieldsValue({ export_type: "csv" });
    setRows(null);
    setCount(null);
    setLastBuildKey(null);
    setLastFilename(null);
    message.info("Фильтры сброшены");
  };

  const previewStats = useMemo(() => {
    if (!rows) return null;
    const uniqueStudents = new Set(rows.map((r) => r.student_name).filter((x) => String(x ?? "").trim().length > 0)).size;
    const uniqueLessons = new Set(rows.map((r) => String(r.lesson_id ?? "")).filter((x) => x.length > 0)).size;
    return { uniqueStudents, uniqueLessons };
  }, [rows]);

  const previewColumns = useMemo(() => {
    const cols: ColumnsType<ExportRow> = [
      {
        title: "Курс",
        dataIndex: "course_name",
        key: "course_name",
        ellipsis: true,
        render: (v: string) => (v ? v : <Text type="secondary">—</Text>),
      },
      {
        title: "Дата",
        dataIndex: "lesson_date",
        key: "lesson_date",
        width: 130,
        className: "mono",
        render: (v: string) => (v ? new Date(v).toLocaleDateString() : "—"),
      },
      {
        title: "ID занятия",
        dataIndex: "lesson_id",
        key: "lesson_id",
        width: 110,
        className: "mono",
        render: (v: any) => (v !== null && v !== undefined && String(v).length > 0 ? String(v) : "—"),
      },
      {
        title: "Студент",
        dataIndex: "student_name",
        key: "student_name",
        ellipsis: true,
        render: (v: string) => (v ? v : <Text type="secondary">—</Text>),
      },
      {
        title: "Статус",
        dataIndex: "status",
        key: "status",
        width: 170,
        render: (v: string) => {
          const key = String(v ?? "");
          const label = statusLabel[key] ?? key ?? "—";
          const color = statusColor[key] ?? "default";
          return (
            <Tag className="pill-tag" color={color}>
              {label || "—"}
            </Tag>
          );
        },
      },
      {
        title: "Комментарий",
        dataIndex: "comment",
        key: "comment",
        ellipsis: true,
        render: (v: string) => {
          const s = String(v ?? "").trim();
          return s ? (
            <Text type="secondary" ellipsis={{ tooltip: s }}>
              {s}
            </Text>
          ) : (
            <Text type="secondary">—</Text>
          );
        },
      },
    ];
    return cols;
  }, []);

  const selectedCourseLabel = useMemo(() => {
    const id = form.getFieldValue("course_id");
    if (typeof id !== "number") return null;
    return courseNameById.get(id) ?? `ID ${id}`;
  }, [courseNameById, courseId]);

  const selectedStudentLabel = useMemo(() => {
    const id = form.getFieldValue("student_id");
    if (typeof id !== "number") return null;
    const opt = students.find((s) => s.value === id);
    return opt?.label ?? `ID ${id}`;
  }, [students, courseId, form]);

  return (
    <div className="page-wrap">
      <div className="page-head">
        <div className="page-head-left">
          <Title level={2} style={{ margin: 0 }}>
            Экспорт посещаемости
          </Title>
        </div>

        <div className="page-head-actions">
          <Button icon={<ReloadOutlined />} onClick={() => void loadCourses()} loading={coursesLoading}>
            Обновить курсы
          </Button>
          <Button icon={<ClearOutlined />} onClick={handleReset} disabled={loading}>
            Сбросить
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={() => void handleDownload()} loading={loading}>
            Скачать
          </Button>
        </div>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={10}>
          <Card className="card-surface" bordered={false}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  Фильтры
                </Title>
                <Text type="secondary">Чем точнее фильтры — тем чище выгрузка.</Text>
              </div>

              <Form<ExportFormValues>
                form={form}
                layout="vertical"
                onFinish={() => void handleBuild()}
                initialValues={{ export_type: "csv" }}
                disabled={loading}
              >
                <Form.Item label="Курс" name="course_id">
                  <Select
                    placeholder="Выберите курс"
                    allowClear
                    loading={coursesLoading}
                    options={courseOptions}
                    showSearch
                    optionFilterProp="label"
                  />
                </Form.Item>

                <Form.Item label="ID занятия" name="lesson_id">
                  <InputNumber style={{ width: "100%" }} min={1} placeholder="Например: 12" />
                </Form.Item>

                <Form.Item label="ФИО студента" name="student_id">
                  <Select
                    placeholder="Выберите студента"
                    allowClear
                    loading={studentsLoading}
                    options={students}
                    showSearch
                    optionFilterProp="label"
                  />
                </Form.Item>

                <Form.Item label="Диапазон дат" name="range">
                  <RangePicker style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item
                  label="Тип данных"
                  name="export_type"
                  rules={[{ required: true, message: "Выберите тип данных" }]}
                >
                  <Select
                    options={[
                      { value: "csv", label: "CSV" },
                      { value: "json", label: "JSON" },
                    ]}
                  />
                </Form.Item>

                <Space style={{ width: "100%", justifyContent: "space-between" }}>
                  <Button onClick={handleReset} disabled={loading}>
                    Очистить
                  </Button>
                  <Space>
                    <Button onClick={() => void handleBuild()} loading={loading}>
                      Сформировать
                    </Button>
                    <Button type="primary" onClick={() => void handleDownload()} loading={loading} icon={<DownloadOutlined />}>
                      Скачать
                    </Button>
                  </Space>
                </Space>
              </Form>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card className="card-surface" bordered={false} bodyStyle={{ padding: 0 }}>
            <div className="table-toolbar">
              <div className="table-toolbar-left">
                <Title level={4} style={{ margin: 0 }}>
                  Результат
                </Title>
              </div>
              <div className="table-toolbar-right">
                <Space size={8}>
                  {selectedCourseLabel && <Tag className="pill-tag" color="geekblue">{selectedCourseLabel}</Tag>}
                  {selectedStudentLabel && <Tag className="pill-tag" color="purple">{selectedStudentLabel}</Tag>}
                  {lastFilename && <Tag className="pill-tag">{lastFilename}</Tag>}
                </Space>
              </div>
            </div>

            <div className="stats">
              <div className="stat-item">
                <div className="stat-label">Найдено записей</div>
                <div className="stat-value">{count !== null ? count : "—"}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Уник. студентов</div>
                <div className="stat-value">{previewStats ? previewStats.uniqueStudents : "—"}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Уник. занятий</div>
                <div className="stat-value">{previewStats ? previewStats.uniqueLessons : "—"}</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Превью</div>
                <div className="stat-value">{rows ? `${Math.min(rows.length, 8)} строк` : "—"}</div>
              </div>
            </div>

            {rows ? (
              <Table<ExportRow>
                className="data-table"
                rowKey={(_, idx) => String(idx)}
                dataSource={rows.slice(0, 8)}
                columns={previewColumns}
                pagination={false}
                tableLayout="fixed"
                rowClassName={(_, index) => (index % 2 === 1 ? "row-zebra" : "")}
                locale={{ emptyText: "Нет данных" }}
              />
            ) : (
              <div style={{ padding: 24 }}>
                <Empty description="Нажмите «Сформировать», чтобы увидеть превью" />
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
