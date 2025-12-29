export const breadcrumbConfig = [
  /* ================= HOME ================= */
  {
    match: /^\/$/,
    items: [{ label: "breadcrumb_home", path: "/" }],
  },

  /* ================= CATEGORY ================= */
  {
    match: /^\/category\/([^/]+)$/,
    items: (match) => {
      const categorySlug = decodeURIComponent(match[1]);

      return [
        { label: "breadcrumb_home", path: "/" },
        { label: "breadcrumb_category", path: "/category" },
        { label: categorySlug },
      ];
    },
  },

  /* ================= BRAND (category/brands/:brand) ================= */
  {
    match: /^\/category\/brands\/([^/]+)$/,
    items: (match) => {
      const brand = decodeURIComponent(match[1]);

      return [
        { label: "breadcrumb_home", path: "/" },
        { label: "breadcrumb_category", path: "/category" },
        { label: "Brands", path: "/category/brands" },
        { label: brand },
      ];
    },
  },

  /* ================= PRODUCT (FULL FLOW) ================= */
  {
    match: /^\/product\/([^/]+)$/,
    items: [
      { label: "breadcrumb_home", path: "/" },
      { label: "breadcrumb_category", path: "/category" },
      { label: "breadcrumb_brand" },   // sẽ replace bằng brand thật
      { label: "breadcrumb_product" }, // sẽ replace bằng tên product
    ],
  },
];
