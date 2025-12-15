import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { login, type LoginRequest } from "../api/auth";
import { useAuth } from "../context/AuthContext";

interface LoginFormValues {
  email: string;
  password: string;
}

const { Title, Text } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async (values: LoginFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const payload: LoginRequest = {
        email: values.email.trim(),
        password: values.password,
      };

      await login(payload);
      await refresh();
      navigate("/courses");
    } catch {
      setError("Неверный email или пароль");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card" bordered={false} style={{ width: "100%", maxWidth: 520 }}>
        <div className="auth-card-header">
          <Title level={2}>Вход</Title>
          <Text>Введите данные для доступа к системе</Text>
        </div>

        {error && (
          <Alert type="error" message={error} showIcon style={{ marginTop: 16 }} />
        )}

        <Form<LoginFormValues>
          layout="vertical"
          onFinish={handleFinish}
          style={{ marginTop: 18 }}
          disabled={loading}
          requiredMark={false}
        >
          <Form.Item
            label="Почта"
            name="email"
            rules={[
              { required: true, message: "Введите почту" },
              { type: "email", message: "Введите корректный email" },
            ]}
          >
            <Input size="large" placeholder="admin@example.com" autoComplete="email" />
          </Form.Item>

          <Form.Item
            label="Пароль"
            name="password"
            rules={[{ required: true, message: "Введите пароль" }]}
          >
            <Input.Password
              size="large"
              placeholder="Введите пароль"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 18, marginBottom: 8 }}>
            <Button
              className="auth-submit"
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

        <div className="auth-footer">
          <div>
            <Text>Нет аккаунта? </Text>
            <Link to="/register">Зарегистрироваться</Link>
          </div>
          <Text type="secondary">Забыли пароль? Функция пока не реализована</Text>
        </div>
      </Card>
    </div>
  );
}
