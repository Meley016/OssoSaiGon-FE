import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ProductLargerCard from "../components/common/ProductLargeCard";
import SettingsContext from "../contexts/SettingsContext";

export default function AllProducts() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_BACKEND_URL;
  const { currency, exchangeRate } = useContext(SettingsContext);
  const { t } = useTranslation();

  /* ===================== DATA ===================== */
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===================== FILTER ===================== */
  const [search, setSearch] = useState("");
  const [inStock, setInStock] = useState(false);
  const [color, setColor] = useState("");
  const [categoryId, setCategoryId] = useState("");

  /* ===================== PAGINATION ===================== */
  const [page, setPage] = useState(1);
  const PER_PAGE = 52;

  const isFiltering = search || inStock || color || categoryId;

  /* ===================== PRICE ===================== */
  const formatPrice = (vnd) => {
    const converted = (vnd || 0) * exchangeRate;
    return currency === "USD"
      ? `$${converted.toFixed(2)}`
      : `${converted.toLocaleString()}₫`;
  };

  const getMinPrice = (p) =>
    p?.variants?.length
      ? Math.min(...p.variants.map((v) => v.price || 0))
      : p.minPrice || 0;

  /* ===================== LOAD DATA ===================== */
  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        // categories
        const catRes = await fetch(`${API}/api/categories`);
        const catData = await catRes.json();
        setCategories(Array.isArray(catData) ? catData : []);

        // colors
        const colorRes = await fetch(`${API}/api/colors`);
        const colorData = await colorRes.json();
        setColors(Array.isArray(colorData) ? colorData : []);

        // products
        const prodRes = await fetch(`${API}/api/products?limit=1000`);
        const prodData = await prodRes.json();
        setProducts(Array.isArray(prodData?.data) ? prodData.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [API]);

  /* ===================== FILTER PRODUCTS ===================== */
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryId && p.category !== categoryId) return false; // lọc theo category
      if (search && !p.name?.toLowerCase().includes(search.toLowerCase()))
        return false;
      if (inStock && !p.variants?.some((v) => v.stockQuantity > 0))
        return false;
      if (color && !p.colors?.some((c) => c._id === color)) return false;
      return true;
    });
  }, [products, search, inStock, color, categoryId]);

  /* ===================== PAGINATION ===================== */
  const totalPages = Math.ceil(filteredProducts.length / PER_PAGE);
  const displayProducts = filteredProducts.slice(
    (page - 1) * PER_PAGE,
    page * PER_PAGE
  );

  /* ===================== UI ===================== */
  return (
    <div className="w-[92%] mx-auto">
      <h1 className="text-3xl font-bold text-center my-14 uppercase">
        {t("allproduct.title")}
      </h1>

      {/* FILTER */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 border-b pb-8 mb-14">
        <select
          className="border px-3 py-2"
          value={categoryId}
          onChange={(e) => {
            setCategoryId(e.target.value);
            setPage(1);
          }}
        >
          <option value="">{t("allproduct.allCategory")}</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          className="border px-3 py-2"
          placeholder={t("allproduct.search")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <select
          className="border px-3 py-2"
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
            setPage(1);
          }}
        >
          <option value="">{t("allproduct.allColor")}</option>
          {colors.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => {
              setInStock(e.target.checked);
              setPage(1);
            }}
          />
          {t("allproduct.inStock")}
        </label>
      </div>

      {/* PRODUCTS GRID */}
      {loading ? (
        <p className="text-center text-gray-500 animate-pulse">Đang tải...</p>
      ) : displayProducts.length === 0 ? (
        <p className="text-center text-gray-500">{t("allproduct.noProduct")}</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {displayProducts.map((p) => (
            <ProductLargerCard
              key={p._id}
              item={{ ...p, displayPrice: formatPrice(getMinPrice(p)) }}
              onClick={() => navigate(`/product/${p._id}`)}
            />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {!isFiltering && totalPages > 1 && (
        <div className="flex justify-center gap-6 my-16">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="border px-5 py-2"
          >
            {t("allproduct.prev")}
          </button>

          <span className="px-4 py-2 font-semibold">
            {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="border px-5 py-2"
          >
            {t("allproduct.next")}
          </button>
        </div>
      )}
    </div>
  );
}
