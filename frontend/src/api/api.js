import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL;

if (!BASE_URL) {
  console.error("❌ REACT_APP_API_URL não definida no .env");
}

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
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

