import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { login, getCurrentUser, type LoginRequest } from "../api/auth";

const { Title, Text } = Typography;

interface LoginFormValues {
    email: string;
    password: string;
}

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleFinish = async (values: LoginFormValues) => {
        setError(null);
        setLoading(true);
        try {
            const payload: LoginRequest = {
                email: values.email,
                password: values.password,
            };
            await login(payload);
            await getCurrentUser();
            navigate("/courses");
        } catch (e) {
            setError("Не удалось войти. Проверьте email и пароль.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#050816",
            }}
        >
            <Card
                style={{
                    width: 400,
                    background: "#111827",
                    borderRadius: 16,
                    boxShadow: "0 0 40px rgba(56, 189, 248, 0.35)",
                    border: "1px solid #1f2937",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <Title level={3} style={{ color: "#22c55e", marginBottom: 8 }}>
                        Вход
                    </Title>
                    <Text style={{ color: "#9ca3af" }}>
                        Введите данные администратора для входа
                    </Text>
                </div>

                {error && (
                    <Alert
                        style={{ marginBottom: 16 }}
                        type="error"
                        message={error}
                        showIcon
                    />
                )}

                <Form<LoginFormValues> layout="vertical" onFinish={handleFinish}>
                    <Form.Item
                        label={<span style={{ color: "#e5e7eb" }}>Почта</span>}
                        name="email"
                        rules={[
                            { required: true, message: "Введите email" },
                            { type: "email", message: "Неверный формат email" },
                        ]}
                    >
                        <Input
                            size="large"
                            placeholder="admin@example.com"
                            style={{
                                backgroundColor: "#020617",
                                borderRadius: 8,
                                borderColor: "#4b5563",
                                color: "#e5e7eb",
                            }}
                        />
                    </Form.Item>

                    <Form.Item
                        label={<span style={{ color: "#e5e7eb" }}>Пароль</span>}
                        name="password"
                        rules={[{ required: true, message: "Введите пароль" }]}
                    >
                        <Input.Password
                            size="large"
                            placeholder="••••••••"
                            style={{
                                backgroundColor: "#020617",
                                borderRadius: 8,
                                borderColor: "#4b5563",
                                color: "#e5e7eb",
                            }}
                        />
                    </Form.Item>

                    <Form.Item style={{ marginTop: 24 }}>
                        <Button
                            type="primary"
                            htmlType="submit"
                            size="large"
                            block
                            loading={loading}
                            style={{
                                background: "linear-gradient(90deg,#22c55e,#4ade80)",
                                borderRadius: 999,
                                border: "none",
                                fontWeight: 600,
                            }}
                        >
                            Войти
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}
