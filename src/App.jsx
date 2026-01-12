import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import BrandsCategory from "./components/common/BrandsCategory.jsx";
import Footer from "./components/common/footer";
import PrivacyPolicy from "./components/common/footer/help/privacyPolicy.jsx";
import ReturnExchanges from "./components/common/footer/help/returnExchanges.jsx";
import Shipping from "./components/common/footer/help/shipping.jsx";
import TermsConditions from "./components/common/footer/help/termsConditions.jsx";
import Header from "./components/common/header";
import PageTitleManager from "./components/common/PageTitleManager";
import ScrollToTop from "./components/common/ScrollToTop";
import AboutUs from "./pages/AboutUs.jsx";
import AllProducts from "./pages/AllProducts.jsx";
import CareInstructions from "./pages/CareInstructions.jsx";
import CartPage from "./pages/CartPage";
import Category from "./pages/Category";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import ConfirmEmail from "./pages/ConfirmEmail";
import ConfirmPassword from "./pages/ConfirmPassword";
import ContactUs from "./pages/ContactUs.jsx";
import FaqsPage from "./pages/Faqs.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Home from "./pages/home";
import Login from "./pages/login";
import PaymentBanking from "./pages/payment/PaymentBanking.jsx";
import PaymentFailed from "./pages/payment/PaymentFailed.jsx";
import PaymentProcessing from "./pages/payment/PaymentProcessing.jsx";
import PaymentSuccess from "./pages/payment/PaymentSuccess.jsx";
import ProductDetail from "./pages/ProductDetail";
import Register from "./pages/register";
import SearchPage from "./pages/SearchPage.jsx";
import UserPage from "./pages/UserPage.jsx";
import VerifyCode from "./pages/VerifyCode.jsx";
import WishlistPage from "./pages/WishlistPage";

function Layout() {
  const location = useLocation();
  const hiddenPages = ["/login", "/register", "/forgot-password", "/verify-code"];
  const hideLayout = hiddenPages.includes(location.pathname);    
  return (
    <>
    <ScrollToTop />
      {!hideLayout && (
        <Header />
      )}
      <PageTitleManager />
      {/* Phần bọc Routes có margin/padding tránh đè header */}
      <div className={hideLayout ? "auth-page" : "pt-[82.09px]"}>
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
          <Route path="/payment-processing/:orderId" element={<PaymentProcessing />} />
          <Route path="/order-success/:orderId" element={<PaymentSuccess />} />
          <Route path="/payment-failed/:orderId" element={<PaymentFailed />} />
          <Route path="/payment-banking/:orderId" element={<PaymentBanking />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/forgot-password" element={<ForgotPassword/> } />
          <Route path="/verify-code" element={<VerifyCode/> } />
          <Route path="/terms_conditions" element={<TermsConditions/>} />
          <Route path="/shipping" element={<Shipping/>} />
          <Route path="/returns_exchanges" element={<ReturnExchanges/>} />
          <Route path="/privacy_policy" element={<PrivacyPolicy/>} />
          <Route path="/all" element={<AllProducts />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/category/brands" element={<BrandsCategory />} />
          <Route path="/category/brands/:brand" element={<BrandsCategory />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/faqs" element={<FaqsPage />} />
          <Route path="/care-instructions" element={<CareInstructions/>} />
        </Routes>
      </div>
      {!hideLayout && (
        <Footer />
      )}
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
