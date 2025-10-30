// src/pages/CartPage.jsx
import axios from "axios";
import { useEffect, useState } from "react";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [promoVisible, setPromoVisible] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);

  useEffect(() => {
    fetchCart();
  }, []);

  async function fetchCart() {
    const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, { withCredentials: true });
    setCart(res.data.cart);
  }

  async function handleUpdate(sku, quantity) {
    await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/cart/update`, { sku, quantity }, { withCredentials: true });
    fetchCart();
  }

  async function handleRemove(sku) {
    await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/cart/${sku}`, { withCredentials: true });
    fetchCart();
  }

  async function applyPromo() {
    try {
      const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/promotion/validate`, { code: promoCode }, { withCredentials: true });
      setDiscount(res.data.discount || 0);
    } catch {
      setDiscount(0);
      alert("Mã khuyến mãi không hợp lệ!");
    }
  }

  if (!cart) return <p className="text-center mt-20">ĐANG TẢI GIỎ HÀNG...</p>;

  const subtotal = cart.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const vat = subtotal * 0.08;
  const loyalty = Math.floor(subtotal * 0.01);
  const total = subtotal + vat - discount;

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="w-[90%] mx-auto max-w-6xl px-6">
        <h2 className="text-3xl font-bold mb-8 text-center uppercase text-gray-800">Giỏ Hàng Của Bạn</h2>
        
        {cart.items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4 uppercase">Giỏ Hàng Trống</p>
            <button
              onClick={() => (window.location.href = "/")}
              className="bg-black text-white px-8 py-3  font-semibold uppercase hover:bg-gray-800 transition-colors"
            >
              Tiếp Tục Mua Hàng
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 🛍 LEFT: CART ITEMS (2/3 trên desktop) */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
                {cart.items.map((item, i) => (
                  <div key={i} className="flex flex-col sm:flex-row border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                    {/* IMAGE */}
                    <div className="sm:w-1/3 bg-gray-100 flex-shrink-0">
                      <img
                        src={item.variantInfo.coverImage}
                        alt={item.productId?.name}
                        className="w-full h-48 sm:h-full object-cover"
                      />
                    </div>

                    {/* INFO & CONTROLS */}
                    <div className="sm:w-2/3 p-6 flex flex-col justify-between">
                      <div className="space-y-3">
                        <h3 className="font-bold text-lg uppercase text-gray-800">{item.productId?.name}</h3>
                        <p className="text-sm text-gray-500 uppercase">SKU: {item.sku}</p>
                        
                        {/* HIỂN THỊ MÀU VÀ SIZE RÕ RÀNG HƠN */}
                        <div className="flex items-center gap-4 text-sm uppercase">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-600">Màu:</span>
                            <span className="bg-gray-200 px-2 py-1  text-xs font-medium">
                              {item.variantInfo.color?.name || "N/A"}
                            </span>
                            {item.variantInfo.color?.hex && (
                              <div 
                                className="w-4 h-4  border border-gray-300"
                                style={{ backgroundColor: item.variantInfo.color.hex }}
                              ></div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-600">Size:</span>
                            <span className="bg-blue-100 px-2 py-1  text-xs font-semibold text-blue-800">
                              {item.variantInfo.size?.name || "N/A"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between sm:justify-start gap-4">
                          <div className="flex items-center gap-2">
                            <label className="text-sm font-semibold uppercase text-gray-600">Số Lượng:</label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleUpdate(item.sku, parseInt(e.target.value))}
                              className="w-20 h-10 border border-gray-300  text-center text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                          </div>
                          <div className="text-sm font-semibold text-gray-800">
                            {(item.price * item.quantity).toLocaleString()} VND
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-100 sm:border-t-0 sm:pt-0 sm:mt-0 sm:justify-start sm:items-center sm:gap-4">
                        <div className="text-sm text-gray-600 uppercase">
                          Giá: {item.price.toLocaleString()} VND / sản phẩm
                        </div>
                        <button
                          onClick={() => handleRemove(item.sku)}
                          className="text-red-600 hover:text-red-800 text-sm font-semibold uppercase tracking-wide transition-colors"
                        >
                          Xóa Sản Phẩm
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 📦 RIGHT: SUMMARY (1/3 trên desktop) */}
            <div className="lg:col-span-1">
              <div className="bg-white shadow-sm border border-gray-200 p-6 sticky top-10">
                <h3 className="font-bold text-lg mb-6 uppercase text-gray-800 text-center">Tổng Đơn Hàng</h3>

                <div className="space-y-4 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="uppercase text-gray-600">Tạm tính ({cart.items.length} sản phẩm)</span>
                    <span className="font-semibold">{subtotal.toLocaleString()} VND</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="uppercase text-gray-600">VAT (8%)</span>
                    <span className="text-gray-600">{vat.toLocaleString()} VND</span>
                  </div>

                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="uppercase text-gray-600">Điểm nhận được</span>
                    <span className="text-green-600 font-semibold">{loyalty} PTS</span>
                  </div>

                  {/* PROMO CODE */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setPromoVisible(!promoVisible)}
                      className="w-full border-2 border-gray-300 py-3 text-sm font-semibold uppercase text-gray-700 hover:border-black transition-colors flex items-center justify-center gap-2"
                    >
                      {promoVisible ? "Ẩn" : "Thêm"} Mã Khuyến Mãi
                    </button>
                    {promoVisible && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Nhập mã giảm giá"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                          className="flex-1 border border-gray-300  px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                        />
                        <button
                          onClick={applyPromo}
                          className="bg-black text-white px-6 py-2  text-sm uppercase font-semibold hover:bg-gray-800 transition-colors whitespace-nowrap"
                        >
                          Áp Dụng
                        </button>
                      </div>
                    )}
                    {discount > 0 && (
                      <div className="flex justify-between text-green-600 font-semibold py-2 border-b border-gray-200">
                        <span className="uppercase">Giảm giá</span>
                        <span>-{discount.toLocaleString()} VND</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-gray-300 pt-4">
                    <div className="flex justify-between text-lg font-bold uppercase text-gray-800 mb-6">
                      <span>Tổng cộng</span>
                      <span>{total.toLocaleString()} VND</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mt-8">
                  <button className="w-full bg-black text-white py-4  text-sm font-bold uppercase hover:bg-gray-800 transition-colors shadow-md">
                    Tiến Hành Thanh Toán
                  </button>
                  <button
                    onClick={() => (window.location.href = "/")}
                    className="w-full border-2 border-black py-4  text-sm font-bold uppercase text-black hover:bg-black hover:text-white transition-colors"
                  >
                    Tiếp Tục Mua Hàng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}