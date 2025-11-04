import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import useAuth from "../../../hooks/useAuth";

export default function UserCart() {
  const { isAuthenticated, loading } = useAuth();
  const [cart, setCart] = useState(null);
  const [error, setError] = useState(null);
  const backend = import.meta.env.VITE_BACKEND_URL;
  const { t } = useTranslation();

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchCart = async () => {
      try {
        const res = await axios.get(`${backend}/api/cart`, { withCredentials: true });
        setCart(res.data.cart || { items: [] });
      } catch (err) {
        console.error("Lỗi tải giỏ hàng:", err);
        setError(t("cart_error"));
      }
    };

    fetchCart();
  }, [isAuthenticated, t]);

  if (loading) return <p>{t("cart_loading")}</p>;
  if (!isAuthenticated) return <p>{t("cart_login_required")}</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!cart?.items?.length) return <p>{t("cart_empty")}</p>;

  // === Tính toán giống CartPage ===
  const subtotal = cart.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const vat = subtotal * 0.08;
  const loyalty = Math.floor(subtotal * 0.01);
  const total = subtotal + vat;

  return (
    <div className="bg-white p-6 shadow-sm border border-gray-200">
      <h2 className="text-2xl font-semibold mb-6 border-b pb-3">{t("cart_title")}</h2>

      {/* Danh sách sản phẩm */}
      <ul className="space-y-4">
        {cart.items.map((item) => {
          const product = item.productId || item.product;
          const coverImage =
            item.variantInfo?.coverImage ||
            product?.coverImage ||
            product?.mainImage?.url ||
            "/no-image.jpg";
          const color = item.variantInfo?.color;
          const size = item.variantInfo?.size;

          return (
            <li
              key={item.sku || item._id}
              className="flex items-center gap-4 border-b pb-4 last:border-none"
            >
              <img
                src={coverImage}
                alt={product?.name}
                className="w-20 h-20 object-cover border"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-800">{product?.name}</p>
                <p className="text-sm text-gray-500">SKU: {item.sku}</p>

                {/* Màu và Size */}
                <div className="flex gap-3 mt-1 text-xs uppercase">
                  {color && (
                    <span className="flex items-center gap-1">
                      <span
                        className="w-4 h-4 border border-gray-400 inline-block"
                        style={{ backgroundColor: color?.code || "#ccc" }}
                      ></span>
                      {color?.name}
                    </span>
                  )}
                  {size && (
                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 font-semibold">
                      {size?.name}
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-600 mt-2">
                  {t("quantity")}: <b>{item.quantity}</b> | {t("price")}:{" "}
                  <b>{item.price?.toLocaleString()}₫</b>
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Tổng kết */}
      <div className="mt-8 border-t pt-4 text-sm space-y-2">
        <div className="flex justify-between">
          <span>{t("subtotal", { count: cart.items.length })}</span>
          <span>{subtotal.toLocaleString()}₫</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>{t("vat")}</span>
          <span>{vat.toLocaleString()}₫</span>
        </div>
        <div className="flex justify-between text-green-600 font-medium">
          <span>{t("loyalty_points")}</span>
          <span>+{loyalty} PTS</span>
        </div>
        <div className="border-t mt-3 pt-3 font-bold text-lg flex justify-between">
          <span>{t("total")}</span>
          <span className="text-red-600">{total.toLocaleString()}₫</span>
        </div>
      </div>

      {/* Nút Xem giỏ hàng */}
      <div className="mt-6 text-center">
        <Link
          to="/cart"
          className="inline-block bg-black text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-all"
        >
          {t("view_cart")}
        </Link>
      </div>
    </div>
  );
}
