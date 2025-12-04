import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductLargerCard from "../components/common/ProductLargeCard";
import SettingsContext from "../contexts/SettingsContext";

export default function AllProducts() {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_BACKEND_URL;
  const { currency, exchangeRate } = useContext(SettingsContext);

  const [categories, setCategories] = useState([]);
  const [productsByCate, setProductsByCate] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ FILTER (CHỈ GIỮ LẠI CÁI BE HỖ TRỢ)
  const [search, setSearch] = useState("");
  const [inStock, setInStock] = useState(false);
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [color, setColor] = useState("");
    const [selectedCate, setSelectedCate] = useState("");

  // ✅ PAGINATION CATEGORY
  const [catePage, setCatePage] = useState(1);
  const CATE_PER_PAGE = 5;

  // ✅ FORMAT GIÁ
  const formatPrice = (vnd) => {
    const converted = vnd * exchangeRate;
    return currency === "USD"
      ? `$${converted.toFixed(2)}`
      : `${converted.toLocaleString()}₫`;
  };


  // ✅ LẤY GIÁ THẤP NHẤT TỪ VARIANTS (FIX LỖI p.price)
  const getMinPrice = (product) => {
    if (!product?.variants?.length) return 0;
    return Math.min(...product.variants.map((v) => v.price || 0));
  };

  // ✅ LOAD CATEGORY
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch(`${API}/api/categories`);
      const json = await res.json();
      setCategories(json || []);
    };
    fetchCategories();
  }, []);

  // ✅ LOAD PRODUCT THEO FILTER 
    useEffect(() => {
    if (!categories.length) return;

    let cancelled = false;

    const fetchSequential = async () => {
        for (const cate of categories) {
        try {
            let url = `${API}/api/products?category=${cate._id}&limit=8&page=1`;

            if (search.trim()) {
            url += `&name=${encodeURIComponent(search.trim())}`;
            }

            if (inStock) {
            url += `&minQuantity=1`;
            }

            if (minPrice) {
            url += `&minPrice=${minPrice}`;
            }

            if (maxPrice) {
            url += `&maxPrice=${maxPrice}`;
            }

            if (color) {
            url += `&color=${color}`;
            }

            const res = await fetch(url);
            const json = await res.json();
            const items = json.data || [];

            if (!cancelled && items.length > 0) {
            setProductsByCate((prev) => ({
                ...prev,
                [cate._id]: items,
            }));
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
        }

        setLoading(false);
    };

    setLoading(true);
    setProductsByCate({});
    fetchSequential();

    return () => {
        cancelled = true;
    };
    }, [categories, search, inStock, minPrice, maxPrice, color]);

    // ✅ CATEGORY PAGINATION
const startIndex = (catePage - 1) * CATE_PER_PAGE;
const selectedCategories = categories.slice(
  startIndex,
  startIndex + CATE_PER_PAGE
);
const totalCatePages = Math.ceil(categories.length / CATE_PER_PAGE);

// ✅ CÓ ĐANG LỌC KHÔNG ?
const isFiltering =
  search || inStock || minPrice || maxPrice || color || selectedCate;

// ✅ QUY TẮC HIỂN THỊ CATEGORY
const filteredCategories = isFiltering
  ? selectedCate
    ? categories.filter(c => c._id === selectedCate) 
    : categories 
  : selectedCategories; 
    return (
        <div className="w-[90%] mx-auto">
        {/* ✅ TIÊU ĐỀ */}
        <h1 className="text-3xl font-bold text-center my-10 uppercase">
            Tất Cả Sản Phẩm
        </h1>

        {/* ✅ FILTER NGANG (CHUẨN API) */}
        <div className="flex flex-col md:flex-row gap-4 border-b border-gray-300 pb-6 mb-10">

        <input
            className="border px-3 py-2"
            placeholder="Tìm tên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
        />

        <input
            type="number"
            className="border px-3 py-2"
            placeholder="Giá từ"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
        />

        <input
            type="number"
            className="border px-3 py-2"
            placeholder="Giá đến"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
        />

        <select
            className="border px-3 py-2"
            value={color}
            onChange={(e) => setColor(e.target.value)}
        >
            <option value="">Tất cả màu</option>
            <option value="red">Đỏ</option>
            <option value="black">Đen</option>
            <option value="white">Trắng</option>
        </select>

        <label className="flex items-center gap-2">
            <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
            />
            Còn hàng
        </label>
        </div>


      {/* ✅ LOADING */}
      {loading && (
        <p className="text-center py-10 text-gray-500">
          Đang lọc sản phẩm...
        </p>
      )}

      {/* ✅ HIỂN THỊ CATEGORY + PRODUCT */}
      {filteredCategories.map((cat, index) => {
        const products = productsByCate[cat._id] || [];
        if (!products.length) return null;

        const reversed = index % 2 !== 0;

        return (
          <div
            key={cat._id}
            className={`flex flex-col md:flex-row ${
              reversed ? "md:flex-row-reverse" : ""
            } border-t border-gray-300 mb-12`}
          >
            {/* 🟢 CATEGORY IMAGE */}
            <div
              className="md:w-1/3 h-72 md:h-auto relative cursor-pointer"
              onClick={() => navigate(`/category/${cat._id}`)}
            >
              <img
                src={cat.image || "/no-image.jpg"}
                alt={cat.name}
                className="w-full h-full object-cover"
                onClick={() => {
                setSelectedCate(cat._id);
                setCatePage(1);
                }}

              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold uppercase tracking-wide">
                  {cat.name}
                </h3>
              </div>
            </div>

            {/* 🟢 PRODUCTS GRID */}
            <div className="md:w-2/3 p-6 bg-white grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductLargerCard
                  key={p._id}
                  item={{
                    ...p,
                    displayPrice: formatPrice(getMinPrice(p)),
                  }}
                  onClick={() => navigate(`/product/${p._id}`)}
                />
              ))}

              {/* ✅ XEM THÊM */}
              <div
                className="col-span-full border text-center py-3 cursor-pointer hover:bg-black hover:text-white transition"
                onClick={() => navigate(`/category/${cat._id}`)}
              >
                XEM THÊM
              </div>
            </div>
          </div>
        );
      })}

      {/* ✅ PHÂN TRANG CATEGORY */}
      <div className="flex justify-center gap-3 my-12">
        <button
          disabled={catePage === 1}
          onClick={() => setCatePage(catePage - 1)}
          className="border px-4 py-2 disabled:opacity-50"
        >
          Prev
        </button>

        <span className="px-4 py-2 font-semibold">
          {catePage} / {totalCatePages}
        </span>

        <button
          disabled={catePage === totalCatePages}
          onClick={() => setCatePage(catePage + 1)}
          className="border px-4 py-2 disabled:opacity-50"
        >
          Next
        </button>
      </div>
      {/* ✅ PHÂN TRANG CATEGORY (CHỈ HIỆN KHI KHÔNG LỌC) */}
        {!isFiltering && (
        <div className="flex justify-center gap-3 my-12">
            <button
            disabled={catePage === 1}
            onClick={() => setCatePage(catePage - 1)}
            className="border px-4 py-2 disabled:opacity-50"
            >
            Prev
            </button>

            <span className="px-4 py-2 font-semibold">
            {catePage} / {totalCatePages}
            </span>

            <button
            disabled={catePage === totalCatePages}
            onClick={() => setCatePage(catePage + 1)}
            className="border px-4 py-2 disabled:opacity-50"
            >
            Next
            </button>
        </div>
        )}

    </div>
  );
}
