import axios from "axios";

const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/auth`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});
let accessToken = localStorage.getItem("accessToken");

// ===== SET TOKEN =====
export const setAccessToken = (token) => {
  accessToken = token;
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
};

// ===== REQUEST =====
axiosClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ===== AUTO REFRESH =====
axiosClient.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;

      try {
        const res = await axios.post(
          import.meta.env.VITE_BACKEND_URL + "/api/auth/refresh",
          {},
          { withCredentials: true },
        );

        setAccessToken(res.data.accessToken);
        original.headers.Authorization = `Bearer ${res.data.accessToken}`;

        return axiosClient(original);
      } catch {
        setAccessToken(null);

        // gắn cờ cho UI biết là auth chết
        return Promise.reject({
          ...err,
          __AUTH_EXPIRED__: true,
        });
      }
    }

    return Promise.reject(err);
  },
);
export default axiosClient;
