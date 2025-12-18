import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { FaqContent, FaqMenu } from "../components/common/FaqSection";

export default function ContactUs() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const backend = import.meta.env.VITE_BACKEND_URL;
  const [activeFaq, setActiveFaq] = useState("orders");

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${backend}/api/categories`);
        const data = await res.json();
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        setCategories(shuffled.slice(0, 4));
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="w-full">
      {/* ================= CONTACT ================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 ">
        {/* LEFT */}
        <div className="p-10 h-[345px]">
          <h2 className=" text-sm lowercase font-semibold mb-4">
            {t("contact.title")}
          </h2>
          <p className="text-sm lowercase text-gray-600 mb-8">
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
          <div className="flex justify-start mt-8">
              <div className="flex items-start justify-start gap-8">
                <a
                  href="https://www.facebook.com/ososaigon"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-[24px]"
                >
                  <img
                    src="/icons/Facebook.png"
                    alt="Facebook"
                    className="h-full w-auto hover:opacity-80 transition"
                  />
                </a>

                <a
                  href="https://www.instagram.com/oso.saigon2019/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-[24px]"
                >
                  <img
                    src="/icons/Instagram.png"
                    alt="Instagram"
                    className="h-full w-auto hover:opacity-80 transition"
                  />
                </a>

                <a
                  href="https://www.tiktok.com/@ososneaker?is_from_webapp=1&sender_device=pc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-[24px]"
                >
                  <img
                    src="/icons/Tiktok.png"
                    alt="TikTok"
                    className="h-full w-auto hover:opacity-80 transition"
                  />
                </a>
              </div>
            </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section className="grid grid-cols-1 md:grid-cols-2">
        <div className="bg-pink-50 p-10">
          <FaqMenu
            active={activeFaq}
            onChange={setActiveFaq}
          />
        </div>

        <div className="p-10">
          <FaqContent category={activeFaq} />
        </div>
      </section>



      {/* ================= HOT PICKS ================= */}
      <section className="p-10">
        <div className="flex justify-between mb-6 text-sm uppercase">
          <span>{t("contact.hotPicks")}</span>
          <button
            onClick={() => navigate("/")}
            className="hover:underline"
          >
            {t("contact.backToShop")}
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat._id}
              onClick={() =>
                navigate(`/category/${cat.slug || cat._id}`)
              }
              className="cursor-pointer"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-[350px] object-cover"
              />
              <div className="mt-2 text-sm">
                <p className="uppercase font-medium">{cat.name}</p>
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
