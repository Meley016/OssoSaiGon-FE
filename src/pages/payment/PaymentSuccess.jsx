import axios from "axios";
import { CheckCircle } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import SettingsContext from "../../contexts/SettingsContext";

const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function PaymentSuccess() {
  const { t } = useTranslation();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const orderCode = searchParams.get("order");

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const { currency, exchangeRate } = useContext(SettingsContext);

  const formatVND = (v) =>
    typeof v === "number" ? `${v.toLocaleString("vi-VN")}₫` : "0₫";

  const formatUSD = (v) =>
    typeof v === "number" ? `$${(v * exchangeRate).toFixed(2)}` : "$0.00";

  const formatPrice = (v) =>
    currency === "USD" ? formatUSD(v) : formatVND(v);

  useEffect(() => {
    if (!orderCode) {
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      try {
        const res = await axios.get(
          `${backend}/api/orders/user/order/${orderCode}`,
          { withCredentials: true }
        );
        setOrder(res.data.order);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderCode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Đang tải...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Không tìm thấy đơn hàng
      </div>
    );
  }

  const displayAmount = order.paidAmount ?? order.total;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#ffe6e6] p-6">
      <CheckCircle size={80} className="text-black mb-4" />
      <h1 className="text-2xl font-semibold">{t("payment.success")}</h1>

      <p className="mt-2">
        {t("payment.orderCode")}:{" "}
        <strong>{order.orderCode}</strong>
      </p>

      <p className="mt-1">
        {t("payment.total")}:{" "}
        <strong>{formatPrice(displayAmount)}</strong>
      </p>

      <div className="mt-6 w-full max-w-3xl bg-white p-6 shadow">
        {order.items.map((item) => (
          <div key={item.sku} className="flex gap-4 border-b py-2">
            <img
              src={item.variantInfo?.coverImage || "/placeholder.png"}
              className="w-20 h-20 object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold">{item.productName}</p>
              <p className="text-sm">
                {item.quantity} × {formatPrice(item.price)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <Link
        to="/"
        className="mt-6 px-4 py-2 border border-black hover:bg-black hover:text-white"
      >
        {t("payment.continueShopping")}
      </Link>
    </div>
  );
}
