import { useState } from "react";
import { useTranslation } from "react-i18next";
import useCurrency from "../../hooks/useCurrency";

export default function ProductLargeCard({ item, onClick }) {
  const [hoveredColor, setHoveredColor] = useState(null);
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();

  const variants = item?.variants || [];
  const validVariants = variants.filter(v => v && v.price && v.color && v.size);

  const prices = validVariants.map(v => v.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

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
        <p className="mt-3 text-black api-text font-bold text-lg">
          {prices.length > 0
            ? minPrice !== maxPrice
              ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
              : formatPrice(minPrice)
            : t("productLarge.contact")}
        </p>
      </div>
    </div>
  );
}
