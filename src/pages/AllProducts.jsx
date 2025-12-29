import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ProductLargeCard from "../components/common/ProductLargeCard";

export default function AllProducts() {
  const API = import.meta.env.VITE_BACKEND_URL;
  const { t } = useTranslation();
  const navigate = useNavigate();

  /* ================= FILTER ================= */
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [color, setColor] = useState("");
  const [search, setSearch] = useState("");
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState("");

  /* ================= FACETS ================= */
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);

  /* ================= PRODUCTS ================= */
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= PAGINATION ================= */
  const PER_PAGE = 52;
  const [page, setPage] = useState(1);
  const [_totalPages, setTotalPages] = useState(1);

  /* ================= FACETS ================= */

  // 🔹 BRAND facet (exclude brand)
  useEffect(() => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (color) params.set("color", color);

    fetch(`${API}/api/products/facets?${params}`)
      .then(r => r.json())
      .then(j => setBrands(j?.data?.brands || []));
  }, [API, category, color]);

  // 🔹 CATEGORY facet (exclude category)
  useEffect(() => {
    const params = new URLSearchParams();
    if (brand) params.set("brand", brand);
    if (color) params.set("color", color);

    fetch(`${API}/api/products/facets?${params}`)
      .then(r => r.json())
      .then(j => setCategories(j?.data?.categories || []));
  }, [API, brand, color]);

  // 🔹 COLOR facet (exclude color)
  useEffect(() => {
    const params = new URLSearchParams();
    if (brand) params.set("brand", brand);
    if (category) params.set("category", category);

    fetch(`${API}/api/products/facets?${params}`)
      .then(r => r.json())
      .then(j => setColors(j?.data?.colors || []));
  }, [API, brand, category]);

  /* ================= AUTO CLEAN INVALID ================= */
  useEffect(() => {
    if (brand && !brands.includes(brand)) setBrand("");
    if (
      category &&
      !categories.some(c => String(c._id) === String(category))
    ) {
      setCategory("");
    }
    if (
      color &&
      !colors.some(c => String(c._id) === String(color))
    ) {
      setColor("");
    }
  }, [brands, categories, colors]);

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", page);
        params.set("limit", PER_PAGE);

        if (brand) params.set("brand", brand);
        if (category) params.set("category", category);
        if (color) params.set("color", color);
        if (search) params.set("name", search);
        if (inStock) params.set("inStock", "true");
        if (sort) params.set("sort", sort);

        const res = await fetch(`${API}/api/products/advanced?${params}`);
        const json = await res.json();

        setProducts(json.data || []);
        setTotalPages(json.pagination?.totalPages || 1);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [API, brand, category, color, search, inStock, sort, page]);

  /* ================= RESET PAGE ================= */
  useEffect(() => {
    setPage(1);
  }, [brand, category, color, search, inStock, sort]);

  /* ================= UI ================= */
  return (
    <div className="w-[92%] mx-auto">
      <h1 className="text-3xl font-bold text-left my-14 uppercase">
        {t("allproduct.title")}
      </h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4 border-b pb-8 mb-14">
        <input
          className="border px-3 py-2"
          placeholder={t("allproduct.search")}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2"
          value={brand}
          onChange={e => setBrand(e.target.value)}
        >
          <option value="">all brands</option>
          {brands.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        <select
          className="border px-3 py-2"
          value={category}
          onChange={e => setCategory(e.target.value)}
        >
          <option value="">all categories</option>
          {categories.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <select
          className="border px-3 py-2"
          value={color}
          onChange={e => setColor(e.target.value)}
        >
          <option value="">all colors</option>
          {colors.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={inStock}
            onChange={e => setInStock(e.target.checked)}
          />
          {t("allproduct.inStock")}
        </label>

        <select
          className="border px-3 py-2"
          value={sort}
          onChange={e => setSort(e.target.value)}
        >
          <option value="">{t("allproduct.sort")}</option>
          <option value="name_asc">A–Z</option>
          <option value="name_desc">Z–A</option>
          <option value="price_asc">Giá ↑</option>
          <option value="price_desc">Giá ↓</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center animate-pulse">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500">
          {t("allproduct.noProduct")}
        </p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-20 mb-20">
          {products.map(p => (
            <ProductLargeCard
              key={p._id}
              item={p}
              onClick={() => navigate(`/product/${p._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
