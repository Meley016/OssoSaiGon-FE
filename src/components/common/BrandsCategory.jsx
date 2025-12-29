import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import ProductLargeCard from "./ProductLargeCard.jsx";

export default function BrandsCategory() {
  const API = import.meta.env.VITE_BACKEND_URL;
  const { t } = useTranslation();
  const { brand } = useParams();

  /* ================= STATE ================= */
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedBrand, setSelectedBrand] = useState("all");
  const [categoryId, setCategoryId] = useState("");
  const [search, setSearch] = useState("");
  const [color, setColor] = useState("");
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState("");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= PAGINATION ================= */
  const PER_PAGE = 52;
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fromRouteRef = useRef(false);

  /* ================= META ================= */
  useEffect(() => {
    const fetchMeta = async () => {
      const brandRes = await fetch(`${API}/api/products/brands`);
      setBrands(await brandRes.json());
    };
    fetchMeta();
  }, [API]);

  useEffect(() => {
    const fetchColors = async () => {
      try {
        if (selectedBrand === "all") {
          setColors([]);
          setColor("");
          return;
        }

        const params = new URLSearchParams();
        params.set("brand", selectedBrand);
        if (categoryId) params.set("category", categoryId);

        const res = await fetch(
          `${API}/api/products/colors-by-brand-category?${params.toString()}`
        );
        const json = await res.json();

        setColors(json.data || []);
        setColor("");
      } catch {
        setColors([]);
      }
    };

    fetchColors();
  }, [API, selectedBrand, categoryId]);

  /* ================= BRAND FROM MENU ================= */
  useEffect(() => {
    if (brand) {
      fromRouteRef.current = true;
      setSelectedBrand(decodeURIComponent(brand));
    }
  }, [brand]);

  /* ================= CATEGORIES BY BRAND ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (selectedBrand === "all") {
          setCategories([]);
          setCategoryId("");
          return;
        }

        const res = await fetch(
          `${API}/api/products/categories-by-brand?brand=${encodeURIComponent(
            selectedBrand
          )}`
        );
        const json = await res.json();
        setCategories(json.data || []);
        setCategoryId("");
      } catch {
        setCategories([]);
      }
    };

    fetchCategories();
  }, [API, selectedBrand]);

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", page);
        params.set("limit", PER_PAGE);

        if (selectedBrand !== "all") params.set("brand", selectedBrand);
        if (categoryId) params.set("category", categoryId);
        if (search) params.set("name", search);
        if (color) params.set("color", color);
        if (inStock) params.set("inStock", "true");
        if (sort) params.set("sort", sort);

        const res = await fetch(
          `${API}/api/products/by-brand?${params.toString()}`
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
  }, [
    API,
    selectedBrand,
    categoryId,
    search,
    color,
    inStock,
    sort,
    page,
  ]);

  /* ================= RESET PAGE ================= */
  useEffect(() => {
    if (fromRouteRef.current) {
      fromRouteRef.current = false;
      return;
    }
    setPage(1);
  }, [selectedBrand, categoryId, search, color, inStock, sort]);

  const isEmpty = !loading && products.length === 0;

  /* ================= UI ================= */
  return (
    <div className="w-[92%] mx-auto">
      <h1 className="text-3xl font-bold text-left my-14 uppercase">
        BRANDS
      </h1>

      {/* FILTER */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4 border-b pb-8 mb-14">
        <input
          className="border px-3 py-2 transition-all duration-200"
          placeholder={t("allproduct.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2 transition-all duration-200"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          disabled={selectedBrand === "all"}
        >
          <option value="">{t("allproduct.allCategory")}</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          className="border px-3 py-2 transition-all duration-200"
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
        >
          <option value="all">all brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          className="border px-3 py-2 transition-all duration-200"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          disabled={selectedBrand === "all"}
        >
          <option value="">{t("allproduct.allColor")}</option>
          {colors.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
          />
          {t("allproduct.inStock")}
        </label>

        <select
          className="border px-3 py-2 transition-all duration-200"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">{t("allproduct.sort")}</option>
          <option value="name_asc">A–Z</option>
          <option value="name_desc">Z–A</option>
          <option value="price_asc">Giá ↑</option>
          <option value="price_desc">Giá ↓</option>
        </select>
      </div>

      {/* PRODUCT LIST */}
      <div
        className={`transition-all duration-300 ease-out ${
          loading ? "opacity-40 scale-[0.98]" : "opacity-100 scale-100"
        }`}
      >
        {isEmpty ? (
          <div className="text-center py-10 text-gray-500 text-lg animate-fade-in">
            {t("allproduct.noProduct")}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-20">
            {products.map((item, index) => (
              <div
                key={item._id}
                style={{ transitionDelay: `${index * 30}ms` }}
                className="transform transition-all duration-300 opacity-0 translate-y-4 animate-show"
              >
                <ProductLargeCard
                  item={item}
                  onClick={() =>
                    (window.location.href = `/product/${item._id}`)
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <p className="text-center mt-4 animate-pulse">
          {t("loading")}...
        </p>
      )}

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-4 mt-10">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="px-4 py-2 border transition hover:bg-black hover:text-white disabled:opacity-40"
        >
          ◀
        </button>

        <span className="font-medium">
          {page} / {totalPages}
        </span>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages}
          className="px-4 py-2 border transition hover:bg-black hover:text-white disabled:opacity-40"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
