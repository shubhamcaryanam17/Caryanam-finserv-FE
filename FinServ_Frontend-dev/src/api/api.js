import axios from "axios";
import { API_BASE_URL } from "../config/apiBase";

const API = axios.create({
  baseURL: `${API_BASE_URL}/api`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Login lives under /auth, not /api */
export const loginUser = (data) =>
  axios.post(`${API_BASE_URL}/auth/login`, data);

export default API;