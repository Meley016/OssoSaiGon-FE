import { useState } from "react";
import { Link } from "react-router-dom";

const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function CheckoutPage() {
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!method) return alert("Vui lòng chọn phương thức thanh toán!");
    setLoading(true);

    try {
      if (method === "vnpay") {
        // 🔹 Gọi API BE để tạo link thanh toán VNPay
        const res = await fetch(`${backend}/api/payment/vnpay-payment`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: "6751f6d857eb6c6cf72a1234" }), // TODO: thay bằng orderId thật
        });

        const data = await res.json();
        if (!data.success) throw new Error(data.msg || "Không thể tạo link thanh toán");

        // ✅ Redirect đến VNPay URL
        window.location.href = data.paymentUrl;
        return;
      }

      if (method === "card") {
        alert("Chuyển đến form nhập thông tin thẻ (chưa tích hợp)");
      }

      if (method === "cod") {
        alert("Thanh toán khi nhận hàng - xác nhận đơn hàng thành công!");
      }
    } catch (err) {
      alert("Lỗi thanh toán: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-10">
      <div className="max-w-3xl mx-auto border border-gray-300 p-8 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold text-center mb-8 uppercase tracking-wide">
          Chọn Phương Thức Thanh Toán
        </h2>

        <div className="space-y-3">
          <label className="flex items-center gap-3 border p-4 rounded-lg hover:border-black transition cursor-pointer">
            <input
              type="radio"
              name="method"
              value="vnpay"
              checked={method === "vnpay"}
              onChange={(e) => setMethod(e.target.value)}
            />
            <span className="font-medium">Thanh toán qua VNPay (thẻ / QR / ngân hàng)</span>
          </label>

          <label className="flex items-center gap-3 border p-4 rounded-lg hover:border-black transition cursor-pointer">
            <input
              type="radio"
              name="method"
              value="card"
              checked={method === "card"}
              onChange={(e) => setMethod(e.target.value)}
            />
            <span className="font-medium">Thẻ ngân hàng / thẻ ảo (custom form)</span>
          </label>

          <label className="flex items-center gap-3 border p-4 rounded-lg hover:border-black transition cursor-pointer">
            <input
              type="radio"
              name="method"
              value="cod"
              checked={method === "cod"}
              onChange={(e) => setMethod(e.target.value)}
            />
            <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
          </label>
        </div>

        <div className="mt-8 flex justify-between items-center">
          <Link to="/cart" className="text-gray-500 underline">
            ← Quay lại giỏ hàng
          </Link>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="bg-black text-white px-8 py-3 uppercase font-bold tracking-wider hover:bg-gray-800 disabled:opacity-50 transition"
          >
            {loading ? "Đang xử lý..." : "Tiếp tục thanh toán"}
          </button>
        </div>
      </div>
    </div>
  );
}
