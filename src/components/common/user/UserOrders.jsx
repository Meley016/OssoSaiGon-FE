import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useAuth from "../../../hooks/useAuth";

export default function UserOrders() {
  const { isAuthenticated, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchOrders = async () => {
      try {
        const backend = import.meta.env.VITE_BACKEND_URL;
        const res = await axios.get(`${backend}/api/orders/user`, { withCredentials: true });
        setOrders(res.data.orders || []);
      } catch (err) {
        console.error("Lỗi tải đơn hàng:", err);
      }
    };
    fetchOrders();
  }, [isAuthenticated]);

  if (loading) return <p>{t("orders_loading")}</p>;
  if (!isAuthenticated) return <p>{t("orders_login_required")}</p>;
  if (!orders.length) return <p>{t("orders_empty")}</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">{t("orders_title")}</h2>
      <ul className="space-y-3">
        {orders.map((order) => (
          <li key={order._id} className="border p-3 rounded-lg">
            <p>
              <strong>{t("order_id")}:</strong> {order._id}
            </p>
            <p>
              <strong>{t("order_date")}:</strong>{" "}
              {new Date(order.createdAt).toLocaleDateString("vi-VN")}
            </p>
            <p>
              <strong>{t("order_total")}:</strong> {order.total?.toLocaleString()}₫
            </p>
            <p>
              <strong>{t("order_status")}:</strong> {order.status}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
