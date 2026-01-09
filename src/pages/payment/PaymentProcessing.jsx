import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export default function PaymentProcessing() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const method = searchParams.get("method");
  const txnRef = searchParams.get("txnRef");
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    if (method !== "vnpay" || !txnRef) return;

    let isMounted = true;

    const checkVNPay = async () => {
      try {
        const res = await fetch(
          `${backend}/api/orders/check-vnpay?txnRef=${txnRef}`
        );
        const data = await res.json();

        if (!isMounted) return;

        if (data.status === "success") {
          navigate(`/payment-success?order=${data.orderCode}`);
        } else if (data.status === "failed") {
          navigate(`/payment-failed?order=${data.orderCode}`);
        } else {
          setStatus("processing");
          setTimeout(checkVNPay, 3000);
        }
      } catch {
        navigate("/payment-failed");
      }
    };

    checkVNPay();

    return () => {
      isMounted = false;
    };
  }, [method, txnRef, navigate]);
useEffect(() => {
  if (method !== "vnpay" || !txnRef) return;

  let isMounted = true;
  let retry = 0;
  const MAX_RETRY = 10; // ~30s

  const checkVNPay = async () => {
    try {
      const res = await fetch(
        `${backend}/api/orders/check-vnpay?txnRef=${txnRef}`
      );
      const data = await res.json();

      if (!isMounted) return;

      if (data.status === "success") {
        navigate(`/payment-success?order=${data.orderCode}`);
      } else if (data.status === "failed") {
        navigate(`/payment-failed?order=${data.orderCode}&message=${data.error}`);
      } else {
        retry++;
        if (retry >= MAX_RETRY) {
          navigate(`/payment-failed?message=TIMEOUT`);
        } else {
          setTimeout(checkVNPay, 3000);
        }
      }
    } catch {
      navigate("/payment-failed?message=NETWORK_ERROR");
    }
  };

  checkVNPay();
  return () => { isMounted = false };
}, [method, txnRef, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="animate-spin border-4 border-t-transparent border-black rounded-full w-16 h-16 mb-4"></div>
      <p className="text-black text-lg">
        {status === "checking"
          ? "Đang xác nhận thanh toán..."
          : "Giao dịch đang xử lý..."}
      </p>
    </div>
  );
}
