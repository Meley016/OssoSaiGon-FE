import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UserLogout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const backend = import.meta.env.VITE_BACKEND_URL;
      await axios.post(`${backend}/api/auth/logout`, {}, { withCredentials: true });
      navigate("/login");
    } catch (err) {
      console.error("Lỗi đăng xuất:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h2 className="text-2xl font-semibold mb-4">Đăng xuất tài khoản</h2>
      <p className="text-gray-600 mb-6">Bạn có chắc chắn muốn đăng xuất?</p>
      <button
        onClick={handleLogout}
        className="bg-[#ffe6e6] text-black px-6 py-2  hover:bg-black hover:text-white"
      >
        Đăng xuất
      </button>
    </div>
  );
}
