import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Banner from "../components/common/Banner";
import ProductLargerCard from "../components/common/ProductLargeCard";
import Blog from "./Blog";

export default function Home() {
  const backend = import.meta.env.VITE_BACKEND_URL;
  const [banners, setBanners] = useState([]);
  const [products, setProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [bestSeller, setBestSeller] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const navigate = useNavigate();

  // slider state
  const [cateIndex, setCateIndex] = useState(0);
  const visibleCount = 3;
  const categoryRef = useRef(null); // ⭐ FIX SCROLL

  /* ================= BANNERS ================= */
  useEffect(() => {
    const fetchBanners = async () => {
      const res = await fetch(`${backend}/api/banners/active`);
      const data = await res.json();
      setBanners(data.filter((b) => b.isActive));
    };
    fetchBanners();
  }, [backend]);

  /* ================= CATEGORIES ================= */
  useEffect(() => {
    const fetchCategories = async () => {
      const res = await fetch(`${backend}/api/categories`);
      const data = await res.json();
      setCategories(data || []);
    };
    fetchCategories();
  }, [backend]);

  /* ================= PRODUCTS ================= */
  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch(`${backend}/api/products?limit=1000`);
      const data = await res.json();
      const all = data.data || [];
      setProducts(all);

      setNewProducts(
        [...all]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          )
          .slice(0, 4)
      );

      setBestSeller(
        [...all]
          .sort(
            (a, b) =>
              (b.variants?.reduce((s, v) => s + (v.stockQuantity || 0), 0) ||
                0) -
              (a.variants?.reduce((s, v) => s + (v.stockQuantity || 0), 0) ||
                0)
          )
          .slice(0, 4)
      );
    };
    fetchProducts();
  }, [backend]);

  /* ================= TOP CATEGORIES ================= */
  useEffect(() => {
    if (!categories.length || !products.length) return;

    const count = {};
    products.forEach((p) => {
      const id = p.category?._id?.toString() || p.category?.toString();
      if (!id) return;
      count[id] = (count[id] || 0) + 1;
    });

    const sortedIds = Object.entries(count)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    setTopCategories(
      categories
        .filter((c) => sortedIds.includes(c._id.toString()))
        .slice(0, 6)
    );
  }, [categories, products]);

  const maxIndex = Math.max(topCategories.length - visibleCount, 0);

  const keepScroll = (fn) => {
    const y =
      categoryRef.current?.getBoundingClientRect().top + window.scrollY;
    fn();
    requestAnimationFrame(() =>
      window.scrollTo({ top: y, behavior: "auto" })
    );
  };

  return (
    <div className="w-full bg-gray-100">
      {/* ================= BANNER ================= */}
      <div className="w-full overflow-x-auto snap-x snap-mandatory whitespace-nowrap no-scrollbar">
        {banners.map((b) => (
          <div key={b._id} className="inline-block w-screen snap-center">
            <Banner {...b} />
          </div>
        ))}
      </div>

      <Section title="NEW" products={newProducts} navigate={navigate} />
      <Section title="BEST SELLER" products={bestSeller} navigate={navigate} />

      {/* ================= CATEGORY FEATURED ================= */}
      <div ref={categoryRef} className="w-full bg-white py-6">
        <h2 className="text-2xl font-bold px-6 py-6 uppercase">
          Category
        </h2>

        <div className="flex flex-col gap-12">
          {topCategories
            .slice(cateIndex, cateIndex + visibleCount)
            .map((cat, i) => (
              <CategoryBlock
                key={cat._id}
                category={cat}
                backend={backend}
                navigate={navigate}
                reversed={i % 2 === 1}
              />
            ))}
        </div>

        {/* NAV */}
        {topCategories.length > visibleCount && (
          <>
            {/* DOT */}
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: maxIndex + 1 }).map((_, i) => (
                <button
                  key={i}
                  onClick={() =>
                    keepScroll(() => setCateIndex(i))
                  }
                  className={`w-2.5 h-2.5 rounded-full ${
                    cateIndex === i
                      ? "bg-black"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="bg-white">
        <h2 className="text-2xl font-bold px-6 pt-12 uppercase">
          Blog
        </h2>
        <Blog />
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Section({ title, products, navigate }) {
  return (
    <div className="border-t border-gray-300 py-10 px-6 bg-white">
      <h2 className="text-2xl font-bold mb-8 uppercase">
        {title}
      </h2>
      <div className="grid grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductLargerCard
            key={p._id}
            item={p}
            onClick={() => navigate(`/product/${p._id}`)}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryBlock({ category, backend, navigate, reversed }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const res = await fetch(
          `${backend}/api/products?category=${category._id}&limit=8`
        );
        const data = await res.json();
        setProducts(data.data || []);
      } catch (err) {
        console.error("❌ Lỗi tải sản phẩm danh mục:", err);
      }
    };
    fetchCategoryProducts();
  }, [backend, category._id]);

  const getGridCols = () => {
    if (products.length === 1) return "grid-cols-1";
    if (products.length === 2) return "grid-cols-2";
    if (products.length <= 4) return "grid-cols-2 sm:grid-cols-2 lg:grid-cols-2";
    return "grid-cols-4";
  };

  return (
    <div className={`flex flex-col md:flex-row ${reversed ? "md:flex-row-reverse" : ""}`}>
      {/* CATEGORY IMAGE */}
      <div
        className="md:w-1/3 relative cursor-pointer group"
        onClick={() => navigate(`/category/${category._id}`)}
      >
        <img
          src={category.image || "/no-image.jpg"}
          alt={category.name}
          className="w-full h-full object-cover"
        />

        {/* OVERLAY – chỉ hiện khi hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
          <h3 className="text-white text-2xl font-bold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {category.name}
          </h3>
        </div>
      </div>

      {/* PRODUCTS */}
      <div className={`md:w-2/3 grid gap-6 p-6 bg-white ${getGridCols()}`}>
        {products.map(p => (
          <ProductLargerCard
            key={p._id}
            item={p}
            onClick={() => navigate(`/product/${p._id}`)}
          />
        ))}
      </div>
    </div>
  );
}

