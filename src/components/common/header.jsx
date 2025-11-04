import { useEffect, useState } from "react";
import HeaderDesktop from "./header/HeaderDesktop";
import HeaderMobile from "./header/HeaderMobile";

export default function Header() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile ? <HeaderMobile /> : <HeaderDesktop />;
}
