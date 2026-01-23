import axios from "axios";

console.log("API =", import.meta.env.REACT_APP_API_URL);

const api = axios.create({
  baseURL: import.meta.env.REACT_APP_API_URL,
  withCredentials: true
});

export default api;
