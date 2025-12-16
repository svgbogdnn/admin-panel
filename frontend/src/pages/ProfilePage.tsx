import { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Row,
  Space,
  Tabs,
  Tag,
  Typography,
  message,
} from "antd";
import {
  CalendarOutlined,
  IdcardOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  ReloadOutlined,
  SafetyOutlined,
  TeamOutlined,
  UserOutlined,
  LinkOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";

import {
  type User,
  type UserProfileUpdate,
  getCurrentUser,
  updateCurrentUser,
  changePassword,
} from "../api/users";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ProfileFormValues {
  full_name?: string;
  birthday?: Dayjs | null;
  nationality?: string;
  study_course?: string;
  study_group?: string;
  phone?: string;
  social_links?: string;
}

interface PasswordFormValues {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

function roleTag(role?: string) {
  if (role === "admin") return <Tag color="gold">Администратор</Tag>;
  if (role === "teacher") return <Tag color="purple">Преподаватель</Tag>;
  return <Tag color="blue">Студент</Tag>;
}

function statusTag(active?: boolean) {
  return active ? <Tag color="green">Активен</Tag> : <Tag color="red">Заблокирован</Tag>;
}

function initialsFromName(fullName?: string | null): string {
  const s = String(fullName ?? "").trim();
  if (!s) return "U";
  const parts = s.split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "U";
  const second = parts.length > 1 ? parts[1]?.[0] ?? "" : "";
  return (first + second).toUpperCase();
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString();
}

function normalizeExternalUrl(raw: string): string | null {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  if (/^[a-z]+:\/\//i.test(s)) return null;
  return `https://${s}`;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);

  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileForm] = Form.useForm<ProfileFormValues>();
  const [passwordForm] = Form.useForm<PasswordFormValues>();

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await getCurrentUser();
      setUser(data);
      profileForm.setFieldsValue({
        full_name: data.full_name ?? "",
        birthday: data.birthday ? dayjs(data.birthday) : null,
        nationality: data.nationality ?? "",
        study_course: data.study_course ?? "",
        study_group: data.study_group ?? "",
        phone: data.phone ?? "",
        social_links: data.social_links ?? "",
      });
    } catch {
      message.error("Не удалось загрузить профиль");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, [profileForm]);

  const socialLinks = useMemo(() => {
    const raw = user?.social_links ?? "";
    const list = raw
      .split("\n")
      .map((x) => x.trim())
      .filter((x) => x.length > 0);

    return list
      .map((x) => ({ raw: x, url: normalizeExternalUrl(x) }))
      .filter((x) => x.url);
  }, [user?.social_links]);

  const handleProfileSubmit = async (values: ProfileFormValues) => {
    setSavingProfile(true);
    try {
      const payload: UserProfileUpdate = {
        full_name: values.full_name?.trim() || undefined,
        birthday: values.birthday ? values.birthday.format("YYYY-MM-DD") : undefined,
        nationality: values.nationality?.trim() || undefined,
        study_course: values.study_course?.trim() || undefined,
        study_group: values.study_group?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
        social_links: values.social_links?.trim() || undefined,
      };

      const updated = await updateCurrentUser(payload);
      setUser(updated);
      message.success("Профиль обновлён");
    } catch {
      message.error("Ошибка при обновлении профиля");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (values: PasswordFormValues) => {
    setChangingPassword(true);
    try {
      await changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
      });
      message.success("Пароль успешно изменён");
      passwordForm.resetFields();
    } catch (error: any) {
      const detail = error?.response?.data?.detail ?? "Ошибка при смене пароля";
      message.error(detail);
    } finally {
      setChangingPassword(false);
    }
  };

  const headerName = user?.full_name?.trim() || "Профиль";
  const headerEmail = user?.email ?? "—";

  return (
    <div className="page-wrap">
      <div className="page-head">
        <div className="page-head-left">
          <Title level={2} style={{ margin: 0 }}>
            Профиль
          </Title>
          <Text type="secondary">Управляйте данными аккаунта и безопасностью.</Text>
        </div>

        <div className="page-head-actions">
          <Button icon={<ReloadOutlined />} onClick={() => void refresh()} loading={loading}>
            Обновить
          </Button>
        </div>
      </div>

      <Row gutter={16}>
        <Col xs={24} lg={9}>
          <Card className="card-surface" bordered={false} loading={loading}>
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <Avatar size={56} style={{ background: "rgba(34, 197, 94, 0.18)", color: "#e5e7eb" }}>
                  {initialsFromName(user?.full_name)}
                </Avatar>

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10 }}>
                    <Title level={4} style={{ margin: 0, color: "#e5e7eb" }}>
                      {headerName}
                    </Title>
                    {user && <Text className="mono" type="secondary">ID {user.id}</Text>}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 2 }}>
                    <MailOutlined />
                    <Text type="secondary" ellipsis={{ tooltip: headerEmail }}>
                      {headerEmail}
                    </Text>
                  </div>

                  <Space size={8} wrap style={{ marginTop: 10 }}>
                    {roleTag(user?.role)}
                    {statusTag(user?.is_active)}
                  </Space>
                </div>
              </div>

              <div
                className="stats"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <div className="stat-item" style={{ minWidth: 0 }}>
                  <div className="stat-label">Регистрация</div>
                  <div className="stat-value" style={{ fontSize: 14 }}>
                    {formatDateTime(user?.created_at ?? null)}
                  </div>
                </div>

                <div className="stat-item" style={{ minWidth: 0 }}>
                  <div className="stat-label">Дата рождения</div>
                  <div className="stat-value" style={{ fontSize: 14 }}>
                    {formatDate(user?.birthday ?? null)}
                  </div>
                </div>

                <div className="stat-item" style={{ minWidth: 0 }}>
                  <div className="stat-label">Группа</div>
                  <div className="stat-value" style={{ fontSize: 14 }}>
                    {user?.study_group || "—"}
                  </div>
                </div>

                <div className="stat-item" style={{ minWidth: 0 }}>
                  <div className="stat-label">Телефон</div>
                  <div className="stat-value" style={{ fontSize: 14 }}>
                    {user?.phone || "—"}
                  </div>
                </div>
              </div>

              <Divider style={{ margin: "8px 0" }} />

              <Space direction="vertical" size={10} style={{ width: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <IdcardOutlined />
                  <Text type="secondary">Национальность:</Text>
                  <Text style={{ marginLeft: "auto" }}>{user?.nationality || "—"}</Text>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <TeamOutlined />
                  <Text type="secondary">Курс обучения:</Text>
                  <Text style={{ marginLeft: "auto" }}>{user?.study_course || "—"}</Text>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <CalendarOutlined />
                  <Text type="secondary">День рождения:</Text>
                  <Text style={{ marginLeft: "auto" }}>{formatDate(user?.birthday ?? null)}</Text>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <PhoneOutlined />
                  <Text type="secondary">Телефон:</Text>
                  <Text style={{ marginLeft: "auto" }}>{user?.phone || "—"}</Text>
                </div>
              </Space>

              <Divider style={{ margin: "8px 0" }} />

              <div>
                <Space size={8} align="center" style={{ marginBottom: 8 }}>
                  <LinkOutlined />
                  <Text type="secondary">Соцсети</Text>
                </Space>

                {socialLinks.length > 0 ? (
                  <Space direction="vertical" size={6} style={{ width: "100%" }}>
                    {socialLinks.map((x) => (
                      <a key={x.raw} href={x.url!} target="_blank" rel="noreferrer">
                        {x.raw}
                      </a>
                    ))}
                  </Space>
                ) : (
                  <Text type="secondary">—</Text>
                )}
              </div>

            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={15}>
          <Card className="card-surface" bordered={false} loading={loading} bodyStyle={{ padding: 0 }}>
            <Tabs
              defaultActiveKey="profile"
              items={[
                {
                  key: "profile",
                  label: (
                    <Space size={8}>
                      <UserOutlined />
                      Данные
                    </Space>
                  ),
                  children: (
                    <div style={{ padding: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
                        <div>
                          <Title level={4} style={{ margin: 0 }}>
                            Редактирование профиля
                          </Title>
                          <Text type="secondary">Обновите контактные данные и информацию об обучении.</Text>
                        </div>
                        <Button
                          type="primary"
                          icon={<SaveOutlined />}
                          loading={savingProfile}
                          onClick={() => profileForm.submit()}
                        >
                          Сохранить
                        </Button>
                      </div>

                      <Form<ProfileFormValues>
                        form={profileForm}
                        layout="vertical"
                        onFinish={handleProfileSubmit}
                      >
                        <Row gutter={16}>
                          <Col xs={24} md={12}>
                            <Form.Item label="Полное имя" name="full_name">
                              <Input placeholder="Введите ФИО" />
                            </Form.Item>
                          </Col>

                          <Col xs={24} md={12}>
                            <Form.Item label="Дата рождения" name="birthday">
                              <DatePicker style={{ width: "100%" }} format="YYYY-MM-DD" />
                            </Form.Item>
                          </Col>

                          <Col xs={24} md={12}>
                            <Form.Item label="Национальность" name="nationality">
                              <Input placeholder="Например: Россия" />
                            </Form.Item>
                          </Col>

                          <Col xs={24} md={12}>
                            <Form.Item label="Телефон" name="phone">
                              <Input placeholder="+1 (___) ___-____" />
                            </Form.Item>
                          </Col>

                          <Col xs={24} md={12}>
                            <Form.Item label="Курс обучения" name="study_course">
                              <Input placeholder="Например: 2" />
                            </Form.Item>
                          </Col>

                          <Col xs={24} md={12}>
                            <Form.Item label="Группа" name="study_group">
                              <Input placeholder="Например: ИТ-21" />
                            </Form.Item>
                          </Col>

                          <Col xs={24}>
                            <Form.Item label="Ссылки на соцсети" name="social_links">
                              <TextArea rows={5} placeholder="Каждая ссылка с новой строки" />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                          <Button type="primary" htmlType="submit" loading={savingProfile} icon={<SaveOutlined />}>
                            Сохранить изменения
                          </Button>
                        </Space>
                      </Form>
                    </div>
                  ),
                },
                {
                  key: "security",
                  label: (
                    <Space size={8}>
                      <SafetyOutlined />
                      Безопасность
                    </Space>
                  ),
                  children: (
                    <div style={{ padding: 24 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
                        <div>
                          <Title level={4} style={{ margin: 0 }}>
                            Смена пароля
                          </Title>
                          <Text type="secondary">Рекомендуется использовать уникальный пароль.</Text>
                        </div>
                        <Button
                          type="primary"
                          icon={<LockOutlined />}
                          loading={changingPassword}
                          onClick={() => passwordForm.submit()}
                        >
                          Изменить
                        </Button>
                      </div>

                      <Form<PasswordFormValues>
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handlePasswordSubmit}
                      >
                        <Row gutter={16}>
                          <Col xs={24} md={12}>
                            <Form.Item
                              label="Текущий пароль"
                              name="current_password"
                              rules={[{ required: true, message: "Введите текущий пароль" }]}
                            >
                              <Input.Password />
                            </Form.Item>
                          </Col>

                          <Col xs={24} md={12}>
                            <Form.Item
                              label="Новый пароль"
                              name="new_password"
                              rules={[{ required: true, message: "Введите новый пароль" }]}
                            >
                              <Input.Password />
                            </Form.Item>
                          </Col>

                          <Col xs={24} md={12}>
                            <Form.Item
                              label="Подтверждение пароля"
                              name="confirm_password"
                              dependencies={["new_password"]}
                              rules={[
                                { required: true, message: "Подтвердите пароль" },
                                ({ getFieldValue }) => ({
                                  validator(_, value) {
                                    const np = getFieldValue("new_password");
                                    if (!value || value === np) return Promise.resolve();
                                    return Promise.reject(new Error("Пароли не совпадают"));
                                  },
                                }),
                              ]}
                            >
                              <Input.Password />
                            </Form.Item>
                          </Col>
                        </Row>

                        <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                          <Button type="primary" htmlType="submit" loading={changingPassword} icon={<LockOutlined />}>
                            Изменить пароль
                          </Button>
                        </Space>
                      </Form>

                      <Divider style={{ margin: "18px 0 0" }} />

                    </div>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
