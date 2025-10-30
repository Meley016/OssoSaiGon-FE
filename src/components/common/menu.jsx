import { useEffect, useRef, useState } from "react";

export default function Menu({ open = false, onClose = () => {} }) {
  const overlayRef = useRef();
  const [mode, setMode] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selected, setSelected] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/categories`);
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (err) {
      console.error("fetch categories", err);
    }
  };

  // ✅ Extract brands directly from products API
  const fetchBrands = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products?limit=200`);
      const json = await res.json();
      const items = json?.data || [];
      const uniqueBrands = [...new Set(items.map((p) => p.brand).filter(Boolean))];
      setBrands(uniqueBrands);
    } catch (err) {
      console.error("fetch brands", err);
    }
  };

  // ✅ Fetch products by categoryId or brand
    const fetchProducts = async ({ categoryId, brand }) => {
    try {
        setLoading(true);

        const API = import.meta.env.VITE_BACKEND_URL;
        let url = `${API}/api/products?page=1&limit=120`;

        if (categoryId) url += `&category=${categoryId}`;
        if (brand) url += `&brand=${encodeURIComponent(brand)}`;

        const res = await fetch(url);
        const json = await res.json();

        setProducts(json?.data || []);
    } catch (err) {
        console.error("fetch products", err);
        setProducts([]);
    } finally {
        setLoading(false);
    }
    };

  useEffect(() => {
    if (!open) {
      setMode(null);
      setSelected(null);
      setProducts([]);
      setCategories([]);
      setBrands([]);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!open) return null;

  return (
    <div ref={overlayRef} className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute left-0 top-0 h-full w-full flex">
        {/* PANEL 1 */}
        <div
          className={`transform duration-300 w-1/4 bg-white shadow-xl ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="p-4 border-b flex justify-between">
            <h3 className="font-semibold">Menu</h3>
            <button onClick={onClose} className="text-sm text-gray-400">Đóng</button>
          </div>

          <div className="p-4">
            <button
              onClick={() => {
                setMode("categories");
                setSelected(null);
                if (!categories.length) fetchCategories();
              }}
              className={`block w-full text-left py-3 px-2 rounded hover:bg-gray-100 ${
                mode === "categories" ? "bg-gray-200" : ""
              }`}
            >
              Danh mục
            </button>

            <button
              onClick={() => {
                setMode("brands");
                setSelected(null);
                if (!brands.length) fetchBrands();
              }}
              className={`block w-full text-left py-3 px-2 mt-2 rounded hover:bg-gray-100 ${
                mode === "brands" ? "bg-gray-200" : ""
              }`}
            >
              Brands
            </button>
          </div>
        </div>

        {/* PANEL 2 */}
        <div
          className={`w-1/4 bg-white shadow-xl transition duration-300 ${
            mode ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="p-4 border-b font-medium">
            {mode === "categories" ? "Categories" : "Brands"}
          </div>

          <div className="p-3 overflow-auto h-[calc(100vh-4rem)]">
            {mode === "categories" &&
              categories.map((c) => (
                <div
                  key={c._id}
                  onClick={() => {
                    setSelected(c._id);
                    fetchProducts({ categoryId: c._id });
                  }}
                  className={`py-3 px-2 cursor-pointer rounded hover:bg-gray-100 ${
                    selected === c._id ? "bg-gray-200" : ""
                  }`}
                >
                  {c.name}
                </div>
              ))}

            {mode === "brands" &&
              brands.map((b) => (
                <div
                  key={b}
                  onClick={() => {
                    setSelected(b);
                    fetchProducts({ brand: b });
                  }}
                  className={`py-3 px-2 cursor-pointer rounded hover:bg-gray-100 ${
                    selected === b ? "bg-gray-200" : ""
                  }`}
                >
                  {b}
                </div>
              ))}
          </div>
        </div>

        {/* PANEL 3 */}
        <div
          className={`w-1/2 bg-white shadow-inner transition duration-300 ${
            selected ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="p-4 border-b flex justify-between">
            <h4 className="font-medium">Sản phẩm</h4>
            {selected && (
              <button
                className="text-sm text-gray-400"
                onClick={() => {
                  setSelected(null);
                  setProducts([]);
                }}
              >
                Xoá
              </button>
            )}
          </div>

          <div className="p-4 overflow-auto h-[calc(100vh-4rem)]">
            {loading && <p className="text-sm text-gray-500">Đang tải...</p>}

            {!loading && products.length === 0 && (
              <p className="text-sm text-gray-500">Không có sản phẩm.</p>
            )}

            {!loading && products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => {
                    const image = p.coverImage || p.images?.[0];
                    const name = p.title || p.name;

                    // Lấy tất cả variant & các giá
                    const variants = p.variants || [];

                    const prices = variants
                    .map((v) => v.price)
                    .filter((v) => typeof v === "number");

                    const minPrice = prices.length
                    ? new Intl.NumberFormat("vi-VN").format(Math.min(...prices)) + "₫"
                    : "—";

                    // Lấy tất cả màu distinct theo name/code
                    const colors = variants
                        .map(v => v.color)
                        .filter(c => c && c._id) // loại null
                        .reduce((acc, c) => {
                        if (!acc.some(x => x._id === c._id)) acc.push(c);
                        return acc;
                        }, []);
                    return (
                    <a
                        key={p._id || p.id}
                        href={`/product/${p._id || p.id}`}
                        className="p-3 border rounded-lg hover:shadow-md transition flex flex-col"
                    >
                        <img
                        src={image || "/uploads/placeholder.png"}
                        alt={name}
                        className="w-full h-40 object-cover rounded-md"
                        />

                        <div className="mt-2 flex-1">
                        <div className="font-medium text-sm line-clamp-2">{name}</div>

                        {p.brand && (
                            <div className="text-xs text-gray-500 mt-1">{p.brand}</div>
                        )}

                        {/* COLOR SWATCHES */}
                        {colors.length > 0 && (
                            <div className="flex gap-1 mt-2 flex-wrap">
                            {colors.map((c, idx) => (
                                <div
                                key={idx}
                                title={c?.name || ""}
                                className="w-4 h-4 rounded-full border"
                                style={{ backgroundColor: c?.code || "#ccc" }}
                                />
                            ))}
                            </div>
                        )}

                        {/* PRICE */}
                        <div className="text-black font-semibold mt-2">{minPrice}</div>
                        </div>
                    </a>
                    );
                })}
                </div>

            )}
          </div>
        </div>
      </div>
    </div>
  );
}
