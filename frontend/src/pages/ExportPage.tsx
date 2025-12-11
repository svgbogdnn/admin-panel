import { useState } from "react";
import { Button, DatePicker, Form, InputNumber, Select, Space, Typography } from "antd";
import { getAttendance } from "../api/attendance";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

interface ExportFormValues {
  course_id?: number;
  lesson_id?: number;
  student_id?: number;
  range?: [dayjs.Dayjs, dayjs.Dayjs];
}

export default function ExportPage() {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState<number | null>(null);

  const handleFinish = async (values: ExportFormValues) => {
    setLoading(true);
    try {
      const from_date =
        values.range && values.range[0]
          ? values.range[0].format("YYYY-MM-DD")
          : undefined;
      const to_date =
        values.range && values.range[1]
          ? values.range[1].format("YYYY-MM-DD")
          : undefined;

      const records = await getAttendance({
        course_id: values.course_id,
        lesson_id: values.lesson_id,
        student_id: values.student_id,
        from_date,
        to_date,
      });
      setCount(records.length);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space
        direction="vertical"
        size="large"
        style={{ width: "100%" }}
      >
        <Title level={3} style={{ color: "#e5e7eb", margin: 0 }}>
          Экспорт посещаемости
        </Title>

        <Form<ExportFormValues> layout="vertical" onFinish={handleFinish}>
          <Form.Item label={<span style={{ color: "#e5e7eb" }}>Курс</span>} name="course_id">
            <Select
              placeholder="Выберите курс"
              allowClear
              options={[]}
            />
          </Form.Item>

          <Form.Item label={<span style={{ color: "#e5e7eb" }}>ID занятия</span>} name="lesson_id">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label={<span style={{ color: "#e5e7eb" }}>ID студента</span>} name="student_id">
            <InputNumber style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label={<span style={{ color: "#e5e7eb" }}>Диапазон дат</span>} name="range">
            <RangePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Получить данные
            </Button>
          </Form.Item>
        </Form>

        {count !== null && (
          <Text style={{ color: "#e5e7eb" }}>
            Найдено записей: {count}
          </Text>
        )}
      </Space>
    </div>
  );
}
