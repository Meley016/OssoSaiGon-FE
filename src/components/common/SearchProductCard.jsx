import { useState } from "react";
import { useTranslation } from "react-i18next";
import useCurrency from "../../hooks/useCurrency";

export default function SearchProductCard({ item, onClick }) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();
  const [hoveredColor, setHoveredColor] = useState(null);
  const [hoveredSize, setHoveredSize] = useState(null);

  // 🧩 Dữ liệu
  const colors = item.colors || [];
  const sizes = item.sizes || [];
  const minPrice = item.minPrice || 0;
  const maxPrice = item.maxPrice || 0;

  return (
    <div
      onClick={onClick}
      className="relative cursor-pointer bg-white  overflow-hidden group  transition-all duration-300"
    >
      {/* Ảnh sản phẩm */}
      <div className="relative w-full h-44 bg-gray-100 overflow-hidden">
        <img
          src={item.coverImage}
          alt={item.name}
          className="w-full h-full object-cover transition-all duration-300 group-hover:opacity-10"
        />

        {/* 🧊 Overlay khi hover card */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-3">
          {/* 🎨 Màu sắc */}
          {colors.length > 0 && (
            <div className="mb-4">
              <p className="font-semibold text-gray-800 mb-2 text-xs uppercase tracking-wide">
                {t("productMini.colors", "Màu sắc")}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {colors.slice(0, 6).map((c) => (
                  <div
                    key={c._id}
                    className="w-6 h-6 border border-gray-300 relative transition-transform hover:scale-110"
                    style={{ backgroundColor: c.code }}
                    onMouseEnter={() => setHoveredColor(c._id)}
                    onMouseLeave={() => setHoveredColor(null)}
                  >
                    {/* Tooltip tên màu */}
                    {hoveredColor === c._id && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-[2px] rounded shadow-md whitespace-nowrap z-10">
                        {c.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 📏 Size */}
          {sizes.length > 0 && (
            <div>
              <p className="font-semibold text-gray-800 mb-2 text-xs uppercase tracking-wide">
                {t("productMini.sizes", "Kích cỡ")}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {sizes.slice(0, 8).map((s) => (
                  <div
                    key={s._id}
                    className="px-2 py-[2px] border border-gray-400 text-xs font-medium text-gray-800 transition-transform hover:scale-110 relative"
                    onMouseEnter={() => setHoveredSize(s._id)}
                    onMouseLeave={() => setHoveredSize(null)}
                  >
                    {s.name || s.name}
                    {/* Tooltip tên size */}
                    {hoveredSize === s._id && (
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-[2px] rounded shadow-md whitespace-nowrap z-10">
                        {s.name}
                      </div>
                    )}
                  </div>
                ))}
                {sizes.length > 8 && (
                  <span className="text-[11px] text-gray-600">
                    +{sizes.length - 8}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="p-2">
        <p className="text-[13px] font-medium text-gray-900 leading-tight line-clamp-2 h-[32px]">
          {item.name}
        </p>
        <p className="mt-1 text-black font-semibold text-sm">
          {minPrice !== maxPrice
            ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
            : formatPrice(minPrice)}
        </p>
      </div>
    </div>
  );
}
