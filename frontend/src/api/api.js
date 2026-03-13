import axios from "axios";

// pega URL da API do .env ou usa localhost como fallback
const BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3000";

if (!process.env.REACT_APP_API_URL) {
  console.warn("⚠️ REACT_APP_API_URL não definida, usando localhost");
}

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// 🔐 Envia token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
