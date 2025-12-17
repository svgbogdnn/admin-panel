import { useEffect, useMemo, useState } from "react";
import { Button, Card, Col, DatePicker, Empty, Progress, Row, Segmented, Select, Space, Statistic, Table, Tag, Tooltip as AntdTooltip, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  CheckCircleOutlined,
  FallOutlined,
  FormOutlined,
  ReloadOutlined,
  RiseOutlined,
  StarOutlined,
  TrophyOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { useAuth } from "../context/AuthContext";
import type { AnalyticsCourseOption, AnalyticsCourseSummaryRow, AnalyticsOverview, AnalyticsTopAbsentStudent } from "../api/analytics";
import { getAnalyticsOverview } from "../api/analytics";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type ScopeUi = "overall" | "personal";

const COLORS = {
  blue: "#60a5fa",
  purple: "#a78bfa",
  cyan: "#38bdf8",
  teal: "#2dd4bf",
  green: "#22c55e",
  amber: "#f59e0b",
  orange: "#fb923c",
  red: "#ef4444",
  pink: "#fb7185",
  slate: "#94a3b8",
};

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}

function pct(v: number) {
  const x = Number.isFinite(v) ? v : 0;
  return Math.round(x * 1000) / 10;
}

function roleTag(role?: string) {
  if (role === "admin") return <Tag color="geekblue">Администратор</Tag>;
  if (role === "teacher") return <Tag color="purple">Преподаватель</Tag>;
  return <Tag color="green">Студент</Tag>;
}

function rateColor(rate01: number) {
  const p = rate01 * 100;
  if (p >= 85) return COLORS.green;
  if (p >= 70) return COLORS.cyan;
  if (p >= 55) return COLORS.amber;
  return COLORS.red;
}

function absRateColor(rate01: number) {
  const p = rate01 * 100;
  if (p >= 60) return COLORS.red;
  if (p >= 35) return COLORS.orange;
  if (p >= 20) return COLORS.amber;
  return COLORS.cyan;
}

function scoreColor(score: number) {
  if (score >= 4.6) return COLORS.green;
  if (score >= 4.0) return COLORS.cyan;
  if (score >= 3.0) return COLORS.amber;
  return COLORS.red;
}

function ratingBarColor(rating: number) {
  if (rating === 5) return COLORS.green;
  if (rating === 4) return COLORS.blue;
  if (rating === 3) return COLORS.amber;
  if (rating === 2) return COLORS.orange;
  return COLORS.red;
}

function kpiCardStyle(a: string, b: string) {
  return {
    background: `linear-gradient(135deg, ${hexToRgba(a, 0.22)} 0%, ${hexToRgba(b, 0.10)} 55%, rgba(17,24,39,0.55) 100%)`,
    border: `1px solid ${hexToRgba(a, 0.18)}`,
    borderRadius: 16,
  } as React.CSSProperties;
}

