import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

export default function Above() {

const [logoUrl, setLogoUrl] = useState("../../../assets/LOGO.png");
const navigate = useNavigate;

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
    <div>
      <div className=" flex justify-start">
            <img
              src={logoUrl}
              alt="Logo"
              className="w-20 md:w-24 h-auto "
              onClick={() => navigate("/")}
            />
          </div>
    </div>
  )
}

