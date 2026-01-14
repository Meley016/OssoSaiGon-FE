import { AnimatePresence, motion as Motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ProductLargeCard from "./ProductLargeCard";

export default function Menu({ open = false, onClose = () => {} }) {
  const overlayRef = useRef();
  const API = import.meta.env.VITE_BACKEND_URL;
  const { t } = useTranslation();

  const [treeData, setTreeData] = useState([]);
  const [brands, setBrands] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [selected, setSelected] = useState(null); // chỉ dùng cho UI highlight
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState(null);

  // 🔥 BRAND THẬT SỰ DÙNG ĐỂ ĐIỀU HƯỚNG
  const selectedBrandRef = useRef(null);

  const productCacheRef = useRef({});

  const pickRandom = (arr, count = 12) =>
    [...arr].sort(() => Math.random() - 0.5).slice(0, count);

  /* ================= FETCH CATEGORY TREE ================= */
  const fetchTreeData = async () => {
    const [mainRes, catRes] = await Promise.all([
      fetch(`${API}/api/main-categories`),
      fetch(`${API}/api/categories`),
    ]);

    const mains = await mainRes.json();
    const cats = await catRes.json();

    const tree = [...mains]
      .sort((a, b) =>
        a.name.localeCompare(b.name, "vi", { sensitivity: "base" })
      )
      .map((m) => ({
        ...m,
        children: cats
          .filter((c) => {
            const mainId =
              typeof c.mainCategory === "object"
                ? c.mainCategory._id
                : c.mainCategory;
            return mainId === m._id;
          })
          .sort((a, b) =>
            a.name.localeCompare(b.name, "vi", { sensitivity: "base" })
          ),
      }));

    setTreeData(tree);
  };

  /* ================= FETCH BRANDS ================= */
  const fetchBrands = async () => {
    const res = await fetch(`${API}/api/products/brands`);
    const data = await res.json();
    setBrands(data);
  };

  /* ================= FETCH PRODUCTS (CACHED) ================= */
  const fetchProducts = async ({ cacheKey, url, view, random = false }) => {
    if (productCacheRef.current[cacheKey]) {
      setProducts(productCacheRef.current[cacheKey]);
      setActiveView(view);
      return;
    }

    try {
      setLoading(true);
      setActiveView(view);

      const res = await fetch(url);
      const json = await res.json();
      const data = json?.data || [];

      const finalData = random ? pickRandom(data, 12) : data;

      productCacheRef.current[cacheKey] = finalData;
      setProducts(finalData);
    } finally {
      setLoading(false);
    }
  };

  /* ================= FETCH PRODUCTS FOR MAIN CATEGORY ================= */
  const fetchProductsForMain = async (main) => {
    const subIds = main.children.map((c) => c._id);
    const cacheKey = `main-${main._id}`;

    if (productCacheRef.current[cacheKey]) {
      setProducts(productCacheRef.current[cacheKey]);
      setActiveView({ type: "category", id: main._id, name: main.name });
      return;
    }

    setLoading(true);
    setActiveView({ type: "category", id: main._id, name: main.name });

    let allProducts = [];
    for (let i = 0; i < subIds.length; i++) {
      const res = await fetch(
        `${API}/api/products?limit=12&category=${subIds[i]}`
      );
      const json = await res.json();
      allProducts = allProducts.concat(json?.data || []);
      if (allProducts.length >= 12) break;
    }

    const result = allProducts.slice(0, 12);
    productCacheRef.current[cacheKey] = result;
    setProducts(result);
    setLoading(false);
  };

  /* ================= EFFECTS ================= */
  useEffect(() => {
    const clickOutside = (e) => {
      if (overlayRef.current && !overlayRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, [onClose]);

  useEffect(() => {
    const esc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose]);

  useEffect(() => {
    if (open) {
      fetchTreeData();
      fetchBrands();
    } else {
      setExpanded({});
      setProducts([]);
      setActiveView(null);
      setSelected(null);
      // ❌ KHÔNG reset selectedBrandRef
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <Motion.div
          ref={overlayRef}
          initial={{ x: "-100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ type: "tween", duration: 0.3 }}
          className="fixed inset-0 z-50 sm:w-[70%] lg:w-[70%] flex bg-white shadow-xl"
        >
          {/* ================= LEFT ================= */}
          <div className="w-1/3 border-r overflow-auto">
            <div className="p-4 border-b flex justify-between">
              <h3>{t("category")}</h3>
              <button onClick={onClose}>✕</button>
            </div>

            <div className="p-3 space-y-2">
              {/* ALL PRODUCTS */}
              <div
                className="py-2 cursor-pointer border-b"
                onClick={() => {
                  onClose();
                  window.location.href = "/all";
                }}
              >
                {t("all_products")}
              </div>

              {/* ================= BRANDS ================= */}
              <div className="mt-4">
                <div 
                  className="flex  justify-between py-2 hover:bg-gray-100 cursor-pointer border-b"
                  onClick={() => {
                    setExpanded((p) => ({ ...p, brands: !p.brands }));
                    fetchProducts({
                      cacheKey: "brands-main",
                      url: `${API}/api/products/by-brand?limit=50`,
                      view: { type: "brands", name: t("brands") },
                      random: true,
                    });
                  }}
                >
                  <span>{t("brands")}</span>
                  <span>{expanded.brands ? "−" : "+"}</span>
                </div>

                {expanded.brands && (
                  <div className="ml-3 pl-2 border-l">
                    <button
                      className="py-2 w-full text-left border-b"
                      onClick={() => {
                        onClose();
                        const brand = selectedBrandRef.current;
                        window.location.href = brand
                          ? `/category/brands/${encodeURIComponent(brand)}`
                          : `/category/brands`;
                      }}
                    >
                      {t("all_categories")}{" "}
                      {selectedBrandRef.current || t("brands")}
                    </button>

                    {brands.map((b) => (
                      <div
                        key={b}
                        className={`py-2  cursor-pointer border-b ${
                          selected === b ? "bg-gray-200 " : ""
                        }`}
                        onMouseEnter={() => {
                          if (selected === b) return;
                          setSelected(b);
                          selectedBrandRef.current = b; // giữ cho preview + nút all
                          fetchProducts({
                            cacheKey: `brand-${b}`,
                            url: `${API}/api/products/by-brand?limit=12&brand=${encodeURIComponent(
                              b
                            )}`,
                            view: { type: "brand", name: b },
                          });
                        }}
                        onClick={() => {
                          // 🔥 CLICK → ĐI THẲNG BRAND PAGE
                          selectedBrandRef.current = b;
                          onClose();
                          window.location.href = `/category/brands/${encodeURIComponent(b)}`;
                        }}
                      >
                        {b}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ================= CATEGORIES ================= */}
              {treeData.map((main) => (
                <div key={main._id}>
                  <div
                    className="flex items-center justify-between py-2 cursor-pointer border-b hover:bg-gray-100"
                    onClick={() => {
                      setExpanded((p) => ({
                        ...p,
                         [main._id]: !p[main._id],
                      }));
                      fetchProductsForMain(main);
                    }}
                  >
                    <span className="">{main.name}</span>
                    <span className="text-sm ">
                      {expanded[main._id] ? "−" : "+"}
                    </span>
                  </div>

                  {expanded[main._id] && (
                    <div className="ml-3 pl-2 border-l">
                    {activeView && (
                    <button
                      onClick={() => {
                        onClose();
                        window.location.href =
                          activeView.type === "category"
                            ? `/category/${activeView.id}`
                            : activeView.type === "brands"
                            ? `/category/brands`
                            : `/category/brands/${encodeURIComponent(activeView.name)}`;
                      }}
                      className={`py-2   w-full text-left text-sm cursor-pointer hover:bg-gray-100 border-b
                        }`}
                    >
                      {t("all_categories")} {activeView.name}
                    </button>
                  )}
                      {main.children.map((c) => (
                        <div
                          key={c._id}
                          onMouseEnter={() => {
                            if (selected === c) return;
                            setSelected(c._id);
                            fetchProducts({
                              cacheKey: `cate-${c._id}`,
                              url: `${API}/api/products?limit=12&category=${c._id}`,
                              view: { type: "category", id: c._id, name: c.name },
                            });
                          }}
                          onClick={() => (window.location.href = `/category/${c._id}`)}
                          className={`py-2 text-sm cursor-pointer hover:bg-gray-100 border-b ${
                            selected === c._id ? "bg-gray-200 " : ""
                          }`}
                        >
                          {c.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="w-full h-1/3 sm:h-full bg-white flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h4 className="hardcode-text">
                {activeView?.name || t("products")}
              </h4>

              {activeView && (
                <button
                  onClick={() => {
                    onClose();
                    window.location.href =
                      activeView.type === "category"
                        ? `/category/${activeView.id}`
                        : activeView.type === "brands"
                        ? `/category/brands`
                        : `/category/brands/${encodeURIComponent(activeView.name)}`;
                  }}
                  className="text-sm hover:underline"
                >
                  {t("all_categories")} {activeView.name}
                </button>
              )}
            </div>

            <div className="p-4 overflow-auto flex-1">
              {loading ? (
                <p className="text-sm text-gray-500">{t("loading")}</p>
              ) : products.length === 0 ? (
                <p className="text-sm text-gray-500">{t("no_products")}</p>
              ) : (
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4">
                  {products.slice(0, 12).map((item) => (
                    <ProductLargeCard
                      key={item._id}
                      item={item}
                      onClick={() => (window.location.href = `/product/${item._id}`)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}
