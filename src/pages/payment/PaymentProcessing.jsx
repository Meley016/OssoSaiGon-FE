import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function PaymentProcessing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const method = searchParams.get("method");
  const txnRef = searchParams.get("txnRef");

  const [retry, setRetry] = useState(0);
  const MAX_RETRY = 10; // ~30s

  useEffect(() => {
    if (method !== "vnpay" || !txnRef) {
      navigate("/");
      return;
    }

    let isMounted = true;

    const checkVNPay = async () => {
      try {
        const res = await fetch(
          `${backend}/api/orders/check-vnpay?txnRef=${txnRef}`,
          { credentials: "include" }
        );
        const data = await res.json();

        if (!isMounted) return;

        if (data.status === "success") {
          navigate(`/payment-success/${data.orderId}`);
        } 
        else if (data.status === "failed") {
          navigate(`/payment-failed?orderId=${data.orderId}`);
        } 
        else {
          if (retry >= MAX_RETRY) {
            navigate("/payment-failed?reason=TIMEOUT");
          } else {
            setRetry((r) => r + 1);
            setTimeout(checkVNPay, 3000);
          }
        }
      } catch {
        navigate("/payment-failed?reason=NETWORK");
      }
    };

    checkVNPay();
    return () => { isMounted = false };
  }, [method, txnRef, retry, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="animate-spin border-4 border-t-transparent border-black rounded-full w-16 h-16 mb-4"></div>
      <p className="text-lg">Đang xác nhận thanh toán VNPay...</p>
    </div>
  );
}
