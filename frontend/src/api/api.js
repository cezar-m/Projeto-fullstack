import axios from "axios";

// Garante que a variável existe
const BASE_URL = process.env.REACT_APP_API_URL;
if (!BASE_URL) console.error("⚠️ REACT_APP_API_URL não está definido!");

const api = axios.create({
  baseURL: BASE_URL + "/api"
});

export default api;
