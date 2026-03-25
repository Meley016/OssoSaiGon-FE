import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { slugify } from "../../utils/slugify.js";
import ProductLargeCard from "./ProductLargeCard.jsx";

export default function BrandsCategory() {
  const API = import.meta.env.VITE_BACKEND_URL;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { brand } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  /* ================= STATE ================= */
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedBrand, setSelectedBrand] = useState("all");
  const categoryId = searchParams.get("category") || "";
  const search = searchParams.get("name") || "";
  const color = searchParams.get("color") || "";
  const inStock = searchParams.get("inStock") === "true";
  const sort = searchParams.get("sort") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= PAGINATION ================= */
  const PER_PAGE = 52;
  const [_totalPages, setTotalPages] = useState(1);

  /* ================= CONTROL ================= */
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
          const params = new URLSearchParams(searchParams);
          params.delete("color");
          setSearchParams(params);

          return;
        }

        const params = new URLSearchParams(searchParams);
        params.set("brand", selectedBrand);
        if (categoryId) params.set("category", categoryId);

        const res = await fetch(
          `${API}/api/products/colors-by-brand-category?${params.toString()}`,
        );
        const json = await res.json();

        setColors(json.data || []);
        params.delete("color");
        setSearchParams(params);
      } catch {
        setColors([]);
      }
    };

    fetchColors();
  }, [API, selectedBrand, categoryId]);

  useEffect(() => {
    if (brand) {
      setSelectedBrand(decodeURIComponent(brand));
    }
  }, [brand]);

  /* ================= CATEGORIES ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        if (selectedBrand === "all") {
          setCategories([]);
          const params = new URLSearchParams(searchParams);
          params.delete("category");
          setSearchParams(params);

          return;
        }

        const res = await fetch(
          `${API}/api/products/categories-by-brand?brand=${encodeURIComponent(
            selectedBrand,
          )}`,
        );
        const json = await res.json();
        setCategories(json.data || []);
        const params = new URLSearchParams(searchParams);
        params.delete("category");
        setSearchParams(params);
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
          onChange={(e) => {
            const params = new URLSearchParams(searchParams);
            params.set("name", e.target.value);
            params.set("page", 1);
            setSearchParams(params);
          }}
        />

        <select
          className="border px-3 py-2"
          value={categoryId}
          onChange={(e) => {
            const params = new URLSearchParams(searchParams);
            params.set("category", e.target.value);
            params.set("page", 1);
            setSearchParams(params);
          }}
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
          onChange={(e) => {
            const params = new URLSearchParams(searchParams);
            params.set("color", e.target.value);
            params.set("page", 1);
            setSearchParams(params);
          }}
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
            onChange={(e) => {
              const params = new URLSearchParams(searchParams);
              if (e.target.checked) {
                params.set("inStock", "true");
              } else {
                params.delete("inStock");
              }
              params.set("page", 1);
              setSearchParams(params);
            }}
          />
          {t("allproduct.inStock")}
        </label>

        <select
          className="border px-3 py-2"
          value={sort}
          onChange={(e) => {
            const params = new URLSearchParams(searchParams);
            params.set("sort", e.target.value);
            params.set("page", 1);
            setSearchParams(params);
          }}
        >
          <option value="">{t("allproduct.sort")}</option>
          <option value="name_asc">A–Z</option>
          <option value="name_desc">Z–A</option>
          <option value="price_asc">Giá ↑</option>
          <option value="price_desc">Giá ↓</option>
        </select>
      </div>

      {/* PRODUCT LIST */}
      {/* {isEmpty ? (
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
      )} */}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 lg:gap-20">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 animate-pulse rounded" />
          ))}
        </div>
      ) : isEmpty ? (
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

      <Pagination
        page={page}
        totalPages={_totalPages}
        onChange={(p) => {
          window.scrollTo({ top: 0, behavior: "smooth" });
          const params = new URLSearchParams(searchParams);
          params.set("page", p);
          setSearchParams(params);
        }}
      />
    </div>
  );
}

/* ================= PAGINATION ================= */
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const delta = 2;

    const start = Math.max(1, page - delta);
    const end = Math.min(totalPages, page + delta);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-10 mb-20 select-none">
      {/* PREV */}
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="px-3 py-2 text-sm border disabled:opacity-30 hover:bg-black hover:text-white transition"
      >
        prev
      </button>

      {/* FIRST */}
      {page > 3 && (
        <>
          <button
            onClick={() => onChange(1)}
            className="px-3 py-2 text-sm border hover:bg-black hover:text-white transition"
          >
            1
          </button>
          <span className="px-2 text-gray-400">…</span>
        </>
      )}

      {/* PAGES */}
      {getPages().map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`px-3 py-2 text-sm border transition
            ${
              p === page
                ? "bg-black text-white"
                : "hover:bg-black hover:text-white"
            }
          `}
        >
          {p}
        </button>
      ))}

      {/* LAST */}
      {page < totalPages - 2 && (
        <>
          <span className="px-2 text-gray-400">…</span>
          <button
            onClick={() => onChange(totalPages)}
            className="px-3 py-2 text-sm border hover:bg-black hover:text-white transition"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* NEXT */}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-2 text-sm border disabled:opacity-30 hover:bg-black hover:text-white transition"
      >
        next
      </button>
    </div>
  );
}
