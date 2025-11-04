import { AnimatePresence, motion as Motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import SearchProductCard from "./SearchProductCard";

export default function SearchDropdown({ open }) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Focus input khi mở
  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);

  // Debounce search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        const backend = import.meta.env.VITE_BACKEND_URL;
        const res = await fetch(`${backend}/api/products/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(data);
      } catch (err) {
        console.error("Lỗi tìm kiếm:", err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [query]);

  return (
    <AnimatePresence>
      {open && (
        <Motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="w-full bg-white shadow-md border-t border-gray-200"
            >
          <div className="max-w-[80%] mx-auto px-4 py-4">
            {/* Ô nhập */}
            <div className="flex items-center gap-2 mb-4">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search.placeholder") || "Tìm kiếm sản phẩm..."}
                className="w-full border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-gray-400 outline-none"
              />
            </div>

            {/* Kết quả */}
            {loading && <p className="text-gray-500 text-sm">Đang tìm kiếm...</p>}

            {!loading && query && results.length === 0 && (
              <p className="text-gray-500 text-sm">Không tìm thấy sản phẩm nào.</p>
            )}

            {!loading && results.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {results.map((item) => (
                  <SearchProductCard
                    key={item._id}
                    item={item}
                    onClick={() => (window.location.href = `/product/${item._id}`)}
                    />
                ))}
              </div>
            )}
          </div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}
