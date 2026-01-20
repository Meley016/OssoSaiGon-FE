import axios from "axios";
import { loadingManager } from "./loadingManager";

const http = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true,
});

http.interceptors.request.use(
  (config) => {
    loadingManager.start();
    return config;
  },
  (error) => {
    loadingManager.stop();
    return Promise.reject(error);
  }
);

http.interceptors.response.use(
  (res) => {
    loadingManager.stop();
    return res;
  },
  (error) => {
    loadingManager.stop();
    return Promise.reject(error);
  }
);

export default http;
