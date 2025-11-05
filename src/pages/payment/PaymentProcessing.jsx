import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentProcessing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    async function verifyPayment() {
      try {
        const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
        const orderCode = searchParams.get("orderId");

        // Nếu người dùng hủy (VD: responseCode != 00)
        if (vnp_ResponseCode && vnp_ResponseCode !== "00") {
          navigate("/payment-failed");
          return;
        }

        // Gọi backend để kiểm tra trạng thái giao dịch
        const res = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/api/orders/check-vnpay?orderId=${orderCode}`
        );
        const json = await res.json();

        if (json?.status === "success") {
          navigate(`/payment-success?order=${orderCode}`);
        } else {
          // nếu chưa có IPN hoặc chờ xác nhận
          setStatus("pending");
          // thử lại sau 3 giây
          setTimeout(verifyPayment, 3000);
        }
      } catch (err) {
        console.error("verifyPayment error", err);
        navigate("/payment-failed");
      }
    }

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-gray-600 bg-gray-50">
      <div className="animate-spin border-4 border-t-transparent border-green-600 rounded-full w-12 h-12 mb-4"></div>
      {status === "checking" && <p>Đang xác nhận thanh toán...</p>}
      {status === "pending" && (
        <p className="text-center px-6">
          Giao dịch đang được xử lý. Vui lòng đợi trong giây lát...
        </p>
      )}
    </div>
  );
}
