import { useState } from "react";
import { useTranslation } from "react-i18next";
import useCurrency from "../../hooks/useCurrency";

export default function CartItem({ item, onUpdate, onRemove }) {
  const { t } = useTranslation();
  const [showColorDropdown, setShowColorDropdown] = useState(false);
  const [showSizeDropdown, setShowSizeDropdown] = useState(false);

  const { formatPrice } = useCurrency();
  const currentColor = item.variantInfo?.color;
  const currentSize = item.variantInfo?.size;
  const coverImage = item.variantInfo?.coverImage || item.productId?.coverImage || "/no-image.jpg";

  // === DANH SÁCH MÀU & SIZE ===
  const availableColors = item.productId?.variants
    ?.map(v => v.color)
    .filter((c, i, arr) => c && arr.findIndex(ac => ac?._id === c._id) === i);

  const availableSizes = item.productId?.variants
    ?.filter(v => v.color?._id === currentColor?._id)
    .map(v => v.size)
    .filter((s, i, arr) => s && arr.findIndex(as => as?._id === s._id) === i);

  const handleQuantityChange = (newQty) => {
    if (newQty >= 1) onUpdate(item.sku, newQty);
  };

  const handleColorChange = async (newColor) => {
    const newVariant = item.productId?.variants.find(
      v => v.color?._id === newColor._id && v.size?._id === currentSize?._id
    );
    if (newVariant) await onUpdate(item.sku, item.quantity, newVariant.sku);
    setShowColorDropdown(false);
  };

  const handleSizeChange = async (newSize) => {
    const newVariant = item.productId?.variants.find(
      v => v.size?._id === newSize._id && v.color?._id === currentColor?._id
    );
    if (newVariant) await onUpdate(item.sku, item.quantity, newVariant.sku);
    setShowSizeDropdown(false);
  };

  return (
    <div className="bg-white border border-gray-300 p-6 flex flex-col sm:flex-row gap-6 hover:border-black transition-all duration-200 relative">
      {/* ẢNH */}
      <div className="sm:w-48 h-48 bg-gray-50 border border-gray-300 overflow-hidden flex-shrink-0">
        <img
          src={coverImage}
          alt={item.productId?.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* THÔNG TIN */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold uppercase text-gray-900 line-clamp-2 leading-tight">
            {item.productId?.name}
          </h3>
          <p className="text-xs text-gray-500 uppercase mt-1 tracking-wider">
            SKU: {item.sku}
          </p>

          {/* MÀU + SIZE */}
          <div className="flex flex-wrap gap-4 mt-3 text-sm">
            {/* MÀU */}
            <div className="relative">
              <button
                onClick={() => setShowColorDropdown(!showColorDropdown)}
                className="flex items-center gap-2 hover:underline focus:outline-none"
              >
                <span className="font-medium text-gray-700">{t("cart-item.color")}:</span>

                <div className="relative group">
                  <div
                    className="w-7 h-7 border border-gray-500 shadow-sm"
                    style={{ backgroundColor: currentColor?.code || "#ccc" }}
                  />
                  <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2.5 py-1 opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                    {currentColor?.name}
                  </span>
                </div>

                <span className="px-2.5 py-1 bg-gray-200 text-xs font-bold uppercase tracking-wide">
                  {currentColor?.name}
                </span>
              </button>

              {showColorDropdown && availableColors?.length > 1 && (
                <div className="absolute top-full mt-2 left-0 bg-white border border-gray-300 shadow-xl z-50 min-w-[140px] overflow-hidden">
                  {availableColors.map(color => {
                    const variant = item.productId?.variants.find(
                      v => v.color?._id === color._id && v.size?._id === currentSize?._id
                    );
                    const inStock = variant?.stockQuantity > 0;
                    return (
                      <button
                        key={color._id}
                        onClick={() => handleColorChange(color)}
                        disabled={!inStock}
                        className={`w-full text-left px-3 py-2.5 flex items-center gap-2 hover:bg-gray-50 transition-all ${
                          color._id === currentColor._id ? "bg-gray-100 font-medium" : ""
                        } ${!inStock ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="w-5 h-5 border border-gray-500" style={{ backgroundColor: color.code }} />
                        <span className="text-xs">{color.name}</span>
                        {!inStock && <span className="ml-auto text-xs text-red-500">({t("cart-item.outOfStock")})</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* SIZE */}
            <div className="relative">
              <button
                onClick={() => setShowSizeDropdown(!showSizeDropdown)}
                className="flex items-center gap-2 hover:underline focus:outline-none"
              >
                <span className="font-medium text-gray-700">{t("cart-item.size")}:</span>
                <span className="px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider">
                  {currentSize?.name}
                </span>
              </button>

              {showSizeDropdown && availableSizes?.length > 1 && (
                <div className="absolute top-full mt-2 left-0 bg-white border border-gray-300 shadow-xl z-50 min-w-[80px] overflow-hidden">
                  {availableSizes.map(size => {
                    const variant = item.productId?.variants.find(
                      v => v.size?._id === size._id && v.color?._id === currentColor?._id
                    );
                    const inStock = variant?.stockQuantity > 0;
                    return (
                      <button
                        key={size._id}
                        onClick={() => handleSizeChange(size)}
                        disabled={!inStock}
                        className={`w-full text-left px-3 py-2.5 text-xs font-medium hover:bg-gray-50 transition-all ${
                          size._id === currentSize._id ? "bg-gray-100" : ""
                        } ${!inStock ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {size.name}
                        {!inStock && <span className="ml-2 text-xs text-red-500">({t("cart-item.outOfStock")})</span>}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* SỐ LƯỢNG + GIÁ + POINTS */}
          <div className="flex items-center justify-between mt-5">
            <div className="flex flex-col gap-1">
              <input
                type="number"
                value={item.quantity}
                onChange={(e) =>
                  handleQuantityChange(Math.max(1, parseInt(e.target.value) || 1))
                }
                min="1"
                className="
                  w-11 h-11
                  text-center text-sm font-medium
                  item-center
                  border-none
                  outline-none
                  appearance-none
                  [-moz-appearance:textfield]
                  bg-white
                "
              />
              {item.points !== undefined && (
                <span className="text-xs text-gray-500">
                  {t("cart-item.points")}: {item.points} pts
                </span>
              )}
            </div>

            <span className="text-xl font-medium text-gray-900">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-6 pt-5 border-t border-gray-200">
          <span className="text-sm text-gray-600 font-medium">
            {formatPrice(item.price)} / {t("cart-item.perItem")}
          </span>
          <button
            onClick={() => onRemove(item.sku)}
            className="text-red-600 hover:text-red-800 font-bold text-sm uppercase tracking-wider"
          >
            {t("cart-item.remove")}
          </button>
        </div>
      </div>
    </div>
  );
}
