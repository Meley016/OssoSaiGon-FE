const API_URL = `${import.meta.env.VITE_BACKEND_URL}/api`;

// ===== REFRESH LOCK (chống refresh trùng) =====
let isRefreshing = false;
let refreshPromise = null;

// ===== TOKEN HELPERS =====
export const getAccessToken = () => localStorage.getItem("accessToken");

export const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem("accessToken", token);
  } else {
    localStorage.removeItem("accessToken");
  }
};

// ===== CORE FETCH CLIENT =====
async function fetchClient(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  const token = getAccessToken();

  const config = {
    ...options,
    credentials: "include", // 🔥 Safari + refresh cookie
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
      refreshPromise = null;

      if (!refreshRes.ok) throw new Error("Refresh failed");

      const { accessToken } = await refreshRes.json();
      setAccessToken(accessToken);

      // 🔁 retry request với token mới
      const retryConfig = {
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${accessToken}`,
        },
      };

      response = await fetch(url, retryConfig);
    } catch {
      isRefreshing = false;
      refreshPromise = null;
      setAccessToken(null);
      throw { __AUTH_EXPIRED__: true };
    }
  }

  // ===== PARSE RESPONSE =====
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
