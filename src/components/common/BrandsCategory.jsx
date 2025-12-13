import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import ProductLargeCard from "../common/ProductLargeCard.jsx";

export default function BrandsCategory() {
  const API = import.meta.env.VITE_BACKEND_URL;
  const { t } = useTranslation();

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 54;

  /* ================= FETCH PAGINATED PRODUCTS ================= */
  useEffect(() => {
    let cancelled = false;

    const fetchPage = async () => {
      if (!hasMore) return;

      try {
        setLoading(true);

        const res = await fetch(
          `${API}/api/products?page=${page}&limit=${LIMIT}`
        );
        const json = await res.json();
        const items = json?.data || [];

        const withBrand = items.filter((p) => p.brand);

        if (!cancelled) {
          setProducts((prev) => [...prev, ...withBrand]);

          setBrands((prev) => [
            ...new Set([...prev, ...withBrand.map((p) => p.brand)]),
          ]);

          if (items.length < LIMIT) {
            setHasMore(false);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchPage();

    return () => {
      cancelled = true;
    };
  }, [page, hasMore, API]);

  /* ================= FILTER ================= */
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchName = p.name
        .toLowerCase()
        .includes(keyword.toLowerCase());

      const matchBrand =
        selectedBrand === "all" || p.brand === selectedBrand;

      return matchName && matchBrand;
    });
  }, [products, keyword, selectedBrand]);

  return (
    <div className="max-w- mx-auto px-4 py-6">
      {/* ================= HEADER ================= */}
      <h1 className="text-3xl font-bold mb-8 uppercase">
        BRANDS
      </h1>

      {/* ================= FILTER BAR ================= */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 border-b pb-2 border-gray-300">
        {/* SEARCH */}
        <input
          type="text"
          placeholder={t("search")}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="border px-3 py-2 text-sm w-full sm:w-1/2"
        />

        {/* BRAND SELECT */}
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="border px-3 py-2 text-sm w-full sm:w-1/4"
        >
          <option value="all">ALL BRANDS</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* ================= CONTENT ================= */}
      {filteredProducts.length === 0 && !loading ? (
        <p className="text-sm text-gray-500">
          {t("no_products")}
        </p>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((item) => (
              <ProductLargeCard
                key={item._id}
                item={item}
                onClick={() =>
                  (window.location.href = `/product/${item._id}`)
                }
              />
            ))}
          </div>

          {/* LOADING INDICATOR */}
          {loading && (
            <p className="text-sm text-gray-500 mt-4">
              {t("loading")}...
            </p>
          )}
        </>
      )}

      {/* ================= LOAD MORE ================= */}
      {hasMore && !loading && (
        <div className="flex justify-center mt-8">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="px-6 py-2 border text-sm hover:bg-gray-100 transition"
          >
            ...
          </button>
        </div>
      )}
    </div>
  );
}
