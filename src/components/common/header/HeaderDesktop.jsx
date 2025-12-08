import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { useNavigate } from "react-router-dom";
import SearchIcon from "../../../../public/icons/search.png";
import cartIcon from "../../../assets/cart.png";
import heartIcon from "../../../assets/love-list.png";
import userIcon from "../../../assets/user.png";
import { useSettings } from "../../../contexts/useSetting";
import useAuth from "../../../hooks/useAuth";
import { useCart } from "../../../hooks/useCart";
import SearchDropdown from "./../SearchDropdown";
import Hamburger from "./../menu";

export default function HeaderDesktop() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [logoUrl, setLogoUrl] = useState("../../../assets/LOGO.png");
  const { cartCount, fetchCartCount } = useCart();
  const { language, switchLanguage } = useSettings();

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
    if (user) fetchCartCount();
  }, [fetchCartCount, user]);

  const requireAuth = (path) => {
    if (loading) return;
    if (user) navigate(path);
    else navigate("/login");
  };

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const backend = import.meta.env.VITE_BACKEND_URL;
        const res = await fetch(`${backend}/api/banners/active?type=logo`);
        const data = await res.json();
        if (Array.isArray(data) && data[0]?.image) setLogoUrl(data[0].image);
      } catch (err) {
        console.warn("Lỗi tải logo:", err.message);
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
        onMouseLeave={() => setTimeout(() => setSearchOpen(false), 500)}
      >
        <div className="max-w-[80%] h-24 mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setMenuOpen(true)} className="p-1 hover:opacity-80">
              <Menu className="w-6 h-6 stroke-[1.5]" />
            </button>
            <div onMouseEnter={() => setSearchOpen(true)} className="relative">
              <button className="p-1 hover:opacity-80">
                <img src={SearchIcon} alt="search"/>
              </button>
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 flex justify-center">
            <img
              src={logoUrl}
              alt="Logo"
              className="w-20 md:w-16 h-auto cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => switchLanguage(language === "vi" ? "en" : "vi")} className="p-1 hover:opacity-80">
              <ReactCountryFlag countryCode={language === "vi" ? "VN" : "US"} svg style={{ width: "2em" }} />
            </button>

            <button onClick={() => requireAuth("/wishlist")}>
              <img src={heartIcon} alt="wishlist" className="w-6 h-6" />
            </button>

            <button onClick={() => requireAuth("/profile")}>
              <img src={userIcon} alt="user" className="w-6 h-6" />
            </button>

            <button onClick={() => requireAuth("/cart")} className="relative">
              <img src={cartIcon} alt="cart" className="w-6 h-6" />
              {cartCount > 0 && <span className="absolute -top-2 -right-2 text-black text-sm ">{cartCount}</span>}
            </button>
          </div>
        </div>

        <SearchDropdown open={searchOpen} onClose={() => setSearchOpen(false)} />
      </header>

      <Hamburger open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}