export default function AnalyticsPage() {
  const { role } = useAuth();
  const isAdminOrTeacher = role === "admin" || role === "teacher";

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AnalyticsOverview | null>(null);

  const [courseId, setCourseId] = useState<number | undefined>(undefined);
  const [range, setRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [scope, setScope] = useState<ScopeUi>(isAdminOrTeacher ? "overall" : "personal");

  useEffect(() => {
    if (!isAdminOrTeacher) setScope("personal");
  }, [isAdminOrTeacher]);

  const load = async () => {
    setLoading(true);
    try {
      const from_date = range?.[0]?.isValid() ? range?.[0]?.format("YYYY-MM-DD") : undefined;
      const to_date = range?.[1]?.isValid() ? range?.[1]?.format("YYYY-MM-DD") : undefined;

      const res = await getAnalyticsOverview({
        course_id: courseId,
        from_date,
        to_date,
        scope,
      });

      setData(res);
    } catch {
      message.error("Не удалось загрузить аналитику");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [courseId, range, scope]);

  const courseOptions = useMemo(() => {
    const list: AnalyticsCourseOption[] = data?.courses ?? [];
    return [
      { value: undefined as unknown as number, label: "Все курсы" },
      ...list.map((c) => ({ value: c.id, label: c.name })).sort((a, b) => String(a.label).localeCompare(String(b.label), "ru")),
    ];
  }, [data]);

  const attendanceLine = useMemo(() => {
    const rows = data?.timeseries ?? [];
    return rows.map((r) => ({
      date: r.date,
      attendance_rate: Math.round((r.attendance_rate || 0) * 1000) / 10,
      attended: r.attended,
      total: r.total,
      absent: Math.max(0, (r.total ?? 0) - (r.attended ?? 0)),
    }));
  }, [data]);

  const ratingBars = useMemo(() => {
    const rows = data?.rating_distribution ?? [];
    return rows.map((r) => ({ rating: Number(r.rating), label: `${r.rating}`, count: r.count }));
  }, [data]);

  const summary = data?.summary;

  const courseSummary = data?.course_summary ?? [];
  const bestCourse = useMemo(() => {
    const rows = courseSummary.filter((x) => Number.isFinite(x.attendance_rate));
    if (!rows.length) return null;
    return rows.reduce((a, b) => (a.attendance_rate >= b.attendance_rate ? a : b));
  }, [courseSummary]);

  const worstCourse = useMemo(() => {
    const rows = courseSummary.filter((x) => Number.isFinite(x.attendance_rate));
    if (!rows.length) return null;
    return rows.reduce((a, b) => (a.attendance_rate <= b.attendance_rate ? a : b));
  }, [courseSummary]);

  const mostFeedbackCourse = useMemo(() => {
    if (!courseSummary.length) return null;
    return courseSummary.reduce((a, b) => (a.feedback_count >= b.feedback_count ? a : b));
  }, [courseSummary]);

  const topAbsentColumns: ColumnsType<AnalyticsTopAbsentStudent> = [
    { title: "Студент", dataIndex: "student_name", key: "student_name", ellipsis: true },
    { title: "Пропусков", dataIndex: "absent", key: "absent", width: 120 },
    { title: "Всего отметок", dataIndex: "total", key: "total", width: 140 },
    {
      title: "Доля пропусков",
      dataIndex: "absent_rate",
      key: "absent_rate",
      width: 220,
      render: (v: number) => {
        const percent = Math.min(100, Math.max(0, pct(v)));
        return (
          <Space size={10} style={{ width: "100%" }}>
            <Progress
              percent={percent}
              size="small"
              showInfo={false}
              strokeColor={absRateColor(v)}
              style={{ width: 120 }}
            />
            <Text>{percent.toFixed(1)}%</Text>
          </Space>
        );
      },
    },
  ];

  const courseSummaryColumns: ColumnsType<AnalyticsCourseSummaryRow> = [
    { title: "Курс", dataIndex: "course_name", key: "course_name", ellipsis: true },
    { title: "Занятий", dataIndex: "lessons", key: "lessons", width: 110, sorter: (a, b) => a.lessons - b.lessons },
    {
      title: "Посещаемость",
      dataIndex: "attendance_rate",
      key: "attendance_rate",
      width: 260,
      sorter: (a, b) => a.attendance_rate - b.attendance_rate,
      render: (v: number) => {
        const percent = Math.min(100, Math.max(0, pct(v)));
        return (
          <Space size={10} style={{ width: "100%" }}>
            <Progress
              percent={percent}
              size="small"
              showInfo={false}
              strokeColor={rateColor(v)}
              style={{ width: 140 }}
            />
            <Tag color={percent >= 85 ? "green" : percent >= 70 ? "cyan" : percent >= 55 ? "gold" : "red"}>
              {percent.toFixed(1)}%
            </Tag>
          </Space>
        );
      },
    },
    {
      title: "Средняя оценка",
      dataIndex: "feedback_avg",
      key: "feedback_avg",
      width: 170,
      sorter: (a, b) => (a.feedback_avg ?? -1) - (b.feedback_avg ?? -1),
      render: (v: number | null) => {
        if (v == null) return "—";
        const vv = Math.round(v * 100) / 100;
        return <Tag color={vv >= 4.6 ? "green" : vv >= 4.0 ? "blue" : vv >= 3.0 ? "gold" : "red"}>{vv.toFixed(2)}</Tag>;
      },
    },
    {
      title: "Фидбеков",
      dataIndex: "feedback_count",
      key: "feedback_count",
      width: 140,
      sorter: (a, b) => a.feedback_count - b.feedback_count,
      render: (v: number) => <Tag color={v >= 20 ? "geekblue" : v >= 10 ? "cyan" : "default"}>{v}</Tag>,
    },
  ];

  const showTopAbsent = (role === "admin" || role === "teacher") && (data?.scope ?? "overall") === "overall";

  const avgScore = summary?.feedback_avg == null ? null : Math.round(summary.feedback_avg * 100) / 100;
  const attendanceRate01 = summary?.attendance_rate ?? 0;

  return (
    <div className="page-wrap">
      <div className="page-head">
        <div className="page-head-left">
          <Title level={2} style={{ margin: 0 }}>
            Аналитика
          </Title>

          <Space size={8} wrap>
            {roleTag(role ?? undefined)}
            {data ? (
              <Tag color={data.scope === "overall" ? "geekblue" : "green"}>
                {data.scope === "overall" ? "Общая аналитика" : "Моя аналитика"}
              </Tag>
            ) : null}
          </Space>
        </div>

        <div className="page-head-actions">
          <Button icon={<ReloadOutlined />} onClick={() => void load()} loading={loading}>
            Обновить
          </Button>
        </div>
      </div>

      <Card className="card-surface" bordered={false} bodyStyle={{ padding: 16 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} md={10} lg={8}>
            <Select
              style={{ width: "100%" }}
              placeholder="Курс"
              options={courseOptions}
              value={courseId}
              onChange={(v) => setCourseId(typeof v === "number" ? v : undefined)}
              allowClear
              showSearch
              optionFilterProp="label"
            />
          </Col>

          <Col xs={24} md={14} lg={10}>
            <RangePicker style={{ width: "100%" }} value={range as any} onChange={(v) => setRange(v as any)} allowClear />
          </Col>

          <Col xs={24} lg={6}>
            {isAdminOrTeacher ? (
              <Segmented
                block
                value={scope}
                onChange={(v) => setScope(v as ScopeUi)}
                options={[
                  { label: "Общая", value: "overall" },
                  { label: "Моя", value: "personal" },
                ]}
              />
            ) : (
              <Segmented block value="personal" options={[{ label: "Моя", value: "personal" }]} />
            )}
          </Col>
        </Row>
      </Card>

      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} md={12} lg={6}>
          <Card className="card-surface" bordered={false} style={kpiCardStyle(COLORS.blue, COLORS.cyan)}>
            <Statistic title="Занятий (в фильтре)" value={summary?.lessons ?? 0} prefix={<FormOutlined style={{ color: COLORS.cyan }} />} />
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card className="card-surface" bordered={false} style={kpiCardStyle(COLORS.green, COLORS.teal)}>
            <Statistic
              title="Посещаемость"
              value={pct(attendanceRate01)}
              suffix="%"
              prefix={<CheckCircleOutlined style={{ color: rateColor(attendanceRate01) }} />}
            />
            <Progress
              percent={Math.min(100, Math.max(0, pct(attendanceRate01)))}
              size="small"
              showInfo={false}
              strokeColor={rateColor(attendanceRate01)}
              trailColor={hexToRgba(COLORS.slate, 0.22)}
            />
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card className="card-surface" bordered={false} style={kpiCardStyle(COLORS.amber, COLORS.orange)}>
            <Statistic
              title="Отметок посещаемости"
              value={summary?.attendance_total ?? 0}
              prefix={<RiseOutlined style={{ color: COLORS.amber }} />}
            />
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card className="card-surface" bordered={false} style={kpiCardStyle(COLORS.purple, COLORS.pink)}>
            <Statistic
              title="Средняя оценка"
              value={avgScore == null ? "—" : avgScore.toFixed(2)}
              prefix={<StarOutlined style={{ color: avgScore == null ? COLORS.slate : scoreColor(avgScore) }} />}
            />
            {avgScore == null ? (
              <Text type="secondary">Пока нет фидбеков по фильтру</Text>
            ) : (
              <Tag color={avgScore >= 4.6 ? "green" : avgScore >= 4.0 ? "blue" : avgScore >= 3.0 ? "gold" : "red"}>
                {avgScore >= 4.6 ? "Отлично" : avgScore >= 4.0 ? "Хорошо" : avgScore >= 3.0 ? "Нормально" : "Нужно улучшать"}
              </Tag>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} lg={16}>
          <Card className="card-surface" bordered={false} title="Динамика: посещаемость и количество присутствий">
            {attendanceLine.length ? (
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={attendanceLine}>
                    <CartesianGrid strokeDasharray="3 3" stroke={hexToRgba(COLORS.slate, 0.25)} />
                    <XAxis dataKey="date" tickMargin={10} stroke={hexToRgba(COLORS.slate, 0.85)} />
                    <YAxis yAxisId="left" domain={[0, 100]} tickMargin={10} stroke={hexToRgba(COLORS.slate, 0.85)} />
                    <YAxis yAxisId="right" orientation="right" tickMargin={10} stroke={hexToRgba(COLORS.slate, 0.85)} />
                    <Tooltip
                      cursor={{ fill: hexToRgba(COLORS.blue, 0.08) }}
                      contentStyle={{
                        background: "rgba(17,24,39,0.92)",
                        border: `1px solid ${hexToRgba(COLORS.blue, 0.18)}`,
                        borderRadius: 12,
                      }}
                      labelStyle={{ color: "#e5e7eb" }}
                    />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="attendance_rate"
                      name="Посещаемость, %"
                      dot={false}
                      stroke={COLORS.cyan}
                      strokeWidth={3}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="attended"
                      name="Присутствий, шт."
                      dot={false}
                      stroke={COLORS.purple}
                      strokeWidth={2}
                      strokeDasharray="6 4"
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty description="Нет данных для графика (попробуйте расширить период или выбрать другой курс)" />
            )}
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card className="card-surface" bordered={false} title="Распределение оценок (фидбек)">
            {ratingBars.reduce((a, x) => a + (x.count || 0), 0) ? (
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ratingBars}>
                    <CartesianGrid strokeDasharray="3 3" stroke={hexToRgba(COLORS.slate, 0.25)} />
                    <XAxis dataKey="label" tickMargin={10} stroke={hexToRgba(COLORS.slate, 0.85)} />
                    <YAxis tickMargin={10} allowDecimals={false} stroke={hexToRgba(COLORS.slate, 0.85)} />
                    <Tooltip
                      cursor={{ fill: hexToRgba(COLORS.purple, 0.08) }}
                      contentStyle={{
                        background: "rgba(17,24,39,0.92)",
                        border: `1px solid ${hexToRgba(COLORS.purple, 0.18)}`,
                        borderRadius: 12,
                      }}
                      labelStyle={{ color: "#e5e7eb" }}
                    />
                    <Bar dataKey="count" name="Кол-во" radius={[10, 10, 0, 0]}>
                      {ratingBars.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={ratingBarColor(entry.rating)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <Empty description="Пока нет фидбеков по выбранным условиям" />
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={24} lg={10}>
          <Card className="card-surface" bordered={false} title="Инсайты по выборке">
            <Space direction="vertical" size={10} style={{ width: "100%" }}>
              {bestCourse ? (
                <Space align="start" style={{ width: "100%", justifyContent: "space-between" }}>
                  <Space>
                    <TrophyOutlined style={{ color: COLORS.green }} />
                    <Text strong>Лучший курс по посещаемости</Text>
                  </Space>
                  <AntdTooltip title={bestCourse.course_name}>
                    <Tag color="green">{pct(bestCourse.attendance_rate).toFixed(1)}%</Tag>
                  </AntdTooltip>
                </Space>
              ) : (
                <Space>
                  <WarningOutlined style={{ color: COLORS.slate }} />
                  <Text type="secondary">Недостаточно данных для “лучшего курса”</Text>
                </Space>
              )}

              {worstCourse ? (
                <Space align="start" style={{ width: "100%", justifyContent: "space-between" }}>
                  <Space>
                    <FallOutlined style={{ color: COLORS.red }} />
                    <Text strong>Риск: низкая посещаемость</Text>
                  </Space>
                  <AntdTooltip title={worstCourse.course_name}>
                    <Tag color="red">{pct(worstCourse.attendance_rate).toFixed(1)}%</Tag>
                  </AntdTooltip>
                </Space>
              ) : null}

              {mostFeedbackCourse ? (
                <Space align="start" style={{ width: "100%", justifyContent: "space-between" }}>
                  <Space>
                    <StarOutlined style={{ color: COLORS.amber }} />
                    <Text strong>Самый “обсуждаемый” курс</Text>
                  </Space>
                  <AntdTooltip title={mostFeedbackCourse.course_name}>
                    <Tag color="gold">{mostFeedbackCourse.feedback_count}</Tag>
                  </AntdTooltip>
                </Space>
              ) : null}

              <Text type="secondary">
                Идея: по курсам с низкой посещаемостью можно смотреть даты/темы уроков и корректировать формат.
              </Text>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={14}>
          <Card className="card-surface" bordered={false} title="Сводка по курсам">
            <Table<AnalyticsCourseSummaryRow>
              rowKey={(r) => String(r.course_id)}
              dataSource={courseSummary}
              columns={courseSummaryColumns}
              loading={loading}
              pagination={{ pageSize: 10, showSizeChanger: false }}
              tableLayout="fixed"
              locale={{ emptyText: <Empty description="Нет данных" /> }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="card-surface" bordered={false} title="Топ студентов по пропускам" style={{ marginTop: 12 }}>
        {showTopAbsent ? (
          <Table<AnalyticsTopAbsentStudent>
            rowKey={(r) => String(r.student_id)}
            dataSource={data?.top_absent_students ?? []}
            columns={topAbsentColumns}
            loading={loading}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            tableLayout="fixed"
            locale={{ emptyText: <Empty description="Нет данных" /> }}
          />
        ) : (
          <Empty description="Доступно в режиме «Общая» для администратора/преподавателя" />
        )}
      </Card>

    </div>
  );
}
