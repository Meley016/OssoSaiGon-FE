export default function ProductLargeCard({ item, onClick }) {
  const variants = item?.variants || [];

  const validVariants = variants.filter(v => v && v.price && v.color);
  const prices = validVariants.map(v => v.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const colors = [
    ...new Set(
      validVariants.map(v => v.color && JSON.stringify(v.color)).filter(Boolean)
    ),
  ].map(c => JSON.parse(c));

  const sizes = [
    ...new Set(
      validVariants.map(v => v.size && JSON.stringify(v.size)).filter(Boolean)
    ),
  ].map(s => JSON.parse(s));

  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white group hover:shadow-lg transition-all duration-300 border border-gray-200 overflow-hidden flex flex-col"
    >
      {/* Ảnh sản phẩm */}
      <div className="relative w-full aspect-[4/5] bg-gray-100 overflow-hidden">
        <img
          src={item.coverImage}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Overlay hover — hiển thị thông tin màu và size */}
        {(colors.length > 0 || sizes.length > 0) && (
          <div className="absolute inset-0 bg-white/95 flex flex-col justify-center items-center text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm px-4">
            {colors.length > 0 && (
              <div>
                <p className="font-semibold text-gray-800 mb-1">Màu sắc</p>
                <p className="text-gray-700">
                  {colors.slice(0, 4).map(c => c.name).join(", ")}
                  {colors.length > 4 && ` +${colors.length - 4}`}
                </p>
              </div>
            )}

            {sizes.length > 0 && (
              <div className="mt-3">
                <p className="font-semibold text-gray-800 mb-1">Kích cỡ</p>
                <p className="text-gray-700">
                  {sizes.slice(0, 4).map(s => s.name).join(", ")}
                  {sizes.length > 4 && ` +${sizes.length - 4}`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Thông tin sản phẩm */}
      <div className="p-4 flex flex-col justify-between flex-grow">
        <div>
          <p className="text-base font-semibold text-gray-900 leading-tight line-clamp-2 h-[40px]">
            {item.name}
          </p>

          {/* Màu sắc */}
          {colors.length > 0 && (
            <div className="flex gap-1 mt-2">
              {colors.slice(0, 5).map(c => (
                <div
                  key={c._id}
                  className="w-5 h-5 border border-gray-300"
                  style={{ backgroundColor: c.code }}
                />
              ))}
              {colors.length > 5 && (
                <span className="text-[12px] text-gray-600">
                  +{colors.length - 5}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Giá */}
        <p className="mt-3 text-black font-bold text-lg">
          {minPrice !== maxPrice
            ? `${minPrice.toLocaleString("vi-VN")} - ${maxPrice.toLocaleString("vi-VN")}₫`
            : `${minPrice.toLocaleString("vi-VN")}₫`}
        </p>
      </div>
    </div>
  );
}
