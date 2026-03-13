import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/api",
  headers: {
    "Content-Type": "multipart/form-data", // importante para upload de imagem
  },
});

// Adiciona token se estiver usando autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // ajuste se usa outro storage
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
