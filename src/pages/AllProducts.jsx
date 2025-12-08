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

  const [categories, setCategories] = useState([]);
  const [productsByCate, setProductsByCate] = useState({});
  const [loading, setLoading] = useState(false);
  const [colors, setColors] = useState([]);

  // ✅ FILTER
  const [search, setSearch] = useState("");
  const [inStock, setInStock] = useState(false);
  const [color, setColor] = useState("");
  const [selectedCate, setSelectedCate] = useState("");

  // ✅ SLIDER GIÁ
  const MAX_VND = 50_000_000;
  const [priceRange, setPriceRange] = useState([0, MAX_VND]);
  const handlePriceChange = (e) => setPriceRange([0, Number(e.target.value)]);

  useEffect(() => setPriceRange([0, MAX_VND]), [currency]);

  // ✅ PAGINATION CATEGORY
  const [catePage, setCatePage] = useState(1);
  const CATE_PER_PAGE = 5;

  const formatPrice = (vnd) => {
    const converted = vnd * exchangeRate;
    return currency === "USD"
      ? `$${converted.toFixed(2)}`
      : `${converted.toLocaleString()}₫`;
  };

  // ✅ LOAD CATEGORY
  useEffect(() => {
    fetch(`${API}/api/categories`)
      .then((res) => res.json())
      .then((json) => setCategories(json || []))
      .catch((err) => console.error(err));
  }, []);

  // ✅ LOAD COLORS
  useEffect(() => {
    fetch(`${API}/api/colors`)
      .then((res) => res.json())
      .then((json) => setColors(json || []))
      .catch((err) => console.error(err));
  }, []);

  // ✅ LOAD PRODUCTS THEO FILTER (sử dụng API mới)
  useEffect(() => {
    if (!categories.length) return;

    let cancelled = false;

    const fetchProducts = async () => {
      setLoading(true);
      setProductsByCate({});

      const query = new URLSearchParams();
      if (search.trim()) query.append("name", search.trim());
      if (inStock) query.append("inStock", "true");
      if (color) query.append("color", color);
      if (priceRange[0] !== null) query.append("minPrice", priceRange[0]);
      if (priceRange[1] !== null) query.append("maxPrice", priceRange[1]);

      try {
        const res = await fetch(`${API}/api/products/filter?${query.toString()}`);
        const json = await res.json();
        if (!cancelled) {
          // Gom theo category
          const grouped = {};
          json.data.forEach((p) => {
            const catId = p.category._id;
            if (!grouped[catId]) grouped[catId] = [];
            grouped[catId].push(p);
          });
          setProductsByCate(grouped);
        }
      } catch (err) {
        console.error("Fetch products error:", err);
      }

      setLoading(false);
    };

    fetchProducts();
    return () => { cancelled = true; };
  }, [categories, search, inStock, priceRange, color]);

  const startIndex = (catePage - 1) * CATE_PER_PAGE;
  const selectedCategories = categories.slice(startIndex, startIndex + CATE_PER_PAGE);
  const totalCatePages = Math.ceil(categories.length / CATE_PER_PAGE);

  const isFiltering = search || inStock || priceRange[1] !== MAX_VND || color || selectedCate;
  const filteredCategories = isFiltering
    ? selectedCate ? categories.filter((c) => c._id === selectedCate) : categories
    : selectedCategories;

  const getMinPrice = (product) => {
    if (!product?.variants?.length) return 0;
    return Math.min(...product.variants.map((v) => v.price || 0));
  };

  return (
    <div className="w-[90%] mx-auto">
      <h1 className="text-3xl font-bold text-center my-10 uppercase">
        {t("allproduct.title")}
      </h1>

      {/* FILTER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 border-b border-gray-300 pb-6 mb-10">
        <input
          className="border px-3 py-2"
          placeholder={t("allproduct.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="col-span-2">
          <label className="block mb-1 font-semibold">{t("allproduct.priceRange")}</label>
          <input
            type="range"
            min={0}
            max={MAX_VND}
            step={500000}
            value={priceRange[1]}
            onChange={handlePriceChange}
            className="w-full"
          />
          <div className="flex justify-between text-sm mt-1">
            <span>{formatPrice(priceRange[0])}</span>
            <span>{formatPrice(priceRange[1])}</span>
          </div>
        </div>

        <select
          className="border px-3 py-2"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        >
          <option value="">{t("allproduct.allColor")}</option>
          {colors.map((c) => (
            <option key={c._id} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
          />
          {t("allproduct.inStock")}
        </label>
      </div>

      {loading && <p className="text-center py-10 text-gray-500">{t("allproduct.loading")}</p>}

      {filteredCategories.map((cat, index) => {
        const products = productsByCate[cat._id] || [];
        if (!products.length) return null;
        const reversed = index % 2 !== 0;

        return (
          <div key={cat._id} className={`flex flex-col md:flex-row ${reversed ? "md:flex-row-reverse" : ""} border-t border-gray-300 mb-12`}>
            <div
              className="md:w-1/3 h-72 md:h-auto relative cursor-pointer"
              onClick={() => {
                navigate(`/category/${cat._id}`);
                setSelectedCate(cat._id);
                setCatePage(1);
              }}
            >
              <img src={cat.image || "/no-image.jpg"} alt={cat.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold uppercase tracking-wide">{cat.name}</h3>
              </div>
            </div>

            <div className="md:w-2/3 p-6 bg-white grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductLargerCard
                  key={p._id}
                  item={{ ...p, displayPrice: formatPrice(getMinPrice(p)) }}
                  onClick={() => navigate(`/product/${p._id}`)}
                />
              ))}
              <div
                className="col-span-full border text-center py-3 cursor-pointer hover:bg-black hover:text-white transition"
                onClick={() => navigate(`/category/${cat._id}`)}
              >
                {t("allproduct.viewMore")}
              </div>
            </div>
          </div>
        );
      })}

      {!isFiltering && (
        <div className="flex justify-center gap-3 my-12">
          <button
            disabled={catePage === 1}
            onClick={() => setCatePage(catePage - 1)}
            className="border px-4 py-2 disabled:opacity-50"
          >
            {t("allproduct.prev")}
          </button>
          <span className="px-4 py-2 font-semibold">{catePage} / {totalCatePages}</span>
          <button
            disabled={catePage === totalCatePages}
            onClick={() => setCatePage(catePage + 1)}
            className="border px-4 py-2 disabled:opacity-50"
          >
            {t("allproduct.next")}
          </button>
        </div>
      )}
    </div>
  );
}
