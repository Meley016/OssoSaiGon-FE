import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Footer from "./components/common/footer";
import Header from "./components/common/header";
import CartPage from "./pages/CartPage";
import Category from "./pages/Category";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import ConfirmEmail from "./pages/ConfirmEmail";
import ConfirmPassword from "./pages/ConfirmPassword";
import Home from "./pages/home";
import Login from "./pages/login";
import PaymentFailed from "./pages/payment/PaymentFailed.jsx";
import PaymentProcessing from "./pages/payment/PaymentProcessing.jsx";
import PaymentSuccess from "./pages/payment/PaymentSuccess.jsx";
import ProductDetail from "./pages/ProductDetail";
import Register from "./pages/register";
import UserPage from "./pages/UserPage.jsx";
import WishlistPage from "./pages/WishlistPage";

function Layout() {
  const location = useLocation();
  const hiddenPages = ["/login", "/register"];
  const hideLayout = hiddenPages.includes(location.pathname);    
  return (
    <>
      {!hideLayout && (
        <Header />
      )}

      {/* Phần bọc Routes có margin/padding tránh đè header */}
      <div className={!hideLayout ? "pt-[96.09px]" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/profile" element={<UserPage />} />
          <Route path="/confirm-email/:token" element={<ConfirmEmail />} />
          <Route path="/confirm-password/:token" element={<ConfirmPassword />} />
          <Route path="/payment-processing" element={<PaymentProcessing />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/checkout" element={<CheckoutPage />} />
        </Routes>
        <Footer />
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
