import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Form,
  Input,
  Row,
  Space,
  Tag,
  Typography,
  message,
} from "antd";
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

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [profileForm] = Form.useForm<ProfileFormValues>();
  const [passwordForm] = Form.useForm<PasswordFormValues>();

  useEffect(() => {
    const load = async () => {
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

    void load();
  }, [profileForm]);

  const handleProfileSubmit = async (values: ProfileFormValues) => {
    setSavingProfile(true);
    try {
      const payload: UserProfileUpdate = {
        full_name: values.full_name?.trim() || undefined,
        birthday: values.birthday
          ? values.birthday.format("YYYY-MM-DD")
          : undefined,
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
    if (values.new_password !== values.confirm_password) {
      message.error("Пароли не совпадают");
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
      });
      message.success("Пароль успешно изменён");
      passwordForm.resetFields();
    } catch (error: any) {
      const detail =
        error?.response?.data?.detail ?? "Ошибка при смене пароля";
      message.error(detail);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Space
        direction="vertical"
        size="large"
        style={{ width: "100%" }}
      >
        <Title level={3} style={{ color: "#e5e7eb", margin: 0 }}>
          Профиль
        </Title>

        <Row gutter={24}>
          <Col xs={24} md={12}>
            <Card loading={loading} title="Общая информация">
              {user && (
                <Descriptions column={1} bordered size="small">
                  <Descriptions.Item label="Имя">
                    {user.full_name || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {user.email}
                  </Descriptions.Item>
                  <Descriptions.Item label="Роль">
                    {user.is_superuser ? (
                      <Tag color="gold">Администратор</Tag>
                    ) : (
                      <Tag color="blue">Пользователь</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Статус">
                    {user.is_active ? (
                      <Tag color="green">Активен</Tag>
                    ) : (
                      <Tag color="red">Заблокирован</Tag>
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Дата регистрации">
                    {new Date(user.created_at).toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="Дата рождения">
                    {user.birthday
                      ? new Date(user.birthday).toLocaleDateString()
                      : "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Национальность">
                    {user.nationality || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Курс обучения">
                    {user.study_course || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Группа">
                    {user.study_group || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Телефон">
                    {user.phone || "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Соцсети">
                    {user.social_links
                      ? user.social_links
                          .split("\n")
                          .map((link) => link.trim())
                          .filter((link) => link.length > 0)
                          .map((link) => (
                            <div key={link}>
                              <a
                                href={link}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {link}
                              </a>
                            </div>
                          ))
                      : "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="ID">
                    {user.id}
                  </Descriptions.Item>
                </Descriptions>
              )}
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Редактирование профиля">
              <Form<ProfileFormValues>
                form={profileForm}
                layout="vertical"
                onFinish={handleProfileSubmit}
              >
                <Form.Item label="Полное имя" name="full_name">
                  <Input placeholder="Введите ФИО" />
                </Form.Item>

                <Form.Item label="Дата рождения" name="birthday">
                  <DatePicker
                    style={{ width: "100%" }}
                    format="YYYY-MM-DD"
                  />
                </Form.Item>

                <Form.Item label="Национальность" name="nationality">
                  <Input />
                </Form.Item>

                <Form.Item label="Курс обучения" name="study_course">
                  <Input />
                </Form.Item>

                <Form.Item label="Группа" name="study_group">
                  <Input />
                </Form.Item>

                <Form.Item label="Телефон" name="phone">
                  <Input />
                </Form.Item>

                <Form.Item
                  label="Ссылки на соцсети"
                  name="social_links"
                >
                  <TextArea
                    rows={4}
                    placeholder="Каждая ссылка с новой строки"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={savingProfile}
                  >
                    Сохранить
                  </Button>
                </Form.Item>
              </Form>

              <Divider />

              <Title level={5}>Смена пароля</Title>
              <Form<PasswordFormValues>
                form={passwordForm}
                layout="vertical"
                onFinish={handlePasswordSubmit}
              >
                <Form.Item
                  label="Текущий пароль"
                  name="current_password"
                  rules={[{ required: true, message: "Введите текущий пароль" }]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item
                  label="Новый пароль"
                  name="new_password"
                  rules={[{ required: true, message: "Введите новый пароль" }]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item
                  label="Подтверждение пароля"
                  name="confirm_password"
                  rules={[{ required: true, message: "Подтвердите пароль" }]}
                >
                  <Input.Password />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={changingPassword}
                  >
                    Изменить пароль
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>

        <Text type="secondary">
          Новые поля сохраняются в профиле текущего пользователя.
        </Text>
      </Space>
    </div>
  );
}
