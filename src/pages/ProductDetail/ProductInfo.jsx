import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import loveList from "../../assets/love-list.png";
import AddWishlistModal from "../../components/common/AddWishlistModal";
import AlertModal from "../../components/common/AlertModal";
import useAuth from "../../hooks/useAuth";
export default function ProductInfo({ product, selectedVariant, onVariantChange }) {
  const [hoveredColor, setHoveredColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(selectedVariant?.size?._id);
  const [loading, setLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isShippingOpen, setIsShippingOpen] = useState(false);
  const [isReturnsOpen, setIsReturnsOpen] = useState(false);
  // 🩷 NOTE: state điều khiển modal
  const [showWishlistModal, setShowWishlistModal] = useState(false);

  const [alert, setAlert] = useState({ message: "", type: "info" });

  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const variants = product.variants || [];

  // 🧮 Giá min - max
  const prices = variants.map(v => v.price).filter(p => typeof p === "number");
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  // 🎨 Unique màu
  const uniqueColors = Array.from(new Map(variants.map(v => [v.color?._id, v])).values()).filter(v => v.color);

  // 📏 Size theo màu
  const sizesForColor = Array.from(
    new Map(
      variants
        .filter(v => v.color?._id === selectedVariant?.color?._id)
        .map(v => [v.size?._id, v])
    ).values()
  ).filter(v => v.size);

  // 🩷 NOTE: Check xem product đã có trong wishlist chưa
  useEffect(() => {
    if (authLoading || !user) return;
    const checkWishlist = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/wishlist/check`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId: product._id }),
        });
        const data = await res.json();
        setIsWishlisted(data.isWishlisted || false);
      } catch (err) {
        console.error("❌ Lỗi check wishlist:", err);
      }
    };
    checkWishlist();
  }, [user, authLoading, product._id]);

  // 🧩 Chọn size & color
  const handleSizeSelect = sizeId => {
    setSelectedSize(sizeId);
    const found = variants.find(v => v.color?._id === selectedVariant?.color?._id && v.size?._id === sizeId);
    if (found) onVariantChange(found);
  };

  const handleColorSelect = colorId => {
    const firstVariant = variants.find(v => v.color?._id === colorId);
    if (firstVariant) {
      onVariantChange(firstVariant);
      setSelectedSize(firstVariant.size?._id);
    }
  };

  // 🛒 Add to Cart
  const handleAddToCart = async () => {
    if (authLoading) return;
    if (!user) return navigate("/login");

    if (!selectedVariant) return alert("Vui lòng chọn màu/size");

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/cart/add`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product._id,
          sku: selectedVariant.sku,
          quantity: 1,
          price: selectedVariant.price,
          variantInfo: {
            color: selectedVariant.color?._id,
            size: selectedVariant.size?._id,
            coverImage: selectedVariant.images?.[0] || product.coverImage,
          },
        }),
      });

      const data = await res.json();
      if (!data || data.error) {
        console.error("❌ Lỗi thêm giỏ:", data?.error);
        return alert("Không thể thêm vào giỏ hàng!");
      }

      alert("✅ Đã thêm vào giỏ hàng!");
    } catch (err) {
      console.error("❌ Lỗi thêm giỏ:", err);
      alert("Thêm giỏ thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // 💖 NOTE: Khi click nút wishlist thì hiện modal chọn list
  const handleWishlistClick = () => {
    if (authLoading) return;
    if (!user) return navigate("/login");
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
          message: selectedLists.length > 0
            ? `Đã thêm vào ${selectedLists.length} wishlist!`
            : "Đã gỡ khỏi tất cả wishlist!",
          type: "success"
        });

        // Tự động đóng sau 2 giây (tùy chọn)
        setTimeout(() => setAlert({ message: "", type: "info" }), 2000);
      }, 300); // UX mượt
    }
  // 🔁 Accordion toggle
  const toggleShipping = () => setIsShippingOpen(!isShippingOpen);
  const toggleReturns = () => setIsReturnsOpen(!isReturnsOpen);

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

      {/* === Phần hiển thị sản phẩm === */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{product.name}</h2>
        <p className="text-gray-500 text-sm mt-1">{product.brand}</p>
      </div>

      {/* Giá */}
      <p className="text-xl font-bold text-black">
        {minPrice !== maxPrice
          ? `${minPrice.toLocaleString("vi-VN")} - ${maxPrice.toLocaleString("vi-VN")}₫`
          : `${selectedVariant?.price.toLocaleString("vi-VN") || 0}₫`}
      </p>

      {/* Màu sắc */}
      <div>
        <p className="font-medium mb-2 text-gray-900">Màu sắc:</p>
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
                <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 whitespace-nowrap rounded">
                  {v.color.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Size */}
      <div>
        <p className="font-medium mb-2 text-gray-900">Size:</p>
        <div className="flex gap-2 flex-wrap">
          {sizesForColor.map((v) => {
            const isSelected = selectedSize === v.size._id;
            const outOfStock = v.stockQuantity === 0;
            return (
              <button
                key={v.size._id}
                disabled={outOfStock}
                onClick={() => handleSizeSelect(v.size._id)}
                className={`px-4 py-2 border text-sm font-semibold transition
                  ${outOfStock
                    ? "opacity-30 cursor-not-allowed border-gray-300"
                    : isSelected
                      ? "bg-black text-white border-black"
                      : "border-gray-400 hover:border-black"
                  }`}
              >
                {v.size.name}
                {outOfStock && <span className="ml-1 text-xs text-red-500">(Hết)</span>}
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
          className={`py-3 w-full md:flex-1 font-semibold text-lg transition duration-200 rounded-none
            ${selectedVariant?.stockQuantity > 0 && !loading
              ? "bg-black text-white hover:bg-[#ffe6e6] hover:text-black"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          {loading ? "Đang thêm..." : selectedVariant?.stockQuantity > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
        </button>

        {/* 🩷 NOTE: Nút mở modal wishlist */}
        <button
          onClick={handleWishlistClick}
          disabled={wishlistLoading}
          className={`py-3 w-full md:w-12 font-semibold text-lg transition duration-200 rounded-none flex items-center justify-center
            ${wishlistLoading
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


      <div className="mt-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Mô tả sản phẩm</h3>
        <div
          className="text-gray-700 max-h-[300px] md:max-h-[400px] overflow-y-auto whitespace-pre-wrap text-sm pr-2"
          style={{ lineHeight: "1.5" }}
        >
          {product.description || "Không có mô tả"}
        </div>
      </div>

      {/* Accordion: Shipping / Returns */}
      <div className="mt-6 space-y-4">
        {/* Shipping */}
        <div>
          <button
            onClick={toggleShipping}
            className="w-full py-3 text-sm font-medium border border-gray-300 hover:border-gray-500 transition text-left flex justify-between items-center"
          >
            <span className="ml-2">Fast Shipping</span>
            <svg
              className={`w-5 h-5 transition-transform ${isShippingOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isShippingOpen && (
            <div className="mt-2 p-4 border border-gray-300 rounded text-sm text-gray-700">
              <ul className="list-disc pl-5 space-y-2">
                <p>- Standard Shipping orders placed before 10am PT ship the same day.</p>
                <p>- 2 Day and Overnight orders ship same day if placed before 12pm PT.</p>
                <p>- Free Shipping on US orders over $75 and international orders over $100.</p>
              </ul>
            </div>
          )}
        </div>

        {/* Returns */}
        <div>
          <button
            onClick={toggleReturns}
            className="w-full py-3 text-sm font-medium border border-gray-300 hover:border-gray-500 transition text-left flex justify-between items-center"
          >
            <span className="ml-2"> Easy Returns</span>
            <svg
              className={`w-5 h-5 transition-transform ${isReturnsOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isReturnsOpen && (
            <div className="mt-2 p-4 border border-gray-300 rounded text-sm text-gray-700">
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
