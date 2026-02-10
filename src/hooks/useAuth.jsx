import { useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";

let cachedUser = null;

export default function useAuth() {
  const [user, setUser] = useState(cachedUser);
  const [loading, setLoading] = useState(!cachedUser);

  const fetchMe = async () => {
    try {
      const res = await axiosClient.get("/me");
      const data = res.data;

      if (data?.isAuthenticated) {
        setUser(data.user);
        cachedUser = data.user;
      } else {
        setUser(null);
        cachedUser = null;
      }
    } catch {
      // refresh fail thật
      setUser(null);
      cachedUser = null;
    } finally {
      setLoading(false);
    }
  };

  // 🔹 LẦN ĐẦU LOAD APP
  useEffect(() => {
    if (!cachedUser) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, []);

  // 🔥 QUAN TRỌNG: sau khi refresh token
  useEffect(() => {
    const onAuthRefreshed = () => {
      fetchMe(); // 👈 reload lại user
    };

    window.addEventListener("auth-refreshed", onAuthRefreshed);
    return () => window.removeEventListener("auth-refreshed", onAuthRefreshed);
  }, []);

  return {
    user,
    loading,
    isAuthenticated: !!user,
  };
}
