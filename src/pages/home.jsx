import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Banner from "../components/common/Banner";
import ProductLargerCard from "../components/common/ProductLargeCard";

export default function Home() {
  const backend = import.meta.env.VITE_BACKEND_URL;
  const [banners, setBanners] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [bestSeller, setBestSeller] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const navigate = useNavigate();

  // 🟢 Lấy banners hiển thị
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch(`${backend}/api/banners/active`);
        const data = await res.json();
        // Có thể lọc theo type nếu bạn có nhiều loại banner (ví dụ type = "home")
        const homeBanners = data.filter(b => b.isActive);
        setBanners(homeBanners);
      } catch (err) {
        console.error("❌ Lỗi tải banners:", err);
      }
    };
    fetchBanners();
  }, [backend]);

  // 🟢 Lấy categories (phục vụ phần cuối trang)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${backend}/api/categories`);
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("❌ Lỗi tải categories:", err);
      }
    };
    fetchCategories();
  }, [backend]);

  // 🟢 Lấy sản phẩm (để lấy new / best seller)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${backend}/api/products`);
        const data = await res.json();
        const products = data.data || [];

        // NEW
        const sortedByPrice = [...products].sort(
          (a, b) => (b?.variants?.[0]?.price || 0) - (a?.variants?.[0]?.price || 0)
        );
        setNewProducts(sortedByPrice.slice(0, 4));

        // BEST SELLER
        const sortedByStock = [...products].sort(
          (a, b) =>
            (b?.variants?.reduce((s, v) => s + (v.stockQuantity || 0), 0) || 0) -
            (a?.variants?.reduce((s, v) => s + (v.stockQuantity || 0), 0) || 0)
        );
        setBestSeller(sortedByStock.slice(0, 4));

        // TOP CATEGORY
        const categoryCount = {};
        for (const p of products) {
          const catId = p.category?._id || p.category;
          if (!catId) continue;
          categoryCount[catId] = (categoryCount[catId] || 0) + 1;
        }

        const topCatIds = Object.entries(categoryCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([id]) => id);

        const topCats = categories.filter(c => topCatIds.includes(c._id));
        setTopCategories(topCats);
      } catch (err) {
        console.error("❌ Lỗi tải sản phẩm:", err);
      }
    };
    fetchProducts();
  }, [backend, categories]);

  return (
    <div className="w-full bg-gray-100">
      {/* 🟢 Banner chính */}
      <div className="w-full overflow-x-auto snap-x snap-mandatory border-b border-gray-300 whitespace-nowrap no-scrollbar">
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

      {/* 🟢 NEW */}
      <Section title="NEW" products={newProducts} navigate={navigate} />

      {/* 🟢 BEST SELLER */}
      <Section title="BEST SELLER" products={bestSeller} navigate={navigate} />

      {/* 🟢 CATEGORY FEATURED */}
      <div className="w-full border-t border-gray-300 bg-white">
        <h2 className="text-2xl font-bold px-6 py-6 uppercase">Category</h2>
        <div className="flex flex-col">
          {topCategories.map((cat, index) => (
            <CategoryBlock
              key={cat._id}
              category={cat}
              backend={backend}
              navigate={navigate}
              reversed={index % 2 === 1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* 🟣 COMPONENT: Section */
function Section({ title, products, navigate }) {
  return (
    <div className="border-t border-gray-300 py-10 px-6 bg-white">
      <h2 className="text-2xl font-bold mb-8 uppercase tracking-wide">{title}</h2>
      <div
        className={`grid gap-6
          ${
            products.length === 1
              ? "grid-cols-1"
              : products.length === 2
              ? "grid-cols-2"
              : products.length === 3
              ? "grid-cols-3"
              : "grid-cols-4"
          }`}
      >
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

/* 🟣 COMPONENT: CategoryBlock */
function CategoryBlock({ category, backend, navigate, reversed }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const res = await fetch(`${backend}/api/products?category=${category._id}`);
        const data = await res.json();
        setProducts(data.data?.slice(0, 4) || []);
      } catch (err) {
        console.error("❌ Lỗi tải sản phẩm danh mục:", err);
      }
    };
    fetchCategoryProducts();
  }, [backend, category._id]);

  return (
    <div
      className={`flex flex-col md:flex-row ${
        reversed ? "md:flex-row-reverse" : ""
      } border-t border-gray-200`}
    >
      {/* 🟢 Cột category */}
      <div
        className="md:w-1/3 h-64 md:h-auto relative cursor-pointer"
        onClick={() => navigate(`/category/${category._id}`)}
      >
        <img
          src={category.image || "/no-image.jpg"}
          alt={category.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <h3 className="text-white text-2xl font-bold uppercase tracking-wide">
            {category.name}
          </h3>
        </div>
      </div>

      {/* 🟢 Cột sản phẩm */}
      <div
        className={`md:w-2/3 p-6 bg-white grid gap-6
          ${
            products.length === 1
              ? "grid-cols-1"
              : products.length === 2
              ? "grid-cols-2"
              : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
          }`}
      >
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
