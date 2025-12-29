import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function AboutUs() {
  const { t } = useTranslation();
  const [logoUrl, setLogoUrl] = useState("../../../assets/LOGO.png");

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const backend = import.meta.env.VITE_BACKEND_URL;
        const res = await fetch(`${backend}/api/banners/active?type=logo`);
        const data = await res.json();
        if (Array.isArray(data) && data[0]?.image) {
          setLogoUrl(data[0].image);
        }
      } catch (err) {
        console.warn("Lỗi tải logo:", err.message);
      }
    };
    fetchLogo();
  }, []);

  return (
    <div className="bg-white">

      {/* ===== LOGO ===== */}
      <div className="flex justify-center py-10 sm:py-14">
        <img
          src={logoUrl}
          alt="Logo"
          className="
            w-[65%] sm:w-[45%] md:w-[30%]
            h-auto
            cursor-pointer
          "
        />
      </div>

      {/* ===== GRID CONTENT ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2">

        {/* TEXT 1 */}
        <div className="bg-[#f7dfe7] flex items-center justify-center px-6 py-14 sm:p-10">
          <div className="max-w-md text-center space-y-4">
            <h3 className="text-xs sm:text-sm tracking-widest font-semibold uppercase">
              {t("about.globalTitle")}
            </h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              {t("about.globalDesc")}
            </p>
          </div>
        </div>

        {/* IMAGE 1 */}
        <div className="h-[260px] sm:h-[350px] md:h-[400px]">
          <img
            src="/icons/about-1.png"
            alt="about-1"
            className="w-full h-full object-cover"
          />
        </div>

        {/* IMAGE 2 */}
        <div className="h-[260px] sm:h-[350px] md:h-[400px]">
          <img
            src="/icons/about-2.png"
            alt="about-2"
            className="w-full h-full object-cover"
          />
        </div>

        {/* TEXT 2 */}
        <div className="bg-[#f7dfe7] flex items-center justify-center px-6 py-14 sm:p-10">
          <div className="max-w-md text-center space-y-4">
            <h3 className="text-xs sm:text-sm tracking-widest font-semibold uppercase">
              {t("about.confidenceTitle")} 
            </h3>
            <p className="text-sm sm:text-base text-gray-700 leading-relaxed">
              {t("about.confidenceDesc")}
            </p>
          </div>
        </div>
      </div>

      {/* ===== NEWSLETTER ===== */}
      <div className="border-t mt-20 py-16 mx-auto max-w-[95%] sm:max-w-3xl text-center">
        <h4 className="text-xs sm:text-sm tracking-widest mb-2 uppercase">
          {t("about.newsletter")}
        </h4>

        <p className="text-xs sm:text-sm text-gray-500 mb-8 leading-relaxed">
          {t("about.newsletterDesc")}
        </p>

        <div className="flex items-center justify-center gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder={t("about.email")}
            className="
              border-b border-black
              outline-none
              flex-1
              text-sm sm:text-base
              pb-2
            "
          />
          <button className="text-sm sm:text-base underline whitespace-nowrap">
            {t("about.submit")}
          </button>
        </div>

        {/* SOCIAL */}
        <div className="flex justify-center gap-6 mt-10">
          <a
            href="https://www.facebook.com/ososaigon"
            target="_blank"
            rel="noopener noreferrer"
            className="h-[28px]"
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
            className="h-[28px]"
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
            className="h-[28px]"
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
  );
}
