import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL;

if (!BASE_URL) {
  console.error("❌ REACT_APP_API_URL não definida");
}

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
