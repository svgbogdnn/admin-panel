import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Typography,
} from "antd";
import { registerUser, type RegisterRequest } from "../api/auth";

interface RegisterFormValues {
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  agree: boolean;
}

const { Title, Text } = Typography;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async (values: RegisterFormValues) => {
    if (values.password !== values.confirm_password) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload: RegisterRequest = {
        email: values.email,
        password: values.password,
        full_name: values.full_name,
      };
      await registerUser(payload);
      navigate("/login");
    } catch {
      setError("Не удалось зарегистрировать пользователя");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Card className="auth-card" bordered={false}>
        <div className="auth-card-header">
          <Title level={2}>Регистрация</Title>
          <Text>Создайте учётную запись администратора</Text>
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
          layout="vertical"
          onFinish={handleFinish}
          disabled={loading}
          initialValues={{ agree: false }}
        >
          <Form.Item
            label="ФИО"
            name="full_name"
            rules={[{ required: true, message: "Введите ФИО" }]}
          >
            <Input placeholder="Иванов Иван Иванович" />
          </Form.Item>

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

          <Form.Item
            label="Повторите пароль"
            name="confirm_password"
            rules={[{ required: true, message: "Повторите пароль" }]}
          >
            <Input.Password placeholder="Повторите пароль" />
          </Form.Item>

          <Form.Item
            name="agree"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error("Необходимо согласиться с политикой сайта"),
                      ),
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
