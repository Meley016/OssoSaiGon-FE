import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductLargeCard from "../components/common/ProductLargeCard";
import SettingsContext from "../contexts/SettingsContext";
import { slugify } from "../utils/slugify.js";

export default function Category() {
  const { slug: categorySlug } = useParams();
  const backend = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const { exchangeRate } = useContext(SettingsContext);

  /* ================= DATA ================= */
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= PAGINATION ================= */
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  /* ================= FILTER ================= */
  const [filterDraft, setFilterDraft] = useState({
    name: "",
    color: "",
    inStock: false,
    minPrice: "",
    maxPrice: "",
    sort: "",
  });

  const [filters, setFilters] = useState(filterDraft);

  const firstLoadRef = useRef(true);

  /* ================= FETCH COLORS ================= */
  useEffect(() => {
    fetch(`${backend}/api/colors`)
      .then((r) => r.json())
      .then((j) => setColors(j.data || j || []))
      .catch(console.error);
  }, [backend]);

  /* ================= FETCH CATEGORY ================= */
  const fetchCategory = async () => {
    const [mainRes, catRes] = await Promise.all([
      fetch(`${backend}/api/main-categories`),
      fetch(`${backend}/api/categories`),
    ]);

    const mains = await mainRes.json();
    const cats = await catRes.json();

    const cat =
      mains.find((m) => m.slug === categorySlug || m._id === categorySlug) ||
      cats.find((c) => c.slug === categorySlug || c._id === categorySlug);

    if (!cat) return null;

    const children = cats.filter((c) => {
      const mainId =
        typeof c.mainCategory === "object"
          ? c.mainCategory._id
          : c.mainCategory;
      return mainId === cat._id;
    });

    return { ...cat, children };
  };

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async (cat, pageNum, appliedFilters) => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit,
      });

      if (cat.children?.length) {
        cat.children.forEach((c) => params.append("categories", c._id));
      } else {
        params.append("categories", cat._id);
      }

      if (appliedFilters.name) params.append("name", appliedFilters.name);
      if (appliedFilters.color) params.append("color", appliedFilters.color);
      if (appliedFilters.inStock) params.append("inStock", "true");

      if (appliedFilters.minPrice) {
        params.append(
          "minPrice",
          Math.round(+appliedFilters.minPrice / exchangeRate),
        );
      }

      if (appliedFilters.maxPrice) {
        params.append(
          "maxPrice",
          Math.round(+appliedFilters.maxPrice / exchangeRate),
        );
      }

      if (appliedFilters.sort) params.append("sort", appliedFilters.sort);

      const res = await fetch(
        `${backend}/api/products/by-categories?${params}`,
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

  /* ================= LOAD CATEGORY ================= */
  useEffect(() => {
    (async () => {
      const cat = await fetchCategory();
      if (!cat) return;

      setCategory(cat);
      setPage(1);
      fetchProducts(cat, 1, filters);
      firstLoadRef.current = false;
    })();
  }, [categorySlug]);

  /* ================= PAGE CHANGE ================= */
  useEffect(() => {
    if (!category || firstLoadRef.current) return;
    fetchProducts(category, page, filters);
  }, [page]);

  /* ================= SORT AUTO APPLY ================= */
  useEffect(() => {
    if (!category) return;

    const next = { ...filters, sort: filterDraft.sort };
    setFilters(next);
    setPage(1);
    fetchProducts(category, 1, next);
  }, [filterDraft.sort]);

  /* ================= APPLY FILTER ================= */
  const handleApplyFilter = () => {
    setFilters(filterDraft);
    setPage(1);
    fetchProducts(category, 1, filterDraft);
  };

  /* ================= UI ================= */
  if (!category) {
    return <div className="text-center py-20">Không tìm thấy danh mục</div>;
  }

  return (
    <div className="w-[92%] mx-auto">
      <h1 className="text-3xl font-bold text-left my-14 uppercase">
        {category.name}
      </h1>

      {/* FILTER */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4 border-b pb-8 mb-14">
        <input
          placeholder="Tên sản phẩm"
          value={filterDraft.name}
          onChange={(e) =>
            setFilterDraft({ ...filterDraft, name: e.target.value })
          }
          className="border px-3 py-2"
        />

        <select
          value={filterDraft.color}
          onChange={(e) =>
            setFilterDraft({ ...filterDraft, color: e.target.value })
          }
          className="border px-3 py-2"
        >
          <option value="">Tất cả màu</option>
          {colors.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={filterDraft.inStock}
            onChange={(e) =>
              setFilterDraft({ ...filterDraft, inStock: e.target.checked })
            }
          />
          Còn hàng
        </label>

        <input
          type="number"
          placeholder="Giá min"
          value={filterDraft.minPrice}
          onChange={(e) =>
            setFilterDraft({ ...filterDraft, minPrice: e.target.value })
          }
          className="border px-3 py-2"
        />

        <input
          type="number"
          placeholder="Giá max"
          value={filterDraft.maxPrice}
          onChange={(e) =>
            setFilterDraft({ ...filterDraft, maxPrice: e.target.value })
          }
          className="border px-3 py-2"
        />

        <select
          value={filterDraft.sort}
          onChange={(e) =>
            setFilterDraft({ ...filterDraft, sort: e.target.value })
          }
          className="border px-3 py-2"
        >
          <option value="">Sắp xếp</option>
          <option value="name_asc">Tên A–Z</option>
          <option value="name_desc">Tên Z–A</option>
          <option value="price_asc">Giá ↑</option>
          <option value="price_desc">Giá ↓</option>
        </select>

        <button
          onClick={handleApplyFilter}
          className="bg-black text-white px-4 py-2"
        >
          LỌC
        </button>
      </div>

      {/* PRODUCTS */}
      <div
        className={`transition-all duration-300 ${
          loading ? "opacity-40 scale-[0.98]" : "opacity-100 scale-100"
        }`}
      >
        {products.length ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6 lg:gap-20">
              {products.map((item, index) => (
                <div
                  key={item.groupId}
                  className="opacity-0 translate-y-3 animate-item"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <ProductLargeCard
                    item={item}
                    onClick={() => {
                      const slug = slugify(item.name);
                      navigate(`/product/${slug}-${item.groupId}`);
                    }}
                  />
                </div>
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={(p) => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                setPage(p);
              }}
            />
          </>
        ) : (
          !loading && (
            <p className="text-center text-gray-500 mt-10 animate-fade">
              Không có sản phẩm phù hợp
            </p>
          )
        )}
      </div>

      {loading && <p className="text-center mt-6 animate-pulse">Đang tải...</p>}
    </div>
  );
}
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
