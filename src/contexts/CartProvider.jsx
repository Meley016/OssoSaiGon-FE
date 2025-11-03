import { useEffect, useState } from "react";
import CartContext from "./CartContext";

const CartProvider = ({ children }) => {
  const backend = import.meta.env.VITE_BACKEND_URL;
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    try {
      const res = await fetch(`${backend}/api/cart`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Không thể tải giỏ hàng");
      setCartCount(data.cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0);
    } catch (err) {
      console.warn("⚠️ Lỗi lấy giỏ hàng:", err.message);
      setCartCount(0);
    }
  };

  useEffect(() => {
    fetchCartCount();
  }, []);

  return (
    <CartContext.Provider value={{ cartCount, setCartCount, fetchCartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
