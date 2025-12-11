// import api from "./client";

// export interface Course {
//   id: number;
//   name: string;
//   description?: string | null;
//   start_date?: string | null;
//   end_date?: string | null;
//   is_active: boolean;
//   teacher_id?: number | null;
//   created_at: string;
//   updated_at: string;
// }

// export interface CourseCreate {
//   name: string;
//   description?: string | null;
//   start_date?: string | null;
//   end_date?: string | null;
//   is_active?: boolean;
//   teacher_id?: number | null;
// }

// export interface CourseUpdate {
//   name?: string;
//   description?: string | null;
//   start_date?: string | null;
//   end_date?: string | null;
//   is_active?: boolean;
//   teacher_id?: number | null;
// }

// export async function getCourses(params?: {
//   is_active?: boolean;
// }): Promise<Course[]> {
//   const response = await api.get<Course[]>("/courses", { params });
//   return response.data;
// }

// export async function getCourse(id: number): Promise<Course> {
//   const response = await api.get<Course>(`/courses/${id}`);
//   return response.data;
// }

// export async function createCourse(payload: CourseCreate): Promise<Course> {
//   const response = await api.post<Course>("/courses", payload);
//   return response.data;
// }

// export async function updateCourse(
//   id: number,
//   payload: CourseUpdate
// ): Promise<Course> {
//   const response = await api.patch<Course>(`/courses/${id}`, payload);
//   return response.data;
// }

// export async function deleteCourse(id: number): Promise<void> {
//   await api.delete(`/courses/${id}`);
// }

// frontend/src/api/courses.ts

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

// Тело для создания
export interface CourseCreatePayload {
  name: string;
  description?: string;
  start_date?: string; // формат "YYYY-MM-DD"
  end_date?: string;
  is_active?: boolean;
  teacher_id?: number;
}

// Тело для обновления (все поля опциональны)
export type CourseUpdatePayload = Partial<CourseCreatePayload>;

const API_URL =
  (import.meta as any).env?.VITE_API_URL ?? "http://localhost:8000/api/v1";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("access_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getCourses(): Promise<Course[]> {
  const res = await fetch(`${API_URL}/courses/`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Не удалось загрузить курсы");
  }

  return res.json();
}

export async function getCourse(id: number): Promise<Course> {
  const res = await fetch(`${API_URL}/courses/${id}`, {
    method: "GET",
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error("Курс не найден");
  }

  return res.json();
}

export async function createCourse(
  payload: CourseCreatePayload,
): Promise<Course> {
  const res = await fetch(`${API_URL}/courses/`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Не удалось создать курс");
  }

  return res.json();
}

export async function updateCourse(
  id: number,
  payload: CourseUpdatePayload,
): Promise<Course> {
  const res = await fetch(`${API_URL}/courses/${id}`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Не удалось обновить курс");
  }

  return res.json();
}
