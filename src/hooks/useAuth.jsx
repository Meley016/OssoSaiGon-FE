import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient"; // ✅ thêm dòng này

let cachedUser = null;

export default function useAuth() {
  const [user, setUser] = useState(cachedUser);
  const [loading, setLoading] = useState(!cachedUser);

  useEffect(() => {
    if (cachedUser) return;

    const check = async () => {
      try {
        // ✅ chỉ cần relative path, axiosClient đã có baseURL
        const data = await axiosClient.get("/me");
        if (data?.isAuthenticated) {
          setUser(data.user);
          cachedUser = data.user;
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
