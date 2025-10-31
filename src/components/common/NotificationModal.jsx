// components/common/NotificationModal.jsx
import { useEffect } from "react";

export default function NotificationModal({ open, type = "info", message, onClose, autoClose = 3000 }) {
  // 🔁 Tự động đóng modal sau vài giây (mặc định 3s)
  useEffect(() => {
    if (open && autoClose) {
      const timer = setTimeout(onClose, autoClose);
      return () => clearTimeout(timer);
    }
  }, [open, autoClose, onClose]);

  if (!open) return null;

  // 🎨 Màu sắc theo loại thông báo
  const colors = {
    success: "bg-green-100 text-green-800 border-green-400",
    error: "bg-red-100 text-red-800 border-red-400",
    warning: "bg-yellow-100 text-yellow-800 border-yellow-400",
    info: "bg-blue-100 text-blue-800 border-blue-400",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div
        className={`border ${colors[type]} px-6 py-4 rounded-md shadow-lg text-center max-w-xs w-full animate-fadeIn`}
      >
        <p className="font-semibold mb-2 text-lg">
          {type === "success"
            ? "✅ Thành công"
            : type === "error"
            ? "❌ Lỗi"
            : type === "warning"
            ? "⚠️ Cảnh báo"
            : "ℹ️ Thông báo"}
        </p>
        <p className="text-sm">{message}</p>

        <button
          onClick={onClose}
          className="mt-4 px-4 py-1.5 border border-gray-400 text-gray-700 hover:bg-gray-100 transition text-sm"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
