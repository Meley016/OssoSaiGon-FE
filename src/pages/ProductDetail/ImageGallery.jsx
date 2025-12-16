import { useEffect, useState } from "react";

export default function ImageGallery({ images = [] }) {
  const [activeImage, setActiveImage] = useState(images[0]);
  const [isZooming, setIsZooming] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [mobileZoom, setMobileZoom] = useState(false);

  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    if (images?.length > 0) {
      setActiveImage(images[0]);
      setMobileZoom(false);
    }
  }, [images]);

  /* ===== Desktop hover zoom ===== */
  const handleMouseMove = (e) => {
    if (isMobile) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x, y });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* ================= THUMBNAILS ================= */}
      {/* Desktop: dọc | Mobile: ngang */}
      <div
        className="
          flex md:flex-col gap-3
          md:w-24
          overflow-x-auto md:overflow-y-auto
          
          order-2 md:order-1
        "
      >
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt=""
            onClick={() => {
              setActiveImage(img);
              setMobileZoom(false);
            }}
            className={`
              w-20 h-20 object-cover cursor-pointer border-2 transition-all shrink-0
              ${activeImage === img
                ? "border-black scale-110"
                : "border-gray-300"}
            `}
          />
        ))}
      </div>

      {/* ================= MAIN IMAGE ================= */}
      <div
        className="
          relative bg-white w-full aspect-square
          flex items-center justify-center
          overflow-hidden
          order-1 md:order-2
        "
        onMouseEnter={() => !isMobile && setIsZooming(true)}
        onMouseLeave={() => !isMobile && setIsZooming(false)}
        onMouseMove={handleMouseMove}
        onClick={() => isMobile && setMobileZoom(z => !z)}
      >
        <img
          src={activeImage}
          alt="main"
          className="
            w-full h-full object-contain
            transition-transform duration-300
          "
          style={{
            transform: isMobile
              ? mobileZoom
                ? "scale(1.6)"
                : "scale(1)"
              : isZooming
              ? "scale(1.6)"
              : "scale(1)",
            transformOrigin: isMobile
              ? "center"
              : `${position.x}% ${position.y}%`,
            cursor: isMobile ? "zoom-in" : "crosshair",
          }}
        />

        {/* Hint mobile */}
        {isMobile && !mobileZoom && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white text-xs px-3 py-1 rounded">
            Tap để zoom
          </div>
        )}
      </div>
    </div>
  );
}
