import api from "./client";

export interface Feedback {
  id: number;
  lesson_id: number;
  student_id: number;
  rating: number;
  comment?: string | null;
  is_hidden: boolean;
  created_at: string;
  student_name?: string | null;
  course_name?: string | null;
  lesson_topic?: string | null;
  lesson_date?: string | null;
}

export interface FeedbackCreate {
  lesson_id: number;
  student_id?: number;
  rating: number;
  comment?: string | null;
  is_hidden?: boolean;
}

export interface FeedbackUpdate {
  rating?: number;
  comment?: string | null;
  is_hidden?: boolean;
}

export interface FeedbackQueryParams {
  include_hidden?: boolean;
}

export async function getFeedback(params?: FeedbackQueryParams): Promise<Feedback[]> {
  const response = await api.get("/feedback", { params });
  return response.data as Feedback[];
}

export async function createFeedbackItem(payload: FeedbackCreate): Promise<Feedback> {
  const response = await api.post("/feedback", payload);
  return response.data as Feedback;
}

export async function updateFeedbackItem(feedbackId: number, payload: FeedbackUpdate): Promise<Feedback> {
  const response = await api.patch(`/feedback/${feedbackId}`, payload);
  return response.data as Feedback;
}
