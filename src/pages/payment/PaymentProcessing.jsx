import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function PaymentProcessing() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const method = searchParams.get("method");
  const navigate = useNavigate();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    if (method !== "stripe") {
      let isMounted = true;

      const verifyPayment = async () => {
        try {
          const res = await fetch(`${backend}/api/orders/check-payment?orderId=${orderId}`);
          const data = await res.json();

          if (!isMounted) return;

          if (data.status === "success") {
            navigate(`/payment-success/${orderId}`);
          } else if (data.status === "failed") {
            const msg = data.error || "Thanh toán thất bại";
            navigate(`/payment-failed/${orderId}?message=${encodeURIComponent(msg)}`);
          } else {
            setStatus("pending"); // update trạng thái đang chờ
            setTimeout(verifyPayment, 3000);
          }
        } catch {
          if (!isMounted) return;
          navigate(`/payment-failed/${orderId}?message=${encodeURIComponent("Lỗi kết nối")}`);
        }
      };

      verifyPayment();

      return () => { isMounted = false };
    } else {
      // Stripe method: chỉ hiện loading chờ CheckoutPage xử lý
      setStatus("checking");
    }
  }, [orderId, navigate, method]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="animate-spin border-4 border-t-transparent border-black rounded-full w-16 h-16 mb-4"></div>
      <p className="text-black text-lg">
        {status === "checking" ? "Đang xác nhận thanh toán..." : "Giao dịch đang xử lý..."}
      </p>
    </div>
  );
}
