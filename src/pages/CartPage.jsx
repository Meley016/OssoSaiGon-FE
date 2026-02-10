// src/pages/CartPage.jsx
import { useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import fetchClient from "../api/fetchClient";
import AlertModal from "../components/common/AlertModal";
import Breadcrumb from "../components/common/Breadcrumb";
import CartItem from "../components/common/CartItem";
import SettingsContext from "../contexts/SettingsContext";
import { useCart } from "../hooks/useCart";

const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [alert, setAlert] = useState({ message: "", type: "info" });
  const [loading, setLoading] = useState(false);
  const [pointRate, setPointRate] = useState(null);

  const { fetchCartCount } = useCart();
  const { t } = useTranslation();
  const { currency, exchangeRate } = useContext(SettingsContext);

  useEffect(() => {
    fetchCart();
    fetchPointRate();
  }, []);

  const formatPrice = (value) => {
    const converted = value * exchangeRate;
    return currency === "USD"
      ? `$${converted.toFixed(2)}`
      : `${converted.toLocaleString()}₫`;
  };

  const fetchPointRate = async () => {
    try {
      const res = await fetch(`${backend}/api/users/loyalty/config`);
      const data = await res.json();
      if (res.ok && data?.pointRate) {
        setPointRate(data.pointRate);
      }
    } catch (err) {
      console.warn("PointRate error:", err.message);
    }
  };

  const fetchCart = async () => {
    const data = await fetchClient("/cart");
    setCart(data.cart || { items: [] });
  };

  const handleUpdate = async (oldSku, quantity, newSku = null) => {
    if (quantity < 1) return;
    setLoading(true);
    try {
      await fetchClient("/cart/update", {
        method: "PUT",
        body: JSON.stringify({ sku: oldSku, quantity, newSku }),
      });

      showAlert(t("cart.updateSuccess"), "success");
      fetchCart();
      fetchCartCount();
    } catch {
      showAlert(t("cart.updateFail"), "error");
    } finally {
      setLoading(false);
    }
    fetchCartCount();
  };

  const handleRemove = async (sku) => {
    if (!window.confirm(t("cart.removeConfirm"))) return;
    try {
      await fetchClient(`/cart/${sku}`, {
        method: "DELETE",
      });

      showAlert(t("cart.removeSuccess"), "success");
      fetchCart();
      fetchCartCount();
    } catch {
      showAlert(t("cart.removeFail"), "error");
    }
    fetchCartCount();
  };

  const showAlert = (message, type = "info") => setAlert({ message, type });
  const closeAlert = () => setAlert({ message: "", type: "info" });

  if (!cart) {
    return <p className="text-center mt-20 text-lg  ">{t("cart.loading")}</p>;
  }

  // ==== Tính toán tổng giá và điểm ====
  const subtotal = cart.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const vat = subtotal * 0.08;
  const total = subtotal + vat;

  // Tính điểm tích lũy dựa trên tỉ lệ từ backend
  const loyalty =
    pointRate && pointRate > 0 ? Math.floor(subtotal / pointRate) : 0;

  return (
    <>
      {loading && (
        <div className="fixed inset-0 bg-white/70 flex items-center justify-center z-50">
          <div className="w-10 h-10 border-4 border-black border-t-transparent animate-spin" />
        </div>
      )}

      <div className="min-h-screen bg-white py-8">
        <div className="w-[90%] mx-auto max-w-6xl">
          <Breadcrumb product={null} category={null} />

          <h2 className="text-3xl text-center uppercase mb-10">
            {t("cart.title")}
          </h2>

          {cart.items.length === 0 ? (
            <div className="text-center py-24 border">
              <p className="text-xl mb-6">{t("cart.empty")}</p>
              <Link to="/" className="bg-black text-white px-12 py-3">
                {t("cart.continueShopping")}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                {cart.items.map((item) => (
                  <CartItem
                    key={item.sku}
                    item={item}
                    onUpdate={handleUpdate}
                    onRemove={handleRemove}
                  />
                ))}
              </div>

              <div className="border p-6 sticky top-6">
                <h3 className="font-bold text-center mb-6 uppercase">
                  {t("cart.orderSummary")}
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span>
                      {t("cart.subtotal")} ({cart.items.length})
                    </span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span>{t("cart.vat")}</span>
                    <span>{formatPrice(vat)}</span>
                  </div>

                  <div className="flex justify-between text-[#ec92b3] ">
                    <span>{t("cart.loyalty")}</span>
                    <span>{loyalty} PTS</span>
                  </div>

                  <div className="border-t pt-4 flex justify-between font-bold text-xl">
                    <span>{t("cart.total")}</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  <Link
                    to="/checkout"
                    className="block bg-black text-white py-4 text-center"
                  >
                    {t("cart.checkout")}
                  </Link>

                  <Link
                    to="/"
                    className="block border-2 border-black py-4 text-center"
                  >
                    {t("cart.continueShopping")}
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertModal
        message={alert.message}
        type={alert.type}
        onClose={closeAlert}
      />
    </>
  );
}
