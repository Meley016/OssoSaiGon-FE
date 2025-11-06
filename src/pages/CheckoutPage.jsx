import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [method, setMethod] = useState("");
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState(null);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    street: "",
    ward: "",
    district: "",
    city: "",
  });
  const [promotionCode, setPromotionCode] = useState("");
  const [appliedPromotion, setAppliedPromotion] = useState(null);
  const [applyingPromo, setApplyingPromo] = useState(false);

  // Lấy giỏ hàng từ API
  useEffect(() => {
    const fetchCart = async () => {
      if (!user) return;
      try {
        const res = await fetch(`${backend}/api/cart`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || "Lỗi tải giỏ hàng");
        setCart(data.cart);
      } catch (err) {
        console.error("Lỗi tải giỏ hàng:", err);
        alert("Không thể tải giỏ hàng. Vui lòng thử lại.");
      }
    };

    if (!authLoading && user) {
      fetchCart();
    }
  }, [user, authLoading]);

  // Áp dụng mã giảm giá
  const applyPromotion = async () => {
    if (!promotionCode.trim()) return alert("Vui lòng nhập mã giảm giá");
    if (!cart?.items?.length) return alert("Giỏ hàng trống");

    setApplyingPromo(true);
    try {
      const res = await fetch(`${backend}/api/promotions/apply`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promotionCode.trim(),
          userId: user._id,
          orderTotal: cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
          productIds: cart.items.map(i => i.productId),
          quantities: Object.fromEntries(cart.items.map(i => [i.productId, i.quantity])),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Mã không hợp lệ");

      if (data.valid) {
        setAppliedPromotion(data);
        alert(`Áp dụng mã "${promotionCode}" thành công! Giảm ${data.discount.toLocaleString()}₫`);
      } else {
        throw new Error(data.msg || "Mã không hợp lệ");
      }
    } catch (err) {
      setAppliedPromotion(null);
      alert(err.message || "Mã khuyến mãi không hợp lệ");
    } finally {
      setApplyingPromo(false);
    }
  };

  // Tạo đơn hàng + xử lý thanh toán
  const handlePayment = async () => {
    if (!method) return alert("Vui lòng chọn phương thức thanh toán!");
    if (!cart?.items?.length) return alert("Giỏ hàng trống!");

    // Validate địa chỉ
    const required = ["fullName", "phone", "street", "city"];
    for (const field of required) {
      if (!shippingAddress[field]?.trim()) {
        return alert(`Vui lòng nhập ${getFieldLabel(field)}`);
      }
    }

    setLoading(true);
    try {
      // Chuẩn bị items cho order
      const items = cart.items.map(item => ({
        productId: item.productId,
        sku: item.sku,
        quantity: item.quantity,
        price: item.price,
      }));

      const payload = {
        userId: user._id,
        paymentMethod: method,
        shippingAddress,
        items,
        promotionId: appliedPromotion?.promotionId || undefined,
      };

      // Gọi API tạo order
      const res = await fetch(`${backend}/api/orders`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tạo đơn hàng thất bại");

      const { order, vnpayUrl } = data;

      // Xử lý theo phương thức
      if (method === "vnpay") {
        if (!vnpayUrl) throw new Error("Không nhận được link thanh toán VNPay");
        window.location.href = vnpayUrl;
        return;
      }

      // COD, bank_transfer
      alert(`Đặt hàng thành công! Mã đơn: ${order.orderCode}`);
      navigate(`/order-success/${order._id}`);
    } catch (err) {
      console.error("Lỗi tạo đơn hàng:", err);
      alert(err.message || "Đặt hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  const getFieldLabel = (field) => {
    const labels = {
      fullName: "Họ tên",
      phone: "Số điện thoại",
      street: "Địa chỉ chi tiết",
      city: "Tỉnh/Thành phố",
    };
    return labels[field] || field;
  };

  // Loading states
  if (authLoading) {
    return <div className="text-center py-20">Đang xác thực...</div>;
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p>Vui lòng đăng nhập để thanh toán.</p>
        <Link to="/login" className="text-blue-600 underline">
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  if (!cart) {
    return <div className="text-center py-20">Đang tải giỏ hàng...</div>;
  }

  const subtotal = cart.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discount = appliedPromotion?.discount || 0;
  const total = subtotal - discount;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto bg-white p-8 border border-gray-200">
        <h2 className="text-2xl font-bold text-center mb-8 uppercase tracking-widest">
          Thanh Toán Đơn Hàng
        </h2>

        {/* Giỏ hàng tóm tắt */}
        <div className="mb-8 p-6 border border-gray-300">
          <h3 className="font-bold text-lg mb-4">Sản phẩm</h3>
          {cart.items.map((item) => (
            <div key={item.sku} className="flex justify-between py-2 border-b">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>{(item.price * item.quantity).toLocaleString()}₫</span>
            </div>
          ))}
          <div className="flex justify-between font-bold mt-4">
            <span>Tạm tính</span>
            <span>{subtotal.toLocaleString()}₫</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Giảm giá</span>
              <span>-{discount.toLocaleString()}₫</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold mt-2 text-red-600">
            <span>Tổng cộng</span>
            <span>{total.toLocaleString()}₫</span>
          </div>
        </div>

        {/* Mã giảm giá */}
        <div className="mb-8 p-6 border border-gray-300">
          <h3 className="font-bold text-lg mb-4">Mã giảm giá</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nhập mã"
              value={promotionCode}
              onChange={(e) => setPromotionCode(e.target.value.toUpperCase())}
              className="flex-1 border border-gray-400 px-4 py-2 uppercase focus:outline-none focus:border-black"
            />
            <button
              onClick={applyPromotion}
              disabled={applyingPromo}
              className="bg-black text-white px-6 py-2 font-bold uppercase hover:bg-gray-800 disabled:opacity-50"
            >
              {applyingPromo ? "..." : "Áp dụng"}
            </button>
          </div>
          {appliedPromotion && (
            <p className="text-green-600 mt-2">Đã áp dụng: {appliedPromotion.code}</p>
          )}
        </div>

        {/* Địa chỉ giao hàng */}
        <div className="mb-8 p-6 border border-gray-300">
          <h3 className="font-bold text-lg mb-4">Địa chỉ giao hàng</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              placeholder="Họ và tên"
              value={shippingAddress.fullName}
              onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
              className="border border-gray-400 px-4 py-2 focus:outline-none focus:border-black"
            />
            <input
              placeholder="Số điện thoại"
              value={shippingAddress.phone}
              onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
              className="border border-gray-400 px-4 py-2 focus:outline-none focus:border-black"
            />
            <input
              placeholder="Địa chỉ chi tiết"
              value={shippingAddress.street}
              onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
              className="border border-gray-400 px-4 py-2 focus:outline-none focus:border-black md:col-span-2"
            />
            <input
              placeholder="Phường/Xã"
              value={shippingAddress.ward}
              onChange={(e) => setShippingAddress({ ...shippingAddress, ward: e.target.value })}
              className="border border-gray-400 px-4 py-2 focus:outline-none focus:border-black"
            />
            <input
              placeholder="Quận/Huyện"
              value={shippingAddress.district}
              onChange={(e) => setShippingAddress({ ...shippingAddress, district: e.target.value })}
              className="border border-gray-400 px-4 py-2 focus:outline-none focus:border-black"
            />
            <input
              placeholder="Tỉnh/Thành phố"
              value={shippingAddress.city}
              onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
              className="border border-gray-400 px-4 py-2 focus:outline-none focus:border-black"
            />
          </div>
        </div>

        {/* Phương thức thanh toán */}
        <div className="mb-8 p-6 border border-gray-300">
          <h3 className="font-bold text-lg mb-4">Phương thức thanh toán</h3>
          <div className="space-y-3">
            <label className="flex items-center gap-3 border p-4 hover:border-black cursor-pointer">
              <input
                type="radio"
                name="method"
                value="vnpay"
                checked={method === "vnpay"}
                onChange={(e) => setMethod(e.target.value)}
              />
              <span className="font-medium">VNPay (Thẻ / QR / Ngân hàng)</span>
            </label>

            <label className="flex items-center gap-3 border p-4 hover:border-black cursor-pointer">
              <input
                type="radio"
                name="method"
                value="cod"
                checked={method === "cod"}
                onChange={(e) => setMethod(e.target.value)}
              />
              <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
            </label>

            <label className="flex items-center gap-3 border p-4 hover:border-black cursor-pointer">
              <input
                type="radio"
                name="method"
                value="bank_transfer"
                checked={method === "bank_transfer"}
                onChange={(e) => setMethod(e.target.value)}
              />
              <span className="font-medium">Chuyển khoản ngân hàng</span>
            </label>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex justify-between items-center">
          <Link to="/cart" className="text-gray-600 underline">
            ← Quay lại giỏ hàng
          </Link>
          <button
            onClick={handlePayment}
            disabled={loading}
            className="bg-black text-white px-8 py-3 uppercase font-bold tracking-widest hover:bg-gray-800 disabled:opacity-50 transition"
          >
            {loading ? "Đang xử lý..." : "Hoàn tất thanh toán"}
          </button>
        </div>
      </div>
    </div>
  );
}