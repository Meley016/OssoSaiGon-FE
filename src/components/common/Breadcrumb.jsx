import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { breadcrumbConfig } from "../../config/breadcrumbConfig";

export default function Breadcrumb() {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const [productData, setProductData] = useState(null);
  /* ================= PRODUCT: LOAD REAL DATA ================= */
  useEffect(() => {
    if (!pathname.startsWith("/product/")) return;

    const id = pathname.split("/").pop();

    fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`)
      .then(r => r.json())
      .then(p => {
        setProductData({
          name: p.name,
          brand: p.brand?.name || p.brand || "Brand",
          category: p.category?.name || "Category",
        });
      })
      .catch(() => setProductData(null));
  }, [pathname]);
 
  const rule = breadcrumbConfig.find(r => r.match.test(pathname));
  if (!rule) return null;

  let items =
    typeof rule.items === "function"
      ? rule.items(pathname.match(rule.match))
      : rule.items;


  /* ================= REPLACE PLACEHOLDER ================= */
  if (pathname.startsWith("/product/") && productData) {
    items = [
      { label: "breadcrumb_home", path: "/" },
      {
        label: productData.category,
        path: `/category/${productData.category}`,
      },
      {
        label: productData.brand,
        path: `/category/brands/${productData.brand}`,
      },
      { label: productData.name },
    ];
  }

  return (
    <nav className="px-6 py-3 text-sm text-gray-500">
      <ol className="flex flex-wrap items-center gap-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            {item.path ? (
              <Link to={item.path} className="hover:text-black">
                {t(item.label) || item.label}
              </Link>
            ) : (
              <span className="text-black font-medium">
                {t(item.label) || item.label}
              </span>
            )}
            {i < items.length - 1 && <span>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
