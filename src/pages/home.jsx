import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Banner from "../components/common/Banner";
import ProductLargeCard from "../components/common/ProductLargeCard";
import { slugify } from "../utils/slugify";
import Blog from "./Blog";

export default function Home() {
  const backend = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [banners, setBanners] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [bestSeller, setBestSeller] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const visibleCount = 3;
  const [catePage, setCatePage] = useState(0);
  const categoryRef = useRef(null);

  const bannerRef = useRef(null);
  const [bannerIndex, setBannerIndex] = useState(0);

  /* ================= BANNER ================= */
  useEffect(() => {
    fetch(`${backend}/api/banners/active`)
      .then((r) => r.json())
      .then((d) => setBanners(d.filter((b) => b.isActive)));
  }, [backend]);

  useEffect(() => {
    if (!banners.length) return;
    const i = setInterval(
      () => setBannerIndex((v) => (v + 1) % banners.length),
      5000,
    );
    return () => clearInterval(i);
  }, [banners]);

  useEffect(() => {
    bannerRef.current?.scrollTo({
      left: bannerIndex * window.innerWidth,
      behavior: "smooth",
    });
  }, [bannerIndex]);

  useEffect(() => {
    fetch(`${backend}/api/products`)
      .then((r) => r.json())
      .then((j) => {
        const all = j.data || [];
        setNewProducts(
          [...all]
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 4),
        );
      });
  }, [backend]);

  useEffect(() => {
    fetch(`${backend}/api/bestseller`)
      .then((r) => r.json())
      .then((j) => {
        const list = (j.data || []).map((p) => {
          const v = p.variants?.[0] || {};

          return {
            ...p,
            coverImage:
              v.coverImage || v.images?.[0] || "/imgs/placeholder.jpg",

            colors: p.variants?.map((v) => v.color).filter(Boolean),
            sizes: p.variants?.map((v) => v.size).filter(Boolean),
          };
        });

        setBestSeller(list);
      });
  }, [backend]);

  /* ================= CATEGORY STREAMING LOAD ================= */
  useEffect(() => {
    let mounted = true;
    setTopCategories([]);

    (async () => {
      const res = await fetch(`${backend}/api/categories`);
      const categories = await res.json();
      if (!mounted) return;

      categories.forEach(async (c) => {
        try {
          const r = await fetch(
            `${backend}/api/products?category=${c._id}&limit=6`,
          );
          const j = await r.json();
          const products = j.data || [];

          if (!mounted || products.length === 0) return;

          setTopCategories((prev) => [...prev, { ...c, products }]);
        } catch (err) {
          console.error("Load products failed:", c._id, err);
        }
      });
    })();

    return () => (mounted = false);
  }, [backend]);

  /* ================= PAGINATION ================= */
  const pageCount = Math.ceil(topCategories.length / visibleCount);
  const start = catePage * visibleCount;
  const end = start + visibleCount;

  const changePage = (page) => {
    if (page === catePage) return;
    setIsAnimating(true);

    setTimeout(() => {
      setCatePage(page);
      const y =
        categoryRef.current?.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }, 200);

    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <div className="w-full bg-white">
      {/* BANNER */}
      <div className="w-full overflow-hidden">
        <div
          ref={bannerRef}
          className="flex overflow-x-hidden snap-x snap-mandatory"
        >
          {banners.map((b) => (
            <div key={b._id} className="min-w-full snap-center">
              <Banner {...b} />
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-3">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setBannerIndex(i)}
              className={`w-2.5 h-2.5 ${bannerIndex === i ? "bg-black" : "bg-gray-300"}`}
            />
          ))}
        </div>
      </div>

      <Section title="NEW" products={newProducts} navigate={navigate} />
      <BestSellerSlider products={bestSeller} navigate={navigate} />

      {/* CATEGORY */}
      <div ref={categoryRef} className="py-6">
        <div className="w-[95%] mx-auto mb-10 flex items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-bold uppercase">
            categories
          </h2>
          <div className="flex-1 h-px bg-black/20" />
        </div>

        <div
          className={`flex flex-col gap-12 transition-all duration-500 ${
            isAnimating ? "opacity-0 translate-x-6" : "opacity-100"
          }`}
        >
          {topCategories.slice(start, end).map((cat, i) => (
            <CategoryBlock
              key={cat._id}
              category={cat}
              navigate={navigate}
              reversed={i % 2}
            />
          ))}
        </div>

        {pageCount > 1 && (
          <div className="flex justify-center mt-24">
            <div className="flex w-1/3 max-w-md gap-3">
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => changePage(i)}
                  className={`h-2 transition-all ${
                    catePage === i
                      ? "flex-[3] bg-black"
                      : "flex-[1] bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="w-[95%] mx-auto mt-10">
        <div className="flex items-center gap-4 mb-5">
          <h2 className="text-2xl md:text-3xl font-bold uppercase">BLOG</h2>
          <div className="flex-1 h-px bg-black/20" />
        </div>
        <Blog />
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Section({ title, products, navigate }) {
  return (
    <section className="mb-10 mt-14">
      <div className="w-[95%] mx-auto">
        <div className="mb-6 flex items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-bold uppercase">{title}</h2>

          <div className="flex-1 h-px bg-black/20" />

          {title === "NEW"}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-20">
          {products.map((p) => (
            <ProductLargeCard
              key={p.groupId}
              item={p}
              onClick={() => {
                const slug = slugify(p.name);
                navigate(`/product/${slug}-${p.groupId}`);
              }}
            />
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => navigate("/all")}
            className="
                text-md
                font-medium
                text-black/70
                hover:text-black
                transition
              "
          >
            Xem thêm
          </button>
        </div>
      </div>
    </section>
  );
}

function CategoryBlock({ category, navigate, reversed }) {
  const products = category.products || [];
  const isFew = products.length < 3;
  return (
    <div
      className={`flex flex-col md:flex-row ${reversed ? "md:flex-row-reverse" : ""}`}
    >
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

      <div
        className={`md:w-2/3
          grid grid-cols-2 lg:grid-cols-3
          gap-4 md:gap-6 lg:gap-20
          ${reversed ? "md:ml-20 md:mr-6 lg:mr-20" : "md:mr-20 md:ml-6 lg:ml-20"}
          px-0
        `}
      >
        {products.map((p) => (
          <ProductLargeCard
            key={p.groupId}
            className="opacity-0 translate-y-3 animate-item"
            item={p}
            onClick={() => {
              const slug = slugify(p.name);
              navigate(`/product/${slug}-${p.groupId}`);
            }}
          />
        ))}
      </div>
    </div>
  );
}
function BestSellerSlider({ products, navigate }) {
  const [page, setPage] = useState(0);
  const PER_PAGE = 4;

  const pageCount = Math.ceil(products.length / PER_PAGE);
  const start = page * PER_PAGE;
  const visible = products.slice(start, start + PER_PAGE);

  return (
    <section className="pb-10 mt-0">
      <div className="w-[95%] mx-auto">
        <div className="mb-10 flex items-center gap-4">
          <h2 className="text-2xl md:text-3xl font-bold uppercase">
            BEST SELLER
          </h2>
          <div className="flex-1 h-px bg-black/20" />
        </div>

        {/* PRODUCTS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-20">
          {visible.map((p) => (
            <ProductLargeCard
              key={p.groupId}
              item={p}
              onClick={() => {
                const slug = slugify(p.name);
                navigate(`/product/${slug}-${p.groupId}`);
              }}
            />
          ))}
        </div>

        {/* DOT */}
        {pageCount > 1 && (
          <div className="flex justify-center mt-20">
            <div className="flex w-1/3 max-w-md gap-3">
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i)}
                  className={`h-2 transition-all duration-300 ${
                    page === i ? "flex-[3] bg-black" : "flex-[1] bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
