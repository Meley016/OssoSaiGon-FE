import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { setAccessToken } from "../api/axiosClient";
import AlertModal from "../components/common/AlertModal";
import { authService } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [logoUrl, setLogoUrl] = useState("../../assets/LOGO.png");
  const location = useLocation();
  const from = location.state?.from || "/";
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await authService.login(form);

      // 🔴 BẮT BUỘC CHECK TRƯỚC
      if (!res?.success || !res?.accessToken) {
        throw res;
      }

      // ✅ SET TOKEN SAU KHI LOGIN OK
      setAccessToken(res.accessToken);

      // ✅ BÁO TOÀN APP AUTH ĐÃ SẴN SÀNG
      window.dispatchEvent(new Event("auth-refreshed"));

      setModalMessage("Đăng nhập thành công");
      setTimeout(() => navigate(from, { replace: true }), 1200);
    } catch (err) {
      setModalMessage(err?.error || "Sai tài khoản hoặc mật khẩu!");
    }
  };

  // LẤY LOGO TỪ BACKEND
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

        <h2 className="font-bold text-xl mb-6">Đăng nhập</h2>

        <form onSubmit={handleSubmit}>
          <div className="text-left mb-4">
            <label className="block font-medium text-sm mb-1">Email</label>
            <input
              className="w-full border-b border-black py-3 px-2 bg-white outline-none"
              placeholder="example@gmail.com"
              required
              type="email"
              name="email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="text-left mb-2 relative">
            <label className="block font-medium text-sm mb-1">Mật khẩu</label>
            <input
              className="w-full border-b border-black py-3 px-2 bg-white outline-none"
              placeholder="••••••"
              required
              type={showPw ? "text" : "password"}
              name="password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <div
              className="absolute right-2 bottom-3 cursor-pointer text-gray-600 hover:text-black transition"
              onClick={() => setShowPw(!showPw)}
            >
              {showPw ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>
          <div className="text-right pb-2">
            <Link
              className=" text-sm  text-sub hover:underline"
              to="/forgot-password"
            >
              Quên mật khẩu?
            </Link>
          </div>
          <button className="w-full bg-black text-white font-semibold py-3 hover:bg-main hover:text-black transition">
            Đăng nhập
          </button>
        </form>

        <div className="mt-4 text-sm">
          Chưa có tài khoản?{" "}
          <Link
            className="text-sub cursor-pointer hover:underline"
            to="/register"
          >
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
