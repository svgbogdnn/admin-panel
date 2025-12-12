import api from "./client";

export type ExportFormat = "csv" | "json";

export interface ExportParams {
  course_id?: number;
  student_id?: number;
  from_date?: string;
  to_date?: string;
  response_format: ExportFormat;
}

export async function exportAttendance(params: ExportParams): Promise<Blob> {
  const response = await api.get("/export/attendance", {
    params,
    responseType: "blob",
  });
  return response.data as Blob;
}
