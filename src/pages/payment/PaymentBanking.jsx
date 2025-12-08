// src/pages/PaymentBankingSuccess.jsx
import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom"; // không import useNavigate nếu không dùng
import SettingsContext from "../../contexts/SettingsContext";

const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function PaymentBankingSuccess() {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currency, exchangeRate } = useContext(SettingsContext);

  const formatPrice = (v) => {
    const value = v * exchangeRate;
    return currency === "USD"
      ? `$${value.toFixed(2)}`
      : `${value.toLocaleString()}₫`;
  };

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${backend}/api/orders/user/order/${orderId}`, { withCredentials: true });
        setOrder(res.data.order);
      } catch (err) {
        console.error("Error loading order:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#ffe6e6] p-6">
        <div className="animate-spin border-4 border-t-transparent w-16 h-16 mb-4"></div>
        <p className="text-black text-lg">{t("payment.loading")}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#ffe6e6] p-6">
        <p className="text-red-500 text-lg">{t("payment.notFound")}</p>
        <Link to="/" className="mt-4 text-black underline">{t("payment.backHome")}</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#ffe6e6] p-6">
      <h1 className="text-3xl font-bold text-black mb-6">BANK TRANSFER METHOD</h1>

      {/* Bank info */}
      <div className="w-full max-w-4xl p-6 space-y-3 mb-6">
        <p><strong>BANK NAME:</strong> OCB (Orient Commercial Joint Stock Bank)</p>
        <p><strong>SWIFT:</strong> ORCOVNVX</p>
        <p><strong>ACCOUNT NUMBER:</strong> 0767022229</p>
        <p><strong>HOLDER’S NAME:</strong> LE TRUNG HIEU</p>
      </div>

      {/* Order details */}
      <div className="w-full max-w-4xl bg-white shadow-lg p-6 space-y-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">ORDER SUMMARY</h2>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.sku} className="flex gap-4 border p-2">
              <img
                src={item.variantInfo?.coverImage || "/placeholder.png"}
                alt={item.productName}
                className="w-20 h-20 object-cover"
              />
              <div className="flex-1 flex flex-col justify-between">
                <p className="font-semibold">{item.productName}</p>
                <p className="text-sm text-gray-600">
                  {item.variantInfo?.color?.name || item.variantInfo.color || ""} /{" "}
                  {item.variantInfo?.size?.name || item.variantInfo.size || ""} - {item.quantity} × {formatPrice(item.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Note */}
      <div className="w-full max-w-4xl text-center p-6 space-y-3 mb-6 text-gray-800">
        <p>It would take 6 hours to 1 business day to process your order after we received your payment. You will receive a confirmation email.</p>
        <p>Thanks for choosing us, homie!</p>
      </div>

      <button
        onClick={() => alert("Payment confirmed!")}
        className="px-6 py-3 bg-[#ec92b3] text-white hover:bg-black hover:text-white transition"
      >
        CONFIRM PAYMENT
      </button>
      <div className="flex px-6 py-3 gap-6 mb-6 w-full max-w-4xl">
        {/* Back to Shop */}
        <Link
            to="/"
            className="flex-1 flex flex-col items-start py-3 transition"
        >
            <span className="mb-1">Back to Shop</span>
            <svg
            className="w-full h-3"
            viewBox="0 0 100 2"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            >
            {/* Đường mảnh */}
            <line x1="-25" y1="1" x2="25" y2="1" stroke="black" strokeOpacity="0.5" strokeWidth="0.5"/>
            {/* Mũi tên trái */}
            <polygon points="0,1 -2,0 -2,2" fill="black" fillOpacity="0.5"/>
            </svg>
        </Link>

        {/* View My Order */}
        <Link
            to={`/order-success/${order._id}`}
            className="flex-1 flex flex-col items-end px-4 py-3 transition"
        >
            <span className="mb-1">View My Order</span>
            <svg
            className="w-full h-3"
            viewBox="0 0 100 2"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            >
            {/* Đường mảnh */}
            <line x1="69" y1="1" x2="125" y2="1" stroke="black" strokeOpacity="0.5" strokeWidth="0.5"/>
            {/* Mũi tên phải */}
            <polygon points="100,1 102,0 102,2" fill="black" fillOpacity="0.5"/>
            </svg>
        </Link>
        </div>

   </div>
  );
}
