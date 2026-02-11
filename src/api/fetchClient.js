const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

// ===== REFRESH LOCK (chung với axios) =====
let isRefreshing = false;
let refreshPromise = null;

async function fetchClient(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;

  const token = localStorage.getItem("accessToken");

  const config = {
    ...options,
    credentials: "include", // 🔥 Safari cần
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  };

  let response = await fetch(url, config);

  // ===== ACCESS TOKEN HẾT =====
  if (response.status === 401) {
    try {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });
      }

      const refreshRes = await refreshPromise;
      isRefreshing = false;

      if (!refreshRes.ok) throw new Error("Refresh failed");

      const refreshData = await refreshRes.json();

      localStorage.setItem("accessToken", refreshData.accessToken);

      // 🔄 báo cho axios sync token
      window.dispatchEvent(new Event("access-token-updated"));

      // retry request
      config.headers.Authorization = `Bearer ${refreshData.accessToken}`;
      response = await fetch(url, config);
    } catch {
      isRefreshing = false;
      throw { __AUTH_EXPIRED__: true };
    }
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw { error: "Server trả về dữ liệu không hợp lệ" };
  }

  if (!response.ok) {
    throw data;
  }

  return data;
}

export default fetchClient;
