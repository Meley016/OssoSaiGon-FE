import { useTranslation } from "react-i18next";
import useCurrency from "../../hooks/useCurrency";

export default function ProductMiniCard({ item, onClick }) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency(); // ✅ Dùng để hiển thị giá theo tiền tệ

  const variants = item?.variants || [];

  const validVariants = variants.filter(v => v && v.price && v.color);
  const prices = variants
    .map(v => v.price)
    .filter(p => typeof p === "number" && p > 0); // chỉ lấy giá hợp lệ

  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;


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
      className="cursor-pointer w-36 sm:w-40 flex-shrink-0 border border-gray-200 bg-white group hover:shadow-md transition-all duration-300"
    >
      {/* Ảnh sản phẩm */}
      <div className="relative w-full h-44 bg-gray-100 overflow-hidden">
        <img
          src={item.coverImage}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Overlay hover — chỉ hiện tên màu + size */}
        {(colors.length > 0 || sizes.length > 0) && (
          <div className="absolute inset-0 bg-white/95 flex flex-col justify-center items-center text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs px-3">
            {/* Màu sắc */}
            {colors.length > 0 && (
              <div>
                <p className="font-semibold text-gray-800 mb-1">{t("productMini.colors")}</p>
                <p className="text-gray-700">
                  {colors.slice(0, 4).map(c => c.name).join(", ")}
                  {colors.length > 4 && ` +${colors.length - 4}`}
                </p>
              </div>
            )}

            {/* Kích cỡ */}
            {sizes.length > 0 && (
              <div className="mt-3">
                <p className="font-semibold text-gray-800 mb-1">{t("productMini.sizes")}</p>
                <p className="text-gray-700">
                  {sizes.slice(0, 4).map(s => s.name).join(", ")}
                  {sizes.length > 4 && ` +${sizes.length - 4}`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Thông tin */}
      <div className="p-2">
        <p className="text-[13px] font-medium text-gray-900 leading-tight line-clamp-2 h-[32px]">
          {item.name}
        </p>

        {/* Dải màu nhỏ dưới ảnh */}
        {colors.length > 0 && (
          <div className="flex gap-1 mt-1">
            {colors.slice(0, 4).map(c => (
              <div
                key={c._id}
                className="w-4 h-4 border border-gray-300"
                style={{ backgroundColor: c.code }}
              />
            ))}
            {colors.length > 4 && (
              <span className="text-[11px] text-gray-600">
                +{colors.length - 4}
              </span>
            )}
          </div>
        )}

        {/* 💰 Giá (theo tiền tệ hiện tại) */}
        <p className="mt-1 text-black font-semibold text-sm">
          {minPrice !== maxPrice
            ? `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`
            : formatPrice(minPrice)}
        </p>
      </div>
    </div>
  );
}
