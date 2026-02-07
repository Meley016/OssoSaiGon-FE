import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "react-router-dom";
import SearchProductCard from "../components/common/SearchProductCard";
import { slugify } from "../utils/slugify.js";

export default function SearchPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const query = params.get("q") || "";
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) return;

    const fetchAll = async () => {
      try {
        setLoading(true);
        const backend = import.meta.env.VITE_BACKEND_URL;
        const res = await fetch(
          `${backend}/api/products/search?q=${encodeURIComponent(query)}`,
        );
        const data = await res.json();
        setProducts(data || []);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">
        {t("search.resultTitle", { query })}
      </h1>

      {loading && <p className="text-gray-500">{t("search.loading")}</p>}

      {!loading && products.length === 0 && (
        <p className="text-gray-500">{t("search.noResult")}</p>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {products.map((item) => (
            <SearchProductCard
              key={item.groupId}
              item={item}
              onClick={() => {
                const slug = slugify(item.name);
                navigate(`/product/${slug}-${item.groupId}`);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
