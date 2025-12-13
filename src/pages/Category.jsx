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
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [page, categorySlug]);
  // 🔹 Fetch products theo category + page
    const fetchProductsForCategory = async (cat, page = 1) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page,
          limit,
        });

        if (cat.children?.length > 0) {
          cat.children.forEach((c) =>
            params.append("categories", c._id)
          );
        } else {
          params.append("categories", cat._id);
        }

        const res = await fetch(
          `${backend}/api/products/by-categories?${params}`
        );
        const json = await res.json();

        setProducts(json.data || []);
        setTotalPages(json.totalPages || 1);
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
              className="px-4 py-2disabled:opacity-50"
            >
               ◀
            </button>
            <span className="px-4 py-2">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2disabled:opacity-50"
            >
             ▶ 
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
