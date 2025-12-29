// src/components/common/PageTitleManager.jsx
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

export default function PageTitleManager() {
  const { pathname } = useLocation();
  const { t } = useTranslation();

  // mapping route -> i18n key
  const pageKeyMap = {
    "/": "home",
    "/cart": "cart",
    "/wishlist": "wishlist",
    "/checkout": "checkout",
    "/profile": "profile",
    "/search": "search",
    "/all": "all",
    "/about-us": "about",
    "/contact-us": "contact",
    "/faqs": "faqs",
    "/terms": "terms",
    "/shipping": "shipping",
    "/returns": "returns",
    "/privacy": "privacy",
    "/care-instructions": "care",
  };

  let pageKey = pageKeyMap[pathname];

  // route động
  if (!pageKey) {
    if (pathname.startsWith("/product/")) pageKey = "product";
    else if (pathname.startsWith("/category/")) pageKey = "category";
    else if (pathname.startsWith("/profile/")) pageKey = "profile";
    else pageKey = "default";
  }

  const title = t(`seo.${pageKey}.title`);
  const description = t(`seo.${pageKey}.description`);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />

      {/* OpenGraph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
    </Helmet>
  );
}
