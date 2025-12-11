// import { useEffect, useState } from "react";
// import { DatePicker, Select, Space, Table, Tag, Typography } from "antd";
// import type { ColumnsType } from "antd/es/table";
// import { type AttendanceRecord, type AttendanceStatus, getAttendance } from "../api/attendance";

// const { Title } = Typography;
// const { RangePicker } = DatePicker;

// interface AttendanceRow extends AttendanceRecord {
//   student_name?: string;
//   course_name?: string;
// }

// const statusColor: Record<AttendanceStatus, string> = {
//   present: "green",
//   absent: "red",
//   late: "orange",
//   excused: "blue",
// };

// const statusLabel: Record<AttendanceStatus, string> = {
//   present: "Присутствовал",
//   absent: "Отсутствовал",
//   late: "Опоздал",
//   excused: "Уважительная причина",
// };

// export default function AttendancePage() {
//   const [records, setRecords] = useState<AttendanceRow[]>([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       try {
//         const data = await getAttendance();
//         setRecords(data);
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, []);

//   const columns: ColumnsType<AttendanceRow> = [
//     {
//       title: "Студент",
//       dataIndex: "student_name",
//       key: "student_name",
//       render: (value: string | undefined, record) =>
//         value ?? `ID ${record.student_id}`,
//     },
//     {
//       title: "ID занятия",
//       dataIndex: "lesson_id",
//       key: "lesson_id",
//     },
//     {
//       title: "Статус",
//       dataIndex: "status",
//       key: "status",
//       render: (value: AttendanceStatus) => (
//         <Tag color={statusColor[value]}>{statusLabel[value]}</Tag>
//       ),
//     },
//     {
//       title: "Комментарий",
//       dataIndex: "comment",
//       key: "comment",
//       render: (value: string | null | undefined) => value || "—",
//     },
//   ];

//   return (
//     <div style={{ padding: 24 }}>
//       <Space
//         direction="vertical"
//         size="large"
//         style={{ width: "100%" }}
//       >
//         <Title level={3} style={{ color: "#e5e7eb", margin: 0 }}>
//           Посещаемость
//         </Title>

//         <Space wrap>
//           <RangePicker />
//           <Select
//             placeholder="Курс"
//             style={{ width: 200 }}
//             options={[]}
//           />
//           <Select
//             placeholder="Студент"
//             style={{ width: 200 }}
//             options={[]}
//           />
//         </Space>

//         <Table<AttendanceRow>
//           rowKey="id"
//           dataSource={records}
//           columns={columns}
//           loading={loading}
//           pagination={{ pageSize: 20 }}
//         />
//       </Space>
//     </div>
//   );
// }

import { useEffect, useState } from "react";
import {
  Button,
  DatePicker,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { Dayjs } from "dayjs";
import { EditOutlined } from "@ant-design/icons";

import {
  type AttendanceRecord,
  type AttendanceStatus,
  getAttendance,
  updateAttendance,
} from "../api/attendance";
import { getCourses } from "../api/courses";

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface AttendanceRow extends AttendanceRecord {
  // просто уточняем, что эти поля могут прийти
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
  const [courseOptions, setCourseOptions] = useState<
    { value: number; label: string }[]
  >([]);
  const [studentOptions, setStudentOptions] = useState<
    { value: number; label: string }[]
  >([]);

  // Загрузка курсов для фильтра
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
      } catch (error) {
        console.error(error);
        message.error("Не удалось загрузить список курсов");
      }
    };

    void loadCourses();
  }, []);

  // Загрузка посещаемости с учетом фильтров
  const loadAttendance = async (nextFilters: FiltersState = filters) => {
    setLoading(true);
    try {
      const data = await getAttendance(nextFilters);
      setRecords(data);

      // Студенты для дропдауна "Студент"
      const studentsMap = new Map<number, string>();
      data.forEach((rec) => {
        const label =
          rec.student_name ||
          // запасной вариант, если вдруг поле иначе называется
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
    } catch (error) {
      console.error(error);
      message.error("Не удалось загрузить посещаемость");
    } finally {
      setLoading(false);
    }
  };

  // первый запрос
  useEffect(() => {
    void loadAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- обработчики фильтров ----

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
    const next: FiltersState = {
      ...filters,
      course_id: value ?? undefined,
    };
    setFilters(next);
    void loadAttendance(next);
  };

  const handleStudentChange = (value: number | null) => {
    const next: FiltersState = {
      ...filters,
      student_id: value ?? undefined,
    };
    setFilters(next);
    void loadAttendance(next);
  };

  // ---- переключение статуса по клику ----

  const toggleStatusValue = (status: AttendanceStatus): AttendanceStatus => {
    // минимально: present <-> absent, остальные в present
    if (status === "present") return "absent";
    if (status === "absent") return "present";
    return "present";
  };

  const handleToggleStatus = async (record: AttendanceRow) => {
    const newStatus = toggleStatusValue(record.status);
    try {
      const updated = await updateAttendance(record.id, {
        status: newStatus,
      });
      setRecords((prev) =>
        prev.map((r) =>
          r.id === record.id ? { ...r, ...updated } : r,
        ),
      );
    } catch (error) {
      console.error(error);
      message.error("Не удалось обновить статус");
    }
  };

  const columns: ColumnsType<AttendanceRow> = [
    {
      title: "Студент",
      dataIndex: "student_name",
      key: "student_name",
      render: (_value, record) =>
        record.student_name || `ID ${record.student_id}`,
    },
    {
      title: "ID занятия",
      dataIndex: "lesson_id",
      key: "lesson_id",
    },
    {
      title: "Курс",
      dataIndex: "course_name",
      key: "course_name",
      render: (value: string | null | undefined) => value || "—",
    },
    {
      title: "Дата",
      dataIndex: "lesson_date",
      key: "lesson_date",
      render: (value: string | null | undefined) =>
        value ? new Date(value).toLocaleDateString() : "—",
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (_value, record) => (
        <Tag
          color={statusColor[record.status]}
          onClick={() => handleToggleStatus(record)}
          style={{ cursor: "pointer" }}
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
          type="link"
          icon={<EditOutlined />}
          // пока заглушка, дальше можно сюда повесить модалку редактирования
          onClick={() => message.info("Редактирование настроим позже")}
        />
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Title level={3} style={{ color: "#e5e7eb", margin: 0 }}>
          Посещаемость
        </Title>

        <Space wrap>
          <RangePicker onChange={handleDateChange} />
          <Select
            placeholder="Курс"
            allowClear
            style={{ width: 200 }}
            options={courseOptions}
            value={filters.course_id}
            onChange={(value) => handleCourseChange(value as number | null)}
          />
          <Select
            placeholder="Студент"
            allowClear
            style={{ width: 240 }}
            options={studentOptions}
            value={filters.student_id}
            onChange={(value) => handleStudentChange(value as number | null)}
          />
        </Space>

        <Table<AttendanceRow>
          rowKey="id"
          dataSource={records}
          columns={columns}
          loading={loading}
          pagination={{ pageSize: 20 }}
        />
      </Space>
    </div>
  );
}
