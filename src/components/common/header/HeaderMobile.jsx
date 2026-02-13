import { Drawer } from "antd";
import { MoreVertical } from "lucide-react";
import { useEffect, useState } from "react";
import ReactCountryFlag from "react-country-flag";
import { useLocation, useNavigate } from "react-router-dom";
import cartIcon from "../../../../public/icons/cart.png";
import menuIcon from "../../../../public/icons/hamburger.png";
import searchIcon from "../../../../public/icons/search.png";
import userIcon from "../../../../public/icons/user.png";
import heartIcon from "../../../../public/icons/wishlist.png";
import { useSettings } from "../../../contexts/useSetting";
import useAuth from "../../../hooks/useAuth";
import { useCart } from "../../../hooks/useCart";
import i18n from "../../../i18n/index";
import SearchDropdown from "./../SearchDropdown";
import Hamburger from "./../menu";

export default function HeaderMobile() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [logoUrl, setLogoUrl] = useState("../../../assets/LOGO.png");
  const { cartCount, fetchCartCount } = useCart();
  const { language, switchLanguage } = useSettings();
  const location = useLocation();
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

    if (user) {
      navigate(path);
    } else {
      navigate("/login", {
        state: { from: location.pathname },
      });
    }
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

  const handleLanguageToggle = () => {
    const newLang = language === "vi" ? "en" : "vi";
    switchLanguage(newLang);
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full bg-white border-b-2 border-gray-300 z-30
          transition-transform duration-300 ease-out
          ${showHeader ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="max-w-[95%] h-20 mx-auto px-4 flex items-center justify-between overflow-hidden">
          {/* Left: menu + search */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setMenuOpen(true)}
              className="p-1 hover:opacity-80 transition"
            >
              <img src={menuIcon} alt="menu" className="w-6 h-6" />
            </button>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-1 hover:opacity-80"
            >
              <img src={searchIcon} alt="search" className="w-7 h-7" />
            </button>
          </div>

          {/* Logo */}
          <div
            className="flex justify-center items-center flex-grow cursor-pointer"
            onClick={() => navigate("/")}
          >
            <img
              src={logoUrl}
              alt="Logo"
              className="max-h-14 w-auto object-contain"
            />
          </div>

          {/* Right: cart + more */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => requireAuth("/cart")}
              className="relative p-1 hover:opacity-80"
            >
              <img src={cartIcon} alt="cart" className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 text-black text-sm ">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMoreOpen(true)}
              className="p-1 hover:opacity-80"
            >
              <MoreVertical className="w-6 h-6 text-gray-800" />
            </button>
          </div>
        </div>

        <SearchDropdown
          open={searchOpen}
          onClose={() => setSearchOpen(false)}
        />
      </header>

      <Hamburger open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Drawer phụ */}
      <Drawer
        placement="right"
        closable={false}
        onClose={() => setMoreOpen(false)}
        open={moreOpen}
        width="50%"
      >
        <div className="flex justify-between border-b items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {i18n.t("header.options")}
          </h3>
          <button
            onClick={() => setMoreOpen(false)}
            className="text-gray-500 hover:text-black text-lg"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col  gap-3">
          {/* ❤️ Wishlist */}
          <button
            onClick={() => {
              requireAuth("/wishlist");
              setMoreOpen(false);
            }}
            className="flex items-center border-b gap-4 py-3 px-4 text-lg font-medium text-gray-700 
                        hover:bg-[#ffe6e6] hover:text-black transition-all duration-200"
          >
            <img src={heartIcon} alt="wishlist" className="w-6 h-6" />
            {i18n.t("header.wishlist")}
          </button>

          {/* 👤 Profile */}
          <button
            onClick={() => {
              requireAuth("/profile");
              setMoreOpen(false);
            }}
            className="flex items-center border-b gap-4 py-3 px-4  text-lg font-medium text-gray-700 
                        hover:bg-[#ffe6e6] hover:text-black transition-all duration-200"
          >
            <img src={userIcon} alt="user" className="w-6 h-6" />
            {i18n.t("header.profile")}
          </button>

          {/* 🌐 Language */}
          <button
            onClick={() => {
              handleLanguageToggle();
              setMoreOpen(true);
            }}
            className="flex items-center border-b gap-4 py-3 px-4 text-lg font-medium text-gray-700 
                        hover:bg-[#ffe6e6] hover:text-black transition-all duration-200"
          >
            <ReactCountryFlag
              countryCode={language === "vi" ? "VN" : "US"}
              svg
              style={{ width: "1.8em", height: "1.3em" }}
            />
            <span>
              {i18n.t("header.language")}:{" "}
              {language === "vi" ? "Tiếng Việt" : "English"}
            </span>
          </button>
        </div>
      </Drawer>
    </>
  );
}
