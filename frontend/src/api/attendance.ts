// import api from "./client";

// export type AttendanceStatus = "present" | "absent" | "late" | "excused";

// export interface AttendanceRecord {
//   id: number;
//   lesson_id: number;
//   student_id: number;
//   status: AttendanceStatus;
//   comment?: string | null;
//   created_at: string;
//   updated_at: string;
// }

// export interface AttendanceCreate {
//   lesson_id: number;
//   student_id: number;
//   status?: AttendanceStatus;
//   comment?: string | null;
// }

// export interface AttendanceUpdate {
//   status?: AttendanceStatus;
//   comment?: string | null;
// }

// export async function getAttendance(params?: {
//   lesson_id?: number;
//   student_id?: number;
//   course_id?: number;
//   from_date?: string;
//   to_date?: string;
// }): Promise<AttendanceRecord[]> {
//   const response = await api.get<AttendanceRecord[]>("/attendance", {
//     params,
//   });
//   return response.data;
// }

// export async function getAttendanceRecord(
//   id: number
// ): Promise<AttendanceRecord> {
//   const response = await api.get<AttendanceRecord>(`/attendance/${id}`);
//   return response.data;
// }

// export async function createAttendance(
//   payload: AttendanceCreate
// ): Promise<AttendanceRecord> {
//   const response = await api.post<AttendanceRecord>("/attendance", payload);
//   return response.data;
// }

// export async function updateAttendance(
//   id: number,
//   payload: AttendanceUpdate
// ): Promise<AttendanceRecord> {
//   const response = await api.patch<AttendanceRecord>(
//     `/attendance/${id}`,
//     payload
//   );
//   return response.data;
// }

// export async function deleteAttendance(id: number): Promise<void> {
//   await api.delete(`/attendance/${id}`);
// }

import api from "./client";

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceRecord {
  id: number;
  lesson_id: number;
  student_id: number;
  status: AttendanceStatus;
  comment?: string | null;
  created_at: string;
  updated_at: string;

  // новые поля, которые приходят с бэка
  student_name?: string | null;  // полное ФИО студента
  course_name?: string | null;   // название курса
  lesson_date?: string | null;   // дата занятия (строка, например "2025-12-10")
}

export interface AttendanceCreate {
  lesson_id: number;
  student_id: number;
  status?: AttendanceStatus;
  comment?: string | null;
}

export interface AttendanceUpdate {
  status?: AttendanceStatus;
  comment?: string | null;
}

export async function getAttendance(params?: {
  lesson_id?: number;
  student_id?: number;
  course_id?: number;
  from_date?: string;
  to_date?: string;
}): Promise<AttendanceRecord[]> {
  const response = await api.get<AttendanceRecord[]>("/attendance", {
    params,
  });
  return response.data;
}

export async function getAttendanceRecord(
  id: number
): Promise<AttendanceRecord> {
  const response = await api.get<AttendanceRecord>(`/attendance/${id}`);
  return response.data;
}

export async function createAttendance(
  payload: AttendanceCreate
): Promise<AttendanceRecord> {
  const response = await api.post<AttendanceRecord>("/attendance", payload);
  return response.data;
}

export async function updateAttendance(
  id: number,
  payload: AttendanceUpdate
): Promise<AttendanceRecord> {
  const response = await api.patch<AttendanceRecord>(
    `/attendance/${id}`,
    payload
  );
  return response.data;
}

export async function deleteAttendance(id: number): Promise<void> {
  await api.delete(`/attendance/${id}`);
}
