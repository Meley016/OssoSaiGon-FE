// src/pages/CheckoutPage.jsx
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useContext, useEffect, useState } from "react";
import { RegionDropdown } from "react-country-region-selector";
import { useTranslation } from "react-i18next";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Link, useNavigate } from "react-router-dom";
import fetchClient from "../api/fetchClient";
import AlertModal from "../components/common/AlertModal";
import Breadcrumb from "../components/common/Breadcrumb";
import CartItem from "../components/common/CartItem";
import StripeModal from "../components/common/StripeModal";
import SettingsContext from "../contexts/SettingsContext";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { currency, exchangeRate } = useContext(SettingsContext);
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // promo
  const [promotionCode, setPromotionCode] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [applyingPromo, setApplyingPromo] = useState(false);

  // address
  const [country, setCountry] = useState("Vietnam");
  const [region, setRegion] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    city: "",
  });

  // payment
  const [method, setMethod] = useState("");

  // stripe
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [stripeOrderInfo, setStripeOrderInfo] = useState(null);

  // alert
  const [alert, setAlert] = useState({ message: "", type: "info" });

  // loyalty points
  const [pointRate, setPointRate] = useState(null);

  /* ================= FETCH CART ================= */
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const cartRes = await fetchClient("/cart");

        const cartData = cartRes.cart || { items: [] };
        if (cartData.items.length === 0) {
          navigate("/cart");
          return;
        }
        setCart(cartData);
      } catch (err) {
        setAlert({ message: err.message, type: "error" });
      }
    };
    fetchCart();

    // fetch pointRate
    const fetchPointRate = async () => {
      try {
        const loyaltyRes = await fetchClient("/users/loyalty/config");

        if (loyaltyRes?.pointRate) {
          setPointRate(loyaltyRes.pointRate);
        }
      } catch (err) {
        console.warn("PointRate error:", err.message);
      }
    };
    fetchPointRate();
  }, [navigate]);

  useEffect(() => {
    if (region) {
      setShippingAddress((p) => ({ ...p, city: region }));
    }
  }, [region]);

  if (!cart) {
    return (
      <p className="text-center mt-20 text-lg font-medium">
        {t("cart.loading")}
      </p>
    );
  }

  /* ================= PRICE CALC ================= */
  const subtotal = cart.items.reduce(
    (s, i) => s + (i.salePrice ?? i.price) * i.quantity,
    0,
  );
  const vat = subtotal * 0.08;
  const discount = appliedPromotion?.discount || 0;
  const total = subtotal + vat - discount;

  const loyaltyPoints = pointRate ? Math.floor(subtotal / pointRate) : 0;

  const formatPrice = (v) => {
    const value = v * exchangeRate;
    return currency === "USD"
      ? `$${value.toFixed(2)}`
      : `${value.toLocaleString()}₫`;
  };

  const showAlert = (message, type = "info") => setAlert({ message, type });

  /* ================= PROMO ================= */
  const applyPromotion = async () => {
    if (!promotionCode.trim()) return;

    setApplyingPromo(true);
    try {
      const promoRes = await fetchClient("/promotions/apply", {
        method: "POST",
        body: JSON.stringify({
          code: promotionCode.trim().toUpperCase(),
          orderTotal: subtotal,
        }),
      });

      if (!promoRes.valid) throw new Error(promoRes.msg);
      setAppliedPromotion(promoRes);

      showAlert(t("checkout.promo_applied"), "success");
    } catch (err) {
      setAppliedPromotion(null);
      showAlert(err.message, "error");
    } finally {
      setApplyingPromo(false);
    }
  };

  /* ================= PLACE ORDER ================= */
  const placeOrder = async () => {
    if (loading) return;
    if (!method) return showAlert(t("checkout.select_payment"), "warning");
    if (!shippingAddress.firstName.trim() || !shippingAddress.lastName.trim())
      return showAlert(t("checkout.enter_name"), "warning");
    if (!shippingAddress.phone || !isValidPhoneNumber(shippingAddress.phone))
      return showAlert("Số điện thoại không hợp lệ", "warning");
    if (!shippingAddress.street.trim())
      return showAlert("Vui lòng nhập địa chỉ", "warning");

    const items = cart.items.map((i) => ({
      productId: i.productId._id,
      sku: i.sku,
      quantity: i.quantity,
    }));

    setLoading(true);
    try {
      const orderRes = await fetchClient("/orders/pre-create", {
        method: "POST",
        body: JSON.stringify({
          paymentMethod: method,
          shippingAddress: {
            ...shippingAddress,
            country,
            fullName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
          },
          items,
          promotionId: appliedPromotion?.promotionId || null,
        }),
      });

      if (!orderRes.success) throw new Error(orderRes.error);

      if (method === "stripe") {
        setStripeOrderInfo({ orderId: orderRes.order._id });

        setShowStripeModal(true);
        return;
      }
      // if (method === "vnpay") {
      //   const payData = await fetchClient("/payment/vnpay-payment", {
      //     method: "POST",
      //     body: JSON.stringify({ orderId: orderRes.order._id }),
      //   });

      //   if (!payData.success) {
      //     throw new Error(payData.msg || "Không tạo được VNPay");
      //   }

      //   window.location.href = payData.paymentUrl;
      //   return;
      // }

      if (method === "bank_transfer") {
        navigate(`/payment-banking/${orderRes.order._id}`);
        return;
      }

      navigate(`/order-success/${orderRes.order._id}`);
    } catch (err) {
      showAlert(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  /* ================= RENDER ================= */
  return (
    <>
      <div className="min-h-screen bg-white py-8">
        <div className="w-[90%] mx-auto max-w-6xl">
          <Breadcrumb />
          <h2 className="text-3xl font-bold text-center uppercase mb-10">
            {t("checkout.title")}
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-6">
              {/* PRODUCTS */}
              <div className="border p-6">
                <h3 className="font-bold text-center uppercase mb-6">
                  {t("checkout.products")}
                </h3>
                <div className="space-y-6">
                  {cart.items.map((item) => (
                    <div key={item.sku} className="relative checkout-readonly">
                      <CartItem item={item} />
                      <div className="absolute inset-0 bg-transparent z-10 pointer-events-auto" />
                    </div>
                  ))}
                </div>
              </div>

              {/* PROMO */}
              <div className="border p-6">
                <h3 className="font-bold text-center uppercase mb-6">
                  {t("checkout.promo_code")}
                </h3>
                <div className="flex gap-3">
                  <input
                    className="flex-1 border px-4 py-3"
                    value={promotionCode}
                    onChange={(e) =>
                      setPromotionCode(e.target.value.toUpperCase())
                    }
                  />
                  <button
                    onClick={applyPromotion}
                    disabled={applyingPromo}
                    className="bg-black text-white px-6"
                  >
                    {applyingPromo ? "..." : t("checkout.apply")}
                  </button>
                </div>
              </div>

              {/* ADDRESS */}
              <div className="border p-6 space-y-4">
                <h3 className="font-bold uppercase">
                  {t("checkout.shipping_address")}
                </h3>

                <div className="flex gap-4">
                  <input
                    className="flex-1 border px-4 py-3"
                    placeholder={t("checkout.first_name")}
                    value={shippingAddress.firstName}
                    onChange={(e) =>
                      setShippingAddress((p) => ({
                        ...p,
                        firstName: e.target.value,
                      }))
                    }
                  />
                  <input
                    className="flex-1 border px-4 py-3"
                    placeholder={t("checkout.last_name")}
                    value={shippingAddress.lastName}
                    onChange={(e) =>
                      setShippingAddress((p) => ({
                        ...p,
                        lastName: e.target.value,
                      }))
                    }
                  />
                </div>

                <PhoneInput
                  international
                  defaultCountry="VN"
                  value={shippingAddress.phone}
                  onChange={(v) =>
                    setShippingAddress((p) => ({ ...p, phone: v }))
                  }
                  className="border px-4 py-3"
                />

                <div className="flex gap-4">
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="flex-1 px-4 py-3 border box-border text-base"
                  >
                    <option value="United States">United States</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Vietnam">Vietnam</option>
                    <option value="Japan">Japan</option>
                    <option value="Malaysia">Malaysia</option>
                  </select>

                  <RegionDropdown
                    country={country}
                    value={region}
                    onChange={setRegion}
                    classes="flex-1 px-4 py-3 text-base border box-border"
                  />
                </div>

                <input
                  className="w-full border px-4 py-3"
                  placeholder="Số nhà, tên đường..."
                  value={shippingAddress.street}
                  onChange={(e) =>
                    setShippingAddress((p) => ({
                      ...p,
                      street: e.target.value,
                    }))
                  }
                />
              </div>

              {/* PAYMENT */}
              <div className="border p-6 space-y-4">
                <h3 className="font-bold uppercase">
                  {t("checkout.payment_method")}
                </h3>
                {/* "vnpay", */}
                {["bank_transfer", "stripe"].map((m) => (
                  <label key={m} className="flex gap-3 items-center">
                    <input
                      type="radio"
                      disabled={loading}
                      checked={method === m}
                      onChange={() => setMethod(m)}
                    />
                    <span>{t(`checkout.${m}`)}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* RIGHT */}
            <div className="border p-6 sticky top-6 h-fit">
              <h3 className="font-bold text-center uppercase mb-6">
                {t("cart.orderSummary")}
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>{t("checkout.subtotal")}</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between">
                  <span>VAT</span>
                  <span>{formatPrice(vat)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-[#ec92b3]">
                    <span>{t("checkout.discount")}</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                {pointRate && (
                  <div className="flex justify-between text-[#ec92b3]">
                    <span>{t("cart.loyalty")}</span>
                    <span>{loyaltyPoints} PTS</span>
                  </div>
                )}

                <div className="border-t pt-4 flex justify-between font-bold text-xl">
                  <span>{t("checkout.total")}</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <button
                onClick={placeOrder}
                disabled={loading}
                className="block bg-black text-white py-4 w-full mt-6"
              >
                {loading
                  ? t("common.processing") + "..."
                  : t("checkout.complete_order")}
              </button>

              <Link
                to="/cart"
                className="block border-2 border-black py-4 text-center mt-4"
              >
                ← {t("checkout.back_to_cart")}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Elements stripe={stripePromise}>
        {showStripeModal && stripeOrderInfo && (
          <StripeModal
            isOpen={showStripeModal}
            onClose={() => setShowStripeModal(false)}
            orderId={stripeOrderInfo.orderId}
          />
        )}
      </Elements>

      {alert.message && (
        <AlertModal
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ message: "", type: "info" })}
        />
      )}
    </>
  );
}
