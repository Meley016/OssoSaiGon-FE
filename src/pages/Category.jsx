import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductLargeCard from "../components/common/ProductLargeCard";

export default function Category() {
  const { slug: categorySlug } = useParams();
  const backend = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 12;

  const cacheRef = useState({})[0]; // cache products theo category + page

  // 🔹 Lấy tất cả categories → tìm category theo slug
  const fetchCategory = async () => {
    try {
      const [mainRes, catRes] = await Promise.all([
        fetch(`${backend}/api/main-categories`),
        fetch(`${backend}/api/categories`),
      ]);

      const mains = await mainRes.json();
      const cats = await catRes.json();

      // Tìm category theo slug hoặc _id
      let cat = mains.find((m) => m.slug === categorySlug || m._id === categorySlug);
      if (!cat) {
        // Hoặc là subcategory
        cat = cats.find((c) => c.slug === categorySlug || c._id === categorySlug);
        if (!cat) throw new Error("Không tìm thấy danh mục");
        const mainId = typeof cat.mainCategory === "object" ? cat.mainCategory._id : cat.mainCategory;
        const main = mains.find((m) => m._id === mainId);
        return { ...cat, children: [], parent: main };
      }

      // Nếu là main category → lấy children
      const children = cats.filter((c) => {
        const mainId = typeof c.mainCategory === "object" ? c.mainCategory._id : c.mainCategory;
        return mainId === cat._id;
      });

      return { ...cat, children };
    } catch (err) {
      console.error(err);
      setCategory(null);
      return null;
    }
  };

  // 🔹 Fetch products theo category + page
  const fetchProductsForCategory = async (cat, page = 1) => {
    const cacheKey = `cat-${cat._id}-page-${page}`;
    if (cacheRef[cacheKey]) {
      setProducts(cacheRef[cacheKey].items);
      setTotalPages(cacheRef[cacheKey].totalPages);
      return;
    }

    setLoading(true);

    try {
      let allProducts = [];
      let totalProducts = 0;

      if (cat.children && cat.children.length > 0) {
        // Main category → lấy tất cả subcategories
        for (let i = 0; i < cat.children.length; i++) {
          const res = await fetch(
            `${backend}/api/products?limit=${limit}&page=${page}&category=${cat.children[i]._id}`
          );
          const json = await res.json();
          const subProducts = json?.data || [];
          allProducts = allProducts.concat(subProducts);
          totalProducts = json?.total || totalProducts;
          if (allProducts.length >= limit) break;
        }
        allProducts = allProducts.slice(0, limit);
      } else {
        // Subcategory
        const res = await fetch(
          `${backend}/api/products?limit=${limit}&page=${page}&category=${cat._id}`
        );
        const json = await res.json();
        allProducts = json?.data || [];
        totalProducts = json?.total || 0;
      }

      const totalPages = Math.ceil(totalProducts / limit) || 1;

      cacheRef[cacheKey] = { items: allProducts, totalPages };
      setProducts(allProducts);
      setTotalPages(totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Load category + products
  useEffect(() => {
    const load = async () => {
      const cat = await fetchCategory();
      if (cat) {
        setCategory(cat);
        fetchProductsForCategory(cat, page);
      }
    };
    load();
  }, [categorySlug, page]);

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500 animate-pulse">Đang tải...</p>
      </div>
    );

  if (!category)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-gray-600">
        <p>Không tìm thấy danh mục này.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-black text-white rounded hover:opacity-80"
        >
          Quay lại
        </button>
      </div>
    );

  return (
    <div className="mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-8 uppercase border-b pb-2 border-gray-300">
        {category.name}
      </h1>

      {products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-8">
            {products.map((item) => (
              <ProductLargeCard
                key={item._id}
                item={item}
                onClick={() => navigate(`/product/${item._id}`)}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-8 gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Trước
            </button>
            <span className="px-4 py-2">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              
            </button>
          </div>
        </>
      ) : (
        <p className="text-gray-500 text-center mt-10">
          Chưa có sản phẩm nào trong danh mục này.
        </p>
      )}
    </div>
  );
}
