import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Form,
  Input,
  InputNumber,
  Space,
  Switch,
  Typography,
  message,
} from "antd";
import { createCourse, type CourseCreatePayload } from "../api/courses";
import { useAuth } from "../context/AuthContext";

const { Title } = Typography;

export default function CourseCreatePage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm<CourseCreatePayload>();

  const { role } = useAuth();
  const canCreate = role === "admin" || role === "teacher";

  useEffect(() => {
    if (role && !canCreate) {
      message.error("У вас нет прав для создания курса");
      navigate("/courses");
    }
  }, [role, canCreate, navigate]);

  const onFinish = async (values: CourseCreatePayload) => {
    setSubmitting(true);
    try {
      const course = await createCourse(values);
      message.success("Курс создан");
      navigate(`/courses/${course.id}`);
    } catch (e) {
      message.error("Ошибка при создании курса");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space
        style={{ marginBottom: 16, width: "100%", justifyContent: "space-between" }}
      >
        <Title level={3} style={{ color: "#e5e7eb", margin: 0 }}>
          Добавить курс
        </Title>
        <Button onClick={() => navigate("/courses")}>К списку курсов</Button>
      </Space>

      <Form<CourseCreatePayload>
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ is_active: true }}
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
            Создать
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
