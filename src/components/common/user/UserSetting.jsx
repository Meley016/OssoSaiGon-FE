// import { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";

// export default function UserSettings() {
//   const { i18n, t } = useTranslation();
//   const [lang, setLang] = useState(localStorage.getItem("lang") || "vi");

//   const changeLang = (value) => {
//     setLang(value);
//     i18n.changeLanguage(value);
//     localStorage.setItem("lang", value);
//   };

//   // 🧮 Lưu tỉ giá (ví dụ 1 USD = 30000₫)
//   const exchangeRate = 30000;

//   useEffect(() => {
//     console.log(`🌍 Ngôn ngữ hiện tại: ${lang}`);
//   }, [lang]);

//   return (
//     <div className="max-w-lg mx-auto bg-white border border-gray-300 shadow p-6 rounded-lg">
//       <h2 className="text-2xl font-bold mb-4">{t("settings")}</h2>

//       <div className="space-y-6">
//         {/* Chọn ngôn ngữ */}
//         <div>
//           <label className="block font-medium mb-2">Ngôn ngữ / Language</label>
//           <select
//             value={lang}
//             onChange={(e) => changeLang(e.target.value)}
//             className="w-full border px-4 py-2 rounded-md"
//           >
//             <option value="vi">🇻🇳 Tiếng Việt</option>
//             <option value="en">🇺🇸 English</option>
//           </select>
//         </div>

//         {/* Ví dụ hiển thị tiền */}
//         <div className="mt-6">
//           <p className="text-gray-700 mb-1 font-semibold">Xem thử định dạng tiền tệ:</p>
//           {lang === "vi" ? (
//             <p className="text-xl font-bold text-green-600">
//               {(150000).toLocaleString("vi-VN")}₫
//             </p>
//           ) : (
//             <p className="text-xl font-bold text-green-600">
//               $
//               {(150000 / exchangeRate).toLocaleString("en-US", {
//                 minimumFractionDigits: 2,
//               })}
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
