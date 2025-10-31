import axios from "axios";
import { useEffect, useState } from "react";
import AlertModal from "../../components/common/AlertModal.jsx";


export default function ProductReviews({ productId }) {
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [showModal, setShowModal] = useState(false);

  // ⚡ Alert modal state
  const [alert, setAlert] = useState({
    isOpen: false,
    type: "info",
    message: "",
  });

  const openAlert = (type, message) => {
    setAlert({ isOpen: true, type, message });
  };

  const closeAlert = () => {
    setAlert({ ...alert, isOpen: false });
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/reviews/${productId}`);
      const data = await res.json();
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Lỗi lấy đánh giá:", err);
      openAlert("error", "Không thể tải đánh giá sản phẩm!");
    }
  };

  const handleSubmit = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/reviews/${productId}`,
        { rating, comment },
        { withCredentials: true }
      );

      if (!res.data.success) {
        return openAlert("error", res.data.message || "Gửi đánh giá thất bại!");
      }

      setComment("");
      await fetchReviews();
      openAlert("success", "Cảm ơn bạn đã gửi đánh giá!");
    } catch (err) {
      if (err.response?.status === 401)
        return openAlert("warning", "Vui lòng đăng nhập để gửi đánh giá!");
      console.error("❌ Gửi đánh giá lỗi:", err);
      openAlert("error", "Không thể kết nối đến máy chủ!");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const visibleReviews = reviews.slice(0, 4);

  return (
    <div className="mt-14">
      <h2 className="text-lg font-semibold mb-3">Đánh giá sản phẩm</h2>

      {avgRating && (
        <p className="text-yellow-600 font-medium mb-3">
          ⭐ {avgRating} / 5 ({reviews.length} đánh giá)
        </p>
      )}

      {/* Form nhập đánh giá */}
      <div className="border p-4 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span>Số sao:</span>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="border px-2 py-1"
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} ⭐
              </option>
            ))}
          </select>
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Nhận xét của bạn..."
          className="border p-2 w-full focus:ring focus:ring-gray-300"
          rows="3"
        />

        <button
          onClick={handleSubmit}
          className="mt-3 bg-black text-white px-4 py-2 w-full hover:bg-gray-800"
        >
          Gửi đánh giá
        </button>
      </div>

      {/* Danh sách đánh giá */}
      <div className="flex flex-col gap-3">
        {reviews.length === 0 && (
          <p className="text-gray-500 text-sm">Chưa có đánh giá nào.</p>
        )}

        {visibleReviews.map((r, i) => (
          <div key={i} className="border p-3 bg-gray-50">
            <p className="font-medium">
              ⭐ {r.rating} - {r.user?.name || "Ẩn danh"}
            </p>
            <p className="text-sm text-gray-700 mt-1">
              {r.comment || "Không có nội dung"}
            </p>
          </div>
        ))}

        {reviews.length > 4 && (
          <button
            onClick={() => setShowModal(true)}
            className="mt-2 text-blue-600 text-sm hover:underline self-center"
          >
            Xem thêm ({reviews.length - 4} đánh giá)
          </button>
        )}
      </div>

      {/* Modal xem thêm */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white w-[80%] max-h-[90vh] overflow-y-auto p-6 relative shadow-lg">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-black text-xl"
            >
              ✕
            </button>

            <h3 className="text-xl font-semibold mb-4 text-center">
              Tất cả đánh giá ({reviews.length})
            </h3>

            <div className="flex flex-col gap-3">
              {reviews.map((r, i) => (
                <div key={i} className="border p-3 bg-gray-50">
                  <p className="font-medium">
                    ⭐ {r.rating} - {r.user?.name || "Ẩn danh"}
                  </p>
                  <p className="text-sm text-gray-700 mt-1">
                    {r.comment || "Không có nội dung"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 🔔 Modal thông báo */}
    <AlertModal message={alert.isOpen ? alert.message : ""} onClose={closeAlert} />

    </div>
  );
}
