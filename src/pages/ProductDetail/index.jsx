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
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/products/group/${id}`);
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
    <div className="md:w-[80%] api-text mx-auto px-4 py-6 bg-white">
      <Breadcrumb product={product} category={product.category} />

      {/* ===== MOBILE ===== */}
      <div className="md:hidden space-y-8">
        <ImageGallery images={images} />

        <ProductInfo
          product={product}
          selectedVariant={selectedVariant}
          onVariantChange={setSelectedVariant}
        />

        <ProductReviews productId={product._id} />
        <RecentViewed currentProduct={product} />
        <Recommended
          currentId={product._id}
          categoryId={product.category?._id}
        />
      </div>

      {/* ===== DESKTOP ===== */}
      <div className="hidden md:grid space-y-8 md:grid-cols-3 gap-10">
        {/* Gallery */}
        <div className="col-span-2">
          <ImageGallery images={images} />
          <ProductReviews productId={product._id} />
          <RecentViewed currentProduct={product} />
          <Recommended
            currentId={product._id}
            categoryId={product.category?._id}
          />
        </div>

        {/* Info sticky */}
        <div className="sticky top-28 self-start  border-l pl-8">
          <ProductInfo
            product={product}
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
          />
        </div>

        {/* Reviews */}
        <div className="col-span-2  mt-16">
          
        </div>
      </div>
    </div>

  );
}