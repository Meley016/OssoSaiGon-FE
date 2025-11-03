// src/components/UserInfo.jsx
import { useState } from "react";
import fetchClient from "../../../api/fetchClient"; // ← ĐÚNG ĐƯỜNG DẪN
import useAuth from "../../../hooks/useAuth";

export default function UserInfo() {
  const { user, loading, isAuthenticated, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);

  if (loading) return <p className="text-center py-10">Đang tải...</p>;
  if (!isAuthenticated) return <p className="text-center py-10 text-red-600">Vui lòng đăng nhập.</p>;

  const handleEdit = () => {
    setForm({
      name: user.name || "",
      email: user.email || "",
      address: user.address || "",
      birthday: user.birthday ? user.birthday.split("T")[0] : "",
    });
    setAvatarPreview(user.avatar);
    setEditing(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      setForm((prev) => ({ ...prev, avatar: file }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();

      if (form.name !== user.name) formData.append("name", form.name);
      if (form.email !== user.email) formData.append("email", form.email);
      if (form.address !== user.address) formData.append("address", form.address);
      if (form.birthday !== (user.birthday?.split("T")[0] || ""))
        formData.append("birthday", form.birthday);
      if (form.password) formData.append("password", form.password);
      if (form.avatar instanceof File) formData.append("avatar", form.avatar);
      if (form.avatar === null) formData.append("avatar", "");

      const res = await fetchClient("/users/me", {
        method: "PUT",
        body: formData,
      });

      alert(res.message);
      if (res.message.includes("email") || res.message.includes("mật khẩu")) {
        alert("Kiểm tra email để xác nhận thay đổi!");
      }
      refreshUser?.();
      setEditing(false);
    } catch (err) {
      alert(err.error || "Lỗi cập nhật thông tin");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white w-full shadow-lg p-8  mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Thông tin cá nhân</h2>

      <div className="flex justify-center mb-6">
        <div className="relative">
          <img
            src={avatarPreview || user.avatar || "/default-avatar.png"}
            alt="Avatar"
            className="w-28 h-28  object-cover border-4 border-gray-200"
          />
          {editing && (
            <label className="absolute bottom-0 right-0 p-2  cursor-pointer bg-black text-white hover:bg-[#ffe6e6] hover:text-black">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>
      </div>

      {!editing ? (
        <div className="space-y-3 text-gray-700">
          <p><strong>Họ tên:</strong> {user.name || "Chưa có"}</p>
          <p><strong>Email:</strong> {user.email}</p>
          {user.address && <p><strong>Địa chỉ:</strong> {user.address}</p>}
          {user.birthday && (
            <p><strong>Ngày sinh:</strong> {new Date(user.birthday).toLocaleDateString("vi-VN")}</p>
          )}
          <button
            onClick={handleEdit}
            className="w-full mt-6 py-3 bg-black text-white hover:bg-[#ffe6e6] hover:text-black font-medium"
          >
            Sửa thông tin
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Họ tên"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full border  p-3 focus:ring-2 focus:ring-[#ffe6e6]"
          />
          <input
            type="email"
            placeholder="Email mới"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full border  p-3 focus:ring-2 focus:ring-[#ffe6e6]"
          />
          <input
            type="text"
            placeholder="Địa chỉ"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full border  p-3"
          />
          <input
            type="date"
            value={form.birthday}
            onChange={(e) => setForm({ ...form, birthday: e.target.value })}
            className="w-full border  p-3"
          />
          <input
            type="password"
            placeholder="Mật khẩu mới (để trống nếu không đổi)"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full border  p-3"
          />

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 py-3 bg-black text-white hover:bg-[#ffe6e6] hover:text-black disabled:opacity-50"
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 py-3 bg-gray-400 text-white hover:bg-gray-500"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}