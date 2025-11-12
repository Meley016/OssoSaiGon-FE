import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ProductMiniCard from "../../components/common/ProductCard";

export default function RecentViewed({ currentProduct }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const { t } = useTranslation(); // ✅ dùng i18next

  useEffect(() => {
    if (!currentProduct) return;

    let viewed = JSON.parse(localStorage.getItem("recentViewed")) || [];

    viewed = viewed.filter(p => p._id !== currentProduct._id);

    viewed.unshift({
      _id: currentProduct._id,
      name: currentProduct.name,
      coverImage: currentProduct.coverImage,
      variants: currentProduct.variants?.map(v => ({
        price: v.price,
        color: v.color,
        size: v.size,
      })),
    });

    viewed = viewed.slice(0, 10);
    localStorage.setItem("recentViewed", JSON.stringify(viewed));

    setItems(viewed);
  }, [currentProduct]);

  if (items.length <= 1) return null;

  return (
    <div className="mt-16">
      <h2 className="text-xl font-semibold mb-4 uppercase tracking-tight">
        {t("recentViewed.title")}
      </h2>

      <div className="flex gap-4 no-scrollbar overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300">
        {items
          .filter(p => p._id !== currentProduct._id)
          .map(p => (
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
