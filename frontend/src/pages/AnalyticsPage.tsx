import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Progress,
  Row,
  Segmented,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  ReloadOutlined,
  FireOutlined,
  TrophyOutlined,
  LineChartOutlined,
  ExperimentOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  StarOutlined,
  MessageOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
  Area,
  ComposedChart,
} from "recharts";

import { useAuth, type UserRole } from "../context/AuthContext";
import type {
  AnalyticsCourseOption,
  AnalyticsCourseSummaryRow,
  AnalyticsOverview,
  AnalyticsRiskResponse,
  AnalyticsRiskRow,
  AnalyticsTopAbsentStudent,
} from "../api/analytics";
import { getAnalyticsOverview, getAnalyticsRisk } from "../api/analytics";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

type ScopeUi = "overall" | "personal";

const CHART_COLORS = {
  cyan: "#13c2c2",
  blue: "#1677ff",
  purple: "#722ed1",
  magenta: "#eb2f96",
  orange: "#fa8c16",
  volcano: "#fa541c",
  green: "#52c41a",
  gold: "#fadb14",
  red: "#f5222d",
};

const RATING_COLORS = [CHART_COLORS.red, CHART_COLORS.orange, CHART_COLORS.gold, CHART_COLORS.green, CHART_COLORS.blue];

function pct(v: number | null | undefined) {
  const x = Number.isFinite(v as number) ? (v as number) : 0;
  return Math.round(x * 1000) / 10;
}

function roleLabel(role: UserRole | null | undefined) {
  if (role === "admin") return "Администратор";
  if (role === "teacher") return "Преподаватель";
  return "Студент";
}

function clamp01(x: number) {
  if (!Number.isFinite(x)) return 0;
  if (x < 0) return 0;
  if (x > 1) return 1;
  return x;
}

function riskBand(p: number) {
  const x = clamp01(p);
  if (x >= 0.8) return { tag: "Высокий", color: "red" as const, from: CHART_COLORS.red, to: CHART_COLORS.volcano };
  if (x >= 0.6) return { tag: "Повышенный", color: "volcano" as const, from: CHART_COLORS.volcano, to: CHART_COLORS.orange };
  if (x >= 0.4) return { tag: "Средний", color: "orange" as const, from: CHART_COLORS.orange, to: CHART_COLORS.gold };
  if (x >= 0.25) return { tag: "Низкий", color: "geekblue" as const, from: CHART_COLORS.blue, to: CHART_COLORS.purple };
  return { tag: "Минимальный", color: "green" as const, from: CHART_COLORS.green, to: CHART_COLORS.cyan };
}

function kpiStyle(from: string, to: string): CSSProperties {
  return {
    borderRadius: 16,
    border: `1px solid ${from}33`,
    background: `radial-gradient(900px 240px at 10% 0%, ${from}3a 0%, transparent 60%),
                 radial-gradient(700px 220px at 90% 0%, ${to}2f 0%, transparent 55%),
                 linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(0,0,0,0.25) 100%)`,
    boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset",
    overflow: "hidden",
  };
}

function chartCardStyle(accent: string): CSSProperties {
  return {
    borderRadius: 16,
    border: `1px solid ${accent}2b`,
    background: `radial-gradient(900px 260px at 15% 0%, ${accent}22 0%, transparent 60%),
                 linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.25) 100%)`,
    boxShadow: "0 0 0 1px rgba(255,255,255,0.04) inset",
  };
}

