import api from "./client";

export interface Token {
  access_token: string;
  token_type: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string | null;
  is_active?: boolean;
  is_superuser?: boolean;
}

export interface User {
  id: number;
  email: string;
  full_name?: string | null;
  is_active: boolean;
  is_superuser: boolean;
}

export function getStoredToken(): string | null {
  return localStorage.getItem("access_token");
}

export function clearToken(): void {
  localStorage.removeItem("access_token");
}

export async function login(data: LoginRequest): Promise<Token> {
  const response = await api.post<Token>("/login", data);
  localStorage.setItem("access_token", response.data.access_token);
  return response.data;
}

export async function registerUser(data: RegisterRequest): Promise<User> {
  const payload: RegisterRequest = {
    email: data.email,
    password: data.password,
    full_name: data.full_name ?? null,
    is_active: data.is_active ?? true,
    is_superuser: data.is_superuser ?? false,
  };
  const response = await api.post<User>("/register", payload);
  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get<User>("/me");
  return response.data;
}
