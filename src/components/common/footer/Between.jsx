import { ChevronDown, ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import CategoryModal from "../CategoryModal";

export default function Between() {
  const [mainCategories, setMainCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedMain, setSelectedMain] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null); // ✅ brand chọn
  const [openSections, setOpenSections] = useState({
    shop: false,
    help: false,
    info: false,
  });
  const { t } = useTranslation();
  const navigate = useNavigate();
  const API = import.meta.env.VITE_BACKEND_URL;

  // 🧩 fetch main categories
  useEffect(() => {
    const fetchMainCategories = async () => {
      try {
        const res = await fetch(`${API}/api/main-categories`);
        const data = await res.json();
        if (Array.isArray(data)) setMainCategories(data.reverse());
      } catch (err) {
        console.error("⚠️ Lỗi tải main categories:", err);
      }
    };
    fetchMainCategories();
  }, [API]);

  // 🧩 fetch brands
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await fetch(`${API}/api/products?limit=200`);
        const json = await res.json();
        const items = json?.data || [];
        const uniqueBrands = [...new Set(items.map((p) => p.brand).filter(Boolean))];
        setBrands(uniqueBrands);
      } catch (err) {
        console.error("⚠️ Lỗi tải brands:", err);
      }
    };
    fetchBrands();
  }, [API]);

  const staticColumns = [
    {
      key: "info",
      title: t("footer.info"),
      links: [
        { text: t("footer.about_us"), path: "/about" },
        { text: t("footer.contact_us"), path: "/contact" },
        { text: t("footer.faqs"), path: "/faqs" },
        { text: t("footer.care_instructions"), path: "/care" },
        { text: t("footer.size_charts"), path: "/sizes" },
      ],
    },
  ];

  const helpLinks = [
    { text: t("footer.returns_exchanges"), path: "/returns" },
    { text: t("footer.terms_conditions"), path: "/terms" },
    { text: t("footer.privacy_policy"), path: "/privacy" },
    { text: t("footer.shipping"), path: "/shipping" },
  ];

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      <div className="flex flex-col md:flex-row gap-12 text-white max-w-full pb-12 mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 flex-1">
          {/* LEFT SIDE: SHOP + INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 flex-1">

            {/* SHOP */}
            <div className="api-text">
              <div
                className="flex items-center justify-between cursor-pointer md:cursor-default mb-3"
                onClick={() => toggleSection("shop")}
              >
                <h3 className="hardcode-text font-semibold">{t("footer.shop")}</h3>
                <span className="md:hidden">
                  {openSections.shop ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
              </div>

              <ul
                className={`space-y-1 text-sm text-gray-300 transition-all duration-300 overflow-hidden 
                  ${openSections.shop ? "max-h-60" : "max-h-0 md:max-h-none"} md:block`}
              >
              {/* Divider for brands */}
                {brands.length > 0 && (
                  <>
                    <li
                      onClick={() => setSelectedBrand(true)} 
                      className="mt-2 text-gray-300 font-semibold cursor-pointer hover:text-gray-100"
                    >
                      {t("brands")}
                    </li>
                  </>
                )}
                {/* Main Categories */}
                {mainCategories.length > 0 ? (
                  mainCategories.map((cat) => (
                    <li
                      key={cat._id}
                      onClick={() => setSelectedMain(cat._id)}
                      className="cursor-pointer hover:text-gray-100"
                    >
                      {cat.name}
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 italic">Loading...</li>
                )}

              </ul>
            </div>

            {/* INFO */}
            {staticColumns.map((col) => (
              <div key={col.key} className="api-text ">
                <div
                  className="flex items-center  justify-between cursor-pointer md:cursor-default mb-3"
                  onClick={() => toggleSection(col.key)}
                >
                  <h3 className="hardcode-text font-semibold">{col.title}</h3>
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
                      className="cursor-pointer hover:text-gray-100 "
                    >
                      {link.text}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {/* STORE INFO */}
          <div className="">
            <div
              className="flex items-center justify-between cursor-pointer md:cursor-default mb-3"
              onClick={() => toggleSection("store")}
            >
              <h3 className="hardcode-text font-semibold">{t("store.name")}</h3>
              <span className="md:hidden">
                {openSections.store ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </span>
            </div>

            <ul
              className={`space-y-1 text-sm text-gray-300 transition-all duration-300 overflow-hidden 
                ${openSections.store ? "max-h-60" : "max-h-0 md:max-h-none"} md:block`}
            >
            
              <li>{t("store.taxId")}</li>
              <li className="api-text">{t("store.phone")}</li>
              <li className="api-text">{t("store.email")}</li>
              <li className="max-w-[200px]">{t("store.address")}</li>
            </ul>
          </div>

          {/* RIGHT SIDE: NEWSLETTER */}
          <div className="w-full api-text item">
            <h3 className="hardcode-text font-semibold mb-3">{t("footer.newsletter")}</h3>
            <p className="text-sm text-gray-400 mb-3">
              {t("footer.newsletter_text")}
            </p>
            <div className="flex items-center border-b border-gray-400 pb-1">
              <input
                type="email"
                placeholder="email"
                className="bg-transparent outline-none flex-1 text-sm text-gray-300"
              />
              <button className="text-sm api-text underline hover:text-gray-100">
                {t("footer.submit")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* HELP SECTION */}
      <div className="flex flex-wrap justify-start gap-6 text-sm api-text text-gray-300 border-gray-700 pt-6">
        {helpLinks.map((link, i) => (
          <span
            key={i}
            onClick={() => navigate(link.path)}
            className="cursor-pointer hover:text-white transition-colors"
          >
            {link.text}
          </span>
        ))}
      </div>

      {/* Modal hiển thị main category hoặc brand */}
      <CategoryModal
        open={!!selectedMain || !!selectedBrand}
        onClose={() => {
          setSelectedMain(null);
          setSelectedBrand(null);
        }}
        mainCategoryId={selectedMain}
        brands={selectedBrand ? brands : []}
      />
    </>
  );
}
