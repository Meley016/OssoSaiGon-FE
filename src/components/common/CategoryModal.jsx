import { AnimatePresence, motion as Motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CategoryModal({ open, onClose, mainCategoryId, brands = [] }) {
  const overlayRef = useRef();
  const [categories, setCategories] = useState([]);
  const API = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const isBrandMode = brands.length > 0;
  const isCategoryMode = !!mainCategoryId;

  // Fetch sub-categories nếu mainCategoryId có giá trị
  useEffect(() => {
    if (!open || !mainCategoryId) return;

    const fetchSubCategories = async () => {
      try {
        const res = await fetch(`${API}/api/categories`);
        const data = await res.json();
        if (Array.isArray(data)) {
          const filtered = data.filter((c) => {
            const mainId =
              typeof c.mainCategory === "object"
                ? c.mainCategory._id
                : c.mainCategory;
            return mainId === mainCategoryId;
          });
          setCategories(filtered);
        }
      } catch (err) {
        console.error("⚠️ Lỗi tải category:", err);
      }
    };

    fetchSubCategories();
  }, [open, mainCategoryId, API]);

  // Đóng khi click ngoài
  useEffect(() => {
    const handleClick = (e) => {
      if (overlayRef.current && overlayRef.current === e.target) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  // Đóng khi nhấn ESC
  useEffect(() => {
    const handleKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <AnimatePresence>
      {open && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          ref={overlayRef}
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center"
        >
          <Motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-black shadow-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-auto"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white">
                {isBrandMode ? "Brands" : "Danh mục"}
              </h2>
              <button
                onClick={onClose}
                className="text-white hover:text-[#ffe6e6]"
              >
                ✕
              </button>
            </div>

            {/* VIEW ALL */}
            {isBrandMode && (
              <button
                onClick={() => {
                  navigate("/category/brands");
                  onClose();
                }}
                className="w-full text-left mb-4 px-3 py-2 text-sm text-gray-300 hover:bg-[#ffe6e6] hover:text-black transition border-b border-gray-700"
              >
                Xem tất cả Brands
              </button>
            )}

            {isCategoryMode && (
              <button
                onClick={() => {
                  navigate(`/category/${mainCategoryId}`);
                  onClose();
                }}
                className="w-full text-left mb-4 px-3 py-2 text-sm text-gray-300 hover:bg-[#ffe6e6] hover:text-black transition border-b border-gray-700"
              >
                Xem tất cả
              </button>
            )}

            {/* LIST */}
            {isBrandMode ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {brands.map((b, i) => (
                  <div
                    key={i}
                    onClick={() => {
                      navigate(`/category/brands/${encodeURIComponent(b)}`);
                      onClose();
                    }}
                    className="cursor-pointer p-3 text-center hover:bg-[#ffe6e6] hover:text-black transition"
                  >
                    <p className="font-medium text-white hover:text-black">{b}</p>
                  </div>
                ))}
              </div>
            ) : categories.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Không có danh mục con</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    onClick={() => {
                      navigate(`/category/${cat._id}`);
                      onClose();
                    }}
                    className="cursor-pointer p-3 text-center hover:bg-[#ffe6e6] transition"
                  >
                    <p className="font-medium text-white hover:text-black">
                      {cat.name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
}

