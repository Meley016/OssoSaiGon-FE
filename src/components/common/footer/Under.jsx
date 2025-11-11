import { useTranslation } from "react-i18next";
import mastercard from "../../../assets/mastercard.png";
import paypal from "../../../assets/paypal.png";
import visa from "../../../assets/visa.png";
import vnpay from "../../../assets/vnpay.png";

export default function Under() {
  const { t } = useTranslation();

  return (
    <div className="border-t border-gray-700 mt-10 ">
      <div className="mx-20 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm max-w-full font-jost">
        <p>© 2024, ososaigon | {t("footer.rights")}</p>
      <div className="flex gap-3 ">
      <div className="bg-[#ffe6e6] px-2 py-0 my-2 w-[64px] justify-center items-center flex flex-1 rounded-lg hover:bg-white">
        <img src={visa} alt="Visa" className="h-8" />
      </div>
      <div className="bg-[#ffe6e6] px-2 py-0 my-2 w-[64px] justify-center items-center flex flex-1 rounded-lg hover:bg-white">
        <img src={mastercard} alt="Mastercard" className="h-8" />

      </div>       
      <div className="bg-[#ffe6e6] px-2 py-0 my-2 w-[64px] justify-center items-center flex flex-1 rounded-lg hover:bg-white">
        <img src={paypal} alt="PayPal" className="h-8" />

      </div>
      <div className="bg-[#ffe6e6] px-2 py-0 my-2 w-[64px] justify-center items-center flex flex-1 rounded-lg hover:bg-white">
        <img src={vnpay} alt="VNPay" className="h-8" />

      </div>
        
      </div>
      </div>
    </div>
  );
}
