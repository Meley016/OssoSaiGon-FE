// src/api/fetchClient.js
const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

async function fetchClient(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const config = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  if (options.body instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  try {
    const response = await fetch(url, config);

    if (response.status === 401) {
      console.warn("[fetchClient] 401 → Chuyển hướng login");
      window.location.href = "/login";
      return;
    }

    let data;
    try {
      data = await response.json();
    } catch (parseErr) {
      console.error("[fetchClient] Không parse được JSON:", parseErr);
      throw { error: "Server trả về dữ liệu không hợp lệ" };
    }

    if (!response.ok) {
      console.warn(`[fetchClient] ${response.status} ${endpoint}:`, data);
      throw data;
    }

    return data;
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      console.error("[fetchClient] Lỗi mạng:", err);
      throw { error: "Không thể kết nối đến server. Kiểm tra mạng!" };
    }
    throw err.error ? { error: err.error } : err;
  }
}

export default fetchClient;