import api from "./client";

export interface Lesson {
  id: number;
  course_id: number;
  topic: string;
  date: string;
  room?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  created_at: string;
}

export interface LessonCreate {
  course_id: number;
  topic: string;
  date: string;
  room?: string | null;
  start_time?: string | null;
  end_time?: string | null;
}

export interface LessonUpdate {
  topic?: string;
  date?: string;
  room?: string | null;
  start_time?: string | null;
  end_time?: string | null;
}

export async function getLessons(params?: {
  course_id?: number;
  from_date?: string;
  to_date?: string;
}): Promise<Lesson[]> {
  const response = await api.get<Lesson[]>("/lessons", { params });
  return response.data;
}

export async function getLesson(id: number): Promise<Lesson> {
  const response = await api.get<Lesson>(`/lessons/${id}`);
  return response.data;
}

export async function createLesson(payload: LessonCreate): Promise<Lesson> {
  const response = await api.post<Lesson>("/lessons", payload);
  return response.data;
}

export async function updateLesson(
  id: number,
  payload: LessonUpdate
): Promise<Lesson> {
  const response = await api.patch<Lesson>(`/lessons/${id}`, payload);
  return response.data;
}

export async function deleteLesson(id: number): Promise<void> {
  await api.delete(`/lessons/${id}`);
}
