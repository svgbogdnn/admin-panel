import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, Descriptions, Space, Spin, Tag, Typography } from "antd";
import { getCourse, type Course } from "../api/courses";

const { Title, Paragraph } = Typography;

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getCourse(Number(id));
        setCourse(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

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
          Курс: {course.name}
        </Title>
        <Space>
          <Button onClick={() => navigate("/courses")}>К списку курсов</Button>
          <Button
            type="primary"
            onClick={() => navigate(`/courses/${course.id}/edit`)}
          >
            Редактировать
          </Button>
        </Space>
      </Space>

      <Card>
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Название">
            {course.name}
          </Descriptions.Item>
          <Descriptions.Item label="Статус">
            {course.is_active ? (
              <Tag color="green">Активный</Tag>
            ) : (
              <Tag color="red">Неактивный</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Дата начала">
            {course.start_date
              ? new Date(course.start_date).toLocaleDateString()
              : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Дата окончания">
            {course.end_date
              ? new Date(course.end_date).toLocaleDateString()
              : "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Учитель (id)">
            {course.teacher_id ?? "—"}
          </Descriptions.Item>
        </Descriptions>

        {course.description && (
          <>
            <Title level={4} style={{ marginTop: 24 }}>
              Описание
            </Title>
            <Paragraph>{course.description}</Paragraph>
          </>
        )}
      </Card>
    </div>
  );
}
