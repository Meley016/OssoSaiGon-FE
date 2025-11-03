import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import cartIcon from "../../assets/cart.png";
import heartIcon from "../../assets/love-list.png";
import searchIcon from "../../assets/search.png";
import userIcon from "../../assets/user.png";
import useAuth from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import Hamburger from "./menu";

export default function Header() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [logoUrl, setLogoUrl] = useState("../../../assets/LOGO.png");
  const { cartCount, fetchCartCount } = useCart();
  // 🧭 Ẩn/hiện header khi scroll
  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      if (current < 10) setShowHeader(true);
      else if (current > lastScrollY) setShowHeader(false);
      else setShowHeader(true);
      setLastScrollY(current);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);
  useEffect(() => {
      if (user) fetchCartCount(); // Khi đăng nhập thì load lại
    }, [user]);
  // 📦 Handler chung cho các nút yêu cầu đăng nhập
  const requireAuth = (path) => {
    if (loading) return; // ⏳ đang kiểm tra login thì bỏ qua
    if (user) navigate(path);
    else navigate("/login");
  };
  // 🧩 Lấy logo từ API
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await fetch("/api/banners/active?type=logo");
        if (!res.ok) throw new Error("Không thể tải logo!");
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0 && data[0].image) {
          setLogoUrl(data[0].image);
        }
      } catch (err) {
        console.warn("⚠️ Lỗi tải logo:", err.message);
      }
    };
    fetchLogo();
  }, []);
  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full bg-white border-b-2 border-gray-300 z-30 
  transition-transform duration-300 ease-out
        ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-4">
            <button
              aria-label="menu"
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1 hover:opacity-80 transition"
            >
              <Menu className="w-6 h-6 stroke-[1.5]" />
            </button>

            <button
              onClick={() => navigate("/search")}
              className="p-1 hover:opacity-80 transition hidden sm:inline-block"
            >
              <img src={searchIcon} alt="search" className="w-6 h-6" />
            </button>
          </div>

          {/* Logo */}
          <div className="flex-1 flex justify-center">
            <img
              src={logoUrl}
              alt="Logo"
              className="w-20 md:w-24 h-auto cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            <button onClick={() => requireAuth("/wishlist")} className="p-1 hover:opacity-80 transition">
              <img src={heartIcon} alt="wishlist" className="w-6 h-6" />
            </button>

            <button onClick={() => requireAuth("/profile")} className="p-1 hover:opacity-80 transition">
              <img src={userIcon} alt="user" className="w-6 h-6" />
            </button>

            <button
            onClick={() => requireAuth("/cart")}
            className="p-1 hover:opacity-80 transition relative"
          >
            <img src={cartIcon} alt="cart" className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full px-1">
                {cartCount}
              </span>
            )}
          </button>
          </div>
        </div>
      </header>

      <Hamburger open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
