import axios from "axios";

const api = axios.create({
  baseURL: "https://nearly-backend-production-48b3.up.railway.app/api",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("nearly_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && window.location.pathname !== "/login") {
      localStorage.removeItem("nearly_token");
      localStorage.removeItem("nearly_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export default api;
