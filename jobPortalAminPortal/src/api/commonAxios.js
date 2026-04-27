// commonAxios.js
import axios from "axios";

const commonAxios = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // 👈 NO /admin
  withCredentials: true,
});

export default commonAxios;