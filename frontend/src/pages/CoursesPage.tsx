// import { useEffect, useState } from "react";
// import { Button, Space, Table, Tag, Typography } from "antd";
// import type { ColumnsType } from "antd/es/table";
// import { type Course, getCourses } from "../api/courses";

// const { Title } = Typography;

// export default function CoursesPage() {
//   const [courses, setCourses] = useState<Course[]>([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       try {
//         const data = await getCourses();
//         setCourses(data);
//       } finally {
//         setLoading(false);
//       }
//     };
//     load();
//   }, []);

//   const columns: ColumnsType<Course> = [
//     {
//       title: "Название курса",
//       dataIndex: "name",
//       key: "name",
//     },
//     {
//       title: "Дата начала",
//       dataIndex: "start_date",
//       key: "start_date",
//       render: (value: string | null) =>
//         value ? new Date(value).toLocaleDateString() : "—",
//     },
//     {
//       title: "Дата окончания",
//       dataIndex: "end_date",
//       key: "end_date",
//       render: (value: string | null) =>
//         value ? new Date(value).toLocaleDateString() : "—",
//     },
//     {
//       title: "Статус",
//       dataIndex: "is_active",
//       key: "is_active",
//       render: (value: boolean) =>
//         value ? (
//           <Tag color="green">Активный</Tag>
//         ) : (
//           <Tag color="red">Неактивный</Tag>
//         ),
//     },
//     {
//       title: "Действия",
//       key: "actions",
//       render: () => (
//         <Space>
//           <Button type="link">Подробнее</Button>
//           <Button type="link">Редактировать</Button>
//         </Space>
//       ),
//     },
//   ];

//   return (
//     <div style={{ padding: 24 }}>
//       <Space
//         style={{ marginBottom: 16, width: "100%", justifyContent: "space-between" }}
//       >
//         <Title level={3} style={{ color: "#e5e7eb", margin: 0 }}>
//           Курсы
//         </Title>
//         <Button type="primary">Добавить курс</Button>
//       </Space>

//       <Table<Course>
//         rowKey="id"
//         dataSource={courses}
//         columns={columns}
//         loading={loading}
//         pagination={{ pageSize: 10 }}
//       />
//     </div>
//   );
// }

// frontend/src/pages/CoursesPage.tsx

import { useEffect, useState } from "react";
import { Button, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useNavigate } from "react-router-dom";
import { type Course, getCourses } from "../api/courses";

const { Title } = Typography;

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getCourses();
        setCourses(data);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const columns: ColumnsType<Course> = [
    {
      title: "Название курса",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Дата начала",
      dataIndex: "start_date",
      key: "start_date",
      render: (value: string | null) =>
        value ? new Date(value).toLocaleDateString() : "—",
    },
    {
      title: "Дата окончания",
      dataIndex: "end_date",
      key: "end_date",
      render: (value: string | null) =>
        value ? new Date(value).toLocaleDateString() : "—",
    },
    {
      title: "Статус",
      dataIndex: "is_active",
      key: "is_active",
      render: (value: boolean) =>
        value ? (
          <Tag color="green">Активный</Tag>
        ) : (
          <Tag color="red">Неактивный</Tag>
        ),
    },
    {
      title: "Действия",
      key: "actions",
      render: (_: unknown, record: Course) => (
        <Space>
          <Button
            type="link"
            onClick={() => navigate(`/courses/${record.id}`)}
          >
            Подробнее
          </Button>
          <Button
            type="link"
            onClick={() => navigate(`/courses/${record.id}/edit`)}
          >
            Редактировать
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Space
        style={{ marginBottom: 16, width: "100%", justifyContent: "space-between" }}
      >
        <Title level={3} style={{ color: "#e5e7eb", margin: 0 }}>
          Курсы
        </Title>
        <Button type="primary" onClick={() => navigate("/courses/new")}>
          Добавить курс
        </Button>
      </Space>

      <Table<Course>
        rowKey="id"
        dataSource={courses}
        columns={columns}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}
