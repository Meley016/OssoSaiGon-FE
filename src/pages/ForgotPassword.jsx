import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertModal from "../components/common/AlertModal";
import { authService } from "../services/authService";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [logoUrl, setLogoUrl] = useState("../../assets/LOGO.png");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      const res = await authService.forgotPassword(email);
      if (!res.success) throw res;
      setModalMessage("✅ Mã xác nhận đã được gửi đến email của bạn!");
      setTimeout(() => navigate("/verify-code", { state: { email } }), 1500);
    } catch (err) {
      setModalMessage(err?.error || "Không thể gửi mã xác nhận!");
    } finally {
      setIsSending(false);
    }
  };
  useEffect(() => {
      const fetchLogo = async () => {
        try {
          const backend = import.meta.env.VITE_BACKEND_URL;
          const res = await fetch(`${backend}/api/banners/active?type=logo`);
          if (!res.ok) throw new Error("Không thể tải logo!");
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0 && data[0].image) {
            setLogoUrl(data[0].image);
          }
        } catch (err) {
          console.warn("Lỗi tải logo:", err.message);
        }
      };
      fetchLogo();
    }, []);
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <AlertModal message={modalMessage} onClose={() => setModalMessage("")} />

      <div className="w-full max-w-sm text-center">
        <img
          src={logoUrl}
          alt="Logo"
          className="w-[150px] h-auto mx-auto mb-6"
        />

        <h2 className="font-bold text-xl mb-6">Quên mật khẩu</h2>

        <form onSubmit={handleSubmit}>
          <div className="text-left mb-6">
            <label className="block font-medium text-sm mb-1">Email</label>
            <input
              className="w-full border-b border-black py-3 px-2 bg-white outline-none"
              placeholder="example@gmail.com"
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            disabled={isSending}
            className={`w-full bg-black text-white font-semibold py-3 transition ${
              isSending ? "opacity-60 cursor-not-allowed" : "hover:bg-main hover:text-black"
            }`}
          >
            {isSending ? "Đang gửi..." : "Gửi mã xác nhận"}
          </button>
        </form>

        <p className="mt-4 text-sm">
          Đã nhớ mật khẩu?{" "}
          <span
            className="text-sub cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Đăng nhập ngay
          </span>
        </p>
      </div>
    </div>
  );
}
