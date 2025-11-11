import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import CategoryModal from "../CategoryModal";

export default function Between() {
  const [mainCategories, setMainCategories] = useState([]);
  const [selectedMain, setSelectedMain] = useState(null);
  const [openSections, setOpenSections] = useState({
    shop: false,
    help: false,
    info: false,
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchMainCategories = async () => {
      try {
        const res = await fetch(`${API}/api/main-categories`);
        const data = await res.json();
        if (Array.isArray(data)) setMainCategories(data);
      } catch (err) {
        console.error("⚠️ Lỗi tải main categories:", err);
      }
    };
    fetchMainCategories();
  }, [API]);

  const staticColumns = [
    {
      key: "help",
      title: t("footer.help"),
      links: [
        { text: t("footer.contact_us"), path: "/contact" },
        { text: t("footer.order_tracking"), path: "/orders" },
        { text: t("footer.shipping"), path: "/shipping" },
        { text: t("footer.returns_exchanges"), path: "/returns" },
        { text: t("footer.terms_conditions"), path: "/terms" },
        { text: t("footer.privacy_policy"), path: "/privacy" },
      ],
    },
    {
      key: "info",
      title: t("footer.info"),
      links: [
        { text: t("footer.about_us"), path: "/about" },
        { text: t("footer.faqs"), path: "/faqs" },
        { text: t("footer.care_instructions"), path: "/care" },
        { text: t("footer.size_charts"), path: "/sizes" },
      ],
    },
  ];

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-12 text-white max-w-full pb-20 mx-auto font-jost">
        {/* LEFT SIDE: SHOP + HELP + INFO */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 flex-1">
          {/* SHOP */}
          <div>
            <div
              className="flex items-center justify-between cursor-pointer md:cursor-default mb-3"
              onClick={() => toggleSection("shop")}
            >
              <h3 className="font-semibold">{t("footer.shop")}</h3>
              <span className="md:hidden">
                {openSections.shop ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </span>
            </div>

            <ul
              className={`space-y-1 text-sm text-gray-300 transition-all duration-300 overflow-hidden 
                ${openSections.shop ? "max-h-60" : "max-h-0 md:max-h-none"} md:block`}
            >
              {mainCategories.length > 0 ? (
                mainCategories.map((cat) => (
                  <li
                    key={cat._id}
                    onClick={() => setSelectedMain(cat._id)}
                    className="cursor-pointer hover:text-gray-100 capitalize"
                  >
                    {cat.name}
                  </li>
                ))
              ) : (
                <li className="text-gray-500 italic">Loading...</li>
              )}
            </ul>
          </div>

          {/* HELP + INFO */}
          {staticColumns.map((col) => (
            <div key={col.key}>
              <div
                className="flex items-center justify-between cursor-pointer md:cursor-default mb-3"
                onClick={() => toggleSection(col.key)}
              >
                <h3 className="font-semibold">{col.title}</h3>
                <span className="md:hidden">
                  {openSections[col.key] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </div>

              <ul
                className={`space-y-1 text-sm text-gray-300 transition-all duration-300 overflow-hidden 
                  ${openSections[col.key] ? "max-h-60" : "max-h-0 md:max-h-none"} md:block`}
              >
                {col.links.map((link, j) => (
                  <li
                    key={j}
                    onClick={() => navigate(link.path)}
                    className="cursor-pointer hover:text-gray-100 capitalize"
                  >
                    {link.text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* RIGHT SIDE: NEWSLETTER */}
        <div className="w-full md:w-1/3">
          <h3 className="font-semibold mb-3">{t("footer.newsletter")}</h3>
          <p className="text-sm text-gray-400 mb-3">{t("footer.newsletter_text")}</p>
          <div className="flex items-center border-b border-gray-400 pb-1">
            <input
              type="email"
              placeholder="email"
              className="bg-transparent outline-none flex-1 text-sm text-gray-300"
            />
            <button className="text-sm underline hover:text-gray-100">
              {t("footer.submit")}
            </button>
          </div>
        </div>
      </div>

      {/* Modal hiển thị category con */}
      <CategoryModal
        open={!!selectedMain}
        onClose={() => setSelectedMain(null)}
        mainCategoryId={selectedMain}
      />
    </>
  );
}
