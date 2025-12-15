import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Banner from "../components/common/Banner";
import ProductLargeCard from "../components/common/ProductLargeCard";
import Blog from "./Blog";

export default function Home() {
  const backend = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [banners, setBanners] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [bestSeller, setBestSeller] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topCategories, setTopCategories] = useState([]);

  const [cateIndex, setCateIndex] = useState(0);
  const visibleCount = 3;
  const categoryRef = useRef(null);

  /* ================= BANNERS ================= */
  useEffect(() => {
    fetch(`${backend}/api/banners/active`)
      .then(r => r.json())
      .then(d => setBanners(d.filter(b => b.isActive)));
  }, [backend]);

  /* ================= CATEGORIES ================= */
  useEffect(() => {
    fetch(`${backend}/api/categories`)
      .then(r => r.json())
      .then(setCategories);
  }, [backend]);
  
  const getMaxPrice = (product) =>
  product.variants?.reduce(
    (max, v) => Math.max(max, v.price || 0),
    0
  ) || 0;

  /* ================= PRODUCTS (PRIORITY LOAD) ================= */
  useEffect(() => {
    let mounted = true;

    (async () => {
      const res = await fetch(`${backend}/api/products?limit=60`);
      const json = await res.json();
      if (!mounted) return;

      const all = json.data || [];

      // render sớm NEW
      setNewProducts(
        [...all]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 4)
      );

      // render sớm BEST SELLER
      setBestSeller(
        [...all]
          .sort((a, b) => {
            const pa = getMaxPrice(a);
            const pb = getMaxPrice(b);
            return pb - pa; // giá cao -> thấp
          })
          .slice(0, 4)
      );

      // xử lý top categories async sau
      requestIdleCallback?.(() => {
        const count = {};
        all.forEach(p => {
          const id = p.category?._id;
          if (id) count[id] = (count[id] || 0) + 1;
        });

        const sortedIds = Object.entries(count)
          .sort((a, b) => b[1] - a[1])
          .map(([id]) => id);

        setTopCategories(
          categories.filter(c => sortedIds.includes(c._id)).slice(0, 6)
        );
      });
    })();

    return () => (mounted = false);
  }, [backend, categories]);

  const keepScroll = (fn) => {
    const y = categoryRef.current?.getBoundingClientRect().top + window.scrollY;
    fn();
    requestAnimationFrame(() => window.scrollTo({ top: y }));
  };

  const maxIndex = Math.max(topCategories.length - visibleCount, 0);

  return (
    <div className="w-full bg-gray-100">
      {/* BANNER */}
      <div className="w-full overflow-x-auto snap-x snap-mandatory no-scrollbar">
        {banners.map(b => (
          <div key={b._id} className="inline-block w-screen snap-center">
            <Banner {...b} />
          </div>
        ))}
      </div>

      <Section title="NEW" products={newProducts} navigate={navigate} />
      <Section title="BEST SELLER" products={bestSeller} navigate={navigate} />

      {/* CATEGORY FEATURE */}
      <div ref={categoryRef} className="bg-white py-6">
        <h2 className="text-2xl font-bold px-6 py-6 uppercase">Category</h2>

        <div className="flex flex-col gap-12">
          {topCategories
            .slice(cateIndex, cateIndex + visibleCount)
            .map((cat, i) => (
              <CategoryBlock
                key={cat._id}
                category={cat}
                backend={backend}
                navigate={navigate}
                reversed={i % 2}
              />
            ))}
        </div>

        {topCategories.length > visibleCount && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => keepScroll(() => setCateIndex(i))}
                className={`w-2.5 h-2.5 rounded-full ${
                  cateIndex === i ? "bg-black" : "bg-gray-300"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="bg-white">
        <h2 className="text-2xl font-bold px-6 pt-12 uppercase">Blog</h2>
        <Blog />
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Section({ title, products, navigate }) {
  return (
    <div className="border-t py-10 px-6 bg-white">
      <h2 className="text-2xl font-bold mb-8 uppercase">{title}</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((p, i) => (
          <div
            key={p._id}
            className="opacity-0 translate-y-3 animate-item"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <ProductLargeCard
              item={p}
              onClick={() => navigate(`/product/${p._id}`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function useVisibleCount() {
  const getCount = () => {
    const w = window.innerWidth;
    if (w < 800) return 4;        // mobile
    if (w < 1200) return 4;       // tablet / small desktop
    return 8;                     // desktop lớn
  };

  const [count, setCount] = useState(getCount);

  useEffect(() => {
    const onResize = () => setCount(getCount());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return count;
}

function CategoryBlock({ category, backend, navigate, reversed }) {
  const [products, setProducts] = useState([]);
  const visibleCount = useVisibleCount(); // 👈 dùng chung desktop + mobile

  useEffect(() => {
    let mounted = true;

    fetch(`${backend}/api/products?category=${category._id}&limit=8`)
      .then(r => r.json())
      .then(j => mounted && setProducts(j.data || []));

    return () => (mounted = false);
  }, [backend, category._id]);

  const visibleProducts = products.slice(0, visibleCount);

  return (
    <div className={`flex flex-col md:flex-row ${reversed ? "md:flex-row-reverse" : ""}`}>
      {/* IMAGE */}
      <div
        className="md:w-1/3 relative cursor-pointer group overflow-hidden"
        onClick={() => navigate(`/category/${category._id}`)}
      >
        <img
          src={category.image || "/no-image.jpg"}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/30 transition-colors duration-300 flex items-center justify-center">
          <h3 className="text-white text-xl md:text-2xl font-bold uppercase tracking-wide text-center px-4 drop-shadow">
            {category.name}
          </h3>
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="md:w-2/3 grid grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {visibleProducts.map((p, i) => (
          <div
            key={p._id}
            className="opacity-0 translate-y-3 animate-item"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <ProductLargeCard
              item={p}
              onClick={() => navigate(`/product/${p._id}`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}



