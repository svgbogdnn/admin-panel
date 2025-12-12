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

export interface CourseCreatePayload {
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  teacher_id?: number;
}

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

export async function getCourses(params?: {
  is_active?: boolean;
}): Promise<Course[]> {
  const query = new URLSearchParams();
  if (params?.is_active !== undefined) {
    query.append("is_active", String(params.is_active));
  }

  const qs = query.toString();
  const res = await fetch(`${API_URL}/courses${qs ? `?${qs}` : ""}`, {
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
    throw new Error("Не удалось загрузить курс");
  }

  return res.json();
}

export async function createCourse(payload: CourseCreatePayload): Promise<Course> {
  const res = await fetch(`${API_URL}/courses`, {
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
