import { useSettings } from "../contexts/useSetting";

export default function useCurrency() {
  const { currency, exchangeRate } = useSettings();

  const formatPrice = (amountVND) => {
    if (!amountVND) return "";

    if (currency === "VND") {
      return `${amountVND.toLocaleString("vi-VN")}₫`;
    }
    return `$${(amountVND * exchangeRate).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return { formatPrice };
}
