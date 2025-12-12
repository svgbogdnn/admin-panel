import { useEffect, useMemo, useState } from "react";
import { Button, DatePicker, Form, InputNumber, Select, Space, Typography, message } from "antd";
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

export default function ExportPage() {
  const [form] = Form.useForm<ExportFormValues>();
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState<number | null>(null);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [students, setStudents] = useState<SelectOption[]>([]);
  const [lastRecords, setLastRecords] = useState<AttendanceRecord[] | null>(null);

  const courseId = Form.useWatch("course_id", form);

  const courseNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of courses) map.set(c.id, c.name);
    return map;
  }, [courses]);

  const loadCourses = async () => {
    setCoursesLoading(true);
    try {
      const data = await getCourses();
      setCourses(data);
    } catch {
      message.error("Не удалось загрузить курсы");
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
    loadCourses();
    form.setFieldsValue({ export_type: "csv" });
  }, []);

  useEffect(() => {
    form.setFieldValue("student_id", undefined);
    const id = typeof courseId === "number" ? courseId : undefined;
    loadStudentsFromAttendance(id);
  }, [courseId]);

  const handleFinish = async (values: ExportFormValues) => {
    setLoading(true);
    try {
      const from_date = values.range && values.range[0] ? values.range[0].format("YYYY-MM-DD") : undefined;
      const to_date = values.range && values.range[1] ? values.range[1].format("YYYY-MM-DD") : undefined;

      const records = await getAttendance({
        course_id: values.course_id,
        lesson_id: values.lesson_id,
        student_id: values.student_id,
        from_date,
        to_date,
      });

      setLastRecords(records);
      setCount(records.length);

      const rows = records.map((r) => ({
        course_name: r.course_name ?? (values.course_id ? courseNameById.get(values.course_id) ?? "" : ""),
        lesson_date: r.lesson_date ?? "",
        lesson_id: r.lesson_id ?? "",
        student_name: r.student_name ?? "",
        status: r.status ?? "",
        comment: r.comment ?? "",
      }));

      const stamp = dayjs().format("YYYYMMDD_HHmmss");

      if (values.export_type === "csv") {
        const headers = [
          { key: "course_name", label: "Курс" },
          { key: "lesson_date", label: "Дата занятия" },
          { key: "lesson_id", label: "ID занятия" },
          { key: "student_name", label: "ФИО студента" },
          { key: "status", label: "Статус" },
          { key: "comment", label: "Комментарий" },
        ];
        const csv = "\ufeff" + buildCsv(rows, headers);
        downloadTextFile(`attendance_export_${stamp}.csv`, csv, "text/csv;charset=utf-8");
      } else {
        const json = JSON.stringify(rows, null, 2);
        downloadTextFile(`attendance_export_${stamp}.json`, json, "application/json;charset=utf-8");
      }
    } catch {
      message.error("Не удалось выгрузить посещаемость");
      setLastRecords(null);
      setCount(null);
    } finally {
      setLoading(false);
    }
  };

  const courseOptions = useMemo(() => courses.map((c) => ({ value: c.id, label: c.name })), [courses]);

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={3} style={{ color: "#e5e7eb", margin: 0 }}>
          Экспорт посещаемости
        </Title>

        <Form<ExportFormValues> form={form} layout="vertical" onFinish={handleFinish} initialValues={{ export_type: "csv" }}>
          <Form.Item label={<span style={{ color: "#e5e7eb" }}>Курс</span>} name="course_id">
            <Select
              placeholder="Выберите курс"
              allowClear
              loading={coursesLoading}
              options={courseOptions}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item label={<span style={{ color: "#e5e7eb" }}>ID занятия</span>} name="lesson_id">
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>

          <Form.Item label={<span style={{ color: "#e5e7eb" }}>ФИО студента</span>} name="student_id">
            <Select
              placeholder="Выберите студента"
              allowClear
              loading={studentsLoading}
              options={students}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item label={<span style={{ color: "#e5e7eb" }}>Диапазон дат</span>} name="range">
            <RangePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label={<span style={{ color: "#e5e7eb" }}>Тип данных</span>}
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

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Скачать
            </Button>
          </Form.Item>
        </Form>

        {count !== null && <Text style={{ color: "#e5e7eb" }}>Найдено записей: {count}</Text>}

        {lastRecords && lastRecords.length === 0 && (
          <Text style={{ color: "#e5e7eb" }}>По выбранным фильтрам нет данных</Text>
        )}
      </Space>
    </div>
  );
}
