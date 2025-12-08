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
      <h1 className="text-3xl font-bold text-black mb-6">
        {t("payment.bankingTitle")}
        </h1>

    {/* Bank info */}
    <div className="w-full max-w-4xl p-6 space-y-3 mb-6">
    <p><strong>{t("payment.bank.name")}:</strong> OCB (Orient Commercial Joint Stock Bank)</p>
    <p><strong>{t("payment.bank.swift")}:</strong> ORCOVNVX</p>
    <p><strong>{t("payment.bank.account")}:</strong> 0767022229</p>
    <p><strong>{t("payment.bank.holder")}:</strong> LE TRUNG HIEU</p>
    <p><strong>{t("payment.noidungchuyenkhoan")}:</strong> {t("payment.madonhang")}</p>
    </div>

    {/* Order details */}
    <div className="w-full max-w-6xl bg-white shadow-lg p-6 mb-6">
  <h2 className="text-xl font-semibold mb-4">
    {t("payment.orderSummary")}
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    
    {/* LEFT — PRODUCTS */}
    <div>
      <h4 className="font-semibold mb-3">
        {t("payment.items")}
      </h4>

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
                {item.variantInfo?.size?.name || item.variantInfo.size || ""} –{" "}
                {item.quantity} × {formatPrice(item.price)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* RIGHT — ORDER INFO (NO PRODUCTS) */}
    <div className="border-l pl-6 space-y-3 text-sm">
      <p>
        <strong>OrderID: </strong> {order.orderCode}
      </p>

      <p>
        <strong>{t("payment.total")}:</strong> {formatPrice(order.total)}
      </p>

      <p>
        <strong>{t("payment.status")}:</strong> {t("orderStatus.processing")}
      </p>

      <p>
        <strong>{t("payment.createdAt")}:</strong>{" "}
        {new Date(order.createdAt).toLocaleDateString()}
      </p>

      <div>
        <p className="mb-3"><strong>{t("payment.shippingInfo")}: </strong></p>
        <p>{order.shippingAddress.fullName}, {order.shippingAddress.phone}</p>
        <p>
          {order.shippingAddress.street},{" "}
          {order.shippingAddress.ward},{" "}
          {order.shippingAddress.district},{" "}
          {order.shippingAddress.city}
        </p>
      </div>
    </div>

    </div>
    </div>

    {/* Note */}
    <div className="w-full max-w-4xl text-center p-6 space-y-3 mb-6 text-gray-800">
    <p>{t("payment.note.processing")}</p>
    <p>{t("payment.note.thanks")}</p>
    </div>

    <button
    className="px-6 py-3 bg-[#ec92b3] text-white hover:bg-black hover:text-white transition"
    >
    {t("payment.confirm")}
    </button>

    {/* Links */}
    <div className="flex px-6 py-3 gap-6 mb-6 w-full max-w-4xl">
    <Link to="/" className="flex-1 flex flex-col items-start py-3 transition">
        <span className="mb-1">{t("payment.backShop")}</span>
    </Link>

    <Link
        to={`/order-success/${order._id}`}
        className="flex-1 flex flex-col items-end px-4 py-3 transition"
    >
        <span className="mb-1">{t("payment.viewOrder")}</span>
        </Link>
        </div>

   </div>
  );
}
