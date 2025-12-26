import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import useCurrency from "../../hooks/useCurrency";

export default function ConfirmPreorderModal({ user, product, onClose, onConfirm, loading }) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [items, setItems] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");

  const colors = useMemo(() => {
    const map = new Map();
    product.variants?.forEach(v => {
      if (v.color) map.set(v.color._id, v.color);
    });
    return Array.from(map.values());
  }, [product.variants]);

  const sizesForColor = useMemo(() => {
    if (!selectedColor) return [];
    const map = new Map();
    product.variants
      ?.filter(v => v.color?._id === selectedColor)
      .forEach(v => {
        if (v.size) map.set(v.size._id, v.size);
      });
    return Array.from(map.values());
  }, [product.variants, selectedColor]);

  const getVariant = (colorId, sizeId) =>
    product.variants.find(v => v.color?._id === colorId && v.size?._id === sizeId);

  // Ẩn thông báo tự động nếu chọn xong hoặc add xong
  useEffect(() => {
    if ((selectedColor && selectedSize && errorMessage.includes(t("pleaseSelectColor"))) ||
        (selectedColor && selectedSize && errorMessage.includes(t("pleaseSelectSize")))) {
      setErrorMessage("");
    }
  }, [selectedColor, selectedSize]);

  const handleAddItem = () => {
    if (!selectedColor) {
      setErrorMessage(`* ${t("pleaseSelectColor")}`);
      return;
    }
    if (!selectedSize) {
      setErrorMessage(`* ${t("pleaseSelectSize")}`);
      return;
    }

    const variant = getVariant(selectedColor, selectedSize);
    if (!variant) return;

    setItems(prev => [
      ...prev,
      {
        key: `${selectedColor}_${selectedSize}`,
        variant,
        quantity,
        color: { id: variant.color?._id || "", name: variant.color?.name || "-" },
        size: { id: variant.size?._id || "", name: variant.size?.name || "-" },
      }
    ]);


    setQuantity(1);
    setSelectedColor(null);
    setSelectedSize(null);
    setErrorMessage(""); // Xóa thông báo sau khi Add
  };

  const handleRemoveItem = key => setItems(prev => prev.filter(i => i.key !== key));
  const total = items.reduce((sum, i) => sum + i.variant.price * i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg bg-white shadow-xl overflow-hidden">
        {/* HEADER */}
        <div className="px-6 py-4 border-b bg-[#ffe6e6]">
          <h2 className="text-xl font-semibold">{t("confirmPreorder")}</h2>
          <p className="text-sm text-gray-700">{t("confirmPreorderDesc")}</p>
        </div>

        {/* CONTENT */}
        <div className="px-6 py-4 space-y-4">
          {/* Customer Info */}
          <div className="space-y-1">
            <p className="text-gray-500">{t("customer")}: {user?.name || t("notUpdated")}</p>
            <p className="text-gray-500">email: {user?.email || "-"}</p>
          </div>

          {/* Color & Size Selection */}
          <div className="space-y-2">
            <p className="text-gray-900">{t("color")}</p>
            <div className="flex gap-2 flex-wrap">
              {colors.map(c => (
                <div
                  key={c._id}
                  onClick={() => setSelectedColor(c._id)}
                  className={`h-8 w-8 cursor-pointer border transition relative
                    ${selectedColor === c._id ? "border-black" : "border-gray-300"}`}
                  style={{ backgroundColor: c.code }}
                  title={c.name}
                />
              ))}
            </div>

            <p className="text-gray-900">{t("size")}</p>
            <div className="flex gap-2 flex-wrap">
              {sizesForColor.map(s => (
                <button
                  key={s._id}
                  onClick={() => setSelectedSize(s._id)}
                  className={`px-4 py-2 border text-sm font-semibold transition
                    ${selectedSize === s._id ? "bg-black text-white border-black" : "border-gray-300 hover:border-black"}`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity + Add */}
          <div className="space-y-2">
            <p className="text-gray-900">Quantity</p>
            <div className="flex gap-2 items-center mt-2">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={e => setQuantity(parseInt(e.target.value) || 1)}
                className="border px-3 py-1 w-20 text-center"
              />
              <button
                onClick={handleAddItem}
                className="px-4 py-1 bg-black text-white uppercase hover:bg-[#ffe6e6] hover:text-black transition"
              >
                {t("add")}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <p className="text-red-600 text-sm font-medium">{errorMessage}</p>
          )}

          {/* Selected Items Table */}
          {items.length > 0 && (
            <table className="w-full text-left text-sm border mt-4 border-gray-200">
              <thead className="bg-[#ffe6e6]">
                <tr>
                  <th className="px-2 py-1">{t("color")}</th>
                  <th className="px-2 py-1">{t("size")}</th>
                  <th className="px-2 py-1">{t("quantity")}</th>
                  <th className="px-2 py-1">{t("price")}</th>
                  <th className="px-2 py-1">{t("total")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {items.map(i => (
                  <tr key={i.key} className="hover:bg-gray-50 border">
                    <td className="px-2 py-1">{i.variant.color.name}</td>
                    <td className="px-2 py-1">{i.variant.size.name}</td>
                    <td className="px-2 py-1">{i.quantity}</td>
                    <td className="px-2 py-1">{formatPrice(i.variant.price)}</td>
                    <td className="px-2 py-1">{formatPrice(i.variant.price * i.quantity)}</td>
                    <td className="px-2 py-1">
                      <button
                        onClick={() => handleRemoveItem(i.key)}
                        className="text-red-500 hover:underline"
                      >
                        {t("remove")}
                      </button>
                    </td>
                  </tr>
                ))}
                <tr className="font-semibold border-t">
                  <td colSpan={4} className="text-right px-2 py-1">{t("total")}</td>
                  <td className="px-2 py-1">{formatPrice(total)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t bg-[#ffe6e6]/40">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 border border-black py-2 hover:bg-black hover:text-white transition"
          >
            {t("cancel")}
          </button>
          <button
            onClick={() => {
              if (!user?.email) {
                setErrorMessage(`* ${t("pleaseEnterEmail")}`);
                return;
              }
              if (items.length === 0) {
                // Kiểm tra nếu có chọn color + size nhưng chưa Add
                if (selectedColor && selectedSize) {
                  setErrorMessage(`* ${t("pleasePressAdd")}`);
                  return;
                }
                setErrorMessage(`* ${t("pleaseSelectColorSize")}`);
                return;
              }
              setErrorMessage("");
              onConfirm(items);
            }}
            disabled={loading}
            className="flex-1 bg-black py-2 text-white hover:bg-[#ffe6e6] hover:text-black transition"
          >
            {loading ? t("sending") : t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
