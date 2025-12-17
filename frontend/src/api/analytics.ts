import api from "./client";

export type AnalyticsScope = "auto" | "overall" | "personal";

export interface AnalyticsParams {
  course_id?: number;
  from_date?: string;
  to_date?: string;
  scope?: AnalyticsScope;
}

export interface AnalyticsCourseOption {
  id: number;
  name: string;
}

export interface AnalyticsSummary {
  courses: number;
  lessons: number;
  attendance_total: number;
  attendance_attended: number;
  attendance_rate: number;
  feedback_count: number;
  feedback_avg: number | null;
}

export interface AnalyticsTimeseriesPoint {
  date: string;
  total: number;
  attended: number;
  attendance_rate: number;
}

export interface AnalyticsRatingBucket {
  rating: number;
  count: number;
}

export interface AnalyticsTopAbsentStudent {
  student_id: number;
  student_name: string;
  absent: number;
  total: number;
  absent_rate: number;
}

export interface AnalyticsCourseSummaryRow {
  course_id: number;
  course_name: string;
  lessons: number;
  attendance_rate: number;
  feedback_avg: number | null;
  feedback_count: number;
}

export interface AnalyticsOverview {
  role: "admin" | "teacher" | "student";
  scope: "overall" | "personal";
  courses: AnalyticsCourseOption[];
  summary: AnalyticsSummary;
  timeseries: AnalyticsTimeseriesPoint[];
  rating_distribution: AnalyticsRatingBucket[];
  top_absent_students: AnalyticsTopAbsentStudent[];
  course_summary: AnalyticsCourseSummaryRow[];
}

export async function getAnalyticsOverview(params: AnalyticsParams = {}): Promise<AnalyticsOverview> {
  const response = await api.get("/analytics/overview", { params });
  return response.data as AnalyticsOverview;
}
