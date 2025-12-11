import axios from "axios";

export const API_BASE_URL =
    import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/api/v1";

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
    }
    return config;
});

export default api;
