import axios from "axios";

const api = axios.create({
  baseURL: (import.meta.env.VITE_BASE_URL || "http://localhost:3000") + "/api",
});

let authTokenGetter = null;

export const setAuthTokenGetter = (getter) => {
  authTokenGetter = getter;
};

api.interceptors.request.use(async (config) => {
  if (authTokenGetter) {
    try {
      const token = await authTokenGetter();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // ignore token errors
    }
  }
  return config;
});

export default api;
