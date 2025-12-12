import { useEffect, useState } from "react";
import {
  Button,
  DatePicker,
  Select,
  Space,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";  

import { exportAttendance } from "../api/export";
import type { ExportFormat, ExportParams } from "../api/export";
import { getCourses } from "../api/courses";
import { getUsers } from "../api/users";

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface Option {
  value: number;
  label: string;
}

export default function ExportPage() {
  const [courses, setCourses] = useState<Option[]>([]);
  const [students, setStudents] = useState<Option[]>([]);
  const [filters, setFilters] = useState<Omit<ExportParams, "response_format"> & { response_format: ExportFormat }>({
    course_id: undefined,
    student_id: undefined,
    from_date: undefined,
    to_date: undefined,
    response_format: "csv",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [coursesData, usersData] = await Promise.all([
          getCourses(),
          getUsers()
        ]);

        setCourses(
          coursesData.map((c) => ({
            value: c.id,
            label: c.name,
          }))
        );

        setStudents(
          usersData.map((u) => ({
            value: u.id,
            label: u.full_name || u.email,
          }))
        );
      } catch {
        message.error("Не удалось загрузить данные");
      }
    };
    loadData();
  }, []);

  const handleExport = async () => {
    try {
      // Clean up undefined values and format payload
      const payload: ExportParams = {
        response_format: filters.response_format,
        ...(filters.course_id && { course_id: filters.course_id }),
        ...(filters.student_id && { student_id: filters.student_id }),
        ...(filters.from_date && { from_date: filters.from_date }),
        ...(filters.to_date && { to_date: filters.to_date }),
      };

      const blob = await exportAttendance(payload);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download =
        filters.response_format === "csv"
          ? "attendance.csv"
          : "attendance.json";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      message.error("Ошибка при экспорте");
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title>Экспорт посещаемости</Title>

        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          <RangePicker
            onChange={(_, dateStrings) => {
              setFilters((prev) => ({
                ...prev,
                from_date: dateStrings[0] || undefined,
                to_date: dateStrings[1] || undefined,
              }));
            }}
          />

          <Select
            placeholder="Курс"
            options={courses}
            allowClear
            style={{ width: 200 }}
            onChange={(value) => {
              setFilters((prev) => ({
                ...prev,
                course_id: value,
              }));
            }}
          />

          <Select
            placeholder="Студент"
            options={students}
            allowClear
            style={{ width: 200 }}
            onChange={(value) => {
              setFilters((prev) => ({
                ...prev,
                student_id: value,
              }));
            }}
          />

          <Select
            placeholder="Тип Данных"
            defaultValue="csv"
            options={[
              { value: "csv", label: "CSV" },
              { value: "json", label: "JSON" },
            ]}
            style={{ width: 120 }}
            onChange={(value: ExportFormat) => {
              setFilters((prev) => ({
                ...prev,
                response_format: value,
              }));
            }}
          />

          <Button type="primary" onClick={handleExport}>
            Скачать
          </Button>
        </Space>
      </Space>
    </div>
  );
}
