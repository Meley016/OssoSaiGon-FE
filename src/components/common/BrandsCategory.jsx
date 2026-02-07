import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { slugify } from "../../utils/slugify.js";
import ProductLargeCard from "./ProductLargeCard.jsx";

export default function BrandsCategory() {
  const API = import.meta.env.VITE_BACKEND_URL;
  const { t } = useTranslation();
  const navigate = useNavigate();
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
  const [_totalPages, setTotalPages] = useState(1);

  /* ================= CONTROL ================= */
  const fromRouteRef = useRef(false);
  const latestRequestRef = useRef(0);
  /* ================= META ================= */
  useEffect(() => {
    const fetchMeta = async () => {
      const brandRes = await fetch(`${API}/api/products/brands`);
      setBrands(await brandRes.json());
    };
    fetchMeta();
  }, [API]);

  /* ================= COLORS ================= */
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
          `${API}/api/products/colors-by-brand-category?${params.toString()}`,
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

  /* ================= CATEGORIES ================= */
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
            selectedBrand,
          )}`,
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

  /* ================= FETCH PRODUCTS (FIXED) ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      const requestId = ++latestRequestRef.current; // ✅ đánh dấu request
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
          `${API}/api/products/by-brand?${params.toString()}`,
        );
        const json = await res.json();

        // 🚨 DROP REQUEST CŨ
        if (requestId !== latestRequestRef.current) return;

        setProducts(json.data || []);
        setTotalPages(json.totalPages || 1);
      } catch (err) {
        console.error(err);
      } finally {
        if (requestId === latestRequestRef.current) {
          setLoading(false);
        }
      }
    };

    fetchProducts();
  }, [API, selectedBrand, categoryId, search, color, inStock, sort, page]);

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
      <h1 className="text-3xl font-bold text-left my-14 uppercase">BRANDS</h1>

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
          className="border px-3 py-2"
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
          className="border px-3 py-2"
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
      {isEmpty ? (
        <div className="text-center py-10 text-gray-500">
          {t("allproduct.noProduct")}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 lg:gap-20">
          {products.map((item) => (
            <ProductLargeCard
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

      {loading && (
        <p className="text-center mt-4 animate-pulse">{t("loading")}...</p>
      )}

      <Pagination
        page={page}
        totalPages={_totalPages}
        onChange={(p) => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          setPage(p);
        }}
      />
    </div>
  );
}

/* ================= PAGINATION ================= */
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (
    let i = Math.max(1, page - 2);
    i <= Math.min(totalPages, page + 2);
    i++
  ) {
    pages.push(i);
  }

  return (
    <div className="flex justify-center gap-2 mt-10 mb-20">
      <button onClick={() => onChange(page - 1)} disabled={page === 1}>
        prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={p === page ? "font-bold" : ""}
        >
          {p}
        </button>
      ))}

      <button onClick={() => onChange(page + 1)} disabled={page === totalPages}>
        next
      </button>
    </div>
  );
}
