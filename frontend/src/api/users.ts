import api from "./client";

export interface User {
  id: number;
  email: string;
  full_name?: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  birthday?: string | null;
  nationality?: string | null;
  study_course?: string | null;
  study_group?: string | null;
  phone?: string | null;
  social_links?: string | null;
}

export interface UserProfileUpdate {
  full_name?: string | null;
  birthday?: string | null;
  nationality?: string | null;
  study_course?: string | null;
  study_group?: string | null;
  phone?: string | null;
  social_links?: string | null;
}

export interface PasswordChangePayload {
  current_password: string;
  new_password: string;
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get<User>("/users/me");
  return response.data;
}

export async function updateCurrentUser(
  payload: UserProfileUpdate,
): Promise<User> {
  const response = await api.patch<User>("/users/me", payload);
  return response.data;
}

export async function changePassword(
  payload: PasswordChangePayload,
): Promise<void> {
  await api.post("/users/me/change-password", payload);
}
