// src/pages/ConfirmEmail.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import fetchClient from "../api/fetchClient";

export default function ConfirmEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Đang xác nhận...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setStatus("Không tìm thấy token!");
      setLoading(false);
      return;
    }

    fetchClient(`/users/confirm-email/${token}`)
      .then((res) => {
        setStatus(res.message || "Email đã được cập nhật thành công!");
        setTimeout(() => navigate("/profile"), 3000);
      })
      .catch((err) => {
        console.error("Confirm email error:", err);
        setStatus(err.error || "Liên kết không hợp lệ hoặc đã hết hạn");
      })
      .finally(() => setLoading(false));
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="bg-white shadow-lg p-10 max-w-md w-full text-center border">
        <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 flex items-center justify-center">
          {loading ? (
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 animate-spin"></div>
          ) : (
            <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          )}
        </div>
        <h1 className="text-2xl font-bold mb-4">Xác nhận Email</h1>
        <p className="text-lg text-gray-700 mb-6">{status}</p>
        {!loading && (
          <button
            onClick={() => navigate("/profile")}
            className="w-full py-3 bg-black text-white font-medium hover:bg-[#ffe6e6] hover:text-black transition-all"
          >
            Về trang cá nhân
          </button>
        )}
      </div>
    </div>
  );
}