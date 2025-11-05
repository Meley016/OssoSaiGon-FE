import { AnimatePresence, motion as Motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function Menu({ open = false, onClose = () => {} }) {
  const overlayRef = useRef();
  const [treeData, setTreeData] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selected, setSelected] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const API = import.meta.env.VITE_BACKEND_URL;

  // 🧩 Fetch main + sub categories
  const fetchTreeData = async () => {
    try {
      const [mainRes, catRes] = await Promise.all([
        fetch(`${API}/api/main-categories`),
        fetch(`${API}/api/categories`),
      ]);
      const mains = await mainRes.json();
      const cats = await catRes.json();

      if (!Array.isArray(mains) || !Array.isArray(cats)) return;

      // gộp categories vào main
      const tree = mains.map((m) => ({
        ...m,
        children: cats.filter((c) => {
          const mainId = typeof c.mainCategory === "object" ? c.mainCategory._id : c.mainCategory;
          return mainId === m._id;
        }),
      }));
      setTreeData(tree);
    } catch (err) {
      console.error("fetchTreeData error", err);
    }
  };
   useEffect(() => {
  function handleClickOutside(e) {
    if (overlayRef.current && overlayRef.current === e.target) {
      onClose();
    }
  }
  document.addEventListener("mousedown", handleClickOutside);
  return () => document.removeEventListener("mousedown", handleClickOutside);
}, [onClose]);
  // 🧩 Fetch brands
  const fetchBrands = async () => {
    try {
      const res = await fetch(`${API}/api/products?limit=200`);
      const json = await res.json();
      const items = json?.data || [];
      const uniqueBrands = [...new Set(items.map((p) => p.brand).filter(Boolean))];
      setBrands(uniqueBrands);
    } catch (err) {
      console.error("fetch brands", err);
    }
  };

  // 🧩 Fetch products
  const fetchProducts = async ({ categoryId, brand }) => {
    try {
      setLoading(true);
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



  // 🔄 Reset
  useEffect(() => {
    if (open) {
      fetchTreeData();
      fetchBrands();
    } else {
      setSelected(null);
      setProducts([]);
    }
  }, [open]);

  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <Motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "tween", duration: 0.3 }}
        className="relative z-50 bg-white w-[85%] sm:w-[70%] md:w-[60%] lg:w-[50%] h-full shadow-xl flex"
      >
        {/* PANEL LEFT */}
        <div className="w-1/2 border-r bg-gray-50 overflow-auto">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Danh mục</h3>
            <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600">
              Đóng ✕
            </button>
          </div>

          <div className="p-3 space-y-2">
            {treeData.map((main) => (
              <div
                key={main._id}
                className="group"
                onMouseEnter={() => {
                  setExpanded((prev) => ({ ...prev, [main._id]: true }));
                  setSelected(main._id);
                  fetchProducts({ categoryId: main._id }); // 🟢 Fetch sản phẩm khi hover main
                }}
                onMouseLeave={() => setExpanded((prev) => ({ ...prev, [main._id]: false }))}
              >
                <div
                  className={`flex items-center justify-between py-2 px-2 cursor-pointer select-none border-b border-transparent transition-colors ${
                    expanded[main._id] ? "bg-gray-100 font-semibold" : "hover:bg-gray-100"
                  }`}
                >
                  <span className="text-gray-800 group-hover:font-semibold">{main.name}</span>
                  <span className="text-sm text-gray-400">
                    {expanded[main._id] ? "−" : "+"}
                  </span>
                </div>

                <AnimatePresence>
                  {expanded[main._id] && (
                    <Motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="ml-3 pl-3 border-l border-gray-200 space-y-1 mt-1"
                    >
                      {main.children.length > 0 ? (
                        main.children.map((c) => (
                          <div
                            key={c._id}
                            onMouseEnter={() => {
                              setSelected(c._id);
                              fetchProducts({ categoryId: c._id }); // 🟢 Hover subcategory cũng load sản phẩm
                            }}
                            className={`py-2 px-2 text-sm cursor-pointer transition-colors border-b border-transparent hover:bg-gray-100 hover:font-medium ${
                              selected === c._id ? "bg-gray-200 font-semibold" : ""
                            }`}
                          >
                            {c.name}
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-gray-400 italic pl-2">
                          (Chưa có danh mục con)
                        </div>
                      )}
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}


            {/* Brands */}
            <div
              className="mt-4 group"
              onMouseEnter={() => setExpanded((prev) => ({ ...prev, brands: true }))}
              onMouseLeave={() => setExpanded((prev) => ({ ...prev, brands: false }))}
            >
              <div
                className={`flex items-center justify-between py-2 px-2 cursor-pointer select-none border-b border-transparent transition-colors ${
                  expanded["brands"] ? "bg-gray-100 font-semibold" : "hover:bg-gray-100"
                }`}
              >
                <span className="text-gray-800 group-hover:font-semibold">Brands</span>
                <span className="text-sm text-gray-400">
                  {expanded["brands"] ? "−" : "+"}
                </span>
              </div>

              <AnimatePresence>
                {expanded["brands"] && (
                  <Motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="ml-3 pl-3 border-l border-gray-200 space-y-1 mt-1"
                  >
                    {brands.map((b) => (
                      <div
                        key={b}
                        onMouseEnter={() => {
                          setSelected(b);
                          fetchProducts({ brand: b }); // 🟢 Hover brand load sản phẩm
                        }}
                        className={`py-2 px-2 text-sm cursor-pointer border-b border-transparent hover:bg-gray-100 hover:font-medium ${
                          selected === b ? "bg-gray-200 font-semibold" : ""
                        }`}
                      >
                        {b}
                      </div>
                    ))}
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* PANEL RIGHT — PRODUCTS */}
        <div className="flex-1 bg-white">
          <div className="p-4 border-b flex justify-between">
            <h4 className="font-medium">Sản phẩm</h4>
            <button
              className="text-sm text-gray-400 hover:text-gray-600"
              onClick={() => {
                setSelected(null);
                setProducts([]);
              }}
            >
              Xoá
            </button>
          </div>

          <div className="p-4 overflow-auto h-[calc(100vh-4rem)]">
            {loading && <p className="text-sm text-gray-500">Đang tải...</p>}
            {!loading && products.length === 0 && (
              <p className="text-sm text-gray-500">Không có sản phẩm.</p>
            )}
            {!loading && products.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((p) => {
                  const img = p.coverImage || p.images?.[0];
                  const name = p.title || p.name;
                  const variants = p.variants || [];
                  const prices = variants.map((v) => v.price).filter(Number.isFinite);
                  const minPrice = prices.length
                    ? `${Math.min(...prices).toLocaleString("vi-VN")}₫`
                    : "—";

                  const colors = variants
                    .map((v) => v.color)
                    .filter((c) => c && c._id)
                    .reduce((acc, c) => {
                      if (!acc.some((x) => x._id === c._id)) acc.push(c);
                      return acc;
                    }, []);

                  return (
                    <a
                      key={p._id}
                      href={`/product/${p._id}`}
                      className="border hover:shadow-md transition p-2 flex flex-col"
                    >
                      <img
                        src={img || "/uploads/placeholder.png"}
                        alt={name}
                        className="w-full h-32 object-cover"
                      />
                      <div className="mt-2 flex-1">
                        <div className="text-sm font-medium line-clamp-2">{name}</div>
                        {colors.length > 0 && (
                          <div className="flex gap-1 mt-2 flex-wrap">
                            {colors.map((c) => (
                              <div
                                key={c._id}
                                title={c.name}
                                className="w-4 h-4 border"
                                style={{ backgroundColor: c.code }}
                              />
                            ))}
                          </div>
                        )}
                        <div className="mt-1 text-xs text-gray-500">{p.brand}</div>
                        <div className="mt-1 font-semibold text-black">{minPrice}</div>
                      </div>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Motion.div>

      )}
    </AnimatePresence>
  );
}
