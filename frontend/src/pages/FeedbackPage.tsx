import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Rate,
  Select,
  Space,
  Switch,
  Typography,
  message,
} from "antd";
import type { Feedback, FeedbackCreate } from "../api/feedback";
import { createFeedbackItem, getFeedback } from "../api/feedback";
import type { Course } from "../api/courses";
import { getCourses } from "../api/courses";
import type { Lesson } from "../api/lessons";
import { getLessons } from "../api/lessons";

const { Title, Text } = Typography;

interface CourseOption {
  value: number;
  label: string;
}

interface LessonOption {
  value: number;
  label: string;
}

export default function FeedbackPage() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [includeHidden, setIncludeHidden] = useState(false);

  const [createVisible, setCreateVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  const [lessonOptions, setLessonOptions] = useState<LessonOption[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | undefined>();
  const [form] = Form.useForm<FeedbackCreate & { student_id_input: number }>();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getFeedback({ include_hidden: includeHidden });
        setItems(data);
      } catch (error) {
        message.error("Не удалось загрузить фидбэк");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [includeHidden]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data: Course[] = await getCourses({ is_active: true });
        const options = data.map((c) => ({
          value: c.id,
          label: c.name,
        }));
        setCourseOptions(options);
      } catch (error) {
        message.error("Не удалось загрузить список курсов");
      }
    };
    loadCourses();
  }, []);

  const loadLessonsForCourse = async (courseId: number) => {
    try {
      const data: Lesson[] = await getLessons({ course_id: courseId });
      const options = data.map((l) => ({
        value: l.id,
        label: `${l.topic || "Урок"} — ${l.date ?? ""}`,
      }));
      setLessonOptions(options);
    } catch (error) {
      message.error("Не удалось загрузить список уроков");
    }
  };

  const handleOpenCreate = () => {
    setCreateVisible(true);
    form.resetFields();
    setSelectedCourseId(undefined);
    setLessonOptions([]);
  };

  const handleCourseChange = (courseId: number) => {
    setSelectedCourseId(courseId);
    form.setFieldsValue({ lesson_id: undefined as unknown as number });
    loadLessonsForCourse(courseId);
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      const payload: FeedbackCreate = {
        lesson_id: values.lesson_id,
        student_id: values.student_id,
        rating: values.rating,
        comment: values.comment,
        is_hidden: values.is_hidden ?? false,
      };
      setCreating(true);
      const created = await createFeedbackItem(payload);
      setItems((prev) => [created, ...prev]);
      setCreateVisible(false);
      message.success("Фидбэк создан");
    } catch (error) {
      if (error instanceof Error) {
        message.error("Не удалось создать фидбэк");
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <Space style={{ width: "100%", justifyContent: "space-between" }}>
          <Title level={3} style={{ color: "#e5e7eb", margin: 0 }}>
            Фидбэк студентов
          </Title>
          <Space>
            <Button type="primary" onClick={handleOpenCreate}>
              Создать
            </Button>
            <Text style={{ color: "#e5e7eb" }}>Показывать скрытые</Text>
            <Switch checked={includeHidden} onChange={setIncludeHidden} />
          </Space>
        </Space>

        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          {items.map((item) => (
            <Card
              key={item.id}
              loading={loading}
              style={{
                background: "#020617",
                borderRadius: 12,
                border: "1px solid #1f2937",
              }}
            >
              <Space
                direction="vertical"
                size="small"
                style={{ width: "100%" }}
              >
                <Space
                  style={{
                    width: "100%",
                    justifyContent: "space-between",
                  }}
                >
                  <Text style={{ color: "#e5e7eb", fontWeight: 600 }}>
                    {item.student_name
                      ? item.student_name
                      : `Студент ID ${item.student_id}`}
                  </Text>
                  <Rate disabled allowHalf defaultValue={item.rating} />
                </Space>

                <Text style={{ color: "#9ca3af" }}>
                  {item.comment || "Без комментария"}
                </Text>

                <Text style={{ color: "#9ca3af", fontSize: 12 }}>
                  Курс: {item.course_name || "—"}
                </Text>
                <Text style={{ color: "#9ca3af", fontSize: 12 }}>
                  Урок: {item.lesson_topic || "—"}
                </Text>

                <Text style={{ color: "#6b7280", fontSize: 12 }}>
                  Дата:{" "}
                  {new Date(
                    item.lesson_date || item.created_at
                  ).toLocaleDateString()}
                </Text>
              </Space>
            </Card>
          ))}
          {items.length === 0 && !loading && (
            <Text style={{ color: "#9ca3af" }}>Пока нет отзывов</Text>
          )}
        </Space>
      </Space>

      <Modal
        open={createVisible}
        title="Создать фидбэк"
        okText="Сохранить"
        cancelText="Отмена"
        onOk={handleCreate}
        onCancel={() => setCreateVisible(false)}
        confirmLoading={creating}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{ rating: 5, is_hidden: false }}
        >
          <Form.Item
            label="Студент ID"
            name="student_id"
            rules={[{ required: true, message: "Укажите ID студента" }]}
          >
            <InputNumber style={{ width: "100%" }} min={1} />
          </Form.Item>

          <Form.Item
            label="Курс"
            name="course_id"
            rules={[{ required: true, message: "Выберите курс" }]}
          >
            <Select
              placeholder="Выберите курс"
              options={courseOptions}
              onChange={handleCourseChange}
              value={selectedCourseId}
            />
          </Form.Item>

          <Form.Item
            label="Урок"
            name="lesson_id"
            rules={[{ required: true, message: "Выберите урок" }]}
          >
            <Select
              placeholder="Выберите урок"
              options={lessonOptions}
              disabled={!selectedCourseId}
            />
          </Form.Item>

          <Form.Item
            label="Оценка"
            name="rating"
            rules={[{ required: true, message: "Укажите оценку" }]}
          >
            <Rate allowHalf />
          </Form.Item>

          <Form.Item label="Комментарий" name="comment">
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item label="Скрытый" name="is_hidden" valuePropName="checked">
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
