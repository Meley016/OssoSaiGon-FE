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
        if (Array.isArray(data) && data[0]?.image) setLogoUrl(data[0].image);
      } catch (err) {
        console.warn("Lỗi tải logo:", err.message);
      }
    };
    fetchLogo();
  }, []);
  return (
    <div className="bg-white">
    <div className="flex justify-center">
            <img
              src={logoUrl}
              alt="Logo"
              className="w-[40%]  h-auto cursor-pointer"
            />
          </div>
      {/* ===== GRID ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        
        {/* TEXT 1 */}
        <div className="bg-[#f7dfe7] flex items-center justify-center p-10">
          <div className="max-w-md text-center space-y-4">
            <h3 className="text-sm tracking-widest font-semibold uppercase">
              {t("about.globalTitle")}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {t("about.globalDesc")}
            </p>
          </div>
        </div>

        {/* IMAGE 1 */}
        <div className="h-[400px]">
          <img
            src="/icons/about-1.png"
            alt="about-1"
            className="w-full h-full object-cover"
          />
        </div>

        {/* IMAGE 2 */}
        <div className="h-[400px]">
          <img
            src="/icons/about-2.png"
            alt="about-2"
            className="w-full h-full object-cover"
          />
        </div>

        {/* TEXT 2 */}
        <div className="bg-[#f7dfe7] flex items-center justify-center p-10">
          <div className="max-w-md text-center space-y-4">
            <h3 className="text-sm tracking-widest font-semibold uppercase">
              {t("about.confidenceTitle")}
            </h3>
            <p className="text-sm text-gray-700 leading-relaxed">
              {t("about.confidenceDesc")}
            </p>
          </div>
        </div>
      </div>

      {/* ===== NEWSLETTER ===== */}
      <div className="border-t mt-20 py-16 text-center">
        <h4 className="text-sm tracking-widest mb-2">
          {t("about.newsletter")}
        </h4>
        <p className="text-xs text-gray-500 mb-8">
          {t("about.newsletterDesc")}
        </p>

        <div className="flex justify-center gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder={t("about.email")}
            className="border-b border-black outline-none flex-1 text-sm pb-2"
          />
          <button className="text-sm underline">
            {t("about.submit")}
          </button>
        </div>

        <div className="flex justify-center gap-6 mt-8 text-lg">
          <a
            href="https://www.facebook.com/ososaigon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/icons/Facebook.png"
              alt="Facebook"
              className="h-full object-cover hover:opacity-80 transition"
            />
          </a>

          <a
            href="https://www.instagram.com/oso.saigon2019/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/icons/Instagram.png"
              alt="Instagram"
              className="h-full object-cover hover:opacity-80 transition"
            />
          </a>

          <a
            href="https://www.tiktok.com/@ososneaker?is_from_webapp=1&sender_device=pc"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/icons/Tiktok.png"
              alt="TikTok"
              className="w-[28px] object-cover hover:opacity-80 transition"
            />
          </a>
        </div>

      </div>
    </div>
  );
}
