// src/pages/payment/PaymentSuccess.jsx
import { CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get("order");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập load dữ liệu đơn hàng
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen text-gray-600">
        <div className="animate-spin border-4 border-t-transparent border-green-500 rounded-full w-12 h-12 mb-4"></div>
        <p>Đang xác nhận thanh toán...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-green-50 p-6">
      <CheckCircle size={80} className="text-green-600 mb-4" />
      <h1 className="text-2xl font-semibold text-green-700">Thanh toán thành công!</h1>
      {orderCode && (
        <p className="mt-2 text-gray-600">
          Mã đơn hàng: <span className="font-semibold text-green-700">{orderCode}</span>
        </p>
      )}
      <p className="mt-1 text-gray-500">Cảm ơn bạn đã mua sắm tại Osso Saigon 💚</p>

      <div className="mt-6 flex gap-3">
        <Link
          to="/orders"
          className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition"
        >
          Xem đơn hàng
        </Link>
        <Link
          to="/"
          className="border border-green-600 text-green-700 px-4 py-2 rounded-lg hover:bg-green-100 transition"
        >
          Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
}
