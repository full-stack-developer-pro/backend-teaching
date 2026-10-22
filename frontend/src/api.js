import axios from "axios";

// Backend API Base URL (Express server running on port 5000)
export const BASE_URL = "http://localhost:5000";

// Central Axios instance
const api = axios.create({
  baseURL: `${BASE_URL}/api`,
});

// Request Interceptor: Automatically attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
