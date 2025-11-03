import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import AlertModal from "../components/common/AlertModal";
import { authService } from "../services/authService";

export default function Register() {
  const navigate = useNavigate();
  const [logoUrl, setLogoUrl] = useState("../../assets/LOGO.png");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword)
      return setModalMessage("Mật khẩu xác nhận không khớp!");

    try {
      await authService.register(form);
      setModalMessage("Đăng ký thành công");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setModalMessage(err?.error || "Lỗi đăng ký!");
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

        <h2 className="font-bold text-xl mb-6">Đăng ký</h2>

        <form onSubmit={handleSubmit}>
          {[
            { name: "name", label: "Họ và tên", type: "text", placeholder: "Nguyễn Văn A" },
            { name: "email", label: "Email", type: "email", placeholder: "example@gmail.com" }
          ].map((i, idx) => (
            <div key={idx} className="text-left mb-4">
              <label className="block font-medium text-sm mb-1">{i.label}</label>
              <input
                className="w-full border-b border-black py-3 px-2 bg-white outline-none"
                required
                name={i.name}
                type={i.type}
                placeholder={i.placeholder}
                onChange={(e) => setForm({ ...form, [i.name]: e.target.value })}
              />
            </div>
          ))}

          <div className="text-left mb-4 relative">
            <label className="block font-medium text-sm mb-1">Mật khẩu</label>
            <input
              className="w-full border-b border-black py-3 px-2 bg-white outline-none"
              required
              name="password"
              type={showPw ? "text" : "password"}
              placeholder="••••••"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <div
              className="absolute right-2 bottom-3 cursor-pointer text-gray-600 hover:text-black transition"
              onClick={() => setShowPw(!showPw)}
            >
              {showPw ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          <div className="text-left mb-6 relative">
            <label className="block font-medium text-sm mb-1">
              Nhập lại mật khẩu
            </label>
            <input
              className="w-full border-b border-black py-3 px-2 bg-white outline-none"
              required
              name="confirmPassword"
              type={showPw2 ? "text" : "password"}
              placeholder="••••••"
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />
            <div
              className="absolute right-2 bottom-3 cursor-pointer text-gray-600 hover:text-black transition"
              onClick={() => setShowPw2(!showPw2)}
            >
              {showPw2 ? <FaEyeSlash /> : <FaEye />}
            </div>
          </div>

          <button className="w-full bg-black text-white font-semibold py-3 hover:bg-main hover:text-black transition">
            Đăng ký
          </button>
        </form>

        <p className="mt-4 text-sm">
          Đã có tài khoản?{" "}
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