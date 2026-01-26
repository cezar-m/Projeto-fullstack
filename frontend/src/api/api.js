// src/api/api.js
import axios from "axios";

// REACT_APP_API_URL deve estar no .env
// Exemplo: REACT_APP_API_URL=https://projeto-fullstack-djir.onrender.com
const BASE_URL = process.env.REACT_APP_API_URL;

if (!BASE_URL) {
  console.error("❌ REACT_APP_API_URL não definida no .env");
}

const api = axios.create({
  baseURL: `${BASE_URL}/api`, // garante que vai para /api/... no backend
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
