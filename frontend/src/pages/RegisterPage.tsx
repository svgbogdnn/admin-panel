import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Progress,
  Space,
  Typography,
  message,
} from "antd";
import {
  LockOutlined,
  MailOutlined,
  SafetyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { registerUser, type RegisterRequest } from "../api/auth";

interface RegisterFormValues {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  agree: boolean;
}

const { Title, Text } = Typography;

function calcPasswordStrength(password: string): { percent: number; label: string } {
  const p = String(password ?? "");
  if (!p) return { percent: 0, label: "Введите пароль" };

  let score = 0;

  const len = p.length;
  if (len >= 8) score += 25;
  if (len >= 12) score += 15;

  if (/[a-z]/.test(p)) score += 15;
  if (/[A-Z]/.test(p)) score += 15;
  if (/\d/.test(p)) score += 15;
  if (/[^A-Za-z0-9]/.test(p)) score += 15;

  const percent = Math.max(0, Math.min(100, score));

  let label = "Слабый пароль";
  if (percent >= 70) label = "Хороший пароль";
  if (percent >= 90) label = "Отличный пароль";

  return { percent, label };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm<RegisterFormValues>();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const password = Form.useWatch("password", form) ?? "";
  const strength = useMemo(() => calcPasswordStrength(password), [password]);

  const handleFinish = async (values: RegisterFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const payload: RegisterRequest = {
        email: values.email.trim(),
        password: values.password,
        full_name: values.full_name.trim(),
      };

      await registerUser(payload);
      message.success("Аккаунт создан. Теперь войдите.");
      navigate("/login");
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      const msg =
        typeof detail === "string" && detail.trim().length > 0
          ? detail.trim()
          : "Не удалось зарегистрировать пользователя";
      setError(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card" bordered={false}>
        <div className="auth-card-header">
          <Title level={2} style={{ marginBottom: 6 }}>
            Регистрация
          </Title>
          <Text type="secondary">Создайте учётную запись администратора</Text>
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form<RegisterFormValues>
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          disabled={loading}
          initialValues={{ agree: false }}
          onValuesChange={() => {
            if (error) setError(null);
          }}
        >
          <Form.Item
            label="ФИО"
            name="full_name"
            rules={[
              { required: true, message: "Введите ФИО" },
              { min: 2, message: "Слишком короткое имя" },
            ]}
          >
            <Input
              size="large"
              placeholder="Иванов Иван Иванович"
              prefix={<UserOutlined />}
              autoComplete="name"
              allowClear
            />
          </Form.Item>

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
              prefix={<MailOutlined />}
              autoComplete="email"
              allowClear
            />
          </Form.Item>

          <Form.Item
            label="Пароль"
            name="password"
            rules={[
              { required: true, message: "Введите пароль" },
              { min: 8, message: "Минимум 8 символов" },
            ]}
          >
            <Input.Password
              size="large"
              placeholder="Введите пароль"
              prefix={<LockOutlined />}
              autoComplete="new-password"
            />
          </Form.Item>

          <div style={{ marginTop: -8, marginBottom: 14 }}>
            <Progress percent={strength.percent} showInfo={false} />
            <Space size={8} align="center" style={{ marginTop: 6 }}>
              <SafetyOutlined />
              <Text type="secondary">{strength.label}</Text>
              <Text type="secondary">•</Text>
              <Text type="secondary">Лучше: 12+ символов, буквы, цифры, спецсимвол</Text>
            </Space>
          </div>

          <Form.Item
            label="Повторите пароль"
            name="confirm_password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Повторите пароль" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const p = getFieldValue("password");
                  if (!value || value === p) return Promise.resolve();
                  return Promise.reject(new Error("Пароли не совпадают"));
                },
              }),
            ]}
          >
            <Input.Password
              size="large"
              placeholder="Повторите пароль"
              prefix={<LockOutlined />}
              autoComplete="new-password"
            />
          </Form.Item>

          <Form.Item
            name="agree"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(new Error("Необходимо согласиться с политикой сайта")),
              },
            ]}
          >
            <Checkbox>Согласен с политикой сайта</Checkbox>
          </Form.Item>

          <Form.Item style={{ marginTop: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
            >
              Зарегистрироваться
            </Button>
          </Form.Item>
        </Form>

        <div className="auth-card-footer">
          <Text>Уже есть аккаунт? </Text>
          <Link to="/login">Войти</Link>
        </div>
      </Card>
    </div>
  );
}
