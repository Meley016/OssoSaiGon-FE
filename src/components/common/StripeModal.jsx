import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import fetchClient from "../../api/fetchClient";

export default function StripeModal({ isOpen, onClose, orderId }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [orderTotal, setOrderTotal] = useState(null);

  /* ================= FETCH ORDER ================= */
  useEffect(() => {
    if (!isOpen || !orderId) return;

    const fetchOrder = async () => {
      try {
        const data = await fetchClient(`/orders/user/order/${orderId}`);
        setOrderTotal(data.order.total);
      } catch (err) {
        console.error("Fetch order error:", err);
        setErrorMsg("Không thể lấy thông tin đơn hàng");
      }
    };

    fetchOrder();
  }, [isOpen, orderId]);

  if (!isOpen || !orderId) return null;

  /* ================= STRIPE PAYMENT ================= */
  const handleStripePayment = async () => {
    if (!stripe || !elements) return;

    setLoading(true);
    setErrorMsg("");

    try {
      // 1️⃣ Create PaymentIntent
      const intentData = await fetchClient("/payment/create-payment-intent", {
        method: "POST",
        body: JSON.stringify({ orderId }),
      });

      if (!intentData.clientSecret) {
        throw new Error("Không thể tạo PaymentIntent");
      }

      // 2️⃣ Get card
      const card = elements.getElement(CardElement);
      if (!card) throw new Error("CardElement chưa sẵn sàng");

      // 3️⃣ Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        intentData.clientSecret,
        {
          payment_method: { card },
        },
      );

      if (error) {
        setErrorMsg(error.message);
        navigate(`/payment-failed/${orderId}`);
        return;
      }

      if (paymentIntent.status === "succeeded") {
        // 4️⃣ Confirm order
        await fetchClient("/orders/confirm-stripe", {
          method: "POST",
          body: JSON.stringify({
            orderId,
            paymentIntentId: paymentIntent.id,
          }),
        });

        navigate(`/order-success/${orderId}`);
      } else {
        navigate(`/payment-failed/${orderId}`);
      }
    } catch (err) {
      console.error("Stripe payment error:", err);
      setErrorMsg(err.message || "Thanh toán thất bại");
    } finally {
      setLoading(false);
    }
  };
  /* ================= RENDER ================= */
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 space-y-6 relative">
        {/* CLOSE */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-6 text-3xl font-bold text-gray-500 hover:text-black transition"
        >
          ×
        </button>

        {/* HEADER */}
        <div className="text-center">
          <h2 className="text-3xl font-bold">Thanh toán bằng thẻ</h2>
          <p className="text-xl text-gray-600 mt-2">
            Số tiền:{" "}
            <span className="font-bold text-black">
              {(orderTotal ?? 0).toLocaleString()}₫
            </span>
          </p>
        </div>

        {/* CARD */}
        <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-300">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: "18px",
                  color: "#000",
                  "::placeholder": { color: "#aab7c4" },
                },
              },
            }}
            className="p-4 bg-white border-2 border-black rounded"
          />
        </div>

        {/* ERROR */}
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-300 text-red-700 rounded text-center">
            {errorMsg}
          </div>
        )}

        {/* PAY BUTTON */}
        <button
          onClick={handleStripePayment}
          disabled={loading || !stripe || orderTotal === null}
          className="w-full py-5 bg-black text-white font-bold text-xl rounded-lg hover:bg-gray-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Đang xử lý thanh toán..." : "Thanh toán ngay"}
        </button>

        <p className="text-center text-sm text-gray-500">
          Thanh toán an toàn qua Stripe • Không lưu thông tin thẻ
        </p>
      </div>
    </div>
  );
}
