// src/pages/ConfirmPassword.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import fetchClient from "../api/fetchClient";

export default function ConfirmPassword() {
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

    fetchClient(`/users/confirm-password/${token}`)
      .then((res) => {
        setStatus(res.message || "Mật khẩu đã được thay đổi thành công!");
        setTimeout(() => navigate("/login"), 3000);
      })
      .catch((err) => {
        console.error("Confirm password error:", err);
        setStatus(err.error || "Liên kết không hợp lệ hoặc đã hết hạn");
      })
      .finally(() => setLoading(false));
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <div className="bg-white shadow-lg p-10 max-w-md w-full text-center border">
        <div className="w-20 h-20 mx-auto mb-6 bg-green-100 flex items-center justify-center">
          {loading ? (
            <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 animate-spin"></div>
          ) : (
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          )}
        </div>
        <h1 className="text-2xl font-bold mb-4">Xác nhận Mật khẩu</h1>
        <p className="text-lg text-gray-700 mb-6">{status}</p>
        {!loading && (
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3 bg-black text-white font-medium hover:bg-[#ffe6e6] hover:text-black transition-all"
          >
            Đăng nhập lại
          </button>
        )}
      </div>
    </div>
  );
}