import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductMiniCard from "../components/common/ProductCard";

export default function Category() {
  const { slug: categoryId } = useParams(); // /category/:slug (slug = id)
  const backend = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryAndProducts = async () => {
      try {
        setLoading(true);

        // 🟢 Lấy thông tin danh mục theo ID
        const catRes = await fetch(`${backend}/api/categories/${categoryId}`);
        const catData = await catRes.json();
        if (!catRes.ok) throw new Error(catData.error || "Không tìm thấy danh mục");
        setCategory(catData);

        // 🟢 Lấy sản phẩm thuộc danh mục này
        const prodRes = await fetch(`${backend}/api/products?category=${categoryId}`);
        const prodData = await prodRes.json();
        if (!prodRes.ok) throw new Error(prodData.error || "Lỗi tải sản phẩm");

        // BE trả về { success, data: [] } → nên lấy prodData.data hoặc prodData
        const list = prodData.data || prodData;
        setProducts(list);
      } catch (err) {
        console.error("❌ Fetch category page:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryAndProducts();
  }, [categoryId, backend]);

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
    <div className="max-w-6xl mx-auto px-4 py-10 mt-20">
      <h1 className="text-3xl font-bold mb-8 uppercase border-b pb-2 border-gray-300">
        {category.name}
      </h1>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {products.map((item) => (
            <ProductMiniCard
              key={item._id}
              item={item}
              onClick={() => navigate(`/product/${item._id}`)}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center mt-10">
          Chưa có sản phẩm nào trong danh mục này.
        </p>
      )}
    </div>
  );
}
