import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Space,
  Spin,
  Switch,
  Typography,
  message,
} from "antd";
import { getCourse, updateCourse, type Course } from "../api/courses";

const { Title } = Typography;

interface CourseFormValues {
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  teacher_id?: number;
}

export default function CourseEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<CourseFormValues>();

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getCourse(Number(id));
        setCourse(data);
        form.setFieldsValue({
          name: data.name,
          description: data.description ?? undefined,
          start_date: data.start_date ?? undefined,
          end_date: data.end_date ?? undefined,
          is_active: data.is_active,
          teacher_id: data.teacher_id ?? undefined,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, form]);

  const onFinish = async (values: CourseFormValues) => {
    if (!id) return;
    setSubmitting(true);
    try {
      await updateCourse(Number(id), values);
      message.success("Курс обновлён");
      navigate(`/courses/${id}`);
    } catch (e) {
      message.error("Ошибка при обновлении курса");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !course) {
    return (
      <div style={{ padding: 24 }}>
        <Spin />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Space
        style={{ marginBottom: 16, width: "100%", justifyContent: "space-between" }}
      >
        <Title level={3} style={{ color: "#e5e7eb", margin: 0 }}>
          Редактировать курс: {course.name}
        </Title>
        <Button onClick={() => navigate(`/courses/${course.id}`)}>
          Отмена
        </Button>
      </Space>

      <Form<CourseFormValues>
        form={form}
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          label="Название"
          name="name"
          rules={[{ required: true, message: "Введите название курса" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item label="Описание" name="description">
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item label="Дата начала" name="start_date">
          <Input type="date" />
        </Form.Item>

        <Form.Item label="Дата окончания" name="end_date">
          <Input type="date" />
        </Form.Item>

        <Form.Item
          label="Активный"
          name="is_active"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item label="ID учителя" name="teacher_id">
          <InputNumber style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={submitting}
          >
            Сохранить
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
