import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import ProductLargeCard from "../common/ProductLargeCard.jsx";

export default function BrandsCategory() {
  const API = import.meta.env.VITE_BACKEND_URL;
  const { t } = useTranslation();
  const { brand } = useParams();

  /* ================= STATE ================= */
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [brandsLoaded, setBrandsLoaded] = useState(false);

  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");

  const [search, setSearch] = useState("");
  const [inStock, setInStock] = useState(false);
  const [color, setColor] = useState("");
  const [sort, setSort] = useState("");

  const [selectedBrand, setSelectedBrand] = useState("all");

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= PAGINATION ================= */
  const PER_PAGE = 52;
  const FETCH_LIMIT = 54;

  const [fetchPage, setFetchPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [uiPage, setUiPage] = useState(1);
  const isFiltering =
    search ||
    inStock ||
    color ||
    categoryId ||
    sort;

  /* ================= FLAG: BRAND FROM MENU ================= */
  const fromRouteRef = useRef(false);

  /* ================= LOAD BRANDS + COLORS ================= */
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [brandRes, colorRes] = await Promise.all([
          fetch(`${API}/api/products/brands`),
          fetch(`${API}/api/colors`),
        ]);

        setBrands(await brandRes.json());
        const colorJson = await colorRes.json();
        setColors(colorJson.data || colorJson || []);
        setBrandsLoaded(true);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMeta();
  }, [API]);

  /* ================= BRAND FROM URL (MENU) ================= */
  useEffect(() => {
    if (brand) {
      fromRouteRef.current = true; // 🔥 đánh dấu từ menu
      setSelectedBrand(decodeURIComponent(brand));
    }
  }, [brand]);

  /* ================= RESET (ONLY USER ACTION) ================= */
  useEffect(() => {
    if (!brandsLoaded) return;

    // 👉 brand từ menu → KHÔNG reset
    if (fromRouteRef.current) {
      fromRouteRef.current = false;
      return;
    }

    // 👉 user đổi brand trong page
    setProducts([]);
    setFetchPage(1);
    setHasMore(true);
    setUiPage(1);
  }, [selectedBrand, brandsLoaded]);

  /* ================= LOAD CATEGORIES ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        let url;

        if (!selectedBrand || selectedBrand === "all") {
          // ✅ all brands → load toàn bộ category
          url = `${API}/api/categories`;
        } else {
          // ✅ theo brand
          url = `${API}/api/products/categories-by-brand?brand=${encodeURIComponent(selectedBrand)}`;
        }

        const res = await fetch(url);
        const json = await res.json();

        // tuỳ backend trả về
        const list = Array.isArray(json) ? json : json.data;

        if (Array.isArray(list)) {
          setCategories(list);
        } else {
          console.error("Invalid categories response", json);
          setCategories([]);
        }

        setCategoryId(""); // reset khi đổi brand
      } catch (err) {
        console.error(err);
        setCategories([]);
      }
    };

    fetchCategories();
  }, [API, selectedBrand]);

    /* ================= FETCH PRODUCTS (BASE + INFINITE) ================= */
    useEffect(() => {
    if (!brandsLoaded || !hasMore || isFiltering) return;

    const fetchData = async () => {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("page", fetchPage);
      params.set("limit", FETCH_LIMIT);

      if (selectedBrand !== "all") {
        params.set("brand", selectedBrand);
      }

      const res = await fetch(`${API}/api/products?${params}`);
      const json = await res.json();
      const items = json?.data || [];

      setProducts((prev) =>
        fetchPage === 1 ? items : [...prev, ...items]
      );

      if (items.length < FETCH_LIMIT) setHasMore(false);
      setLoading(false);
    };

    fetchData();
    }, [API, brandsLoaded, fetchPage, selectedBrand, hasMore, isFiltering]);

  useEffect(() => {
    if (!isFiltering) return;

    const fetchFiltered = async () => {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("page", 1);
      params.set("limit", PER_PAGE);

      // 🔥 BRAND LÀ SCOPE BẮT BUỘC
      if (selectedBrand !== "all") {
        params.set("brand", selectedBrand);
      }

      // 🔥 FILTER TRONG BRAND
      if (categoryId) params.set("category", categoryId);
      if (color) params.set("color", color);
      if (search) params.set("name", search);
      if (inStock) params.set("inStock", "true");
      if (sort) params.set("sort", sort);

      const endpoint =
        selectedBrand === "all"
          ? `${API}/api/products`
          : `${API}/api/products/by-brand`;

      const res = await fetch(`${endpoint}?${params.toString()}`);
      const json = await res.json();
      setProducts(json.data || []);
      setHasMore(false);
      setUiPage(1);
      setLoading(false);
    };

    fetchFiltered();
  }, [
    API,
    isFiltering,
    selectedBrand,
    categoryId,
    color,
    search,
    inStock,
    sort,
  ]);


  /* ================= FILTER + SORT (CLIENT) ================= */
  const filteredProducts = useMemo(() => {
    let list = products;

    const minPrice = (p) =>
      Math.min(...p.variants.map((v) => v.price || 0));

    if (sort === "name_asc")
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "name_desc")
      list = [...list].sort((a, b) => b.name.localeCompare(a.name));
    if (sort === "price_asc")
      list = [...list].sort((a, b) => minPrice(a) - minPrice(b));
    if (sort === "price_desc")
      list = [...list].sort((a, b) => minPrice(b) - minPrice(a));

    return list;
  }, [products, sort]);
   
  /* ================= UI PAGINATION ================= */
  const pageItems = filteredProducts.slice(
    (uiPage - 1) * PER_PAGE,
    uiPage * PER_PAGE
  );
  const isEmpty =
  !loading &&
  products.length === 0;
  /* ================= UI ================= */
  return (
    <div className="max-w mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-8 uppercase">BRANDS</h1>

      {/* FILTER */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-6 border-b pb-4">
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
        >
          <option value="">{t("allproduct.allCategory")}</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="border px-3 py-2"
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
          <option value="price_asc">Giá ↑</option>
          <option value="price_desc">Giá ↓</option>
        </select>
      </div>
      {isEmpty ? (
        <div className="text-center py-10 text-gray-500 text-lg">
          {t("allproduct.noProduct")}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {pageItems.map((item) => (
            <ProductLargeCard
              key={item._id}
              item={item}
              onClick={() =>
                (window.location.href = `/product/${item._id}`)
              }
            />
          ))}
        </div>
      )}
      {loading && <p className="text-center mt-4">{t("loading")}...</p>}

      {/* PAGINATION */}
      {!isFiltering && (
        <div className="flex justify-center items-center gap-4 mt-10">
          <button
            onClick={() => setUiPage((p) => Math.max(1, p - 1))}
            disabled={uiPage === 1}
            className="px-4 py-2 border"
          >
            ◀
          </button>

          <span>{uiPage}</span>

          <button
            onClick={() => {
              if (hasMore && uiPage * PER_PAGE >= products.length) {
                setFetchPage((p) => p + 1);
              }
              setUiPage((p) => p + 1);
            }}
            disabled={!hasMore && uiPage * PER_PAGE >= products.length}
            className="px-4 py-2 border"
          >
            ▶
          </button>
        </div>
      )}
    </div>
  );
}
