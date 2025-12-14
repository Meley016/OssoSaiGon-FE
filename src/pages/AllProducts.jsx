import { useContext, useEffect, useState } from "react";
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
  const [colors, setColors] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  /* ===================== FILTER ===================== */
  const [search, setSearch] = useState("");
  const [inStock, setInStock] = useState(false);
  const [color, setColor] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [sort, setSort] = useState("");

  /* ===================== PAGINATION ===================== */
  const [page, setPage] = useState(1);
  const PER_PAGE = 52;

  const isFiltering = search || inStock || color || categoryId || sort;

  /* ===================== PRICE ===================== */
  const getMinPrice = (p) =>
    p?.variants?.length
      ? Math.min(...p.variants.map((v) => v.price || 0))
      : 0;

  const formatPrice = (vnd) => {
    const converted = (vnd || 0) * exchangeRate;
    return currency === "USD"
      ? `$${converted.toFixed(2)}`
      : `${converted.toLocaleString()}₫`;
  };

  /* ===================== LOAD META ===================== */
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catRes, colorRes] = await Promise.all([
          fetch(`${API}/api/categories`),
          fetch(`${API}/api/colors`),
        ]);

        setCategories(await catRes.json());
        const colJson = await colorRes.json();
        setColors(colJson.data || colJson || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMeta();
  }, [API]);

  /* ===================== LOAD PRODUCTS (BE FILTER) ===================== */
  useEffect(() => {
    if (!categories.length) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();

        // categories
        if (categoryId) {
          params.append("categories", categoryId);
        } else {
          categories.forEach((c) =>
            params.append("categories", c._id)
          );
        }

        params.set("page", page);
        params.set("limit", PER_PAGE);

        if (search) params.set("name", search);
        if (color) params.set("color", color);
        if (inStock) params.set("inStock", "true");
        if (sort) params.set("sort", sort);

        const res = await fetch(
          `${API}/api/products/by-categories?${params.toString()}`
        );

        const json = await res.json();

        setProducts(json.data || []);
        setTotalPages(json.totalPages || 1);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [API, categories, page, search, color, inStock, sort, categoryId]);

  /* ===================== UI ===================== */
  return (
    <div className="w-[92%] mx-auto">
      <h1 className="text-3xl font-bold text-center my-14 uppercase">
        {t("allproduct.title")}
      </h1>

      {/* FILTER */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4 border-b pb-8 mb-14">
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

        <select
          className="border px-3 py-2"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
        >
          <option value="">{t("allproduct.sort")}</option>
          <option value="name_asc">A–Z</option>
          <option value="name_desc">Z–A</option>
          <option value="price_asc">Giá ↑</option>
          <option value="price_desc">Giá ↓</option>
        </select>
      </div>

      {/* GRID */}
      {loading ? (
        <p className="text-center text-gray-500 animate-pulse">Đang tải...</p>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500">
          {t("allproduct.noProduct")}
        </p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {products.map((p) => (
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
