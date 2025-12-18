import { useTranslation } from "react-i18next";
import useCurrency from "../../hooks/useCurrency";

export default function ConfirmPreorderModal({
  user,
  product,
  variant,
  onClose,
  onConfirm,
  loading,
}) {
  const { t } = useTranslation();
  const { formatPrice } = useCurrency();

  if (!variant) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg bg-white shadow-xl overflow-hidden">
        
        {/* HEADER */}
        <div className="px-8 py-6 border-b">
          <h2 className="text-xl font-semibold uppercase tracking-wide">
            {t("confirmPreorder")}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {t("confirmPreorderDesc")}
          </p>
        </div>

        {/* CONTENT */}
        <div className="px-8 py-6 space-y-6 text-sm">
          
          {/* CUSTOMER */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              {t("customer")}
            </p>
            <div className="space-y-1">
              <p className="font-medium text-gray-900">
                {user?.name || t("notUpdated")}
              </p>
              <p className="text-gray-600">
                {user?.email || "-"}
              </p>
            </div>
          </div>

          {/* PRODUCT */}
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-500">
              {t("product")}
            </p>

            <div className=" space-y-2">
              <p className="font-medium text-gray-900">
                {product.name}
              </p>

              <div className="grid grid-cols-2 gap-y-1 text-gray-700">
                <p>{t("sku")}</p>
                <p className="text-right">{variant.sku}</p>

                <p>{t("color")}</p>
                <p className="text-right">{variant.color?.name}</p>

                <p>{t("size")}</p>
                <p className="text-right">{variant.size?.name}</p>

                <p className="font-medium  ">{t("price")}</p>
                <p className=" text-right font-semibold">
                  {formatPrice(variant.price)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex gap-3 px-8 py-6 border-t bg-[#ffe6e6]/40">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 border border-black py-2 text-sm font-medium hover:bg-black hover:text-white transition"
          >
            {t("cancel")}
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1  bg-black py-2 text-sm font-medium text-white hover:bg-[#ffe6e6] hover:text-black transition"
          >
            {loading ? t("sending") : t("confirm")}
          </button>
        </div>
      </div>
    </div>
  );
}
