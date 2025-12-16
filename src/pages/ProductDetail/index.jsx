import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Breadcrumb from "../../components/common/Breadcrumb";
import ImageGallery from "./ImageGallery";
import ProductInfo from "./ProductInfo";
import ProductReviews from "./RatingReview";
import RecentViewed from "./RecentViewed";
import Recommended from "./Recommended";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/${id}`);
        if (!res.ok) throw new Error("Lỗi tải sản phẩm");
        const data = await res.json();
        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setProduct(null);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product?.variants?.length > 0) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  if (!product || !selectedVariant) {
    return <div className="p-10 text-center text-gray-500">Đang tải...</div>;
  }

  const images =
    selectedVariant?.images?.length > 0
      ? selectedVariant.images
      : [product.coverImage || "/placeholder.jpg"];

  return (
    <div className="w-[80%] api-text mx-auto px-4 py-6  bg-white">
      {/* Breadcrumb */}
      <Breadcrumb product={product} category={product.category} />
      {/* Layout chính */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* 1️⃣ Gallery */}
        <div className="order-1 md:order-1 md:col-span-2">
          <ImageGallery images={images} />
        </div>

        {/* 2️⃣ Product Info (NGAY SAU GALLERY TRÊN MOBILE) */}
        <div className="
          order-2
          md:order-2
          md:col-span-1
          md:sticky md:top-28
          md:self-start
          md:border-l md:pl-8
        ">
          <ProductInfo
            product={product}
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
          />
        </div>

        {/* 3️⃣ Reviews + Recent */}
        <div className="order-3 md:order-3 md:col-span-2 mt-12 space-y-12">
          <ProductReviews productId={product._id} />
          <RecentViewed currentProduct={product} />
        </div>

        {/* 4️⃣ Recommended */}
        <div className="order-4 md:order-4 md:col-span-3">
          <Recommended
            currentId={product._id}
            categoryId={product.category?._id}
          />
        </div>
      </div>
      <Recommended
          currentId={product._id}
          categoryId={product.category?._id}
        />
    </div>
  );
}