export default function AnalyticsPage() {
  const { role } = useAuth();
  const isAdminOrTeacher = role === "admin" || role === "teacher";

  const [scopeUi, setScopeUi] = useState<ScopeUi>(isAdminOrTeacher ? "overall" : "personal");
  const [courseId, setCourseId] = useState<number | undefined>(undefined);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [risk, setRisk] = useState<AnalyticsRiskResponse | null>(null);

  const [loading, setLoading] = useState(false);

  const courseOptions = useMemo<AnalyticsCourseOption[]>(() => overview?.courses ?? [], [overview?.courses]);

  const effectiveScopeParam = useMemo(() => {
    if (!isAdminOrTeacher) return "personal";
    return scopeUi;
  }, [isAdminOrTeacher, scopeUi]);

  const params = useMemo(() => {
    const from_date = dateRange ? dateRange[0].format("YYYY-MM-DD") : undefined;
    const to_date = dateRange ? dateRange[1].format("YYYY-MM-DD") : undefined;
    return {
      course_id: courseId,
      from_date,
      to_date,
      scope: effectiveScopeParam,
    };
  }, [courseId, dateRange, effectiveScopeParam]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, rk] = await Promise.all([
        getAnalyticsOverview(params),
        getAnalyticsRisk({
          ...params,
          k: 5,
          limit: role === "student" ? 80 : 160,
        }),
      ]);
      setOverview(ov);
      setRisk(rk);
    } catch (e: any) {
      setOverview(null);
      setRisk(null);
      message.error(e?.response?.data?.detail || "Не удалось загрузить аналитику");
    } finally {
      setLoading(false);
    }
  }, [params, role]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = useMemo(() => (overview as any)?.summary ?? null, [overview]);
  const avgRating = useMemo(() => {
    const v = summary?.feedback_avg ?? summary?.avg_rating ?? summary?.rating_avg ?? null;
    return typeof v === "number" && Number.isFinite(v) ? v : null;
  }, [summary]);

  const attendanceRate = useMemo(() => {
    const v = summary?.attendance_rate;
    return typeof v === "number" ? clamp01(v) : 0;
  }, [summary]);

  const ratingData = useMemo(() => overview?.rating_distribution ?? [], [overview?.rating_distribution]);
  const tsData = useMemo(
    () =>
      (overview?.timeseries ?? []).map((x: any) => ({
        ...x,
        attendance_pct: (x.attendance_rate ?? 0) * 100,
      })),
    [overview?.timeseries]
  );

  const topAbsentColumns = useMemo<ColumnsType<AnalyticsTopAbsentStudent>>(() => {
    return [
      {
        title: "Студент",
        dataIndex: "student_name",
        key: "student_name",
        render: (v) => (
          <Tooltip title={v}>
            <Text strong ellipsis style={{ maxWidth: 220, display: "inline-block" }}>
              {v}
            </Text>
          </Tooltip>
        ),
      },
      {
        title: "Пропуски",
        dataIndex: "absent",
        key: "absent",
        sorter: (a, b) => a.absent - b.absent,
        defaultSortOrder: "descend",
        render: (v) => (
          <Tag color="volcano" icon={<FireOutlined />}>
            {v}
          </Tag>
        ),
        width: 120,
      },
      {
        title: "Всего",
        dataIndex: "total",
        key: "total",
        sorter: (a, b) => a.total - b.total,
        width: 100,
      },
      {
        title: "Доля",
        dataIndex: "absent_rate",
        key: "absent_rate",
        sorter: (a, b) => a.absent_rate - b.absent_rate,
        render: (v) => {
          const p = clamp01(v);
          const band = riskBand(p);
          return (
            <Space size={10}>
              <Tag color={band.color}>{pct(p)}%</Tag>
              <div style={{ width: 90 }}>
                <Progress
                  percent={Math.round(p * 100)}
                  size="small"
                  status="active"
                  strokeColor={{ from: band.from, to: band.to }}
                  showInfo={false}
                />
              </div>
            </Space>
          );
        },
        width: 210,
      },
    ];
  }, []);

  const riskColumns = useMemo<ColumnsType<AnalyticsRiskRow>>(() => {
    const cols: ColumnsType<AnalyticsRiskRow> = [];

    if (role !== "student") {
      cols.push({
        title: "Студент",
        dataIndex: "student_name",
        key: "student_name",
        render: (v) => (
          <Tooltip title={v}>
            <Text strong ellipsis style={{ maxWidth: 220, display: "inline-block" }}>
              {v}
            </Text>
          </Tooltip>
        ),
        width: 220,
      });
    }

    cols.push(
      {
        title: "Курс",
        dataIndex: "course_name",
        key: "course_name",
        render: (v) => (
          <Tooltip title={v}>
            <Text ellipsis style={{ maxWidth: 340, display: "inline-block" }}>
              {v}
            </Text>
          </Tooltip>
        ),
        width: 340,
      },
      {
        title: "Риск пропуска",
        dataIndex: "risk_absent_next",
        key: "risk_absent_next",
        sorter: (a, b) => a.risk_absent_next - b.risk_absent_next,
        defaultSortOrder: "descend",
        render: (v: number, row) => {
          const band = riskBand(v);
          const modelIsMl = row.model === "logistic_regression";
          return (
            <Space direction="vertical" size={6} style={{ width: "100%" }}>
              <Space size={8} wrap>
                <Tag color={band.color}>{band.tag}</Tag>
                <Text strong>{pct(v)}%</Text>
                <Tag color={modelIsMl ? "purple" : "default"} icon={<ExperimentOutlined />}>
                  {modelIsMl ? "ML" : "Fallback"}
                </Tag>
                <Tag color="cyan">
                  данных: <Text strong>{row.total_records}</Text>
                </Tag>
              </Space>
              <Progress
                percent={Math.round(clamp01(v) * 100)}
                size="small"
                status="active"
                strokeColor={{ from: band.from, to: band.to }}
                trailColor="rgba(255,255,255,0.08)"
              />
            </Space>
          );
        },
        width: 360,
      },
      {
        title: "Последние 5",
        dataIndex: "recent_absent_rate",
        key: "recent_absent_rate",
        sorter: (a, b) => a.recent_absent_rate - b.recent_absent_rate,
        render: (v: number, row) => {
          const p = clamp01(v);
          const band = riskBand(p);
          return (
            <Space size={8} wrap>
              <Tag color={band.color}>{pct(p)}%</Tag>
              <Text type="secondary">окно: {row.window_size}</Text>
            </Space>
          );
        },
        width: 190,
      },
      {
        title: "Серия",
        dataIndex: "absent_streak",
        key: "absent_streak",
        sorter: (a, b) => a.absent_streak - b.absent_streak,
        render: (v: number) => (v > 0 ? <Tag color="volcano">{v}</Tag> : <Tag color="green">0</Tag>),
        width: 110,
      }
    );

    return cols;
  }, [role]);

  const scopeTag = useMemo(() => {
    if (!overview) return null;
    const s = (overview as any).scope as string | undefined;
    if (s === "overall") return <Tag color="blue">Общая аналитика</Tag>;
    return <Tag color="purple">Личная аналитика</Tag>;
  }, [overview]);

  return (
    <div className="page-wrap">
      <div className="page-head">
        <div className="page-head-left">
          <Title level={2} style={{ margin: 0 }}>
            Аналитика
          </Title>
          <Space size={10} wrap>
            <Text type="secondary">
              Роль: <Text strong>{roleLabel(role)}</Text>
            </Text>
            {scopeTag}
            {risk ? (
              <Space size={8}>
                <Tag color={risk.trained ? "purple" : "default"}>{risk.trained ? "LogReg (обучено)" : "Fallback (мало данных)"}</Tag>
                <Text type="secondary">
                  samples: <Text strong>{risk.training_samples}</Text>
                </Text>
              </Space>
            ) : null}
          </Space>
        </div>

        <div className="page-head-right">
          <Button icon={<ReloadOutlined />} onClick={load} loading={loading}>
            Обновить
          </Button>
        </div>
      </div>

      <Card className="card-surface" bordered={false} style={{ ...chartCardStyle(CHART_COLORS.blue) }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} lg={8}>
            <Select
              allowClear
              style={{ width: "100%" }}
              placeholder="Курс (фильтр)"
              value={courseId}
              onChange={(v) => setCourseId(v)}
              options={courseOptions.map((c) => ({ value: c.id, label: c.name }))}
            />
          </Col>

          <Col xs={24} lg={10}>
            <RangePicker
              style={{ width: "100%" }}
              value={dateRange as any}
              onChange={(v) => setDateRange(v ? [v[0]!, v[1]!] : null)}
              allowEmpty={[true, true]}
            />
          </Col>

          <Col xs={24} lg={6}>
            {isAdminOrTeacher ? (
              <Segmented
                style={{ width: "100%" }}
                options={[
                  { label: "Общая", value: "overall" },
                  { label: "Личная", value: "personal" },
                ]}
                value={scopeUi}
                onChange={(v) => setScopeUi(v as ScopeUi)}
              />
            ) : (
              <Tag color="purple" style={{ width: "100%", textAlign: "center", padding: "6px 10px", borderRadius: 10 }}>
                Личная аналитика (студент)
              </Tag>
            )}
          </Col>
        </Row>
      </Card>

      <div style={{ height: 14 }} />

      {!overview ? (
        <Card className="card-surface" bordered={false}>
          <Empty description="Нет данных для отображения" />
        </Card>
      ) : (
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="card-surface" bordered={false} style={kpiStyle(CHART_COLORS.blue, CHART_COLORS.purple)}>
                <Statistic
                  title="Занятия"
                  value={summary?.lessons ?? 0}
                  prefix={<CalendarOutlined style={{ color: CHART_COLORS.blue }} />}
                  valueStyle={{ fontWeight: 700 }}
                />
                <Text type="secondary">Уроков в выбранном диапазоне</Text>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="card-surface" bordered={false} style={kpiStyle(CHART_COLORS.green, CHART_COLORS.cyan)}>
                <Statistic
                  title="Посещаемость"
                  value={pct(attendanceRate)}
                  suffix="%"
                  prefix={<CheckCircleOutlined style={{ color: CHART_COLORS.green }} />}
                  valueStyle={{ fontWeight: 700 }}
                />
                <div style={{ marginTop: 10 }}>
                  <Progress
                    percent={Math.round(attendanceRate * 100)}
                    status="active"
                    showInfo={false}
                    strokeColor={{ from: CHART_COLORS.cyan, to: CHART_COLORS.green }}
                    trailColor="rgba(255,255,255,0.08)"
                  />
                </div>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="card-surface" bordered={false} style={kpiStyle(CHART_COLORS.orange, CHART_COLORS.volcano)}>
                <Statistic
                  title="Отметок посещаемости"
                  value={summary?.attendance_total ?? 0}
                  prefix={<ThunderboltOutlined style={{ color: CHART_COLORS.orange }} />}
                  valueStyle={{ fontWeight: 700 }}
                />
                <Text type="secondary">Всего записей в выборке</Text>
              </Card>
            </Col>

            <Col xs={24} sm={12} lg={6}>
              <Card className="card-surface" bordered={false} style={kpiStyle(CHART_COLORS.magenta, CHART_COLORS.purple)}>
                <Statistic
                  title="Средняя оценка"
                  value={avgRating == null ? "—" : Number(avgRating.toFixed(2))}
                  prefix={<StarOutlined style={{ color: CHART_COLORS.magenta }} />}
                  valueStyle={{ fontWeight: 700 }}
                />
                <Space size={8} wrap style={{ marginTop: 6 }}>
                  <Tag color="purple" icon={<MessageOutlined />}>
                    фидбеков: {summary?.feedback_count ?? 0}
                  </Tag>
                </Space>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={14}>
              <Card className="card-surface" bordered={false} style={chartCardStyle(CHART_COLORS.cyan)} title="Динамика: посещаемость и количество отметок">
                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer>
                    <ComposedChart data={tsData}>
                      <defs>
                        <linearGradient id="attFill" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor={CHART_COLORS.cyan} stopOpacity={0.28} />
                          <stop offset="50%" stopColor={CHART_COLORS.blue} stopOpacity={0.18} />
                          <stop offset="100%" stopColor={CHART_COLORS.purple} stopOpacity={0.12} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" domain={[0, 100]} tickFormatter={(v) => `${v}`} />
                      <YAxis yAxisId="right" orientation="right" allowDecimals={false} />
                      <ReTooltip />
                      <Legend />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey="attendance_pct"
                        name="Посещаемость, %"
                        stroke={CHART_COLORS.cyan}
                        strokeWidth={2}
                        fill="url(#attFill)"
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="total"
                        name="Отметок, шт."
                        stroke={CHART_COLORS.purple}
                        strokeWidth={2}
                        dot={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>

            <Col xs={24} lg={10}>
              <Card className="card-surface" bordered={false} style={chartCardStyle(CHART_COLORS.magenta)} title="Распределение оценок (фидбек)">
                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer>
                    <BarChart data={ratingData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="rating" />
                      <YAxis allowDecimals={false} />
                      <ReTooltip />
                      <Legend />
                      <Bar dataKey="count" name="Количество" radius={[10, 10, 6, 6]}>
                        {ratingData.map((x: any, i: number) => {
                          const r = Number(x?.rating ?? i + 1);
                          const idx = Math.max(1, Math.min(5, r)) - 1;
                          return <Cell key={`${i}-${r}`} fill={RATING_COLORS[idx]} />;
                        })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <Space size={8} wrap>
                  <Tag color="red">1</Tag>
                  <Tag color="orange">2</Tag>
                  <Tag color="gold">3</Tag>
                  <Tag color="green">4</Tag>
                  <Tag color="blue">5</Tag>
                </Space>
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Card
                className="card-surface"
                bordered={false}
                style={chartCardStyle(CHART_COLORS.purple)}
                title={
                  <Space>
                    <ExperimentOutlined />
                    <span>Прогноз риска пропуска следующего занятия (ML)</span>
                  </Space>
                }
                extra={
                  risk ? (
                    <Space size={8} wrap>
                      <Tag color={risk.trained ? "purple" : "default"}>{risk.trained ? "LogReg" : "Fallback"}</Tag>
                      <Tag color="cyan">k=5</Tag>
                      <Tag color="geekblue">страница: 5</Tag>
                    </Space>
                  ) : null
                }
              >
                
                <div style={{ height: 12 }} />

                <Table
                  rowKey={(r) => `${(r as any).student_id}-${(r as any).course_id}`}
                  columns={riskColumns}
                  dataSource={risk?.rows ?? []}
                  loading={loading}
                  size="small"
                  tableLayout="fixed"
                  pagination={{ pageSize: 5, showSizeChanger: false, showQuickJumper: true }}
                />
              </Card>
            </Col>
          </Row>

          {isAdminOrTeacher && (overview as any).scope === "overall" ? (
            <Row gutter={[16, 16]}>
              <Col xs={24}>
                <Card
                  className="card-surface"
                  bordered={false}
                  style={chartCardStyle(CHART_COLORS.orange)}
                  title={
                    <Space>
                      <TrophyOutlined />
                      <span>Топ по пропускам</span>
                    </Space>
                  }
                  extra={<Tag color="volcano">по выбранному фильтру</Tag>}
                >
                  <Table
                    rowKey={(r) => String((r as any).student_id)}
                    columns={topAbsentColumns}
                    dataSource={(overview as any).top_absent_students}
                    size="small"
                    pagination={{ pageSize: 5, showSizeChanger: false }}
                  />
                </Card>
              </Col>
            </Row>
          ) : null}

          <Row gutter={[16, 16]}>
            <Col xs={24}>
              <Card className="card-surface" bordered={false} style={chartCardStyle(CHART_COLORS.blue)} title="Сводка по курсам">
                <Table<AnalyticsCourseSummaryRow>
                  rowKey={(r) => String((r as any).course_id)}
                  size="small"
                  pagination={{ pageSize: 10 }}
                  dataSource={(overview as any).course_summary}
                  columns={[
                    {
                      title: "Курс",
                      dataIndex: "course_name",
                      key: "course_name",
                      render: (v) => (
                        <Tooltip title={v}>
                          <Text strong ellipsis style={{ maxWidth: 520, display: "inline-block" }}>
                            {v}
                          </Text>
                        </Tooltip>
                      ),
                    },
                    {
                      title: "Занятий",
                      dataIndex: "lessons",
                      key: "lessons",
                      sorter: (a: any, b: any) => a.lessons - b.lessons,
                      width: 110,
                    },
                    {
                      title: "Посещаемость",
                      dataIndex: "attendance_rate",
                      key: "attendance_rate",
                      sorter: (a: any, b: any) => a.attendance_rate - b.attendance_rate,
                      render: (v: number) => {
                        const p = clamp01(v);
                        const band = riskBand(1 - p);
                        return (
                          <Space size={10}>
                            <Tag color={p >= 0.8 ? "green" : p >= 0.65 ? "cyan" : p >= 0.5 ? "gold" : "volcano"}>{pct(p)}%</Tag>
                            <div style={{ width: 90 }}>
                              <Progress
                                percent={Math.round(p * 100)}
                                size="small"
                                status="active"
                                strokeColor={{ from: band.to, to: band.from }}
                                showInfo={false}
                              />
                            </div>
                          </Space>
                        );
                      },
                      width: 240,
                    },
                    {
                      title: "Средняя оценка",
                      dataIndex: "feedback_avg",
                      key: "feedback_avg",
                      sorter: (a: any, b: any) => ((a.feedback_avg || 0) as number) - ((b.feedback_avg || 0) as number),
                      render: (v: any) => {
                        if (v == null) return <Text type="secondary">—</Text>;
                        const x = Number(v);
                        const color = x >= 4.6 ? "green" : x >= 4.2 ? "cyan" : x >= 3.7 ? "gold" : "volcano";
                        return <Tag color={color}>{x.toFixed(2)}</Tag>;
                      },
                      width: 170,
                    },
                    {
                      title: "Фидбеков",
                      dataIndex: "feedback_count",
                      key: "feedback_count",
                      sorter: (a: any, b: any) => a.feedback_count - b.feedback_count,
                      width: 120,
                    },
                  ]}
                />
              </Card>
            </Col>
          </Row>
        </Space>
      )}
    </div>
  );
}
