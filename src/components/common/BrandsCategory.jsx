import { useEffect, useMemo, useState } from "react";
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
  const [inStock, setInStock] = useState(false);
  const PER_PAGE = 52;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [keyword, setKeyword] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [color, setColor] = useState("");
  const [sort, setSort] = useState("");

  /* ================= PAGINATION ================= */
  const [fetchPage, setFetchPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [uiPage, setUiPage] = useState(1);

  const FETCH_LIMIT = 54;
 

  /* ================= LOAD BRANDS + COLORS ================= */
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [brandRes, colorRes] = await Promise.all([
          fetch(`${API}/api/products/brands`),
          fetch(`${API}/api/colors`),
        ]);

        setBrands(await brandRes.json());
        setColors((await colorRes.json()).data || []);
        setBrandsLoaded(true);
      } catch (err) {
        console.error(err);
      }
    };
    fetchMeta();
  }, [API]);

  useEffect(() => {
    if (brand) setSelectedBrand(decodeURIComponent(brand));
  }, [brand]);

  /* ================= RESET ================= */
  useEffect(() => {
    if (!brandsLoaded) return;
    setProducts([]);
    setFetchPage(1);
    setHasMore(true);
    setUiPage(1);
  }, [selectedBrand, brandsLoaded]);

  /* ================= FETCH PRODUCTS ================= */
  useEffect(() => {
    if (!brandsLoaded || !hasMore) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const brandParam =
          selectedBrand !== "all"
            ? `&brand=${encodeURIComponent(selectedBrand)}`
            : "";

        const res = await fetch(
          `${API}/api/products?page=${fetchPage}&limit=${FETCH_LIMIT}${brandParam}`
        );
        const json = await res.json();
        const items = json?.data || [];

        setProducts((prev) => [...prev, ...items]);
        if (items.length < FETCH_LIMIT) setHasMore(false);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [brandsLoaded, fetchPage, selectedBrand, hasMore, API]);

  /* ================= FILTER + SORT ================= */
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => {
      if (keyword && !p.name.toLowerCase().includes(keyword.toLowerCase()))
        return false;
      if (
        color &&
        !p.variants?.some((v) => v.color?._id === color)
      )
        return false;
      return true;
    });

    const minPrice = (p) =>
      Math.min(...p.variants.map((v) => v.price || 0));

    if (sort === "name_asc")
      list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "name_desc")
      list.sort((a, b) => b.name.localeCompare(a.name));
    if (sort === "price_asc") list.sort((a, b) => minPrice(a) - minPrice(b));
    if (sort === "price_desc") list.sort((a, b) => minPrice(b) - minPrice(a));

    return list;
  }, [products, keyword, color, sort]);

  /* ================= UI PAGINATION ================= */
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PER_PAGE));
  const pageItems = filteredProducts.slice(
    (uiPage - 1) * PER_PAGE,
    uiPage * PER_PAGE
  );

  /* ================= UI ================= */
  return (
    <div className="max-w mx-auto px-4 py-6">
      <h1 className="text-3xl font-bold mb-8 uppercase">BRANDS</h1>

      {/* FILTER */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 border-b pb-4">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={t("allproduct.search")}
          className="border px-3 py-2"
        />

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
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="border px-3 py-2"
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
            onChange={(e) => {
              setInStock(e.target.checked);
              setUiPage(1);
            }}
          />
          {t("allproduct.inStock")}
        </label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="border px-3 py-2"
        >
          <option value="">{t("allproduct.sort")}</option>
          <option value="name_asc">A–Z</option>
          <option value="name_desc">Z–A</option>
          <option value="price_asc">{t("allproduct.price")} ↑</option>
          <option value="price_desc">{t("allproduct.price")} ↓</option>
        </select>
      </div>

      {/* GRID */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {pageItems.map((item) => (
          <ProductLargeCard
            key={item._id}
            item={item}
            onClick={() => (window.location.href = `/product/${item._id}`)}
          />
        ))}
      </div>

      {loading && <p className="text-center mt-4">{t("loading")}...</p>}

      {/* PAGINATION */}
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
            if (uiPage >= totalPages && hasMore) {
              setFetchPage((p) => p + 1);
            }
            setUiPage((p) => p + 1);
          }}
          disabled={!hasMore && uiPage >= totalPages}
          className="px-4 py-2 border"
        >
          ▶
        </button>
      </div>
    </div>
  );
}
