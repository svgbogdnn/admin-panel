import api from "./client";

export interface Course {
  id: number;
  name: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active: boolean;
  teacher_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface CourseCreate {
  name: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
  teacher_id?: number | null;
}

export interface CourseUpdate {
  name?: string;
  description?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
  teacher_id?: number | null;
}

export async function getCourses(params?: {
  is_active?: boolean;
}): Promise<Course[]> {
  const response = await api.get<Course[]>("/courses", { params });
  return response.data;
}

export async function getCourse(id: number): Promise<Course> {
  const response = await api.get<Course>(`/courses/${id}`);
  return response.data;
}

export async function createCourse(payload: CourseCreate): Promise<Course> {
  const response = await api.post<Course>("/courses", payload);
  return response.data;
}

export async function updateCourse(
  id: number,
  payload: CourseUpdate
): Promise<Course> {
  const response = await api.patch<Course>(`/courses/${id}`, payload);
  return response.data;
}

export async function deleteCourse(id: number): Promise<void> {
  await api.delete(`/courses/${id}`);
}
