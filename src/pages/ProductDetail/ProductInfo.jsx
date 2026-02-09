import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import loveList from "../../assets/love-list.png";
import AddWishlistModal from "../../components/common/AddWishlistModal";
import AlertModal from "../../components/common/AlertModal";
import ConfirmPreorderModal from "../../components/common/ConfirmPreorderModal";
import useAuth from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import useCurrency from "../../hooks/useCurrency";

export default function ProductInfo({
  product,
  selectedVariant,
  onVariantChange,
}) {
  const { fetchCartCount } = useCart();
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [hoveredColor, setHoveredColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(selectedVariant?.size?._id);
  const [loading, setLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [isReturnsOpen, setIsReturnsOpen] = useState(false);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
  // 🩷 NOTE: state điều khiển modal
  const [showWishlistModal, setShowWishlistModal] = useState(false);

  const [alert, setAlert] = useState({ message: "", type: "info" });
  const variants = product.variants || [];

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const currentVariant = selectedVariant;
  const originalPrice = currentVariant?.price ?? 0;
  const salePrice =
    currentVariant?.salePrice !== null &&
    typeof currentVariant?.salePrice === "number" &&
    currentVariant.salePrice < currentVariant.price
      ? currentVariant.salePrice
      : null;

  // === Range cho toàn bộ product (dùng khi chưa chọn variant) ===
  const originalPrices = variants
    .map((v) => v.price)
    .filter((p) => typeof p === "number");

  const salePrices = variants
    .filter((v) => typeof v.salePrice === "number" && v.salePrice < v.price)
    .map((v) => v.salePrice);

  const minOriginalPrice = originalPrices.length
    ? Math.min(...originalPrices)
    : 0;
  const maxOriginalPrice = originalPrices.length
    ? Math.max(...originalPrices)
    : 0;

  const minSalePrice = salePrices.length ? Math.min(...salePrices) : null;
  const maxSalePrice = salePrices.length ? Math.max(...salePrices) : null;

  const hasSale = salePrices.length > 0;

  // 🧮 Giá min - max
  // const prices = variants.map(v => v.price).filter(p => typeof p === "number");
  // const minPrice = prices.length ? Math.min(...prices) : 0;
  // const maxPrice = prices.length ? Math.max(...prices) : 0;

  // 🎨 Unique màu
  const uniqueColors = Array.from(
    new Map(variants.map((v) => [v.color?._id, v])).values(),
  ).filter((v) => v.color);

  // 📏 Size theo màu
  const sizesForColor = Array.from(
    new Map(
      variants
        .filter((v) => v.color?._id === selectedVariant?.color?._id)
        .map((v) => [v.size?._id, v]),
    ).values(),
  ).filter((v) => v.size);
  //preorder
  const [preorderLoading, setPreorderLoading] = useState(false);
  const [showPreorderModal, setShowPreorderModal] = useState(false);

  const handlePreorder = () => {
    if (!user?.email) {
      setAlert({ message: t("pleaseEnterEmail"), type: "warning" });
    }
    if (!selectedVariant) {
      setAlert({ message: t("selectColorSize"), type: "warning" });
      return;
    }
    setShowPreorderModal(true);
  };

  const confirmPreorder = async (itemsToSend) => {
    setPreorderLoading(true);
    try {
      if (!itemsToSend || itemsToSend.length === 0) throw new Error("No items");

      const payload = {
        productId: product._id,
        items: itemsToSend.map((i) => ({
          variantId: i.variant.sku,
          sku: i.variant.sku,
          image: i.variant.coverImage || product.coverImage || "",
          color: {
            id: i.variant.color?._id || null,
            name: i.variant.color?.name || "",
          },
          size: {
            id: i.variant.size?._id || null,
            name: i.variant.size?.name || "",
          },
          price: i.variant.price || 0,
          quantity: i.quantity,
        })),
      };

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/preorder`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error preorder");

      setAlert({ message: t("preorderSuccess"), type: "success" });
      setShowPreorderModal(false);
    } catch (err) {
      console.error("❌ preorder error:", err);
      setAlert({ message: err.message || t("preorderFailed"), type: "error" });
    } finally {
      setPreorderLoading(false);
    }
  };

  // 🩷 NOTE: Check xem product đã có trong wishlist chưa
  useEffect(() => {
    if (authLoading) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const checkWishlist = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/wishlist/check`,
          {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ productId: product._id }),
          },
        );
        const data = await res.json();
        setIsWishlisted(data.isWishlisted || false);
      } catch (err) {
        console.error("❌ Lỗi check wishlist:", err);
      }
    };
    checkWishlist();
  }, [user, authLoading, product._id]);

  // 🧩 Chọn size & color
  const handleSizeSelect = (sizeId) => {
    setSelectedSize(sizeId);
    const found = variants.find(
      (v) =>
        v.color?._id === selectedVariant?.color?._id && v.size?._id === sizeId,
    );
    if (found) onVariantChange(found);
  };

  const handleColorSelect = (colorId) => {
    const variantForColor =
      variants.find((v) => v.color?._id === colorId && v.stockQuantity === 0) ||
      variants.find((v) => v.color?._id === colorId);

    if (!variantForColor) return;

    onVariantChange(variantForColor);
    setSelectedSize(variantForColor.size?._id || null);
  };

  // 🛒 Add to Cart
  const handleAddToCart = async () => {
    if (authLoading) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      setAlert({ message: t("loginToContinue"), type: "warning" });
      return navigate("/login");
    }
    if (!selectedVariant) {
      setAlert({ message: t("selectColorSize"), type: "warning" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/cart/add`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product._id,
            sku: selectedVariant.sku,
            quantity: 1,
            price:
              selectedVariant.salePrice !== null &&
              selectedVariant.salePrice < selectedVariant.price
                ? selectedVariant.salePrice
                : selectedVariant.price,

            variantInfo: {
              color: {
                _id: selectedVariant.color?._id,
                name: selectedVariant.color?.name,
                hex: selectedVariant.color?.code || selectedVariant.color?.hex,
              },
              size: {
                _id: selectedVariant.size?._id,
                name: selectedVariant.size?.name,
              },
              coverImage: selectedVariant.images?.[0] || product.coverImage,
              images: selectedVariant.images || [], // Toàn bộ ảnh variant
              stockQuantity: selectedVariant.stockQuantity,
              sku: selectedVariant.sku,
            },
          }),
        },
      );

      const data = await res.json();
      if (!data || data.error) {
        console.error("❌", data?.error);
        setAlert({ message: t("addCartFailed"), type: "error" });
        return;
      }
      await fetchCartCount();
      setAlert({ message: t("addedToCart"), type: "success" });
    } catch (err) {
      console.error("❌", err);
      setAlert({ message: t("addCartFailed"), type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // 💖 NOTE: Khi click nút wishlist thì hiện modal chọn list
  const handleWishlistClick = () => {
    if (authLoading) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return navigate("/login");

    setShowWishlistModal(true);
    setShowWishlistModal(true);
  };

  const handleConfirmAddWishlist = (selectedLists) => {
    // Không cần gọi API nữa → toggle đã lưu real-time!
    setWishlistLoading(true);

    // Cập nhật icon wishlist ngay lập tức
    setIsWishlisted(selectedLists.length > 0);

    // Đóng modal + hiệu ứng loading ngắn
    setTimeout(() => {
      setShowWishlistModal(false);
      setWishlistLoading(false);

      // Thông báo (tùy chọn)
      setAlert({
        message:
          selectedLists.length > 0
            ? t("wishlistAdded", { count: selectedLists.length })
            : t("wishlistRemoved"),
        type: "success",
      });

      // Tự động đóng sau 2 giây (tùy chọn)
      setTimeout(() => setAlert({ message: "", type: "info" }), 2000);
    }, 300); // UX mượt
  };
  // 🔁 Accordion toggle
  const toggleShipping = () => setIsShippingOpen(!isShippingOpen);
  const toggleReturns = () => setIsReturnsOpen(!isReturnsOpen);
  const toggleDescription = () => setIsDescriptionOpen(!isDescriptionOpen);
  return (
    <div className="flex flex-col gap-1">
      {/* 🩷 NOTE: Modal chọn wishlist */}
      {showWishlistModal && (
        <AddWishlistModal
          product={product}
          variant={selectedVariant}
          onClose={() => setShowWishlistModal(false)}
          onConfirm={handleConfirmAddWishlist}
        />
      )}
      {showPreorderModal && (
        <ConfirmPreorderModal
          user={user}
          product={product}
          variant={selectedVariant}
          loading={preorderLoading}
          onClose={() => setShowPreorderModal(false)}
          onConfirm={confirmPreorder}
        />
      )}

      {/* === Phần hiển thị sản phẩm === */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
        <p className="text-gray-500 text-sm mt-1">{product.brand}</p>
      </div>

      {/* Giá */}
      {/* <p className="text-xl api-text text-black">
          {minPrice !== maxPrice
            ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
            : formatPrice(selectedVariant?.price || 0)}
        </p> */}

      <div className="mt-2">
        {currentVariant && salePrice ? (
          // ===== ĐÃ CHỌN VARIANT + CÓ SALE =====
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-gray-400 line-through">
              {formatPrice(originalPrice)}
            </span>
            <span className="text-2xl font-bold text-red-600">
              {formatPrice(salePrice)}
            </span>
          </div>
        ) : currentVariant ? (
          // ===== ĐÃ CHỌN VARIANT + KHÔNG SALE =====
          <span className="text-2xl font-bold text-black">
            {formatPrice(originalPrice)}
          </span>
        ) : hasSale && minSalePrice !== null ? (
          // ===== CHƯA CHỌN VARIANT + CÓ SALE =====
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-gray-400 line-through">
              {minOriginalPrice !== maxOriginalPrice
                ? `${formatPrice(minOriginalPrice)} - ${formatPrice(maxOriginalPrice)}`
                : formatPrice(minOriginalPrice)}
            </span>
            <span className="text-2xl font-bold text-red-600">
              {minSalePrice !== maxSalePrice
                ? `${formatPrice(minSalePrice)} - ${formatPrice(maxSalePrice)}`
                : formatPrice(minSalePrice)}
            </span>
          </div>
        ) : (
          // ===== CHƯA CHỌN VARIANT + KHÔNG SALE =====
          <span className="text-2xl font-bold text-black">
            {minOriginalPrice !== maxOriginalPrice
              ? `${formatPrice(minOriginalPrice)} - ${formatPrice(maxOriginalPrice)}`
              : formatPrice(minOriginalPrice)}
          </span>
        )}
      </div>

      {/* Màu sắc */}
      <div>
        <p className="font-medium mb-2 text-gray-900">{t("color")}:</p>
        <div className="flex gap-2">
          {uniqueColors.map((v) => (
            <div
              key={v.color._id}
              className="relative"
              onMouseEnter={() => setHoveredColor(v.color.name)}
              onMouseLeave={() => setHoveredColor(null)}
            >
              <div
                onClick={() => handleColorSelect(v.color._id)}
                className={`h-8 w-8 border cursor-pointer transition
                    ${selectedVariant?.color?._id === v.color._id ? "border-black" : "border-gray-400"}`}
                style={{ backgroundColor: v.color.code }}
              />
              {hoveredColor === v.color.name && (
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 whitespace-nowrap ">
                  {v.color.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <p className="font-medium mb-2 text-gray-900">{t("size")}:</p>
        <div className="flex gap-2 mb-4 flex-wrap">
          {sizesForColor.map((v) => {
            const isSelected = selectedSize === v.size._id;
            const outOfStock = v.stockQuantity === 0;
            return (
              <button
                key={v.size._id}
                disabled={outOfStock}
                onClick={() => handleSizeSelect(v.size._id)}
                className={`px-4 py-2 border text-sm font-semibold transition
                    ${
                      outOfStock
                        ? "opacity-30 cursor-not-allowed border-gray-300"
                        : isSelected
                          ? "bg-black text-white border-black"
                          : "border-gray-400 hover:border-black"
                    }`}
              >
                {v.size.name}
                {outOfStock}
              </button>
            );
          })}
        </div>
      </div>

      {/* Buttons: Add to Cart + Wishlist */}
      <div className="flex flex-col md:flex-row gap-2">
        <button
          onClick={handleAddToCart}
          disabled={selectedVariant?.stockQuantity === 0 || loading}
          className={`py-3 hardcode-text w-full md:flex-1 font-semibold text-lg transition duration-200 
              ${
                selectedVariant?.stockQuantity > 0 && !loading
                  ? "bg-black text-white hover:bg-[#ffe6e6] hover:text-black"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
        >
          {loading
            ? t("adding")
            : selectedVariant?.stockQuantity > 0
              ? t("addToCart")
              : t("outOfStock")}
        </button>

        {/* 🩷 NOTE: Nút mở modal wishlist */}
        <button
          onClick={handleWishlistClick}
          disabled={wishlistLoading}
          className={`py-3 w-full md:w-12 font-semibold text-lg transition duration-200  flex items-center justify-center
              ${
                wishlistLoading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : isWishlisted
                    ? "border-2 border-[#FFE6E6] bg-[#FFE6E6]"
                    : "border-2 border-gray-300 bg-white hover:bg-gray-100"
              }`}
        >
          <img
            src={loveList}
            alt="wishlist icon"
            className={`w-6 h-6 object-contain transition-all duration-200
                ${isWishlisted ? "scale-110" : "opacity-70 hover:opacity-100"}
              `}
          />
        </button>
      </div>
      {/* PREORDER – chỉ hiện khi variant hết hàng */}
      {selectedVariant?.stockQuantity === 0 && (
        <button
          onClick={handlePreorder}
          disabled={preorderLoading}
          className="mt-2 py-3 w-full uppercase font-semibold text-lg
                        bg-black text-white transition 
                        hover:bg-[#ffe6e6] hover:text-black"
        >
          {preorderLoading ? t("loading") : t("preorder")}
        </button>
      )}

      <div className="mt-6">
        <button
          onClick={toggleDescription}
          className="w-full py-3 text-sm font-medium border hardcode-text border-gray-300 hover:border-gray-500 transition text-left flex justify-between items-center"
        >
          <span className="ml-2">{t("description")}</span>
          <svg
            className={`w-5 h-5 transition-transform ${isDescriptionOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        {isDescriptionOpen && (
          <div className="mt-2 p-4 border  border-gray-300 text-sm text-gray-700">
            <div
              className="text-gray-700 max-h-[300px] no-scrollbar md:max-h-[400px] overflow-y-auto whitespace-pre-wrap text-sm pr-2"
              style={{ lineHeight: "1.5" }}
            >
              {product.description || t("noDescription")}
            </div>
          </div>
        )}
      </div>

      {/* Accordion: Shipping / Returns */}
      <div className="mt-4 space-y-4">
        {/* Shipping */}
        <div>
          <button
            onClick={toggleShipping}
            className="w-full py-3 text-sm font-medium border hardcode-text border-gray-300 hover:border-gray-500 transition text-left flex justify-between items-center"
          >
            <span className="ml-2">{t("shipping")}</span>
            <svg
              className={`w-5 h-5 transition-transform ${isShippingOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {isShippingOpen && (
            <div className="mt-2 p-4 border  border-gray-300  text-sm text-gray-700">
              <ul className="list-disc pl-5 space-y-2">
                <p>
                  - Standard Shipping orders placed before 10am PT ship the same
                  day.
                </p>
                <p>
                  - 2 Day and Overnight orders ship same day if placed before
                  12pm PT.
                </p>
                <p>
                  - Free Shipping on US orders over $75 and international orders
                  over $100.
                </p>
              </ul>
            </div>
          )}
        </div>

        {/* Returns */}
        <div>
          <button
            onClick={toggleReturns}
            className="w-full py-3 text-sm font-medium hardcode-text border border-gray-300 hover:border-gray-500 transition text-left flex justify-between items-center"
          >
            <span className="ml-2"> {t("returns")}</span>
            <svg
              className={`w-5 h-5 transition-transform ${isReturnsOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {isReturnsOpen && (
            <div className="mt-2 p-4 border border-gray-300  text-sm text-gray-700">
              <ul className="list-disc pl-5 space-y-2">
                <p>- Return within 30 days for exchange or refund.</p>
                <p>- Free exchange available via returns portal.</p>
                <p>- Refunds deduct $8 for shipping label cost.</p>
              </ul>
            </div>
          )}
        </div>
      </div>
      <AlertModal
        message={alert.message}
        type={alert.type}
        onClose={() => setAlert({ message: "", type: "info" })}
      />
    </div>
  );
}
