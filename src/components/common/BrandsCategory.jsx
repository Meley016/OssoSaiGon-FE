import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import ProductLargeCard from "../common/ProductLargeCard.jsx";

export default function BrandsCategory() {
  const API = import.meta.env.VITE_BACKEND_URL;
  const { t } = useTranslation();

  /* ================= STATE ================= */
  const [brands, setBrands] = useState([]);
  const [brandsLoaded, setBrandsLoaded] = useState(false);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");

  // backend pagination
  const [fetchPage, setFetchPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // UI pagination
  const [uiPage, setUiPage] = useState(1);

  const FETCH_LIMIT = 54;
  const PER_PAGE = 54;


  const { brand } = useParams();

  /* ================= FETCH BRANDS (LUÔN TRƯỚC) ================= */
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch(`${API}/api/products/brands`);
        const data = await res.json();
        setBrands(data || []);
        setBrandsLoaded(true);
      } catch (err) {
        console.error("Fetch brands error", err);
      }
    };
    fetchBrands();
  }, [API]);
  
  useEffect(() => {
  if (brand) {
    setSelectedBrand(decodeURIComponent(brand));
  } else {
    setSelectedBrand("all");
  }
}, [brand]);

  /* ================= RESET KHI ĐỔI BRAND ================= */
  useEffect(() => {
    if (!brandsLoaded) return;

    setProducts([]);
    setFetchPage(1);
    setHasMore(true);
    setUiPage(1);
  }, [selectedBrand, brandsLoaded]);

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    if (!brandsLoaded || !hasMore) return;

    let cancelled = false;

    const fetchData = async () => {
      try {
        setLoading(true);

        const brandParam =
          selectedBrand !== "all"
            ? `&brand=${encodeURIComponent(selectedBrand)}`
            : "";

        const res = await fetch(
          `${API}/api/products?page=${fetchPage}&limit=${FETCH_LIMIT}${brandParam}`
        );

        const json = await res.json();
        const items = json?.data || [];

        if (!cancelled) {
          setProducts((prev) => [...prev, ...items]);

          if (items.length < FETCH_LIMIT) {
            setHasMore(false);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchData();
    return () => (cancelled = true);
  }, [brandsLoaded, fetchPage, selectedBrand, hasMore, API]);

  /* ================= FILTER (KEYWORD) ================= */
  const filteredProducts = useMemo(() => {
    return products.filter((p) =>
      p.name.toLowerCase().includes(keyword.toLowerCase())
    );
  }, [products, keyword]);

  /* ================= UI PAGINATION ================= */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PER_PAGE)
  );

  const pageItems = useMemo(() => {
    const start = (uiPage - 1) * PER_PAGE;
    return filteredProducts.slice(start, start + PER_PAGE);
  }, [filteredProducts, uiPage]);

  /* ================= PAGE CHANGE ================= */
  const nextPage = () => {
    if (uiPage >= totalPages && hasMore) {
      setFetchPage((p) => p + 1);
    }
    setUiPage((p) => p + 1);
  };

  const prevPage = () => {
    setUiPage((p) => Math.max(1, p - 1));
  };

  /* ================= SCROLL ================= */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [uiPage]);

  /* ================= RENDER ================= */
  return (
    <div className="max-w  mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-8 uppercase">BRANDS</h1>

      {/* FILTER */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6 border-b pb-2">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={t("allproduct.search")}
          className="border px-3 py-2 w-full sm:w-1/2"
        />

        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="border px-3 py-2 w-full sm:w-1/4"
        >
          <option value="all">ALL BRANDS</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      {/* GRID */}
      {pageItems.length === 0 && !loading ? (
        <p className="text-sm text-gray-500">{t("no_products")}</p>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pageItems.map((item) => (
            <ProductLargeCard
              key={item._id}
              item={item}
              onClick={() =>
                (window.location.href = `/product/${item._id}`)
              }
            />
          ))}
        </div>
      )}

      {loading && (
        <p className="text-center text-sm mt-4">{t("loading")}...</p>
      )}

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-4 mt-10">
        <button
          onClick={prevPage}
          disabled={uiPage === 1}
          className="px-4 py-2 border disabled:opacity-40"
        >
          ◀
        </button>

        <span className="text-sm">
          {uiPage}
          {!hasMore}
        </span>

        <button
          onClick={nextPage}
          disabled={!hasMore && uiPage >= totalPages}
          className="px-4 py-2 border disabled:opacity-40"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
