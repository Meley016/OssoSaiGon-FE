import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductMiniCard from "../../components/common/ProductCard";

export default function RecentViewed({ currentProduct }) {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (!currentProduct) return;

    let viewed = JSON.parse(localStorage.getItem("recentViewed")) || [];

    // Xóa nếu trùng
    viewed = viewed.filter(p => p._id !== currentProduct._id);

    // Thêm mới lên đầu
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

    // Giới hạn 10 sản phẩm
    viewed = viewed.slice(0, 10);
    localStorage.setItem("recentViewed", JSON.stringify(viewed));

    setItems(viewed);
  }, [currentProduct]);

  if (items.length <= 1) return null;

  return (
    <div className="mt-16">
      <h2 className="text-xl font-semibold mb-4 uppercase tracking-tight">
        Sản phẩm đã xem
      </h2>

      {/* Cuộn ngang */}
      <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300">
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
