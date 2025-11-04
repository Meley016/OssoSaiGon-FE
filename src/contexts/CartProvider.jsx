import { useCallback, useEffect, useState } from "react";
import CartContext from "./CartContext";

const CartProvider = ({ children }) => {
  const backend = import.meta.env.VITE_BACKEND_URL;
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = useCallback(async () => {
    try {
      const res = await fetch(`${backend}/api/cart`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Không thể tải giỏ hàng");
      setCartCount(data.cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0);
    } catch (err) {
      console.warn("⚠️ Lỗi lấy giỏ hàng:", err.message);
      setCartCount(0);
    }
  }, [backend]);

  // ✅ Hàm thêm vào giỏ hàng + cập nhật count ngay lập tức
  const addToCart = async (productId, variantId, quantity = 1) => {
    try {
      const res = await fetch(`${backend}/api/cart/add`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, variantId, quantity }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Không thể thêm vào giỏ hàng");

      // ✅ Cập nhật lại giỏ hàng ngay
      await fetchCartCount();
      return { success: true };
    } catch (err) {
      console.error("❌ Lỗi thêm giỏ hàng:", err.message);
      return { success: false, message: err.message };
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);

  return (
    <CartContext.Provider value={{ cartCount, setCartCount, fetchCartCount, addToCart }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
