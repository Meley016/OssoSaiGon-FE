import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductLargeCard from "../components/common/ProductLargeCard";
import SettingsContext from "../contexts/SettingsContext";

export default function Category() {
  const { slug: categorySlug } = useParams();
  const backend = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const { exchangeRate } = useContext(SettingsContext);

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  /* ================= FILTER STATE ================= */
  const [filterDraft, setFilterDraft] = useState({
    name: "",
    color: "",
    inStock: false,
    minPrice: "",
    maxPrice: "",
    sort: "",
  });

  const [filters, setFilters] = useState({ ...filterDraft });

  /* ================= SCROLL ================= */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, categorySlug]);

  /* ================= FETCH COLORS ================= */
  useEffect(() => {
    const fetchColors = async () => {
      try {
        const res = await fetch(`${backend}/api/colors`);
        const json = await res.json();
        // ✅ fix API trả data hoặc array trực tiếp
        setColors(json.data || json || []);
      } catch (err) {
        console.error("Fetch colors error", err);
      }
    };
    fetchColors();
  }, []);

  /* ================= FETCH CATEGORY ================= */
  const fetchCategory = async () => {
    try {
      const [mainRes, catRes] = await Promise.all([
        fetch(`${backend}/api/main-categories`),
        fetch(`${backend}/api/categories`),
      ]);

      const mains = await mainRes.json();
      const cats = await catRes.json();

      let cat =
        mains.find((m) => m.slug === categorySlug || m._id === categorySlug) ||
        cats.find((c) => c.slug === categorySlug || c._id === categorySlug);

      if (!cat) throw new Error("Không tìm thấy danh mục");

      const children = cats.filter((c) => {
        const mainId =
          typeof c.mainCategory === "object"
            ? c.mainCategory._id
            : c.mainCategory;
        return mainId === cat._id;
      });

      return { ...cat, children };
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  /* ================= FETCH PRODUCTS ================= */
  const fetchProductsForCategory = async (
    cat,
    pageNum = 1,
    appliedFilters = filters
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit,
      });

      if (cat.children?.length > 0) {
        cat.children.forEach((c) => params.append("categories", c._id));
      } else {
        params.append("categories", cat._id);
      }

      if (appliedFilters.name) params.append("name", appliedFilters.name);
      if (appliedFilters.color) params.append("color", appliedFilters.color);
      if (appliedFilters.inStock) params.append("inStock", "true");

      // ✅ FIX LỌC GIÁ THEO CURRENCY
      if (appliedFilters.minPrice) {
        const vndMin = Math.round(
          Number(appliedFilters.minPrice) / exchangeRate
        );
        params.append("minPrice", vndMin);
      }

      if (appliedFilters.maxPrice) {
        const vndMax = Math.round(
          Number(appliedFilters.maxPrice) / exchangeRate
        );
        params.append("maxPrice", vndMax);
      }

      if (appliedFilters.sort) params.append("sort", appliedFilters.sort);

      const res = await fetch(
        `${backend}/api/products/by-categories?${params.toString()}`
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
    const load = async () => {
      const cat = await fetchCategory();
      if (cat) {
        setCategory(cat);
        setPage(1);
        fetchProductsForCategory(cat, 1, filters);
      }
    };
    load();
  }, [categorySlug]);

  /* ================= PAGE CHANGE ================= */
  useEffect(() => {
    if (category) {
      fetchProductsForCategory(category, page, filters);
    }
  }, [page]);

  /* ================= SORT AUTO APPLY ================= */
  useEffect(() => {
    if (!category) return;
    const next = { ...filters, sort: filterDraft.sort };
    setFilters(next);
    setPage(1);
    fetchProductsForCategory(category, 1, next);
  }, [filterDraft.sort]);

  /* ================= APPLY FILTER ================= */
  const handleApplyFilter = () => {
    setPage(1);
    setFilters(filterDraft);
    fetchProductsForCategory(category, 1, filterDraft);
  };

  /* ================= UI ================= */
  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 animate-pulse">Đang tải...</p>
      </div>
    );

  if (!category)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p>Không tìm thấy danh mục</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-black text-white"
        >
          Quay lại
        </button>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6 uppercase border-b pb-2">
        {category.name}
      </h1>

      {/* ================= FILTER BAR ================= */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-8">
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

        <label className="flex items-center gap-2 px-3 py-2">
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
          <option value="price_asc">Giá thấp → cao</option>
          <option value="price_desc">Giá cao → thấp</option>
        </select>

        <button
          onClick={handleApplyFilter}
          className="bg-black text-white px-4 py-2"
        >
          LỌC
        </button>
      </div>

      {/* ================= PRODUCTS ================= */}
      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
            {products.map((item) => (
              <ProductLargeCard
                key={item._id}
                item={item}
                onClick={() => navigate(`/product/${item._id}`)}
              />
            ))}
          </div>

          <div className="flex justify-center mt-10 gap-4">
            <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              ◀
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              ▶
            </button>
          </div>
        </>
      ) : (
        <p className="text-center text-gray-500 mt-10">
          Không có sản phẩm phù hợp
        </p>
      )}
    </div>
  );
}
