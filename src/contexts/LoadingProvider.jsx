import { useEffect, useState } from "react";
import GlobalLoading from "../components/common/Loading";
import { loadingManager } from "../services/loadingManager";
import { LoadingContext } from "./LoadingContext";

export default function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadingManager.bind(setLoading);
  }, []);

  return (
    <LoadingContext.Provider value={{ loading }}>
      {children}
      {loading && <GlobalLoading message="Đang tải dữ liệu..." />}
    </LoadingContext.Provider>
  );
}
