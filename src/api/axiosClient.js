import axios from "axios";

const AUTH_API = `${import.meta.env.VITE_BACKEND_URL}/api/auth`;

const axiosClient = axios.create({
  baseURL: AUTH_API,
  withCredentials: true, // 🔥 Safari cần
  headers: {
    "Content-Type": "application/json",
  },
});

// ===== ACCESS TOKEN (memory + localStorage) =====
let accessToken = localStorage.getItem("accessToken");

// ===== REFRESH LOCK (chống refresh trùng) =====
let isRefreshing = false;
let refreshPromise = null;

// ===== SET TOKEN =====
export const setAccessToken = (token) => {
  accessToken = token;

  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
};

// 🔄 Sync token khi fetch refresh
window.addEventListener("access-token-updated", () => {
  accessToken = localStorage.getItem("accessToken");
});

// ===== REQUEST INTERCEPTOR =====
axiosClient.interceptors.request.use(
  (config) => {
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ===== RESPONSE INTERCEPTOR =====
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // ❌ Lỗi mạng / Safari CORS
    if (!error.response) {
      return Promise.reject(error);
    }

    // ===== ACCESS TOKEN HẾT =====
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        if (!isRefreshing) {
          isRefreshing = true;
          refreshPromise = axios.post(
            `${AUTH_API}/refresh`,
            {},
            { withCredentials: true },
          );
        }

        const refreshRes = await refreshPromise;
        isRefreshing = false;

        const newAccessToken = refreshRes.data.accessToken;
        setAccessToken(newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosClient(originalRequest);
      } catch {
        isRefreshing = false;
        setAccessToken(null);

        return Promise.reject({
          ...error,
          __AUTH_EXPIRED__: true,
        });
      }
    }

    return Promise.reject(error);
  },
);

export default axiosClient;
