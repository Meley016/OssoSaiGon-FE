import { useEffect, useState } from "react";
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

  // Slider state
  const [cateIndex, setCateIndex] = useState(0);
  const visibleCount = 3;

  // 🟢 Load banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${backend}/api/banners/active`);
        const data = await res.json();
        setBanners(data.filter(b => b.isActive));
      } catch (err) {
        console.error("❌ Lỗi tải banners:", err);
      }
    };
    fetchBanners();
  }, [backend]);

  // 🟢 Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${backend}/api/categories`);
        const data = await res.json();
        setCategories(data || []);
      } catch (err) {
        console.error("❌ Lỗi tải categories:", err);
      }
    };
    fetchCategories();
  }, [backend]);

  // 🟢 Load products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${backend}/api/products?limit=1000`);
        const data = await res.json();
        const allProducts = data.data || [];
        setProducts(allProducts);

        // NEW products theo createdAt
        const sortedByDate = [...allProducts].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setNewProducts(sortedByDate.slice(0, 4));

        // BEST SELLER theo tổng stockQuantity
        const sortedByStock = [...allProducts].sort(
          (a, b) =>
            (b.variants?.reduce((s, v) => s + (v.stockQuantity || 0), 0) || 0) -
            (a.variants?.reduce((s, v) => s + (v.stockQuantity || 0), 0) || 0)
        );
        setBestSeller(sortedByStock.slice(0, 4));
      } catch (err) {
        console.error("❌ Lỗi tải sản phẩm:", err);
      }
    };
    fetchProducts();
  }, [backend]);

  // 🟢 Top categories dựa trên số lượng sản phẩm
  useEffect(() => {
    if (!categories.length || !products.length) return;

    const categoryCount = {};
    products.forEach(p => {
      const catId = p.category?._id?.toString() || p.category?.toString();
      if (!catId) return;
      categoryCount[catId] = (categoryCount[catId] || 0) + 1;
    });

    const sortedCatIds = Object.entries(categoryCount)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    const topCats = categories.filter(c => sortedCatIds.includes(c._id.toString()));
    setTopCategories(topCats.slice(0, 6));
  }, [categories, products]);

  const maxIndex = Math.max(topCategories.length - visibleCount, 0);

  return (
    <div className="w-full mt-0 bg-gray-100">
      {/* Banner */}
      <div className="w-full overflow-x-auto snap-x snap-mandatory whitespace-nowrap no-scrollbar">
        {banners.length > 0 ? (
          banners.map(b => (
            <div key={b._id} className="inline-block w-screen snap-center">
              <Banner
                image={b.image || "/no-image.jpg"}
                title={b.title || ""}
                description={b.description || ""}
                link={b.link || "/"}
              />
            </div>
          ))
        ) : (
          <p className="text-center text-gray-600 mt-10">Chưa có banner nào.</p>
        )}
      </div>

      {/* NEW */}
      <Section title="NEW" products={newProducts} navigate={navigate} />

      {/* BEST SELLER */}
      <Section title="BEST SELLER" products={bestSeller} navigate={navigate} />

      {/* CATEGORY FEATURED */}
      <div className="w-full bg-white relative py-6">
        <h2 className="text-2xl font-bold px-6 py-6 uppercase">Category</h2>

        <div className="flex flex-col gap-12">
          {topCategories
            .slice(cateIndex, cateIndex + visibleCount)
            .map((cat, index) => (
              <CategoryBlock
                key={cat._id}
                category={cat}
                backend={backend}
                navigate={navigate}
                reversed={index % 2 === 1}
              />
            ))}
        </div>

        {/* Slider Buttons dưới */}
        {topCategories.length > visibleCount && (
          <div className="flex justify-center mt-4 gap-4">
            <button
              onClick={() => setCateIndex(i => Math.max(i - 1, 0))}
              className="bg-black/40 text-white px-4 py-2  disabled:opacity-40"
              disabled={cateIndex === 0}
            >
              ◀
            </button>
            <p>.........</p>
            <button
              onClick={() => setCateIndex(i => Math.min(i + 1, maxIndex))}
              className="bg-black/40 text-white px-4 py-2 disabled:opacity-40"
              disabled={cateIndex === maxIndex}
            >
              ▶
            </button>
          </div>
        )}
      </div>

      {/* BLOG */}
      <div className="bg-white">
        <h2 className="text-2xl font-bold px-6 pt-12 uppercase">Blog</h2>
        <Blog />
      </div>
    </div>
  );
}

// 🟣 COMPONENT: Section
function Section({ title, products, navigate }) {
  return (
    <div className="border-t border-gray-300 py-10 px-6 bg-white">
      <h2 className="text-2xl font-bold mb-8 uppercase tracking-wide">{title}</h2>
      <div className={`grid gap-6 ${products.length === 1 ? "grid-cols-1" : products.length === 2 ? "grid-cols-2" : "grid-cols-4"}`}>
        {products.map(item => (
          <ProductLargerCard
            key={item._id}
            item={item}
            onClick={() => navigate(`/product/${item._id}`)}
          />
        ))}
      </div>
    </div>
  );
}

// 🟣 COMPONENT: CategoryBlock
function CategoryBlock({ category, backend, navigate, reversed }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const res = await fetch(`${backend}/api/products?category=${category._id}&limit=8`);
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
      {/* Column category */}
      <div
        className="md:w-1/3 md:h-auto relative cursor-pointer"
        onClick={() => navigate(`/category/${category._id}`)}
      >
        <img
          src={category.image || "/no-image.jpg"}
          alt={category.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
          <h3 className="text-white text-2xl font-bold uppercase tracking-wide">
            {category.name}
          </h3>
        </div>
      </div>

      {/* Column products */}
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
