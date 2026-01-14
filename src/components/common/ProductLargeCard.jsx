import { useState } from "react";
import { useTranslation } from "react-i18next";
import useCurrency from "../../hooks/useCurrency";

export default function ProductLargeCard({ item, onClick }) {
  const [hoveredColor, setHoveredColor] = useState(null);
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();

  const variants = item?.variants || [];
  const validVariants = variants.filter(v => v && v.price && v.color && v.size);

  const finalPrices = validVariants.map(v =>
    v.salePrice && v.salePrice > 0 && v.salePrice < v.price
      ? v.salePrice
      : v.price
  );

  const originalPrices = validVariants.map(v => v.price);

  const minFinalPrice = finalPrices.length ? Math.min(...finalPrices) : 0;
  const maxFinalPrice = finalPrices.length ? Math.max(...finalPrices) : 0;

  const minOriginalPrice = originalPrices.length ? Math.min(...originalPrices) : 0;
  const maxOriginalPrice = originalPrices.length ? Math.max(...originalPrices) : 0;
   //sale price
  const salePercents = validVariants
    .filter(v => v.salePrice && v.salePrice > 0 && v.salePrice < v.price)
    .map(v =>
      Math.floor(((v.price - v.salePrice) / v.price) * 100)
    );

  const maxSalePercent =
    salePercents.length > 0 ? Math.max(...salePercents) : null;

  const hasSale = maxSalePercent !== null;


  // 🎨 Danh sách màu duy nhất
  const colors = [
    ...new Map(
      validVariants
        .filter(v => v.color)
        .map(v => [v.color._id, v.color])
    ).values(),
  ];

  // 📏 Tất cả size duy nhất
  const allSizes = [
    ...new Map(
      validVariants.map(v => [
        v.size._id,
        {
          ...v.size,
          stockQuantity: v.stockQuantity ?? v.stock ?? 0,
        },
      ])
    ).values(),
  ];

  // 📏 Size theo màu đang hover
  const sizesForColor = hoveredColor
    ? [
        ...new Map(
          validVariants
            .filter(v => v.color?._id === hoveredColor)
            .map(v => [
              v.size._id,
              {
                ...v.size,
                stockQuantity: v.stockQuantity ?? v.stock ?? 0,
              },
            ])
        ).values(),
      ]
    : allSizes;


  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white group  transition-all duration-300 overflow-hidden flex flex-col"
    >
      {/* Ảnh sản phẩm */}
      <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
      {hasSale && (
        <div className="absolute top-3 left-80 z-10">
          <div className="relative bg-red-600 text-white flex flex-col items-center px-3 py-2 text-xs font-bold leading-tight">
            <span className="text-sm">-{maxSalePercent}%</span>
            <span className="text-[10px] uppercase">OFF</span>

            {/* Tam giác cân = full width */}
            <div
              className="absolute bottom-[-12px] left-0 w-full h-[12px] bg-red-600"
              style={{
                clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              }}
            />
          </div>
        </div>
      )}



        <img
          src={item.coverImage}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Overlay hover */}
        {(colors.length > 0 || allSizes.length > 0) && (
          <div className="absolute inset-0 bg-white/95 flex flex-col justify-center items-center text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
            {/* Màu sắc */}
            {colors.length > 0 && (
              <div className="mb-6">
                <p className="font-semibold text-gray-800 mb-3  ">
                  {t("productLarge.colors")}
                </p>
                <div className="flex flex-wrap justify-center gap-2 w-auto max-w-[200px]">
                  {colors.map(color => (
                    <div
                      key={color._id}
                      onMouseEnter={() => setHoveredColor(color._id)}
                      onMouseLeave={() => setHoveredColor(null)}
                      className={`relative group/color w-10 h-10 border-2 cursor-pointer transition-transform 
                        ${hoveredColor === color._id ? "border-black scale-110" : "border-gray-300 hover:scale-110"}`}
                      style={{ backgroundColor: color.code }}
                    >
                      {/* Tooltip tên màu */}
                      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 whitespace-nowrap opacity-0 group-hover/color:opacity-100 transition-opacity pointer-events-none z-10">
                        {color.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            <div className="mt-1 transition-all duration-300">
              <p className="font-semibold text-gray-800 mb-3 text-sm">
                {t("productLarge.sizes")}
              </p>
              {sizesForColor.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-2">
                  {sizesForColor.map(size => {
                    const outOfStock = size.stockQuantity <= 0;
                    return (
                      <div
                        key={size._id}
                        className={`relative px-3 py-1 border text-sm font-medium transition select-none
                          ${
                            outOfStock
                              ? "opacity-40 border-gray-300 cursor-not-allowed"
                              : "border-gray-400 hover:border-black"
                          }`}
                      >
                        {size.name}
                        {outOfStock && (
                          <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <span className="absolute w-[120%] h-[2px] bg-gray-400 rotate-45"></span>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-400 text-sm italic">
                  {t("productLarge.noSizes")}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Thông tin sản phẩm */}
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <p className="text-base font-semibold text-gray-900 leading-tight line-clamp-2 h-[40px]">
            {item.name}
          </p>
        </div>

        {/* 💰 Giá theo tiền tệ hiện tại */}
        <div className="mt-3">
          {hasSale ? (
            <div className="flex items-baseline gap-2 whitespace-nowrap">
              {/* Giá cũ */}
              <span className="text-sm text-gray-400 line-through">
                {minOriginalPrice !== maxOriginalPrice
                  ? `${formatPrice(minOriginalPrice)} - ${formatPrice(maxOriginalPrice)}`
                  : formatPrice(minOriginalPrice)}
              </span>

              {/* Giá mới */}
              <span className="text-red-600 font-bold text-xl leading-none">
                {minFinalPrice !== maxFinalPrice
                  ? `${formatPrice(minFinalPrice)} - ${formatPrice(maxFinalPrice)}`
                  : formatPrice(minFinalPrice)}
              </span>
            </div>
          ) : (
            <span className="text-black font-bold text-lg whitespace-nowrap">
              {minFinalPrice !== maxFinalPrice
                ? `${formatPrice(minFinalPrice)} - ${formatPrice(maxFinalPrice)}`
                : formatPrice(minFinalPrice)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
