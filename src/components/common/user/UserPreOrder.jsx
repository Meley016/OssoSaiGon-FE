import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useAuth from "../../../hooks/useAuth";
import useCurrency from "../../../hooks/useCurrency";

export default function UserPreorders() {
  const { isAuthenticated, loading } = useAuth();
  const { t, i18n } = useTranslation();
  const { formatPrice } = useCurrency();

  const [preorders, setPreorders] = useState([]);
  const [selectedPreorder, setSelectedPreorder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const statusMap = {
    true: t("preorder_contacted"),
    false: t("preorder_pending"),
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchPreorders = async () => {
      try {
        const backend = import.meta.env.VITE_BACKEND_URL;
        const res = await axios.get(`${backend}/api/preorder/my`, { withCredentials: true });

        const data = res.data.map((p) => ({
          ...p,
          items: p.items.map((i) => ({
            ...i,
            colorName: i.color?.name || "-",
            sizeName: i.size?.name || "-",
            total: i.price * i.quantity,
          })),
          total: p.items.reduce((sum, i) => sum + (i.price * i.quantity || 0), 0),
        }));

        setPreorders(data);
      } catch (err) {
        console.error("Lỗi tải preorder:", err);
      } finally {
        setLoadingData(false);
      }
    };

    fetchPreorders();
  }, [isAuthenticated]);

  if (loading || loadingData) return <p>{t("preorder_loading")}...</p>;
  if (!isAuthenticated) return <p>{t("orders_login_required")}</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">{t("preorder_title")}</h2>

      {!preorders.length ? (
        <p>{t("preorder_empty")}</p>
      ) : (
        <ul className="space-y-3">
          {preorders.map((p) => (
            <li key={p._id} className="border p-3">
              <p><strong>{t("order_id")}:</strong> {p._id}</p>
              <p><strong>{t("preorder_date")}:</strong> {new Date(p.createdAt).toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US")}</p>
              <p><strong>{t("order_status")}:</strong> {statusMap[p.contacted]}</p>
              <p><strong>{t("order_total")}:</strong> {formatPrice(p.total)}</p>

              <button
                onClick={() => { setSelectedPreorder(p); setShowModal(true); }}
                className="mt-2 px-4 py-2 font-semibold"
                style={{ backgroundColor: "#000", color: "#fff", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.target.style.backgroundColor = "#ffe6e6"; e.target.style.color = "#000"; }}
                onMouseLeave={(e) => { e.target.style.backgroundColor = "#000"; e.target.style.color = "#fff"; }}
              >
                {t("view_order")}
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Modal chi tiết preorder */}
      {showModal && selectedPreorder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-auto">
          <div className="bg-white w-full max-w-4xl mt-10 p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">{t("preorder detail")}</h3>
              <button onClick={() => setShowModal(false)} className="text-xl font-bold px-2">×</button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <p><strong>{t("order_id")}:</strong> {selectedPreorder._id}</p>
              <p><strong>{t("preorder_date")}:</strong> {new Date(selectedPreorder.createdAt).toLocaleDateString(i18n.language === "vi" ? "vi-VN" : "en-US")}</p>
              <p><strong>{t("order_status")}:</strong> {statusMap[selectedPreorder.contacted]}</p>
              <p><strong>{t("order_total")}:</strong> {formatPrice(selectedPreorder.total)}</p>
            </div>

            <div className="mt-3">
              <h4 className="font-semibold mb-2">{t("order items")}</h4>
              <ul className="space-y-3">
                {selectedPreorder.items.map((item) => (
                  <li key={item.sku + item.colorName + item.sizeName} className="flex gap-4 border p-2">
                    <img src={item.image || "/placeholder.png"} alt={selectedPreorder.productId?.name} className="w-20 h-20 object-cover" />
                    <div className="flex-1 flex flex-col justify-between">
                      <p className="font-semibold">{selectedPreorder.productId?.name}</p>
                      <p className="text-sm text-gray-600">
                        {item.colorName} / {item.sizeName} - {item.quantity} × {formatPrice(item.price)}
                      </p>
                      <p className="text-sm text-gray-600">{formatPrice(item.total)}</p>
                      {item.images?.length > 1 && (
                        <div className="flex gap-1 mt-1 overflow-x-auto">
                          {item.images.map((img, idx) => (
                            <img key={idx} src={img} alt="variant" className="w-10 h-10 object-cover" />
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
