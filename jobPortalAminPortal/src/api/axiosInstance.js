import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL + "/admin",
  withCredentials: true,
});

// Attach token to every request automatically
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto logout on 401
axiosInstance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("adminToken");
      window.location.href = "/admin/login";
    }
    return Promise.reject(err);
  },
);

export default axiosInstance;
