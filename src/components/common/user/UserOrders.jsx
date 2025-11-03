import axios from "axios";
import { useEffect, useState } from "react";
import useAuth from "../../../hooks/useAuth";

export default function UserOrders() {
  const { isAuthenticated, loading } = useAuth();
  const [orders, setOrders] = useState([]);

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

  if (loading) return <p>Đang tải đơn hàng...</p>;
  if (!isAuthenticated) return <p>Vui lòng đăng nhập để xem đơn hàng.</p>;
  if (!orders.length) return <p>Bạn chưa có đơn hàng nào.</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Đơn hàng của bạn</h2>
      <ul className="space-y-3">
        {orders.map((order) => (
          <li key={order._id} className="border p-3 rounded-lg">
            <p><strong>Mã đơn:</strong> {order._id}</p>
            <p><strong>Ngày đặt:</strong> {new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
            <p><strong>Tổng tiền:</strong> {order.total?.toLocaleString()}₫</p>
            <p><strong>Trạng thái:</strong> {order.status}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
