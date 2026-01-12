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
  const [isAnimating, setIsAnimating] = useState(false);

  const [cateIndex, setCateIndex] = useState(0);
  const visibleCount = 3;
  const categoryRef = useRef(null);

  const bannerRef = useRef(null);
  const [bannerIndex, setBannerIndex] = useState(0);

  useEffect(() => {
    if (!banners.length) return;

    const interval = setInterval(() => {
      setBannerIndex(i => (i + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners]);

  useEffect(() => {
    const el = bannerRef.current;
    if (!el) return;

    el.scrollTo({
      left: bannerIndex * window.innerWidth,
      behavior: "smooth",
    });
  }, [bannerIndex]);

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


  const maxIndex = Math.max(topCategories.length - visibleCount, 0);
  
  const changePage = (index) => {
    if (index === cateIndex) return;

    setIsAnimating(true);

    setTimeout(() => {
      setCateIndex(index);
      scrollToCategoryTitle();
    }, 200);

    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  const scrollToCategoryTitle = () => {
    const y =
      categoryRef.current?.getBoundingClientRect().top +
      window.scrollY -
      80; // trừ header

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });
  };
  return (
    <div className="w-full bg-white">
      {/* BANNER */}
      <div className="w-full overflow-hidden">
        <div
          ref={bannerRef}
          className="flex overflow-x-hidden snap-x snap-mandatory"
        >
          {banners.map(b => (
            <div key={b._id} className="min-w-full snap-center">
              <Banner {...b} />
            </div>
          ))}
        </div>

        {/* DOTS */}
        <div className="flex justify-center gap-2 mt-3">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setBannerIndex(i)}
              className={`w-2.5 h-2.5 transition ${
                bannerIndex === i ? "bg-black" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>


      <Section title="NEW" products={newProducts} navigate={navigate} />
      <Section title="BEST SELLER" products={bestSeller} navigate={navigate} />

      {/* CATEGORY FEATURE */}
      <div ref={categoryRef} className="bg-white py-6">
        <div className=" md:w-[95%] mx-auto">
          <div className="mb-10 flex items-center gap-4 px-3 mx-auto xl:px-0 sm lg:px-0 md:px-0">
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide">
            categories
          </h2>
          <div className="flex-1 h-px bg-black/20" />
          </div>
        </div>
        
        <div
          className={`
            flex flex-col gap-12
            transition-all duration-500 ease-out
            ${isAnimating
              ? "opacity-0 translate-x-6"
              : "opacity-100 translate-x-0"}
          `}
        >
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
          <div className="flex justify-center gap-3 mt-24">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <button
                key={i}
                onClick={() => changePage(i)}
                className={`
                  transition-all duration-300
                  h-2  
                  ${cateIndex === i
                    ? "w-12 bg-black"
                    : "w-6 bg-gray-300 hover:bg-gray-400"}
                `}
              />
            ))}
          </div>
        )}

      </div>
      <div className=" w-[95%] mt-10 md:mx-auto">
        <div className="flex items-center gap-4 mb-5 px-3 lg:px-0 md:px-0">
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide">
            BLOG
          </h2>
          <div className="flex-1 h-px bg-black/20" />
        </div>
        </div>
        <div className=" w-[95%] md:mx-auto">
          <div className=" px-3 lg:px-0 md:px-0">
            <Blog/>
          </div>
        </div>
        
          
      </div>
  );
}

/* ================= COMPONENTS ================= */
function Section({ title, products, navigate }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-14 bg-white">
      <div className="w-[95%] mx-auto">
        {/* TITLE */}
        <div className="mb-10 flex items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-bold uppercase tracking-wide">
            {title}
          </h2>
          <div className="flex-1 h-px bg-black/20" />
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-20">
          {products.map((p, i) => (
            <div
              key={p._id}
              style={{ transitionDelay: `${i * 80}ms` }}
              className={`
                transform transition-all duration-700 ease-out
                ${visible
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-6 scale-[0.98]"}
              `}
            >
              <ProductLargeCard
                item={p}
                onClick={() => navigate(`/product/${p._id}`)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function useVisibleCount() {
  const getCount = () => {
    const w = window.innerWidth;
    if (w < 800) return 4;        // mobile
    if (w < 1200) return 4;       // tablet / small desktop
    return 6;                     // desktop lớn
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
  const visibleCount = useVisibleCount();  
  const isFew = products.length < 3;
  useEffect(() => {
    let mounted = true;

    fetch(`${backend}/api/products?category=${category._id}&limit=6`)
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
        <div
          className={`
            w-full
            overflow-hidden
            ${isFew ? " md:h-full lg:h-[600px]" : "h-full"}
          `}
        >
          <img
            src={category.image || "/no-image.jpg"}
            alt={category.name}
            className="
              w-full
              h-full
              object-cover
              transition-transform
              duration-300
              group-hover:scale-105
            "
          />
        </div>

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/30 transition-colors duration-300 flex items-center justify-center">
          <h3 className="text-white text-xl md:text-2xl font-bold uppercase tracking-wide text-center px-4 drop-shadow">
            {category.name}
          </h3>
        </div>
      </div>

      {/* PRODUCTS */}
      <div
        className={`md:w-2/3
          grid grid-cols-2 lg:grid-cols-3
          gap-4 md:gap-6 lg:gap-20
          ${reversed ? "md:ml-20 md:mr-3" : "md:mr-20 md:ml-3"}
          px-0
        `}
      >       
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



