import axios from "axios";
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function PaymentSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const statusMap = {
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    shipped: "Đã gửi",
    completed: "Hoàn tất",
    cancelled: "Hủy",
    expired: "Hết hạn",
  };

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await axios.get(`${backend}/api/orders/user/order/${orderId}`, { withCredentials: true });
        setOrder(res.data.order);
      } catch (err) {
        console.error("Lỗi tải đơn hàng:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-6">
        <div className="animate-spin border-4 border-t-transparent border-green-500 rounded-full w-16 h-16 mb-4"></div>
        <p className="text-black text-lg">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-6">
        <p className="text-red-500 text-lg">Không tìm thấy thông tin đơn hàng.</p>
        <Link to="/" className="mt-4 text-black underline">Quay lại trang chủ</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6">
      <CheckCircle size={80} className="text-[#ffe6e6] mb-4" />
      <h1 className="text-2xl font-semibold text-white">Thanh toán thành công!</h1>
      <p className="mt-2 text-white">
        Mã đơn hàng: <span className="font-semibold text-white">{order.orderCode}</span>
      </p>
      <p className="mt-1 text-white">
        Tổng tiền: <span className="font-semibold text-white">{order.total?.toLocaleString()}₫</span>
      </p>

      {/* Chi tiết đơn hàng */}
      <div className="mt-6 w-full max-w-4xl bg-white shadow-lg  p-6 space-y-4">
        {/* Thông tin cơ bản */}
        <div className="grid grid-cols-2 gap-4">
          <p><strong>Mã đơn hàng:</strong> {order.orderCode}</p>
          <p><strong>Ngày tạo:</strong> {new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
          <p><strong>Tổng tiền:</strong> {order.total?.toLocaleString()}₫</p>
          <p><strong>Trạng thái:</strong> {statusMap[order.status] || order.status}</p>
        </div>

        {/* Địa chỉ giao hàng */}
        <div>
          <h4 className="font-semibold">Địa chỉ giao hàng</h4>
          <p>{order.shippingAddress.fullName}, {order.shippingAddress.phone}</p>
          <p>{order.shippingAddress.street}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}</p>
        </div>

        {/* Khuyến mãi */}
        {order.promotionId && (
          <div>
            <p><strong>Khuyến mãi:</strong> {order.promotionId.name || order.promotionId.code}</p>
          </div>
        )}

        {/* Danh sách sản phẩm */}
        <div>
          <h4 className="font-semibold mb-2">Danh sách sản phẩm</h4>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.sku} className="flex gap-4 border p-2 rounded">
                {/* Ảnh chính */}
                <img
                  src={item.variantInfo?.coverImage || "/placeholder.png"}
                  alt={item.productName}
                  className="w-20 h-20 object-cover rounded"
                />

                <div className="flex-1 flex flex-col justify-between">
                  {/* Tên sản phẩm */}
                  <p className="font-semibold">{item.productName}</p>

                  {/* Variant & số lượng */}
                  <p className="text-sm text-gray-600">
                    {item.variantInfo?.color?.name || item.variantInfo.color || ""} /{" "}
                    {item.variantInfo?.size?.name || item.variantInfo.size || ""} - {item.quantity} × {item.price?.toLocaleString()}₫
                  </p>

                  {/* Nếu có nhiều ảnh */}
                  {item.variantInfo?.images?.length > 1 && (
                    <div className="flex gap-1 mt-1 overflow-x-auto">
                      {item.variantInfo.images.map((img, idx) => (
                        <img key={idx} src={img} alt="variant" className="w-10 h-10 object-cover rounded" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
      </div>
      <p className="mt-3 text-white">Cảm ơn bạn đã mua sắm tại Osso Saigon 💚</p>

      <Link
        to="/"
        className="mt-6 px-4 py-2 border border-white text-white rounded hover:bg-[#ffe6e6] hover:text-black transition"
      >
        Tiếp tục mua sắm
      </Link>
    </div>
  );
}
