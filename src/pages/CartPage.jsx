// src/pages/CartPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AlertModal from "../components/common/AlertModal";
import Breadcrumb from "../components/common/Breadcrumb";
import CartItem from "../components/common/CartItem";
import useAuth from "../hooks/useAuth";
import { useCart } from "../hooks/useCart";

const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function CartPage() {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [promoVisible, setPromoVisible] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loadingPromo, setLoadingPromo] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "info" });
  const [loading, setLoading] = useState(false);
  const { fetchCartCount } = useCart();

  // Không cần product ở đây → loại bỏ useParams, fetchProduct, product state
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch(`${backend}/api/cart`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Lỗi tải giỏ hàng");
      setCart(data.cart || { items: [] });
    } catch (err) {
      showAlert(err.message || "Không thể tải giỏ hàng!", "error");
    }
  };

  const handleUpdate = async (oldSku, quantity, newSku = null) => {
    if (quantity < 1) return;
    setLoading(true);
    try {
      const res = await fetch(`${backend}/api/cart/update`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku: oldSku, quantity, newSku }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Cập nhật thất bại");
      fetchCart();
      showAlert("Cập nhật thành công!", "success");
    } catch (err) {
      showAlert(err.message || "Cập nhật thất bại!", "error");
    } finally {
      setLoading(false);
    }
  await fetchCart();
  fetchCartCount();
  };

  const handleRemove = async (sku) => {
    if (!window.confirm("Xóa sản phẩm này khỏi giỏ hàng?")) return;
    try {
      const res = await fetch(`${backend}/api/cart/${sku}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Xóa thất bại");
      fetchCart();
      showAlert("Xóa sản phẩm thành công!", "success");
    } catch (err) {
      showAlert(err.message || "Xóa thất bại!", "error");
    }
  };

  const applyPromo = async () => {
    if (!promoCode.trim()) {
      showAlert("Vui lòng nhập mã giảm giá!", "warning");
      return;
    }
    if (!user?._id) {
      showAlert("Vui lòng đăng nhập để áp dụng mã!", "warning");
      return;
    }

    setLoadingPromo(true);
    try {
      const res = await fetch(`${backend}/api/promotions/apply`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode.trim(),
          userId: user._id,
          orderTotal: cart.items.reduce((acc, i) => acc + i.price * i.quantity, 0),
          productIds: cart.items.map(i => i.productId.toString()),
          quantities: Object.fromEntries(cart.items.map(i => [i.productId.toString(), i.quantity])),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Mã không hợp lệ");

      if (data.valid) {
        setDiscount(data.discount || 0);
        showAlert(`Áp dụng mã "${promoCode}" thành công! Giảm ${data.discount?.toLocaleString()}₫`, "success");
      } else {
        setDiscount(0);
        showAlert(data.msg || "Mã khuyến mãi không hợp lệ!", "error");
      }
    } catch (err) {
      setDiscount(0);
      showAlert(err.message || "Lỗi kết nối server!", "error");
    } finally {
      setLoadingPromo(false);
    }
  };

  const showAlert = (message, type = "info") => setAlert({ message, type });
  const closeAlert = () => setAlert({ message: "", type: "info" });

  if (!cart) {
    return <p className="text-center mt-20 text-lg font-medium">ĐANG TẢI GIỎ HÀNG...</p>;
  }

  const subtotal = cart.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
  const vat = subtotal * 0.08;
  const loyalty = Math.floor(subtotal * 0.01);
  const total = subtotal + vat - discount;

  return (
    <>
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
          {/* Không dùng rounded → dùng border + clip */}
          <div className="w-10 h-10 border-4 border-black border-t-transparent animate-spin"></div>
        </div>
      )}

      <div className="min-h-screen bg-gray-100 py-8">
        <div className="w-[90%] mx-auto max-w-6xl">
          <Breadcrumb product={null} category={null} />
          <h2 className="text-3xl font-bold text-center uppercase mb-10 text-gray-900 tracking-wider">
            Giỏ Hàng Của Bạn
          </h2>

          {cart.items.length === 0 ? (
            <div className="text-center py-24 bg-white border border-gray-300">
              <div className="mb-6">
                <div className="w-20 h-20 mx-auto bg-gray-200 border-2 border-dashed border-gray-400"></div>
              </div>
              <p className="text-xl font-semibold text-gray-700 uppercase mb-6">Giỏ hàng trống</p>
              <Link
                to="/"
                className="inline-block bg-black text-white px-12 py-3 text-sm font-bold uppercase tracking-wide hover:bg-gray-800 transition"
              >
                Tiếp Tục Mua Hàng
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* DANH SÁCH SẢN PHẨM - CÓ SCROLL */}
              <div className="lg:col-span-2">
                <div className="max-h-[600px] overflow-y-auto pr-2 space-y-6">
                  {cart.items.map((item) => (
                    <CartItem
                      key={item.sku}
                      item={item}
                      onUpdate={handleUpdate}
                      onRemove={handleRemove}
                    />
                  ))}
                </div>
              </div>

              {/* TỔNG KẾT */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-300 p-6 sticky top-6">
                  <h3 className="text-lg font-bold uppercase text-center mb-6 tracking-wider">
                    TỔNG ĐƠN HÀNG
                  </h3>

                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between font-medium">
                      <span className="text-gray-700">Tạm tính ({cart.items.length} sp)</span>
                      <span>{subtotal.toLocaleString()}₫</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>VAT (8%)</span>
                      <span>{vat.toLocaleString()}₫</span>
                    </div>
                    <div className="flex justify-between text-green-600 font-bold">
                      <span>Điểm tích lũy</span>
                      <span>+{loyalty} PTS</span>
                    </div>

                    {/* MÃ GIẢM GIÁ */}
                    <div className="mt-6 pt-5 border-t border-gray-200">
                      <button
                        onClick={() => setPromoVisible(!promoVisible)}
                        className="w-full border-2 border-dashed border-gray-500 py-3 text-sm font-bold uppercase tracking-wide hover:border-black transition flex items-center justify-center gap-2"
                      >
                        {promoVisible ? "Ẩn" : "Thêm"} Mã Giảm Giá
                      </button>

                      {promoVisible && (
                        <div className="flex gap-2 mt-4">
                          <input
                            type="text"
                            placeholder="NHẬP MÃ"
                            value={promoCode}
                            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                            className="flex-1 border border-gray-500 px-4 py-2.5 text-sm font-medium uppercase focus:outline-none focus:border-black transition"
                          />
                          <button
                            onClick={applyPromo}
                            disabled={loadingPromo}
                            className="bg-black text-white px-6 py-2.5 text-sm font-bold uppercase tracking-wide hover:bg-gray-800 disabled:opacity-50 transition"
                          >
                            {loadingPromo ? "..." : "ÁP DỤNG"}
                          </button>
                        </div>
                      )}

                      {discount > 0 && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-300 flex justify-between items-center">
                          <span className="text-green-700 font-bold text-sm flex items-center gap-1">
                            Đã áp dụng: <span className="underline">{promoCode}</span>
                          </span>
                          <span className="text-green-700 font-bold">-{discount.toLocaleString()}₫</span>
                        </div>
                      )}
                    </div>

                    {/* TỔNG CỘNG */}
                    <div className="border-t-2 border-gray-400 pt-5 mt-6">
                      <div className="flex justify-between text-2xl font-bold uppercase tracking-wider">
                        <span>TỔNG CỘNG</span>
                        <span className="text-red-600">{total.toLocaleString()}₫</span>
                      </div>
                    </div>
                  </div>

                  {/* NÚT HÀNH ĐỘNG */}
                  <div className="mt-8 space-y-3">
                    <button className="w-full bg-black text-white py-4 text-sm font-bold uppercase tracking-widest hover:bg-gray-800 transition">
                      TIẾN HÀNH THANH TOÁN
                    </button>
                    <Link
                      to="/"
                      className="block w-full text-center border-2 border-black py-4 text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition"
                    >
                      TIẾP TỤC MUA HÀNG
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RecentViewed & Recommended → có thể ẩn nếu không cần */}
      {/* Nếu bạn muốn hiển thị, hãy đảm bảo truyền đúng dữ liệu từ nơi khác */}
      {/* <RecentViewed currentProduct={null} /> */}
      {/* <Recommended currentId={null} categoryId={null} /> */}

      <AlertModal message={alert.message} type={alert.type} onClose={closeAlert} />
    </>
  );
}