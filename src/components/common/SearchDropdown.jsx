import { AnimatePresence, motion as Motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import SearchProductCard from "./SearchProductCard";

export default function SearchDropdown({ open, onClose  }) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus();
  }, [open]);
  const location = useLocation();

  useEffect(() => {
    if (open) onClose?.();
  }, [location.pathname]);
  /* Suggestion search */
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    const delay = setTimeout(async () => {
      try {
        setLoading(true);
        const backend = import.meta.env.VITE_BACKEND_URL;
        const res = await fetch(
          `${backend}/api/products/search?q=${encodeURIComponent(query)}&limit=10`
        );
        const data = await res.json();
        setResults(data || []);
      } catch (err) {
        console.error("Suggestion error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim().length < 2) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
    onClose?.();
  };

  return (
    <AnimatePresence>
      {open && (
        <Motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="w-full bg-white shadow-md border-t"
        >
          <div className="max-w-[80%] mx-auto px-4 py-4">
            <form onSubmit={handleSubmit} className="mb-3">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("search.placeholder")}
                className="w-full border border-black px-4 py-2 outline-none"
              />
            </form>

            {query.trim().length < 2 && (
              <p className="text-xs text-gray-500">
                {t("search.minChars")}
              </p>
            )}

            {loading && (
              <p className="text-xs text-gray-500">
                {t("search.suggestionLoading")}
              </p>
            )}

            {!loading && query.trim().length >= 2 && results.length === 0 && (
              <p className="text-xs text-gray-500">
                {t("search.noSuggestion")}
              </p>
            )}

            {!loading && results.length > 0 && (
              <>
                <p className="text-xs text-gray-500 mb-2">
                  {t("search.suggestionFor", { query })}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {results.map((item) => (
                    <SearchProductCard
                      key={item._id}
                      item={item}
                      onClick={() => {
                        navigate(`/product/${item._id}`);
                        onClose?.(); // 👈 ĐÓNG
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={() =>{
                    navigate(`/search?q=${encodeURIComponent(query)}`);
                    onClose?.();
                  }}
                  className="mt-4 text-sm underline hover:text-black"
                >
                  {t("search.viewAll", { query })}
                </button>
              </>
            )}
          </div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}
