// src/pages/CheckoutPage.jsx – PHIÊN BẢN CUỐI, KHÔNG LỖI NỮA!
import { useContext, useEffect, useState } from "react";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import SettingsContext from "../contexts/SettingsContext";
import useAuth from "../hooks/useAuth";

const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

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

  // Địa chỉ – Đảm bảo có city + street
  const [country, setCountry] = useState("Vietnam");
  const [region, setRegion] = useState("");
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    street: "",        // BẮT BUỘC
    city: "",          // BẮT BUỘC
  });

  useEffect(() => {
    if (!user || authLoading) return;
    const fetchCart = async () => {
      try {
        const res = await fetch(`${backend}/api/cart`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || "Lỗi tải giỏ");
        setCart(data.cart || { items: [] });
      } catch {
        alert(t("checkout.error_cart"));
      }
    };
    fetchCart();
  }, [user, authLoading, t]);

  // Cập nhật city khi chọn vùng
  useEffect(() => {
    if (region) {
      setShippingAddress(prev => ({ ...prev, city: region }));
    }
  }, [region]);

  const applyPromotion = async () => {
    if (!promotionCode.trim()) return alert(t("checkout.enter_promo"));
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
      alert(`${t("checkout.promo_applied")}! -${data.discount.toLocaleString()}₫`);
    } catch (err) {
      alert(err.message || t("checkout.invalid_promo"));
      setAppliedPromotion(null);
    } finally {
      setApplyingPromo(false);
    }
  };

  const handlePayment = async () => {
    // Validate
    if (!method) return alert(t("checkout.select_payment"));
    if (!shippingAddress.fullName.trim()) return alert(t("checkout.enter_name"));
    if (!shippingAddress.phone.trim()) return alert(t("checkout.enter_phone"));
    if (!shippingAddress.street.trim()) return alert("Vui lòng nhập số nhà, đường...");
    if (!shippingAddress.city.trim()) return alert("Vui lòng chọn tỉnh/thành phố");

    setLoading(true);
    try {
      const items = cart.items.map(i => ({
        productId: i.productId,
        sku: i.sku,
        quantity: i.quantity,
        price: i.price,
      }));

      // Đảm bảo đúng format backend yêu cầu
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
          // orderCode: backend tự sinh → không gửi
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.msg || "Đặt hàng thất bại");
      }

      if (method === "vnpay") {
        window.location.href = data.vnpayUrl;
      } else {
        alert(`${t("checkout.order_success")}! Mã đơn: ${data.order.orderCode}`);
        navigate(`/order-success/${data.order._id}`);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || t("checkout.order_failed"));
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user || !cart) {
    return <div className="text-center py-32 text-4xl font-bold">{t("common.loading")}...</div>;
  }

  const subtotal = cart.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discount = appliedPromotion?.discount || 0;
  const vat = subtotal * 0.1;
  const total = (subtotal + vat - discount) * exchangeRate;
  const points = Math.floor(total / 10000);

  const formatPrice = (p) => currency === "USD" ? `$${p.toFixed(2)}` : `${p.toLocaleString()}₫`;

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-3xl mx-auto px-6">

        <h1 className="text-center text-5xl font-black mb-12 uppercase tracking-widest">
          {t("checkout.title")}
        </h1>

        {/* Sản phẩm tối giản */}
        <div className="bg-white border-b-4 border-black pb-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">{t("checkout.products")}</h2>
          {cart.items.map(item => (
            <div key={item.sku} className="flex justify-between items-center py-4 border-b">
              <div>
                <div className="font-semibold">{item.name}</div>
                <div className="text-sm text-gray-600">
                  {item.color && `${item.color} • `}
                  {item.size && `${item.size} • `}
                  Số lượng: {item.quantity}
                </div>
              </div>
              <div className="font-bold">{formatPrice(item.price * item.quantity)}</div>
            </div>
          ))}
        </div>

        {/* Promo */}
        <div className="mb-6">
          <button onClick={() => setShowPromo(!showPromo)} className="w-full py-5 px-6 bg-black text-white font-bold text-xl flex justify-between items-center hover:bg-gray-800 transition">
            {t("checkout.promo_code")} {appliedPromotion && "Applied"}
            <span className="text-3xl">{showPromo ? "−" : "+"}</span>
          </button>
          {showPromo && (
            <div className="p-6 border-x-4 border-b-4 border-black bg-gray-50">
              <div className="flex gap-4">
                <input placeholder={t("checkout.enter_promo")} value={promotionCode} onChange={e => setPromotionCode(e.target.value.toUpperCase())}
                  className="flex-1 px-5 py-4 border-2 border-black text-lg font-medium" />
                <button onClick={applyPromotion} disabled={applyingPromo}
                  className="px-10 py-4 bg-black text-white font-bold hover:bg-[#ffe6e6] hover:text-black transition">
                  {applyingPromo ? "..." : t("checkout.apply")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Địa chỉ */}
        <div className="mb-6">
          <button onClick={() => setShowAddress(!showAddress)} className="w-full py-5 px-6 bg-black text-white font-bold text-xl flex justify-between items-center hover:bg-gray-800 transition">
            {t("checkout.shipping_address")}
            <span className="text-3xl">{showAddress ? "−" : "+"}</span>
          </button>
          {showAddress && (
            <div className="p-6 border-x-4 border-b-4 border-black bg-gray-50 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <input placeholder={t("checkout.fullname")} value={shippingAddress.fullName}
                  onChange={e => setShippingAddress(p => ({ ...p, fullName: e.target.value }))}
                  className="px-5 py-4 border-2 border-black" />
                <input placeholder={t("checkout.phone")} value={shippingAddress.phone}
                  onChange={e => setShippingAddress(p => ({ ...p, phone: e.target.value }))}
                  className="px-5 py-4 border-2 border-black" />
              </div>

              <CountryDropdown value={country} onChange={setCountry}
                classes="w-full px-5 py-4 border-2 border-black text-lg" />

              <RegionDropdown country={country} value={region} onChange={setRegion}
                classes="w-full px-5 py-4 border-2 border-black text-lg"
                disableWhenEmpty />

              <input placeholder="Số nhà, tên đường, phường/xã..."
                value={shippingAddress.street}
                onChange={e => setShippingAddress(p => ({ ...p, street: e.target.value }))}
                className="w-full px-5 py-4 border-2 border-black" />
            </div>
          )}
        </div>

        {/* Thanh toán */}
        <div className="mb-12">
          <button onClick={() => setShowPayment(!showPayment)} className="w-full py-5 px-6 bg-black text-white font-bold text-xl flex justify-between items-center hover:bg-gray-800 transition">
            {t("checkout.payment_method")}
            <span className="text-3xl">{showPayment ? "−" : "+"}</span>
          </button>
          {showPayment && (
            <div className="p-6 border-x-4 border-b-4 border-black bg-gray-50 space-y-4">
              {["vnpay", "cod", "bank_transfer"].map(m => (
                <label key={m} className="flex items-center gap-4 cursor-pointer">
                  <input type="radio" name="pay" value={m} checked={method === m} onChange={e => setMethod(e.target.value)} className="w-6 h-6" />
                  <span className="text-lg font-medium">{t(`checkout.${m}`)}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Tổng kết */}
        <div className="bg-black text-white p-8">
          <div className="space-y-5 text-lg">
            <div className="flex justify-between"><span>{t("checkout.subtotal")}</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between text-sm opacity-80"><span>VAT (10%)</span><span>{formatPrice(vat)}</span></div>
            {discount > 0 && <div className="flex justify-between text-green-400 font-bold"><span>{t("checkout.discount")}</span><span>-{formatPrice(discount)}</span></div>}
            <div className="border-t-2 border-gray-600 pt-5 text-3xl font-black flex justify-between">
              <span>{t("checkout.total")}</span>
              <span className="text-yellow-300">{formatPrice(total)}</span>
            </div>
            <div className="text-center text-yellow-300 font-bold">Nhận {points.toLocaleString()} điểm tích lũy</div>
          </div>

          <button onClick={handlePayment} disabled={loading}
            className="w-full mt-8 py-6 bg-white text-black text-2xl font-bold uppercase tracking-widest hover:bg-[#ffe6e6] transition disabled:opacity-50">
            {loading ? t("common.processing") + "..." : t("checkout.complete_order")}
          </button>

          <Link to="/cart" className="block text-center mt-6 text-yellow-300 hover:underline">
            ← {t("checkout.back_to_cart")}
          </Link>
        </div>
      </div>
    </div>
  );
}