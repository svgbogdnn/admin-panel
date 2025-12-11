import { useEffect, useState } from "react";
import { Card, Rate, Space, Switch, Typography } from "antd";
import type { Feedback } from "../api/feedback";
import { getFeedback } from "../api/feedback";

const { Title, Text } = Typography;

export default function FeedbackPage() {
    const [items, setItems] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(false);
    const [includeHidden, setIncludeHidden] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await getFeedback({ include_hidden: includeHidden });
                setItems(data);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [includeHidden]);

    return (
        <div style={{ padding: 24 }}>
            <Space
                direction="vertical"
                size="large"
                style={{ width: "100%" }}
            >
                <Space
                    style={{ width: "100%", justifyContent: "space-between" }}
                >
                    <Title level={3} style={{ color: "#e5e7eb", margin: 0 }}>
                        Фидбэк студентов
                    </Title>
                    <Space>
                        <Text style={{ color: "#e5e7eb" }}>Показывать скрытые</Text>
                        <Switch
                            checked={includeHidden}
                            onChange={setIncludeHidden}
                        />
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
                                    style={{ width: "100%", justifyContent: "space-between" }}
                                >
                                    <Text style={{ color: "#e5e7eb", fontWeight: 600 }}>
                                        Студент ID {item.student_id}
                                    </Text>
                                    <Rate
                                        disabled
                                        allowHalf
                                        defaultValue={item.rating}
                                    />
                                </Space>
                                <Text style={{ color: "#9ca3af" }}>
                                    {item.comment || "Без комментария"}
                                </Text>
                                <Text style={{ color: "#6b7280", fontSize: 12 }}>
                                    Дата: {new Date(item.created_at).toLocaleDateString()}
                                </Text>
                            </Space>
                        </Card>
                    ))}
                    {items.length === 0 && !loading && (
                        <Text style={{ color: "#9ca3af" }}>
                            Пока нет отзывов
                        </Text>
                    )}
                </Space>
            </Space>
        </div>
    );
}
