import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useContext, useEffect, useState } from "react";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";
import { useTranslation } from "react-i18next";
import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { Link, useNavigate } from "react-router-dom";
import AlertModal from "../components/common/AlertModal"; // ✅ import AlertModal
import StripeModal from "../components/common/StripeModal";
import SettingsContext from "../contexts/SettingsContext";
import useAuth from "../hooks/useAuth";

const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { currency, exchangeRate } = useContext(SettingsContext);
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false);

  const [showAddress, setShowAddress] = useState(false);
  const [showPromo, setShowPromo] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const [promotionCode, setPromotionCode] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [applyingPromo, setApplyingPromo] = useState(false);

  const [country, setCountry] = useState("Vietnam");
  const [region, setRegion] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    city: "",
  });

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [stripeOrderInfo, setStripeOrderInfo] = useState(null);
  const [stripeTotal, setStripeTotal] = useState(0);

  // AlertModal state
  const [modalMessage, setModalMessage] = useState("");
  const [modalType, setModalType] = useState("info");
  const [showModal, setShowModal] = useState(false);

  // fetch cart
  useEffect(() => {
    if (!user || authLoading) return;
    const fetchCart = async () => {
      try {
        const res = await fetch(`${backend}/api/cart`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || "Lỗi tải giỏ");
        setCart(data.cart || { items: [] });
      } catch {
        setModalMessage(t("checkout.error_cart"));
        setModalType("error");
        setShowModal(true);
      }
    };
    fetchCart();
  }, [user, authLoading, t]);

  // update city
  useEffect(() => {
    if (region) setShippingAddress(prev => ({ ...prev, city: region }));
  }, [region]);

  const applyPromotion = async () => {
    if (!promotionCode.trim()) {
      setModalMessage(t("checkout.enter_promo"));
      setModalType("warning");
      setShowModal(true);
      return;
    }
    setApplyingPromo(true);
    try {
      const res = await fetch(`${backend}/api/promotions/apply`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promotionCode.trim().toUpperCase(),
          userId: user._id,
          orderTotal: cart.items.reduce((s, i) => s + i.price * i.quantity, 0),
        }),
      });
      const data = await res.json();
      if (!data.valid) throw new Error(data.msg || t("checkout.invalid_promo"));
      setAppliedPromotion(data);
      setModalMessage(`${t("checkout.promo_applied")}! -${data.discount.toLocaleString()}₫`);
      setModalType("success");
      setShowModal(true);
    } catch (err) {
      setAppliedPromotion(null);
      setModalMessage(err.message || t("checkout.invalid_promo"));
      setModalType("error");
      setShowModal(true);
    } finally {
      setApplyingPromo(false);
    }
  };

  const preparePayment = async () => {
    if (!method) {
      setModalMessage(t("checkout.select_payment"));
      setModalType("warning");
      setShowModal(true);
      return;
    }
    if (!shippingAddress.fullName.trim()) {
      setModalMessage(t("checkout.enter_name"));
      setModalType("warning");
      setShowModal(true);
      return;
    }
    if (!shippingAddress.phone.trim() || !isValidPhoneNumber(shippingAddress.phone)) {
      setModalMessage("Số điện thoại không hợp lệ");
      setModalType("warning");
      setShowModal(true);
      return;
    }
    if (!shippingAddress.street.trim()) {
      setModalMessage("Vui lòng nhập số nhà, đường...");
      setModalType("warning");
      setShowModal(true);
      return;
    }
    if (!shippingAddress.city.trim()) {
      setModalMessage("Vui lòng chọn tỉnh/thành phố");
      setModalType("warning");
      setShowModal(true);
      return;
    }

    const items = cart.items.map(i => ({
      productId: i.productId,
      sku: i.sku,
      quantity: i.quantity,
      price: i.price,
    }));

    const finalAddress = { ...shippingAddress, country };

    const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const vat = subtotal * 0.08;
    const discount = appliedPromotion?.discount || 0;
    const finalTotal = subtotal + vat - discount;

    if (method === "stripe") {
      const res = await fetch(`${backend}/api/orders/pre-create`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: "stripe",
          shippingAddress: finalAddress,
          items,
          promotionId: appliedPromotion?.promotionId || null,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setModalMessage(data.error || "Lỗi tạo đơn");
        setModalType("error");
        setShowModal(true);
        return;
      }

      setStripeOrderInfo({ orderId: data.order._id, total: finalTotal });
      setStripeTotal(finalTotal);
      setShowPaymentModal(true);
    } else {
      handlePayment(); // COD / VNPay / PayPal
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const items = cart.items.map(i => ({
        productId: i.productId,
        sku: i.sku,
        quantity: i.quantity,
        price: i.price,
      }));

      const finalAddress = {
        fullName: shippingAddress.fullName,
        phone: shippingAddress.phone,
        street: shippingAddress.street,
        city: shippingAddress.city,
        country: country,
      };

      const res = await fetch(`${backend}/api/orders/pre-create`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: method,
          shippingAddress: finalAddress,
          items,
          promotionId: appliedPromotion?.promotionId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Lỗi đặt hàng");

      const order = data.order;

      if (data.finalized || data.redirectUrl) {
        setModalMessage("Đặt hàng thành công!");
        setModalType("success");
        setShowModal(true);
        navigate(`/order-success/${order._id}`);
        return;
      }

      if (method === "vnpay" && data.vnpayUrl) {
        window.location.href = data.vnpayUrl;
        return;
      }

      if (method === "stripe" && data.orderId) {
        setStripeOrderInfo({ orderId: data.orderId, total: order.total });
        setShowPaymentModal(true);
        return;
      }
    } catch (err) {
      setModalMessage(err.message || "Đặt hàng thất bại");
      setModalType("error");
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || !cart) {
    return <div className="text-center py-32">{t("common.loading")}...</div>;
  }

  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const vat = subtotal * 0.08;
  const discount = appliedPromotion?.discount || 0;
  const finalTotal = subtotal + vat - discount;
  const total = finalTotal * exchangeRate;
  const points = Math.floor(total / 10000);

  const formatPrice = (p) =>
    currency === "USD" ? `$${p.toFixed(2)}` : `${p.toLocaleString()}₫`;

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-6">
        <h1 className="text-center mb-12 uppercase tracking-widest">{t("checkout.title")}</h1>

        {/* Product List */}
        <div className="bg-white border-b-4 border-black pb-8 mb-8">
          <h2 className="mb-6">{t("checkout.products")}</h2>
          {cart.items.map(item => (
            <div key={item.sku} className="flex justify-between items-center py-4 border-b">
              <div>
                <div>{item.name}</div>
                <div className="text-gray-600">
                  {item.color && `${item.color} • `}
                  {item.size && `${item.size} • `}
                  Số lượng: {item.quantity}
                </div>
              </div>
              <div>{formatPrice(item.price * item.quantity)}</div>
            </div>
          ))}
        </div>

        {/* Promo */}
        <div className="mb-6">
          <button onClick={() => setShowPromo(!showPromo)} className="w-full py-5 px-6 bg-black text-white flex justify-between items-center hover:bg-gray-800 transition">
            {t("checkout.promo_code")} {appliedPromotion && "Applied"}
            <span className="text-3xl">{showPromo ? "−" : "+"}</span>
          </button>
          {showPromo && (
            <div className="p-6 border-x-4 border-b-4 border-black bg-gray-50">
              <div className="flex gap-4">
                <input placeholder={t("checkout.enter_promo")} value={promotionCode} onChange={e => setPromotionCode(e.target.value.toUpperCase())}
                  className="flex-1 px-5 py-4 border-2 border-black" />
                <button onClick={applyPromotion} disabled={applyingPromo}
                  className="px-10 py-4 bg-black text-white hover:bg-[#ffe6e6] hover:text-black transition">
                  {applyingPromo ? "..." : t("checkout.apply")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Address */}
        <div className="mb-6">
          <button onClick={() => setShowAddress(!showAddress)} className="w-full py-5 px-6 bg-black text-white flex justify-between items-center hover:bg-gray-800 transition">
            {t("checkout.shipping_address")}
            <span className="text-3xl">{showAddress ? "−" : "+"}</span>
          </button>
          {showAddress && (
            <div className="p-6 border-x-4 border-b-4 border-black bg-gray-50 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <input placeholder={t("checkout.fullname")} value={shippingAddress.fullName}
                  onChange={e => setShippingAddress(p => ({ ...p, fullName: e.target.value }))}
                  className="px-5 py-4 border-2 border-black" />
                <PhoneInput
                  international
                  defaultCountry="VN"
                  value={shippingAddress.phone}
                  onChange={value => setShippingAddress(p => ({ ...p, phone: value }))}
                  className="px-5 py-4 border-2 border-black w-full"
                  placeholder="Số điện thoại"
                />
              </div>

              <CountryDropdown value={country} onChange={setCountry} classes="w-full px-5 py-4 border-2 border-black text-lg" />
              <RegionDropdown country={country} value={region} onChange={setRegion} classes="w-full px-5 py-4 border-2 border-black text-lg" disableWhenEmpty />
              <input placeholder="Số nhà, tên đường, phường/xã..." value={shippingAddress.street} onChange={e => setShippingAddress(p => ({ ...p, street: e.target.value }))} className="w-full px-5 py-4 border-2 border-black" />
            </div>
          )}
        </div>

        {/* Payment */}
        <div className="mb-12">
          <button onClick={() => setShowPayment(!showPayment)} className="w-full py-5 px-6 bg-black text-white flex justify-between items-center hover:bg-gray-800 transition">
            {t("checkout.payment_method")}
            <span className="text-3xl">{showPayment ? "−" : "+"}</span>
          </button>
          {showPayment && (
            <div className="p-6 border-x-4 border-b-4 border-black bg-gray-50 space-y-4">
              {["cod", "stripe"].map(m => (
                <label key={m} className="flex items-center gap-4 cursor-pointer">
                  <input type="radio" name="pay" value={m} checked={method === m} onChange={e => setMethod(e.target.value)} className="w-6 h-6" />
                  <span>{t(`checkout.${m}`)}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="bg-black text-white p-8">
          <div className="space-y-5">
            <div className="flex justify-between"><span>{t("checkout.subtotal")}</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-sm opacity-80"><span>VAT (8%)</span><span>{formatPrice(vat)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-400"><span>{t("checkout.discount")}</span><span>-{formatPrice(discount)}</span></div>}
            <div className="border-t-2 border-gray-600 pt-5 flex justify-between text-xl">
              <span>{t("checkout.total")}</span>
              <span className="text-yellow-300">{formatPrice(total)}</span>
            </div>
            <div className="text-center text-yellow-300">Nhận {points.toLocaleString()} điểm tích lũy</div>
          </div>

          <button onClick={preparePayment} disabled={loading}
            className="w-full mt-8 py-6 bg-white text-black uppercase tracking-widest hover:bg-[#ffe6e6] transition disabled:opacity-50">
            {loading ? t("common.processing") + "..." : t("checkout.complete_order")}
          </button>

          <Link to="/cart" className="block text-center mt-6 text-yellow-300 hover:underline">
            ← {t("checkout.back_to_cart")}
          </Link>
        </div>

        {/* Stripe Modal */}
        {showPaymentModal && method === "stripe" && stripeOrderInfo && (
          <Elements stripe={stripePromise}>
            <StripeModal
              isOpen={showPaymentModal}
              onClose={() => setShowPaymentModal(false)}
              orderId={stripeOrderInfo.orderId || stripeOrderInfo._id}
              total={stripeTotal}
            />
          </Elements>
        )}

        {/* Alert Modal */}
        {showModal && (
          <AlertModal
            message={modalMessage}
            type={modalType}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
}
