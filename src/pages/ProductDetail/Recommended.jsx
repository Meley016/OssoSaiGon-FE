import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ProductMiniCard from "../../components/common/ProductCard";

export default function Recommended({ currentId, categoryId }) {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const { t } = useTranslation(); // ✅ dùng i18next hook

  useEffect(() => {
    if (!categoryId) return;

    const fetchRecommended = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.data || [];

        const filtered = list
          .filter(p => p._id !== currentId && p.category?._id === categoryId)
          .slice(0, 10);

        setProducts(filtered);
      } catch (err) {
        console.error("❌ Lỗi tải sản phẩm đề xuất:", err);
      }
    };

    fetchRecommended();
  }, [currentId, categoryId]);

  if (!products.length) return null;

  return (
    <div className="mt-16">
      <h2 className="text-xl font-semibold mb-4 uppercase tracking-tight">
        {t("recommended.title")}
      </h2>

      <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300">
        {products.map(p => (
          <div key={p._id} className="snap-start flex-shrink-0">
            <ProductMiniCard
              item={p}
              onClick={() => navigate(`/product/${p._id}`)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
