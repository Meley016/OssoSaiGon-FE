import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AlertModal from "../components/common/AlertModal";
import { authService } from "../services/authService";

export default function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setModalMessage("Thiếu email, vui lòng quay lại bước trước!");
    if (!otp || !newPassword) return setModalMessage("Vui lòng nhập đầy đủ mã và mật khẩu mới!");

    setIsVerifying(true);
    try {
      const res = await authService.verifyForgotOtp(email, otp, newPassword);
      if (!res.success) throw res;
      setModalMessage("✅ Đổi mật khẩu thành công!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setModalMessage(err?.error || "Mã OTP không hợp lệ hoặc đã hết hạn!");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <AlertModal message={modalMessage} onClose={() => setModalMessage("")} />

      <div className="w-full max-w-sm text-center">
        <h2 className="font-bold text-xl mb-6">Xác nhận mã OTP</h2>

        <form onSubmit={handleSubmit}>
          <div className="text-left mb-4">
            <label className="block font-medium text-sm mb-1">Mã OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border-b border-black py-3 px-2 bg-white outline-none"
              placeholder="Nhập mã gồm 6 số"
              required
            />
          </div>

          <div className="text-left mb-6">
            <label className="block font-medium text-sm mb-1">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full border-b border-black py-3 px-2 bg-white outline-none"
              placeholder="Nhập mật khẩu mới"
              required
            />
          </div>

          <button
            disabled={isVerifying}
            className={`w-full bg-black text-white font-semibold py-3 transition ${
              isVerifying ? "opacity-60 cursor-not-allowed" : "hover:bg-main hover:text-black"
            }`}
          >
            {isVerifying ? "Đang xác nhận..." : "Xác nhận & đổi mật khẩu"}
          </button>
        </form>

        <p className="mt-4 text-sm">
          Quay lại{" "}
          <span
            className="text-sub cursor-pointer hover:underline"
            onClick={() => navigate("/forgot-password")}
          >
            trang quên mật khẩu
          </span>
        </p>
      </div>
    </div>
  );
}
