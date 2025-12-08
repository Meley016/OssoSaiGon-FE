import axios from "axios";
import { CheckCircle } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import SettingsContext from "../../contexts/SettingsContext";
const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function PaymentSuccess() {
  const { t } = useTranslation();
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currency, exchangeRate } = useContext(SettingsContext);

  const statusMap = {
    pending: t("orderStatus.pending"),
    processing: t("orderStatus.processing"),
    shipped: t("orderStatus.shipped"),
    completed: t("orderStatus.completed"),
    cancelled: t("orderStatus.cancelled"),
    expired: t("orderStatus.expired"),
  };
  const formatPrice = (v) => {
    const value = v * exchangeRate;
    return currency === "USD" ? `$${value.toFixed(2)}` : `${value.toLocaleString()}₫`;
  };

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await axios.get(`${backend}/api/orders/user/order/${orderId}`, { withCredentials: true });
        setOrder(res.data.order);
      } catch (err) {
        console.error("Error loading order:", err);
      } finally {
        setLoading(false);
      }
    }
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
      <CheckCircle size={80} className="text-black mb-4" />
      <h1 className="text-2xl font-semibold text-black">{t("payment.success")}</h1>
      <p className="mt-2 text-black">
        {t("payment.orderCode")}: <span className="font-semibold">{order.orderCode}</span>
      </p>
      <p className="mt-1 text-black">
        {t("payment.total")}: <span className="font-semibold">{formatPrice(order.total)}</span>
      </p>

      {/* Order details */}
      <div className="mt-6 w-full max-w-4xl bg-white shadow-lg p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <p><strong>{t("payment.orderCode")}:</strong> {order.orderCode}</p>
          <p><strong>{t("payment.createdAt")}:</strong> {new Date(order.createdAt).toLocaleDateString("vi-VN")}</p>
          <p><strong>{t("payment.total")}:</strong> {order.total?.toLocaleString()}₫</p>
          <p><strong>{t("payment.status")}:</strong> {statusMap[order.status] || order.status}</p>
        </div>

        <div>
          <h4 className="font-semibold">{t("payment.shippingAddress")}</h4>
          <p>{order.shippingAddress.fullName}, {order.shippingAddress.phone}</p>
          <p>{order.shippingAddress.street}, {order.shippingAddress.ward}, {order.shippingAddress.district}, {order.shippingAddress.city}</p>
        </div>

        {order.promotionId && (
          <div>
            <p><strong>{t("payment.promotion")}:</strong> {order.promotionId.name || order.promotionId.code}</p>
          </div>
        )}

        <div>
          <h4 className="font-semibold mb-2">{t("payment.items")}</h4>
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
                  {item.variantInfo?.images?.length > 1 && (
                    <div className="flex gap-1 mt-1 overflow-x-auto">
                      {item.variantInfo.images.map((img, idx) => (
                        <img key={idx} src={img} alt="variant" className="w-10 h-10 object-cover" />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="mt-3 text-black">{t("payment.thankYou")}</p>
      <Link
        to="/"
        className="mt-6 px-4 py-2 border border-black text-black hover:bg-black hover:text-white transition"
      >
        {t("payment.continueShopping")}
      </Link>
    </div>
  );
}
