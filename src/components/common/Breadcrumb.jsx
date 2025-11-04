import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import { breadcrumbMap } from "../../config/breadcrumbConfig";

export default function Breadcrumb({ product, category }) {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const parts = pathname.split("/").filter(x => x);
  const paths = parts.map((_, i) => "/" + parts.slice(0, i + 1).join("/"));

  return (
    <nav className="text-sm text-gray-600 mb-4 overflow-x-auto whitespace-nowrap">
      <ol className="flex gap-1 flex-wrap items-center">
        {/* ✅ Trang chủ luôn đầu tiên */}
        <li className="flex items-center gap-1">
          <Link to="/" className="hover:underline">{t("breadcrumb_home")}</Link>
          {parts.length > 0 && <span>/</span>}
        </li>

        {paths.map((path, i) => {
          let key = breadcrumbMap[path];
          let label = key ? t(key) : "";

          if (path.startsWith("/product") && product) {
            if (i === parts.length - 1) label = product.name;
            else if (category) label = category.name;
          }

          if (!label) return null;

          return (
            <li key={path} className="flex items-center gap-1">
              {i < parts.length - 1 ? (
                <Link to={path} className="hover:underline">{label}</Link>
              ) : (
                <span className="font-semibold text-gray-900">{label}</span>
              )}
              {i < parts.length - 1 && <span>/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
