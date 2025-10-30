import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductMiniCard from "../components/common/ProductCard";

export default function WishlistPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/wishlist`, {
          credentials: "include",
        });

        if (res.status === 401) return navigate("/login");
        const data = await res.json();
        if (!data.apiProtect) return navigate("/login");

        const productIds = data.items?.map(w => w.product?._id || w.product) || [];
        if (productIds.length === 0) {
          setProducts([]);
          return;
        }

        const proRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products`);
        const proData = await proRes.json();
        const allProducts = Array.isArray(proData)
          ? proData
          : proData.data || proData.products || [];

        const wishlistProducts = allProducts.filter(p =>
          productIds.includes(p._id)
        );
        setProducts(wishlistProducts);
      } catch (err) {
        console.error("❌ Lỗi lấy wishlist:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [navigate]);

  const handleRemove = async productId => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/wishlist/toggle`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (res.status === 401) return navigate("/login");
      const data = await res.json();
      if (data.isWishlisted === false)
        setProducts(prev => prev.filter(p => p._id !== productId));
    } catch (err) {
      console.error("❌ Lỗi xóa wishlist:", err);
    }
  };

  if (loading)
    return <div className="text-center py-12 text-gray-600">Đang tải danh sách yêu thích...</div>;

  return (
    <div className="w-[90%] mx-auto mt-20 px-4 py-8 bg-white">
      <h1 className="text-3xl font-bold mb-8 text-center uppercase tracking-tight">
        Danh sách yêu thích
      </h1>

      {products.length === 0 ? (
        <div className="text-center text-gray-500 border border-gray-200 py-12">
          <p>Bạn chưa có sản phẩm nào trong danh sách yêu thích.</p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-6 py-2 bg-black text-white hover:bg-gray-800 transition-colors duration-200"
          >
            Tiếp tục mua sắm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {products.map(product => (
            <div key={product._id} className="relative group">
              {/* Nút xóa góc vuông */}
              <button
                onClick={e => {
                  e.stopPropagation();
                  handleRemove(product._id);
                }}
                className="absolute top-0 right-0 bg-white text-red-600 border border-gray-300 px-2 py-1 text-xs font-medium hover:bg-gray-100 z-10"
              >
                ✕
              </button>

              <ProductMiniCard
                item={product}
                onClick={() => navigate(`/product/${product._id}`)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
