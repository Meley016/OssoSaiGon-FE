import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function ContactUs() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const backend = import.meta.env.VITE_BACKEND_URL;

  const [categories, setCategories] = useState([]);

  // ===== FAQ STATE =====
  const [activeFaq, setActiveFaq] = useState("orders");
  const [openQuestion, setOpenQuestion] = useState(null);

  // ===== FAQ DATA (SETUP SẴN – SAU NÀY THAY API) =====
  const FAQS = {
    orders: [
      {
        q: "How do I place an order?",
        a: "",
      },
      {
        q: "Do you ship internationally?",
        a: "Yes. We currently ship to Vietnam, Malaysia, Thailand, Japan, and the United States.",
      },
      {
        q: "How can I track my order?",
        a: "",
      },
      {
        q: "Can I change or cancel my order?",
        a: "",
      },
      {
        q: "How long does shipping take?",
        a: "",
      },
    ],
    returns: [],
    sizing: [],
    payments: [],
    account: [],
    promotions: [],
    care: [],
  };

  // ===== HOT PICKS (API GIỮ NGUYÊN) =====
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${backend}/api/categories`);
        const data = await res.json();

        // random 4 categories
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setCategories(shuffled.slice(0, 4));
      } catch (err) {
        console.error("Fetch categories error:", err);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="w-full">
      {/* ================= CONTACT + FORM ================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[500px]">
        {/* LEFT */}
        <div className="p-10">
          <h2 className="uppercase text-sm font-semibold mb-4">
            {t("contact.title")}
          </h2>
          <p className="text-sm text-gray-600 mb-8">
            {t("contact.subtitle")}
          </p>

          <form className="space-y-6 max-w-md">
            <div className="grid grid-cols-2 gap-6">
              <input
                placeholder={t("contact.firstName")}
                className="border-b outline-none pb-2 text-sm"
              />
              <input
                placeholder={t("contact.lastName")}
                className="border-b outline-none pb-2 text-sm"
              />
            </div>

            <input
              placeholder={t("contact.email")}
              className="w-full border-b outline-none pb-2 text-sm"
            />

            <textarea
              placeholder={t("contact.message")}
              className="w-full border-b outline-none pb-2 text-sm resize-none"
              rows={4}
            />
          </form>
        </div>

        {/* RIGHT */}
        <div className="bg-pink-50 p-10 text-sm">
          <h3 className="uppercase font-semibold mb-4">
            {t("contact.infoTitle")}
          </h3>

          <div className="space-y-2">
            <p>{t("contact.emailText")}: ossosaigon@gmail.com</p>
            <p>{t("contact.phoneText")}: (+84) 78 634 5333</p>
            <p>
              449 Le Quang Dinh, Binh Loi Trung Ward,
              <br />
              Ho Chi Minh 70000, Vietnam
            </p>
          </div>

          <div className="flex gap-4 mt-6 text-lg">
            <i className="fab fa-facebook" />
            <i className="fab fa-instagram" />
            <i className="fab fa-tiktok" />
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        {/* LEFT FAQ MENU */}
        <div className="bg-pink-50 p-10">
          <h3 className="uppercase font-semibold mb-6 text-center">
            FAQs
          </h3>

          <ul className="space-y-3 text-sm text-center">
            {[
              { key: "orders", label: "orders & shipping" },
              { key: "returns", label: "exchanges & returns" },
              { key: "sizing", label: "products & sizing" },
              { key: "payments", label: "payments" },
              { key: "account", label: "account & support" },
              { key: "promotions", label: "promotions & giftcards" },
              { key: "care", label: "product care" },
            ].map((item) => (
              <li
                key={item.key}
                onClick={() => {
                  setActiveFaq(item.key);
                  setOpenQuestion(null);
                }}
                className={`cursor-pointer transition
                  ${
                    activeFaq === item.key
                      ? "text-black font-semibold"
                      : "text-gray-400"
                  }
                `}
              >
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT FAQ CONTENT */}
        <div className="p-10 text-sm">
          {(FAQS[activeFaq] || []).map((item, idx) => {
            const isOpen = openQuestion === idx;

            return (
              <div key={idx} className="border-b">
                <button
                  onClick={() =>
                    setOpenQuestion(isOpen ? null : idx)
                  }
                  className={`w-full py-4 flex justify-between items-center text-left
                    ${isOpen ? "text-pink-600" : ""}
                  `}
                >
                  {item.q}
                  <span>{isOpen ? "˄" : "˅"}</span>
                </button>

                {isOpen && item.a && (
                  <div className="bg-pink-50 p-4 text-gray-600">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= HOT PICKS ================= */}
      <section className="p-10">
        <div className="flex justify-between mb-6 text-sm uppercase">
          <span>{t("contact.hotPicks")}</span>
          <button
            onClick={() => navigate("/shop")}
            className="hover:underline"
          >
            {t("contact.backToShop")}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat._id}
              className="cursor-pointer"
              onClick={() =>
                navigate(`/category/${cat.slug || cat._id}`)
              }
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-[350px] object-cover"
              />
              <div className="mt-2 text-sm">
                <p className="uppercase font-medium">
                  {cat.name}
                </p>
                <span className="underline">
                  {t("contact.shopNow")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
