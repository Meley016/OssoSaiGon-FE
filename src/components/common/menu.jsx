import { AnimatePresence, motion as Motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
// import useCurrency from "../../hooks/useCurrency"; // ✅ import useCurrency
import ProductLargeCard from "./ProductLargeCard";

export default function Menu({ open = false, onClose = () => {} }) {
  const overlayRef = useRef();
  const [treeData, setTreeData] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selected, setSelected] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState({});
  const API = import.meta.env.VITE_BACKEND_URL;
  const { t } = useTranslation(); // ✅ i18n
  // const { formatPrice } = useCurrency(); // ✅ currency formatting

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

      const tree = mains.map((m) => ({
        ...m,
        children: cats.filter((c) => {
          const mainId =
            typeof c.mainCategory === "object" ? c.mainCategory._id : c.mainCategory;
          return mainId === m._id;
        }),
      }));
      setTreeData(tree);
    } catch (err) {
      console.error("fetchTreeData error", err);
    }
  };

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

  // 🧩 Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (overlayRef.current && overlayRef.current === e.target) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // 🔄 Reset when menu toggled
  useEffect(() => {
    if (open) {
      fetchTreeData();
      fetchBrands();
    } else {
      setSelected(null);
      setProducts([]);
    }
  }, [open]);

  // 🧩 Close on ESC
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
          ref={overlayRef}
          className="fixed inset-0 z-50 sm:w-[70%] md:w-[100%] lg:w-[70%] flex flex-col sm:flex-row bg-white shadow-xl"
        >
          {/* PANEL LEFT */}
          <div className="w-full sm:w-1/3 h-1/2 sm:h-full border-r bg-gray-50 overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">{t("category")}</h3>
              <button
                onClick={onClose}
                className="text-sm text-gray-400 hover:text-gray-600"
              >
                {t("close")} ✕
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
                    fetchProducts({ categoryId: main._id });
                  }}
                  onMouseLeave={() =>
                    setExpanded((prev) => ({ ...prev, [main._id]: false }))
                  }
                >
                  <div
                    className={`flex items-center justify-between py-2 px-2 cursor-pointer border-b transition-colors ${
                      expanded[main._id]
                        ? "bg-gray-100 font-semibold"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <span className="text-gray-800">{main.name}</span>
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
                                fetchProducts({ categoryId: c._id });
                              }}
                              className={`py-2 px-2 text-sm cursor-pointer hover:bg-gray-100 border-b ${
                                selected === c._id
                                  ? "bg-gray-200 font-semibold"
                                  : ""
                              }`}
                            >
                              {c.name}
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-gray-400 italic pl-2">
                            {t("no_subcategory")}
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
                onMouseEnter={() =>
                  setExpanded((prev) => ({ ...prev, brands: true }))
                }
                onMouseLeave={() =>
                  setExpanded((prev) => ({ ...prev, brands: false }))
                }
              >
                <div
                  className={`flex items-center justify-between py-2 px-2 cursor-pointer border-b transition-colors ${
                    expanded["brands"]
                      ? "bg-gray-100 font-semibold"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <span className="text-gray-800">{t("brands")}</span>
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
                            fetchProducts({ brand: b });
                          }}
                          className={`py-2 px-2 text-sm cursor-pointer hover:bg-gray-100 border-b ${
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
          <div className="w-full h-1/3 sm:h-full bg-white flex flex-col">
            {/* Header */}
            <div className="p-4 border-b">
              <h4 className="font-medium">{t("products")}</h4>
            </div>

            {/* Product list */}
            <div className="p-4 overflow-auto flex-1">
              {loading ? (
                <p className="text-sm text-gray-500">{t("loading")}</p>
              ) : products.length === 0 ? (
                <p className="text-sm text-gray-500">{t("no_products")}</p>
              ) : (
                <>
                  <div className="grid  sm:grid-cols-3 lg:grid-cols-3 gap-4 ">
                    {products.slice(0, 6).map((item) => (
                      <ProductLargeCard
                        key={item._id}
                        item={item}
                        onClick={() => (window.location.href = `/product/${item._id}`)}
                      />
                    ))}
                  </div>

                  {products.length > 6 && (
                    <div className="flex justify-center mt-4">
                      <button
                        onClick={() =>
                          (window.location.href = `/category/${products[0]?.category?._id || ""}`)
                        }
                        className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-100 transition"
                      >
                        {t("see_more") || "Xem thêm"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

        </Motion.div>
      )}
    </AnimatePresence>
  );
}
