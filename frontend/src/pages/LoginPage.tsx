import type { CSSProperties } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Alert, Button, Card, Divider, Form, Input, Space, Tag, Typography } from "antd";
import { LockOutlined, MailOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { login, type LoginRequest } from "../api/auth";
import { useAuth } from "../context/AuthContext";

interface LoginFormValues {
  email: string;
  password: string;
}

const { Title, Text } = Typography;

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  padding: "40px 16px",
  position: "relative",
  overflow: "hidden",
};

const backdropA: CSSProperties = {
  position: "absolute",
  inset: -220,
  background:
    "radial-gradient(900px 520px at 18% 18%, rgba(34,197,94,0.18), transparent 60%), radial-gradient(900px 520px at 78% 28%, rgba(59,130,246,0.14), transparent 60%), radial-gradient(900px 520px at 60% 88%, rgba(168,85,247,0.12), transparent 60%)",
  filter: "blur(10px)",
  opacity: 0.95,
};

const backdropB: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(180deg, rgba(2,6,14,0.35), rgba(2,6,14,0.72))",
};

const cardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 980,
  borderRadius: 18,
  border: "1px solid rgba(148,163,184,0.14)",
  background: "linear-gradient(180deg, rgba(15,23,42,0.78), rgba(2,6,14,0.64))",
  boxShadow: "0 22px 90px rgba(0,0,0,0.62)",
  position: "relative",
  overflow: "hidden",
};

const topLine: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 2,
  background:
    "linear-gradient(90deg, rgba(34,197,94,0.55), rgba(59,130,246,0.35), rgba(168,85,247,0.25), rgba(148,163,184,0.0))",
  opacity: 0.95,
};

const splitWrap: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
};

const leftPane: CSSProperties = {
  flex: "1 1 360px",
  padding: 26,
  borderRight: "1px solid rgba(148,163,184,0.10)",
  background:
    "radial-gradient(900px 360px at 20% 0%, rgba(34,197,94,0.18), transparent 60%), radial-gradient(900px 360px at 90% 20%, rgba(59,130,246,0.14), transparent 65%)",
};

const rightPane: CSSProperties = {
  flex: "1 1 360px",
  padding: 26,
};

const badgeStyle: CSSProperties = {
  borderRadius: 999,
  border: "1px solid rgba(148,163,184,0.14)",
  background: "rgba(2,6,14,0.35)",
  padding: "4px 10px",
};

const primaryBtnStyle: CSSProperties = {
  height: 46,
  borderRadius: 999,
  fontWeight: 800,
  background:
    "linear-gradient(90deg, rgba(34,197,94,0.92), rgba(16,185,129,0.78), rgba(59,130,246,0.55))",
  border: "1px solid rgba(148,163,184,0.14)",
  boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
};

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
    <div className="auth-page" style={pageStyle}>
      <div style={backdropA} />
      <div style={backdropB} />

      <Card className="auth-card" bordered={false} style={cardStyle} bodyStyle={{ padding: 0 }}>
        <div style={topLine} />

        <div style={splitWrap}>
          <div style={leftPane}>
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 14,
                    display: "grid",
                    placeItems: "center",
                    border: "1px solid rgba(148,163,184,0.14)",
                    background: "linear-gradient(180deg, rgba(34,197,94,0.22), rgba(2,6,14,0.22))",
                    boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
                  }}
                >
                  <SafetyCertificateOutlined />
                </div>
                <div>
                  <Text style={{ letterSpacing: 1, fontWeight: 900 }}>ITAM</Text>
                  <div>
                    <Text type="secondary">Сервис для управления посещаемостью</Text>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: 6 }}>
                <Title level={4} style={{ margin: 0 }}>
                  Добро пожаловать
                </Title>
                <Text type="secondary">
                  Войдите, чтобы управлять курсами, посещаемостью, фидбэком и экспортом в едином интерфейсе.
                </Text>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                <Tag style={badgeStyle} color="blue">
                  Посещаемость
                </Tag>
                <Tag style={badgeStyle} color="purple">
                  Аналитика
                </Tag>
                <Tag style={badgeStyle} color="gold">
                  Курсы
                </Tag>
                <Tag style={badgeStyle} color="cyan">
                  Фидбэк
                </Tag>
                <Tag style={badgeStyle} color="red">
                  Экспорт
                </Tag>
              </div>

              <Divider style={{ borderColor: "rgba(148,163,184,0.10)", margin: "14px 0" }} />

              <Text type="secondary" style={{ lineHeight: 1.6 }}>
                После входа вы попадёте в систему и сможете продолжить работу с данными.
              </Text>
            </Space>
          </div>

          <div style={rightPane}>
            <div className="auth-card-header" style={{ marginBottom: 14 }}>
              <Title level={2} style={{ margin: 0 }}>
                Вход
              </Title>
              <Text type="secondary">Введите данные для доступа к системе</Text>
            </div>

            {error && (
              <Alert
                type="error"
                message={error}
                showIcon
                style={{ marginTop: 12, borderRadius: 12, background: "rgba(239,68,68,0.08)" }}
              />
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
                <Input
                  size="large"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  prefix={<MailOutlined />}
                />
              </Form.Item>

              <Form.Item label="Пароль" name="password" rules={[{ required: true, message: "Введите пароль" }]}>
                <Input.Password
                  size="large"
                  placeholder="Введите пароль"
                  autoComplete="current-password"
                  prefix={<LockOutlined />}
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
                  style={primaryBtnStyle}
                >
                  Войти
                </Button>
              </Form.Item>
            </Form>

            <div className="auth-footer" style={{ marginTop: 12 }}>
              <Text type="secondary">Нет аккаунта? </Text>
              <Link to="/register" style={{ fontWeight: 800 }}>
                Зарегистрироваться
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}