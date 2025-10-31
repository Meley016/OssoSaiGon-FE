import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Header from "./components/common/header";
import CartPage from "./pages/CartPage";
import Category from "./pages/Category";
import Home from "./pages/home";
import Login from "./pages/login";
import ProductDetail from "./pages/ProductDetail";
import Register from "./pages/register";
import WishlistPage from "./pages/WishlistPage";

function Layout() {
  const location = useLocation();
  const hiddenPages = ["/login", "/register"];
  const hideHeader = hiddenPages.includes(location.pathname);

  return (
    <>
      {!hideHeader && (
        <Header />
      )}

      {/* Phần bọc Routes có margin/padding tránh đè header */}
      <div className={!hideHeader ? "pt-[96.09px]" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/category/:slug" element={<Category />} />
        </Routes>
      </div>
    </>
  );
}


export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
