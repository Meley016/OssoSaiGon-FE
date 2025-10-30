import axios from "axios";

const axiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/auth`,
  withCredentials: true, // gửi cookie tự động
  headers: {
    "Content-Type": "application/json"
  }
});

// ✅ Interceptor xử lý response lỗi gọn hơn
axiosClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error?.response?.data) {
      return Promise.reject(error.response.data);
    }
    return Promise.reject({ error: "Lỗi kết nối server" });
  }
);

export default axiosClient;
