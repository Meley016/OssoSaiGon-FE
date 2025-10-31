import { useState } from "react";

export default function WishlistProductCard({ item, onClick, onRemove }) {
  const [hoveredColor, setHoveredColor] = useState(null);
  const variants = item?.variants || [];
  const validVariants = variants.filter(v => v && v.price && v.color && v.size);
  const inStock = validVariants.some(v => (v.stockQuantity ?? v.stock ?? 0) > 0);
  const prices = validVariants.map(v => v.price);
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
  const [removing, setRemoving] = useState(false);

  // 🎨 Danh sách màu duy nhất
  const colors = [
    ...new Map(
      validVariants
        .filter(v => v.color)
        .map(v => [v.color._id, v.color])
    ).values(),
  ];
  
  const coverImage = 
    validVariants.find(v => v.coverImage)?.coverImage 
    || validVariants[0]?.images?.[0] 
    || "/no-image.jpg";
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
    : allSizes; // nếu chưa hover màu → hiển thị toàn bộ size

  // XÓA SẢN PHẨM
  const handleRemove = async (e) => {
    e.stopPropagation();
    if (removing) return;
    setRemoving(true);
    try {
      await onRemove(item._id);
    } finally {
      setRemoving(false);
    }
  };
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white group hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden flex flex-col relative"
    >
      
      {/* NÚT X XÓA */}
      <button
        onClick={handleRemove}
        disabled={removing}
        className={`absolute top-2 right-2 z-10 w-7 h-7 bg-black text-white flex items-center justify-center text-lg font-bold hover:bg-[#ffe6e6] hover:text-black transition-all ${removing ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {removing ? "..." : "X"}
      </button>

      {/* Ảnh sản phẩm */}
      <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
        <img
          src={coverImage}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Overlay hover */}
        {(colors.length > 0 || allSizes.length > 0) && (
          <div className="absolute inset-0 bg-white/95 flex flex-col justify-center items-center text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4">
            {/* Màu sắc */}
            {colors.length > 0 && (
              <div className="mb-6">
                <p className="font-semibold text-gray-800 mb-3 text-sm">Màu sắc</p>
                <div className="flex flex-wrap justify-center gap-2 max-w-[200px]">
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
              <p className="font-semibold text-gray-800 mb-3 text-sm">Size có sẵn</p>
              {sizesForColor.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-2">
                  {sizesForColor.map(size => {
                    const outOfStock = size.stockQuantity <= 0;
                    return (
                      <div
                        key={size._id}
                        className={`relative px-3 py-1 border text-sm font-medium transition select-none
                          ${outOfStock
                            ? "opacity-40 border-gray-300 cursor-not-allowed"
                            : "border-gray-400 hover:border-black"
                          }`}
                      >
                        {size.name}
                        {/* Gạch chéo khi hết hàng */}
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
                <p className="text-gray-400 text-sm italic">Không có size</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Thông tin sản phẩm */}
      <div className="pl-4 pr-4 pt-4 flex flex-col justify-between flex-grow">
        <div>
          <p className="text-base font-semibold text-gray-900 leading-tight line-clamp-2 h-[40px]">
            {item.name}
          </p>
        </div>
      </div>
      <div className="flex flex-row flex-grow pl-4 pr-4 pb-4 items-center mr-2 justify-between ">
        {/* Giá */}
        <p className="text-black font-bold text-lg">
          {prices.length > 0
            ? minPrice !== maxPrice
              ? `${minPrice.toLocaleString("vi-VN")} - ${maxPrice.toLocaleString("vi-VN")}₫`
              : `${minPrice.toLocaleString("vi-VN")}₫`
            : "Liên hệ"}
        </p>
          {inStock ? (
            <button className="px-4 py-1 bg-black text-white text-sm hover:bg-gray-800">
              Xem
            </button>
          ) : (
            <span className="text-red-600 font-medium text-sm">Sold Out</span>
          )}
        </div>
    </div>
  );
}