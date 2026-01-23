import axios from "axios";

console.log("API =", process.env.REACT_APP_API_URL);

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true
});

export default api;
