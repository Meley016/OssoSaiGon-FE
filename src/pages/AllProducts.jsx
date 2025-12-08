import { useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ProductLargerCard from "../components/common/ProductLargeCard";
import SettingsContext from "../contexts/SettingsContext";

/* ===================== SKELETON ===================== */
function CategorySkeleton() {
  return (
    <div className="flex flex-col md:flex-row border-t mb-20 animate-pulse">
      <div className="md:w-1/3 h-[260px] md:h-[420px] bg-gray-200" />

      <div className="md:w-2/3 grid grid-cols-2 lg:grid-cols-4 gap-8 p-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-4">
            <div className="bg-gray-200 aspect-square" />
            <div className="bg-gray-200 h-4 w-3/4" />
            <div className="bg-gray-200 h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AllProducts() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_BACKEND_URL;
  const { currency, exchangeRate } = useContext(SettingsContext);
  const { t } = useTranslation();

  /* ===================== DATA ===================== */
  const [categories, setCategories] = useState([]);
  const [productsByCate, setProductsByCate] = useState({});
  const [loadingCate, setLoadingCate] = useState({});
  const [colors, setColors] = useState([]);

  /* ===================== FILTER ===================== */
  const [search, setSearch] = useState("");
  const [inStock, setInStock] = useState(false);
  const [color, setColor] = useState("");

  /* ===================== PAGINATION ===================== */
  const [catePage, setCatePage] = useState(1);
  const CATE_PER_PAGE = 4;

  const isFiltering = search || inStock || color;

  /* ===================== PRICE ===================== */
  const formatPrice = (vnd) => {
    const converted = (vnd || 0) * exchangeRate;
    return currency === "USD"
      ? `$${converted.toFixed(2)}`
      : `${converted.toLocaleString()}₫`;
  };

  /* ===================== LOAD CATEGORY ===================== */
  useEffect(() => {
    fetch(`${API}/api/categories`)
      .then((r) => r.json())
      .then((d) => setCategories(Array.isArray(d) ? d : []))
      .catch(console.error);
  }, [API]);

  /* ===================== LOAD COLORS ===================== */
  useEffect(() => {
    fetch(`${API}/api/colors`)
      .then((r) => r.json())
      .then((d) => setColors(Array.isArray(d) ? d : []))
      .catch(console.error);
  }, [API]);

  /* ===================== LOAD PRODUCTS ===================== */
  useEffect(() => {
    if (!categories.length) return;

    categories.forEach((cat) => {
      if (productsByCate[cat._id]) return;

      setLoadingCate((p) => ({ ...p, [cat._id]: true }));

      fetch(`${API}/api/products?category=${cat._id}`)
        .then((r) => r.json())
        .then((res) =>
          setProductsByCate((p) => ({
            ...p,
            [cat._id]: Array.isArray(res?.data) ? res.data : res || [],
          }))
        )
        .finally(() =>
          setLoadingCate((p) => ({ ...p, [cat._id]: false }))
        );
    });
  }, [API, categories, productsByCate]);

  /* ===================== FILTER DATA ===================== */
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const products = productsByCate[cat._id] || [];

      return products.some((p) => {
        if (search && !p.name?.toLowerCase().includes(search.toLowerCase()))
          return false;

        if (inStock && !p.variants?.some((v) => v.stockQuantity > 0))
          return false;

        if (color && !p.colors?.some((c) => c._id === color))
          return false;

        return true;
      });
    });
  }, [categories, productsByCate, search, inStock, color]);

  /* ===================== PAGINATION AFTER FILTER ✅ ===================== */
  const displayCategories = isFiltering
    ? filteredCategories
    : filteredCategories.slice(
        (catePage - 1) * CATE_PER_PAGE,
        catePage * CATE_PER_PAGE
      );

  const totalPages = Math.ceil(
    filteredCategories.length / CATE_PER_PAGE
  );

  const getMinPrice = (p) =>
    p?.variants?.length
      ? Math.min(...p.variants.map((v) => v.price || 0))
      : p.minPrice || 0;

  /* ===================== UI ===================== */
  return (
    <div className="w-[92%] mx-auto">
      <h1 className="text-3xl font-bold text-center my-14 uppercase">
        {t("allproduct.title")}
      </h1>

      {/* FILTER */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 border-b pb-8 mb-14">
        <input
          className="border px-3 py-2"
          placeholder={t("allproduct.search")}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCatePage(1);
          }}
        />

        <select
          className="border px-3 py-2"
          value={color}
          onChange={(e) => {
            setColor(e.target.value);
            setCatePage(1);
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
              setCatePage(1);
            }}
          />
          {t("allproduct.inStock")}
        </label>
      </div>

      {/* CATEGORY BLOCKS */}
      {displayCategories.map((cat, index) => {
        const products = productsByCate[cat._id] || [];

        if (loadingCate[cat._id])
          return <CategorySkeleton key={cat._id} />;

        return (
          <div
            key={cat._id}
            className={`flex flex-col md:flex-row border-t mb-20 ${
              index % 2 ? "md:flex-row-reverse" : ""
            }`}
          >
            {/* CATEGORY */}
            <div
              className="md:w-1/3  relative cursor-pointer group"
              onClick={() => navigate(`/category/${cat._id}`)}
            >
              <img
                src={cat.image}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center">
                <h3 className="text-white text-3xl font-bold uppercase">
                  {cat.name}
                </h3>
                <span className="mt-5 text-white underline opacity-0 group-hover:opacity-100 transition">
                  Xem tất cả →
                </span>
              </div>
            </div>

            {/* PRODUCTS */}
            <div className="md:w-2/3 p-10 grid grid-cols-2 lg:grid-cols-2 gap-8">
              {products.slice(0, 4).map((p) => (
                <ProductLargerCard
                  key={p._id}
                  item={{
                    ...p,
                    displayPrice: formatPrice(getMinPrice(p)),
                  }}
                  onClick={() => navigate(`/product/${p._id}`)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* PAGINATION (CHỈ KHI KHÔNG FILTER) */}
      {!isFiltering && totalPages > 1 && (
        <div className="flex justify-center gap-6 my-16">
          <button
            disabled={catePage === 1}
            onClick={() => setCatePage((p) => p - 1)}
            className="border px-5 py-2"
          >
            {t("allproduct.prev")}
          </button>

          <span className="px-4 py-2 font-semibold">
            {catePage} / {totalPages}
          </span>

          <button
            disabled={catePage === totalPages}
            onClick={() => setCatePage((p) => p + 1)}
            className="border px-5 py-2"
          >
            {t("allproduct.next")}
          </button>
        </div>
      )}
    </div>
  );
}
