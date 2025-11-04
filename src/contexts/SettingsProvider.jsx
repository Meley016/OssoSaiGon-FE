import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import SettingsContext from "./SettingsContext";

const SettingsProvider = ({ children }) => {
  const { i18n } = useTranslation();

  const [language, setLanguage] = useState(localStorage.getItem("lang") || "vi");
  const [currency, setCurrency] = useState(language === "en" ? "USD" : "VND");
  const [exchangeRate, setExchangeRate] = useState(1 / 30000);

  // 🟩 Đổi ngôn ngữ → tự đổi tiền tệ
  const switchLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
    localStorage.setItem("lang", lang);

    // Đồng bộ tiền tệ với ngôn ngữ
    if (lang === "en") {
      setCurrency("USD");
      setExchangeRate(1 / 30000);
    } else {
      setCurrency("VND");
      setExchangeRate(1);
    }
  };

  // 🟦 Đổi tiền tệ thủ công (nếu có nút riêng)
  const switchCurrency = (cur) => {
    if (cur === "USD") {
      setCurrency("USD");
      setExchangeRate(1 / 30000);
      setLanguage("en");
      i18n.changeLanguage("en");
    } else {
      setCurrency("VND");
      setExchangeRate(1);
      setLanguage("vi");
      i18n.changeLanguage("vi");
    }
    localStorage.setItem("lang", cur === "USD" ? "en" : "vi");
  };

  // 🟢 Đồng bộ khi load lại trang
  useEffect(() => {
    if (language === "en") {
      setCurrency("USD");
      setExchangeRate(1 / 30000);
    } else {
      setCurrency("VND");
      setExchangeRate(1);
    }
  }, [language]);

  const value = {
    language,
    switchLanguage,
    currency,
    switchCurrency,
    exchangeRate,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsProvider;
