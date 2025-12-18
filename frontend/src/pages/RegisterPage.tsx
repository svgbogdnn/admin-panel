import type { CSSProperties } from "react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button, Card, Checkbox, Divider, Form, Input, Space, Tag, Typography, message } from "antd";
import {
  EyeInvisibleOutlined,
  EyeTwoTone,
  IdcardOutlined,
  LockOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { registerUser } from "../api/auth";

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
  inset: -200,
  background:
    "radial-gradient(900px 520px at 18% 18%, rgba(168,85,247,0.18), transparent 60%), radial-gradient(900px 520px at 78% 28%, rgba(34,197,94,0.14), transparent 60%), radial-gradient(900px 520px at 60% 88%, rgba(59,130,246,0.12), transparent 60%)",
  filter: "blur(10px)",
  opacity: 0.95,
};

const backdropB: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "linear-gradient(180deg, rgba(2,6,14,0.35), rgba(2,6,14,0.65))",
};

const cardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 1020,
  borderRadius: 18,
  border: "1px solid rgba(148,163,184,0.14)",
  background:
    "linear-gradient(180deg, rgba(15,23,42,0.78), rgba(2,6,14,0.64))",
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
    "linear-gradient(90deg, rgba(168,85,247,0.55), rgba(34,197,94,0.35), rgba(59,130,246,0.25), rgba(148,163,184,0.0))",
  opacity: 0.95,
};

const leftPane: CSSProperties = {
  padding: 26,
  borderRight: "1px solid rgba(148,163,184,0.10)",
  background:
    "radial-gradient(900px 360px at 20% 0%, rgba(168,85,247,0.18), transparent 60%), radial-gradient(900px 360px at 90% 20%, rgba(34,197,94,0.14), transparent 65%)",
};

const rightPane: CSSProperties = {
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
  fontWeight: 700,
  background:
    "linear-gradient(90deg, rgba(34,197,94,0.92), rgba(16,185,129,0.78), rgba(168,85,247,0.35))",
  border: "1px solid rgba(148,163,184,0.14)",
  boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
};

type RegisterFormValues = {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  agree: boolean;
};

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: RegisterFormValues) => {
    setLoading(true);
    try {
      await registerUser({
        email: values.email.trim(),
        password: values.password,
        full_name: values.full_name.trim() || null,
      });
      message.destroy();
      message.success("Регистрация успешна. Теперь войдите.");
      navigate("/login");
    } catch {
      message.destroy();
      message.error("Ошибка регистрации. Возможно, почта уже используется.");
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

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          }}
        >
          <div style={leftPane}>
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 14,
                      display: "grid",
                      placeItems: "center",
                      border: "1px solid rgba(148,163,184,0.14)",
                      background:
                        "linear-gradient(180deg, rgba(168,85,247,0.22), rgba(2,6,14,0.22))",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.45)",
                    }}
                  >
                    <UserAddOutlined />
                  </div>
                  <div>
                    <Text style={{ letterSpacing: 1, fontWeight: 800 }}>ITAM</Text>
                    <div>
                      <Text type="secondary">Создание учетной записи</Text>
                    </div>
                  </div>
                </div>

              </div>

              <div style={{ marginTop: 6 }}>
                <Title level={4} style={{ margin: 0 }}>
                  Регистрация администратора
                </Title>
                <Text type="secondary">
                  Создайте учетную запись. После входа можно управлять курсами и данными.
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

              <Space direction="vertical" size={10}>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <SafetyCertificateOutlined style={{ marginTop: 3 }} />
                  <Text type="secondary">
                    Рекомендуется пароль: 12+ символов, буквы, цифры и спецсимвол.
                  </Text>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <SafetyCertificateOutlined style={{ marginTop: 3 }} />
                  <Text type="secondary">
                    После регистрации используйте страницу входа для авторизации.
                  </Text>
                </div>
              </Space>
            </Space>
          </div>

          <div style={rightPane}>
            <div className="auth-card-header" style={{ marginBottom: 18 }}>
              <Title level={2} style={{ margin: 0 }}>
                Регистрация
              </Title>
              <Text type="secondary">Создайте учетную запись администратора</Text>
            </div>

            <Form name="register" layout="vertical" onFinish={onFinish} autoComplete="on">
              <Form.Item
                label={
                  <span>
                    <span style={{ color: "#ff4d4f" }}></span> ФИО
                  </span>
                }
                name="full_name"
                rules={[
                  { required: true, message: "Введите ФИО" },
                  { min: 4, message: "Слишком короткое ФИО" },
                ]}
              >
                <Input size="large" prefix={<IdcardOutlined />} placeholder="Иванов Иван Иванович" />
              </Form.Item>

              <Form.Item
                label={
                  <span>
                    <span style={{ color: "#ff4d4f" }}></span> Почта
                  </span>
                }
                name="email"
                rules={[
                  { required: true, message: "Введите почту" },
                  { type: "email", message: "Некорректный формат почты" },
                ]}
              >
                <Input size="large" prefix={<MailOutlined />} placeholder="admin@example.com" />
              </Form.Item>

              <Form.Item
                label={
                  <span>
                    <span style={{ color: "#ff4d4f" }}></span> Пароль
                  </span>
                }
                name="password"
                rules={[
                  { required: true, message: "Введите пароль" },
                  { min: 8, message: "Минимум 8 символов" },
                ]}
                extra={
                  <Text type="secondary">
                    Лучше: 12+ символов, буквы, цифры, спецсимвол.
                  </Text>
                }
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined />}
                  placeholder="Введите пароль"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item
                label={
                  <span>
                    <span style={{ color: "#ff4d4f" }}></span> Повторите пароль
                  </span>
                }
                name="confirm_password"
                dependencies={["password"]}
                rules={[
                  { required: true, message: "Повторите пароль" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const pwd = getFieldValue("password");
                      if (!value || value === pwd) return Promise.resolve();
                      return Promise.reject(new Error("Пароли не совпадают"));
                    },
                  }),
                ]}
              >
                <Input.Password
                  size="large"
                  prefix={<LockOutlined />}
                  placeholder="Повторите пароль"
                  iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                />
              </Form.Item>

              <Form.Item
                name="agree"
                valuePropName="checked"
                rules={[
                  {
                    validator: async (_, checked) => {
                      if (checked) return;
                      throw new Error("Нужно согласиться с политикой");
                    },
                  },
                ]}
              >
                <Checkbox>Согласен с политикой сайта</Checkbox>
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                block
                loading={loading}
                className="auth-submit"
                style={primaryBtnStyle}
                size="large"
              >
                Зарегистрироваться
              </Button>

              <div className="auth-footer" style={{ marginTop: 16 }}>
                <Text type="secondary">Уже есть аккаунт? </Text>
                <Link to="/login" style={{ fontWeight: 700 }}>
                  Войти
                </Link>
              </div>
            </Form>
          </div>
        </div>
      </Card>
    </div>
  );
}
