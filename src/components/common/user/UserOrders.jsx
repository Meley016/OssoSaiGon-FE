import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useAuth from "../../../hooks/useAuth";
import useCurrency from "../../../hooks/useCurrency"; // <-- import hook

export default function UserOrders() {
  const { isAuthenticated, loading } = useAuth();
  const { t } = useTranslation();
  const { formatPrice } = useCurrency(); // <-- lấy hàm formatPrice
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

  const fetchOrderDetail = async (orderId) => {
    try {
      const backend = import.meta.env.VITE_BACKEND_URL;
      const res = await axios.get(`${backend}/api/orders/user/order/${orderId}`, { withCredentials: true });
      setSelectedOrder(res.data.order);
      setShowModal(true);
    } catch (err) {
      console.error("Lỗi tải chi tiết đơn hàng:", err);
    }
  };

  const statusMap = {
    pending: t("status_pending"),
    processing: t("status_processing"),
    shipped: t("status_shipped"),
    completed: t("status_completed"),
    cancelled: t("status_cancelled"),
    expired: t("status_expired"),
  };

  if (loading) return <p>{t("orders_loading")}...</p>;
  if (!isAuthenticated) return <p>{t("orders_login_required")}</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">{t("orders_title")}</h2>

      {!orders.length ? (
        <p>{t("orders_empty")}</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order._id} className="border p-3">
              <p><strong>{t("order_id")}:</strong> {order.orderCode || order._id}</p>
              <p><strong>{t("order_date")}:</strong> {new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
              <p><strong>{t("order_total")}:</strong> {formatPrice(order.total)}</p>
              <p><strong>{t("order_status")}:</strong> {statusMap[order.status] || order.status}</p>

              <button
                onClick={() => fetchOrderDetail(order._id)}
                className="mt-2 px-4 py-2 font-semibold"
                style={{
                  backgroundColor: "#000",
                  color: "#fff",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#ffe6e6";
                  e.target.style.color = "#000";
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#000";
                  e.target.style.color = "#fff";
                }}
              >
                {t("view_order")}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Modal chi tiết */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-auto">
          <div className="bg-white w-full max-w-4xl mt-10 p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{t("order_detail_title")}</h3>
              <button onClick={() => setShowModal(false)} className="text-xl font-bold px-2">×</button>
            </div>

            {/* Info cơ bản */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <p><strong>{t("order_id")}:</strong> {selectedOrder.orderCode || selectedOrder._id}</p>
              <p><strong>{t("order_date")}:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString("vi-VN")}</p>
              <p><strong>{t("order_total")}:</strong> {formatPrice(selectedOrder.total)}</p>
              <p><strong>{t("order_status")}:</strong> {statusMap[selectedOrder.status] || selectedOrder.status}</p>
            </div>

            {/* Địa chỉ giao hàng */}
            <div className="mt-4">
              <h4 className="font-semibold">{t("shipping_address")}</h4>
              <p>{selectedOrder.shippingAddress.fullName}, {selectedOrder.shippingAddress.phone}</p>
              <p>{selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.ward}, {selectedOrder.shippingAddress.district}, {selectedOrder.shippingAddress.city}</p>
            </div>

            {/* Khuyến mãi */}
            {selectedOrder.promotionId && (
              <div className="mt-3">
                <p><strong>Promotion:</strong> {selectedOrder.promotionId.name || selectedOrder.promotionId.code}</p>
              </div>
            )}

            {/* Danh sách sản phẩm */}
            <div className="mt-3">
              <h4 className="font-semibold mb-2">{t("order_items")}</h4>
              <ul className="space-y-3">
                {selectedOrder.items.map((item) => (
                  <li key={item.sku} className="flex gap-4 border p-2">
                    <img
                      src={item.variantInfo?.coverImage || "/placeholder.png"}
                      alt={item.productName}
                      className="w-20 h-20 object-cover"
                    />
                    <div className="flex-1 flex flex-col justify-between">
                      <p className="font-semibold">{item.productName}</p>
                      <p className="text-sm text-gray-600">
                        {item.variantInfo?.color?.name || item.variantInfo.color} /{" "}
                        {item.variantInfo?.size?.name || item.variantInfo.size} - {item.quantity} × {formatPrice(item.price)}
                      </p>
                      {item.variantInfo?.images?.length > 1 && (
                        <div className="flex gap-1 mt-1 overflow-x-auto">
                          {item.variantInfo.images.map((img, idx) => (
                            <img key={idx} src={img} alt="variant" className="w-10 h-10 object-cover" />
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
