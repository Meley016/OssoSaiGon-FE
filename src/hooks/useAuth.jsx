import { useEffect, useState } from "react";

let cachedUser = null;

export default function useAuth() {
  const [user, setUser] = useState(cachedUser);
  const [loading, setLoading] = useState(!cachedUser);

  useEffect(() => {
    if (cachedUser) return;

    const check = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/me`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data?.isAuthenticated) {
          setUser(data.user);
          cachedUser = data.user; // ✅ lưu cache
        }
      } catch (err) {
        console.error("Auth check failed:", err);
      } finally {
        setLoading(false);
      }
    };

    check();
  }, []);

  return { user, loading, isAuthenticated: !!user };
}
