import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/api",
});

// Interceptor para JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Upload de FormData
export const uploadApi = (url, formData) =>
  api.post(url, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  });

export default api;
