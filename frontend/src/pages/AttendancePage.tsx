import { useEffect, useState } from "react";
import { DatePicker, Select, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { type AttendanceRecord, type AttendanceStatus, getAttendance } from "../api/attendance";

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface AttendanceRow extends AttendanceRecord {
  student_name?: string;
  course_name?: string;
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

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAttendance();
        setRecords(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const columns: ColumnsType<AttendanceRow> = [
    {
      title: "Студент",
      dataIndex: "student_name",
      key: "student_name",
      render: (value: string | undefined, record) =>
        value ?? `ID ${record.student_id}`,
    },
    {
      title: "ID занятия",
      dataIndex: "lesson_id",
      key: "lesson_id",
    },
    {
      title: "Статус",
      dataIndex: "status",
      key: "status",
      render: (value: AttendanceStatus) => (
        <Tag color={statusColor[value]}>{statusLabel[value]}</Tag>
      ),
    },
    {
      title: "Комментарий",
      dataIndex: "comment",
      key: "comment",
      render: (value: string | null | undefined) => value || "—",
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space
        direction="vertical"
        size="large"
        style={{ width: "100%" }}
      >
        <Title level={3} style={{ color: "#e5e7eb", margin: 0 }}>
          Посещаемость
        </Title>

        <Space wrap>
          <RangePicker />
          <Select
            placeholder="Курс"
            style={{ width: 200 }}
            options={[]}
          />
          <Select
            placeholder="Студент"
            style={{ width: 200 }}
            options={[]}
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
