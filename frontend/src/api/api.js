import axios from "axios";

// Cria instância da API
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/api", // Base URL do seu backend
});

// Interceptor para adicionar token JWT automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // Ajuste Content-Type só se não for upload
    if (!config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Função auxiliar para enviar FormData (upload de arquivo)
 * Exemplo: upload de imagem de produto
 *
 * @param {string} url - endpoint da API
 * @param {FormData} formData - dados do upload
 */
export const uploadApi = async (url, formData) => {
  return api.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
    },
  });
};

export default api;
