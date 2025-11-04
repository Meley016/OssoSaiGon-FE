import { useTranslation } from "react-i18next";

export default function UserSidebar({ activeTab, setActiveTab }) {
  const { t } = useTranslation();

  const menus = [
    { key: "info", label: t("sidebar_info") },
    { key: "loyalty", label: t("sidebar_loyalty") },
    { key: "cart", label: t("sidebar_cart") },
    { key: "orders", label: t("sidebar_orders") },
    { key: "logout", label: t("sidebar_logout") },
    { key: "settings", label: t("sidebar_settings") }
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 shadow-md">
      <div className="px-6 py-8 border-b text-xl font-semibold text-gray-700">
        {t("sidebar_account")}
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
