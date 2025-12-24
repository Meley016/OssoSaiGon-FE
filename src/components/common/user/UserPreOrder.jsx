import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useAuth from "../../../hooks/useAuth";
import AlertModal from "../../common/AlertModal";

export default function UserPreorders() {
  const { isAuthenticated, loading } = useAuth();
  const { t, i18n } = useTranslation();

  const [preorders, setPreorders] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // modal
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchPreorders = async () => {
      try {
        const backend = import.meta.env.VITE_BACKEND_URL;
        const res = await axios.get(`${backend}/api/preorder/my`, {
          withCredentials: true,
        });
        setPreorders(res.data || []);
      } catch (err) {
        console.error("Lỗi tải preorder:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchPreorders();
  }, [isAuthenticated]);

  const handlePreorderClick = (p) => {
    const msg = p.contacted
      ? t("preorder_tooltip_contacted")
      : t("preorder_tooltip_pending");

    setAlertMessage(msg);
  };

  if (loading || loadingData) return <p>{t("preorder_loading")}...</p>;
  if (!isAuthenticated) return <p>{t("orders_login_required")}</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">
        {t("preorder_title")}
      </h2>

      {!preorders.length ? (
        <p>{t("preorder_empty")}</p>
      ) : (
        <ul className="space-y-4">
          {preorders.map((p) => (
            <li
              key={p._id}
              onClick={() => handlePreorderClick(p)}
              className="
                group cursor-pointer
                border border-gray-200 bg-white shadow-sm
                hover:border-black hover:shadow-md
                transition
              "
            >
              {/* ===== MAIN CONTENT ===== */}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-lg">
                      {p.productId?.name || t("product_deleted")}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t("preorder_date")}:{" "}
                      {new Date(p.createdAt).toLocaleDateString(
                        i18n.language === "vi" ? "vi-VN" : "en-US"
                      )}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center whitespace-nowrap
                      px-3 py-1 text-xs font-semibold border
                      ${
                        p.contacted
                          ? "bg-[#ffe6e6] text-black"
                          : "bg-black text-[#ffeeee]"
                      }`}
                  >
                    {p.contacted
                      ? t("preorder_contacted")
                      : t("preorder_pending")}
                  </span>
                </div>

                {/* IMAGE */}
                {p.productId?.images?.length > 0 && (
                  <img
                    src={p.productId.images[0]}
                    alt={p.productId.name}
                    className="mt-4 w-24 h-24 object-cover border"
                  />
                )}
              </div>

              {/* ===== HOVER EXPAND AREA (ĐẨY XUỐNG) ===== */}
              <div
                className="
                  overflow-hidden
                  max-h-0 opacity-0
                  group-hover:max-h-40 group-hover:opacity-100
                  transition-[max-height,opacity] duration-300 ease-out
                "
              >
                <div className="px-4 pb-4">
                  <div className="border-t pt-3 uppercase text-gray-700">
                    {p.contacted
                      ? t("preorder_tooltip_contacted")
                      : t("preorder_tooltip_pending")}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* ALERT MODAL (CLICK) */}
      <AlertModal
        message={alertMessage}
        type="info"
        onClose={() => setAlertMessage("")}
      />
    </div>
  );
}
