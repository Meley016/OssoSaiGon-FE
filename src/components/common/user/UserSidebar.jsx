export default function UserSidebar({ activeTab, setActiveTab }) {
  const menus = [
    { key: "info", label: "Thông tin cá nhân" },
    { key: "loyalty", label: "Điểm thưởng & Cấp bậc" },
    { key: "cart", label: "Giỏ hàng" },
    { key: "orders", label: "Đơn hàng" },
    { key: "logout", label: "Đăng xuất" },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-md">
      <div className="px-6 py-8 border-b text-xl font-semibold text-gray-700">
        Tài khoản của tôi
      </div>
      <ul className="flex flex-col">
        {menus.map((m) => (
          <li key={m.key}>
            <button
              onClick={() => setActiveTab(m.key)}
              className={`w-full text-left px-6 py-3 font-medium transition-all ${
                activeTab === m.key
                  ? "bg-gray-900 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {m.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
