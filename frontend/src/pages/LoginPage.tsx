// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { Alert, Button, Card, Form, Input, Typography } from "antd";
// import { login, getCurrentUser, type LoginRequest } from "../api/auth";

// const { Title, Text } = Typography;

// interface LoginFormValues {
//     email: string;
//     password: string;
// }

// export default function LoginPage() {
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState<string | null>(null);
//     const navigate = useNavigate();

//     const handleFinish = async (values: LoginFormValues) => {
//         setError(null);
//         setLoading(true);
//         try {
//             const payload: LoginRequest = {
//                 email: values.email,
//                 password: values.password,
//             };
//             await login(payload);
//             await getCurrentUser();
//             navigate("/courses");
//         } catch (e) {
//             setError("Не удалось войти. Проверьте email и пароль.");
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div
//             style={{
//                 minHeight: "100vh",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 background: "#050816",
//             }}
//         >
//             <Card
//                 style={{
//                     width: 400,
//                     background: "#111827",
//                     borderRadius: 16,
//                     boxShadow: "0 0 40px rgba(56, 189, 248, 0.35)",
//                     border: "1px solid #1f2937",
//                 }}
//             >
//                 <div style={{ textAlign: "center", marginBottom: 24 }}>
//                     <Title level={3} style={{ color: "#22c55e", marginBottom: 8 }}>
//                         Вход
//                     </Title>
//                     <Text style={{ color: "#9ca3af" }}>
//                         Введите данные администратора для входа
//                     </Text>
//                 </div>

//                 {error && (
//                     <Alert
//                         style={{ marginBottom: 16 }}
//                         type="error"
//                         message={error}
//                         showIcon
//                     />
//                 )}

//                 <Form<LoginFormValues> layout="vertical" onFinish={handleFinish}>
//                     <Form.Item
//                         label={<span style={{ color: "#e5e7eb" }}>Почта</span>}
//                         name="email"
//                         rules={[
//                             { required: true, message: "Введите email" },
//                             { type: "email", message: "Неверный формат email" },
//                         ]}
//                     >
//                         <Input
//                             size="large"
//                             placeholder="admin@example.com"
//                             style={{
//                                 backgroundColor: "#020617",
//                                 borderRadius: 8,
//                                 borderColor: "#4b5563",
//                                 color: "#e5e7eb",
//                             }}
//                         />
//                     </Form.Item>

//                     <Form.Item
//                         label={<span style={{ color: "#e5e7eb" }}>Пароль</span>}
//                         name="password"
//                         rules={[{ required: true, message: "Введите пароль" }]}
//                     >
//                         <Input.Password
//                             size="large"
//                             placeholder="••••••••"
//                             style={{
//                                 backgroundColor: "#020617",
//                                 borderRadius: 8,
//                                 borderColor: "#4b5563",
//                                 color: "#e5e7eb",
//                             }}
//                         />
//                     </Form.Item>

//                     <Form.Item style={{ marginTop: 24 }}>
//                         <Button
//                             type="primary"
//                             htmlType="submit"
//                             size="large"
//                             block
//                             loading={loading}
//                             style={{
//                                 background: "linear-gradient(90deg,#22c55e,#4ade80)",
//                                 borderRadius: 999,
//                                 border: "none",
//                                 fontWeight: 600,
//                             }}
//                         >
//                             Войти
//                         </Button>
//                     </Form.Item>
//                 </Form>
//             </Card>
//         </div>
//     );
// }

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { login, type LoginRequest } from "../api/auth";

interface LoginFormValues {
  email: string;
  password: string;
}

const { Title, Text } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async (values: LoginFormValues) => {
    setLoading(true);
    setError(null);
    try {
      const payload: LoginRequest = {
        email: values.email,
        password: values.password,
      };
      await login(payload);
      navigate("/courses");
    } catch {
      setError("Неверный email или пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card" bordered={false}>
        <div className="auth-card-header">
          <Title level={2}>Вход</Title>
          <Text>Введите данные администратора для входа</Text>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form<LoginFormValues>
          layout="vertical"
          onFinish={handleFinish}
          disabled={loading}
        >
          <Form.Item
            label="Почта"
            name="email"
            rules={[
              { required: true, message: "Введите почту" },
              { type: "email", message: "Введите корректный email" },
            ]}
          >
            <Input placeholder="admin@example.com" />
          </Form.Item>

          <Form.Item
            label="Пароль"
            name="password"
            rules={[{ required: true, message: "Введите пароль" }]}
          >
            <Input.Password placeholder="Введите пароль" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
              Войти
            </Button>
          </Form.Item>
        </Form>

        <div className="auth-card-footer">
          <div style={{ marginBottom: 8 }}>
            <Text>Нет аккаунта? </Text>
            <Link to="/register">Зарегистрироваться</Link>
          </div>
          <div>
            <Text type="secondary">
              Забыли пароль? Функция пока не реализована
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
}
