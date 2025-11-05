// src/pages/payment/PaymentFailed.jsx
import { XCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function PaymentFailed() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-red-50 p-6">
      <XCircle size={80} className="text-red-600 mb-4" />
      <h1 className="text-2xl font-semibold text-red-700">Thanh toán thất bại!</h1>
      <p className="mt-2 text-gray-600 text-center max-w-md">
        Rất tiếc, giao dịch của bạn chưa được hoàn tất.  
        Có thể do lỗi mạng, hủy giao dịch hoặc thời gian thanh toán hết hạn.
      </p>

      <div className="mt-6 flex gap-3">
        <Link
          to="/cart"
          className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition"
        >
          Thử lại
        </Link>
        <Link
          to="/"
          className="border border-red-600 text-red-700 px-4 py-2 rounded-lg hover:bg-red-100 transition"
        >
          Trang chủ
        </Link>
      </div>
    </div>
  );
}
