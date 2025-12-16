import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import ProductLargeCard from "../components/common/ProductLargeCard";

export default function AllProducts() {
  const API = import.meta.env.VITE_BACKEND_URL;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { brand: brandFromRoute } = useParams();

  /* ================= META ================= */
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);

  /* ================= FILTER ================= */
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [categoryId, setCategoryId] = useState("");
  const [color, setColor] = useState("");
  const [search, setSearch] = useState("");
  const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState("");

  /* ================= PRODUCTS ================= */
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= PAGINATION ================= */
  const PER_PAGE = 52;
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fromRouteRef = useRef(false);

  /* ================= LOAD BRANDS ================= */
  useEffect(() => {
    fetch(`${API}/api/products/brands`)
      .then((res) => res.json())
      .then((data) =>
        setBrands((data || []).slice().sort((a, b) => a.localeCompare(b)))
      )
      .catch(() => setBrands([]));
  }, [API]);

  /* ================= BRAND FROM ROUTE ================= */
  useEffect(() => {
    if (brandFromRoute) {
      fromRouteRef.current = true;
      setSelectedBrand(decodeURIComponent(brandFromRoute));
    }
  }, [brandFromRoute]);
  useEffect(() => {
    setColor("");
  }, [categoryId]);
  /* ================= LOAD CATEGORIES (BY BRAND) ================= */
  useEffect(() => {
    if (selectedBrand === "all") {
      setCategories([]);
      return;
    }

    fetch(
      `${API}/api/products/categories-by-brand?brand=${encodeURIComponent(
        selectedBrand
      )}`
    )
      .then((res) => res.json())
      .then((json) =>
        setCategories(
          (json.data || []).slice().sort((a, b) => a.name.localeCompare(b.name))
        )
      )
      .catch(() => setCategories([]));
  }, [API, selectedBrand]);

  /* ================= LOAD COLORS (BY BRAND + CATEGORY) ================= */
  useEffect(() => {
    if (selectedBrand === "all") {
      setColors([]);
      return;
    }

    const params = new URLSearchParams();
    params.set("brand", selectedBrand);
    if (categoryId) params.set("category", categoryId);

    fetch(`${API}/api/products/colors-by-brand-category?${params.toString()}`)
      .then((res) => res.json())
      .then((json) =>
        setColors(
          (json.data || []).slice().sort((a, b) => a.name.localeCompare(b.name))
        )
      )
      .catch(() => setColors([]));
  }, [API, selectedBrand, categoryId]);

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", page);
        params.set("limit", PER_PAGE);

        if (search) params.set("name", search);
        if (inStock) params.set("inStock", "true");
        if (sort) params.set("sort", sort);

        let url = "";

        /* ===== ALL PRODUCTS ===== */
        if (selectedBrand === "all") {
          url = `${API}/api/products`;
        }

        /* ===== BY BRAND ===== */
        else {
          url = `${API}/api/products/by-brand`;
          params.set("brand", selectedBrand);
          if (categoryId) params.set("category", categoryId);
          if (color && categoryId) {
            params.set("color", color);
          }
        }

        const res = await fetch(`${url}?${params.toString()}`);
        const json = await res.json();

        setProducts(json.data || []);
        setTotalPages(json.pagination?.totalPages || 1);
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
    color,
    search,
    inStock,
    sort,
    page,
  ]);

  /* ================= RESET PAGE & FILTER ================= */
  useEffect(() => {
    if (fromRouteRef.current) {
      fromRouteRef.current = false;
      return;
    }
    setPage(1);
  }, [selectedBrand, categoryId, color, search, inStock, sort]);

  useEffect(() => {
    setCategoryId("");
    setColor("");
  }, [selectedBrand]);

  /* ================= UI ================= */
  return (
    <div className="w-[92%] mx-auto">
      <h1 className="text-3xl font-bold text-center my-14 uppercase">
        {t("allproduct.title")}
      </h1>

      {/* FILTER */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4 border-b pb-8 mb-14">
        <input
          className="border px-3 py-2"
          placeholder={t("allproduct.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2"
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
          disabled={selectedBrand === "all"}
          className="border px-3 py-2 disabled:opacity-50"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">{t("allproduct.allCategory")}</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          disabled={selectedBrand === "all"}
          className="border px-3 py-2 disabled:opacity-50"
          value={color}
          onChange={(e) => setColor(e.target.value)}
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
            onChange={(e) => setInStock(e.target.checked)}
          />
          {t("allproduct.inStock")}
        </label>

        <select
          className="border px-3 py-2"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">{t("allproduct.sort")}</option>
          <option value="name_asc">A–Z</option>
          <option value="name_desc">Z–A</option>

          {selectedBrand !== "all" && (
            <>
              <option value="price_asc">Giá ↑</option>
              <option value="price_desc">Giá ↓</option>
            </>
          )}
        </select>
      </div>

      {/* PRODUCTS */}
      {loading ? (
        <p className="text-center animate-pulse">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500">
          {t("allproduct.noProduct")}
        </p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {products.map((p) => (
            <ProductLargeCard
              key={p._id}
              item={p}
              onClick={() => navigate(`/product/${p._id}`)}
            />
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-6 my-16">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="border px-5 py-2"
          >
            ◀
          </button>
          <span className="px-4 py-2 font-semibold">
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="border px-5 py-2"
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
}
