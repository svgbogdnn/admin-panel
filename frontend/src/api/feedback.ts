import api from "./client";

export interface Feedback {
  id: number;
  lesson_id: number;
  student_id: number;
  rating: number;
  comment?: string | null;
  is_hidden: boolean;
  created_at: string;
}

export interface FeedbackCreate {
  lesson_id: number;
  student_id: number;
  rating: number;
  comment?: string | null;
  is_hidden?: boolean;
}

export interface FeedbackUpdate {
  rating?: number;
  comment?: string | null;
  is_hidden?: boolean;
}

export async function getFeedback(params?: {
  lesson_id?: number;
  course_id?: number;
  include_hidden?: boolean;
}): Promise<Feedback[]> {
  const response = await api.get<Feedback[]>("/feedback", { params });
  return response.data;
}

export async function getFeedbackItem(id: number): Promise<Feedback> {
  const response = await api.get<Feedback>(`/feedback/${id}`);
  return response.data;
}

export async function createFeedbackItem(
  payload: FeedbackCreate
): Promise<Feedback> {
  const response = await api.post<Feedback>("/feedback", payload);
  return response.data;
}

export async function updateFeedbackItem(
  id: number,
  payload: FeedbackUpdate
): Promise<Feedback> {
  const response = await api.patch<Feedback>(`/feedback/${id}`, payload);
  return response.data;
}

export async function deleteFeedbackItem(id: number): Promise<void> {
  await api.delete(`/feedback/${id}`);
}
