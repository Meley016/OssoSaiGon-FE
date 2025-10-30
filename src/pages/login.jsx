import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AlertModal from "../components/common/AlertModal";
import { authService } from "../services/authService";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await authService.login(form);
      if (!res.success) throw res;
      setModalMessage("Đăng nhập thành công 🎉");
      setTimeout(() => navigate(res.redirect || "/"), 1200);
    } catch (err) {
      setModalMessage(err?.error || "Sai tài khoản hoặc mật khẩu!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
      <AlertModal message={modalMessage} onClose={() => setModalMessage("")} />

      <div className="w-full max-w-sm text-center">
        <img
          src="https://res.cloudinary.com/dnyb9bbkr/image/upload/v1761727034/484065696_2519918064878637_3662425263367956365_n_vzizoq.jpg"
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

          <div className="text-left mb-6 relative">
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

          <button className="w-full bg-black text-white font-semibold py-3 hover:bg-main hover:text-black transition">
            Đăng nhập
          </button>
        </form>

        <p className="mt-4 text-sm">
          Chưa có tài khoản?{" "}
          <span
            className="text-sub cursor-pointer hover:underline"
            onClick={() => navigate("/register")}
          >
            Đăng ký ngay
          </span>
        </p>
      </div>
    </div>
  );
}
