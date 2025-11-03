import axios from "axios";
import { useEffect, useState } from "react";
import useAuth from "../../../hooks/useAuth";

export default function UserCart() {
  const { isAuthenticated, loading } = useAuth();
  const [cart, setCart] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchCart = async () => {
      try {
        const backend = import.meta.env.VITE_BACKEND_URL;
        const res = await axios.get(`${backend}/api/cart`, { withCredentials: true });
        setCart(res.data.cart || { items: [] });
      } catch (err) {
        console.error("Lỗi tải giỏ hàng:", err);
      }
    };
    fetchCart();
  }, [isAuthenticated]);

  if (loading) return <p>Đang tải giỏ hàng...</p>;
  if (!isAuthenticated) return <p>Vui lòng đăng nhập để xem giỏ hàng.</p>;
  if (!cart?.items?.length) return <p>Giỏ hàng của bạn trống.</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Giỏ hàng của bạn</h2>
      <ul className="space-y-3">
        {cart.items.map((item) => (
          <li key={item._id} className="border p-3 rounded-lg flex items-center gap-3">
            <img
              src={item.product?.mainImage?.url}
              alt=""
              className="w-16 h-16 object-cover rounded-md"
            />
            <div>
              <p className="font-medium">{item.product?.name}</p>
              <p>
                Số lượng: {item.quantity} | Giá:{" "}
                {item.product?.price?.toLocaleString()}₫
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
