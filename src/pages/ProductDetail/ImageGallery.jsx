import { useEffect, useState } from "react";

export default function ImageGallery({ images }) {
  const [activeImage, setActiveImage] = useState(images[0]);
  const [isZooming, setIsZooming] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (images?.length > 0) setActiveImage(images[0]);
  }, [images]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setPosition({ x, y });
  };

  return (
    <div className="flex  gap-4">

      {/* ✅ Thumbnail bên trái */}
        <div className="flex flex-col gap-3  overflow-y-auto w-24 shrink-0 scrollbar-hide">
          {images.map((img, idx) => (
          <img
            key={idx}
            src={img}
            alt=""
            className={`w-20 h-20 border overflow-hidden shadow-md  object-cover cursor-pointer border-2 transition-all
              ${activeImage === img ? "border-black scale-110" : "border-gray-400"}
            `}
            onMouseEnter={() => setActiveImage(img)}
            onClick={() => setActiveImage(img)}
          />
        ))}
      </div>

      {/* ✅ Ảnh lớn bên phải */}
      <div
        className="relative  bg-white flex items-center justify-center w-full  overflow-hidden"
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
        onMouseMove={handleMouseMove}
        >
        <img
            src={activeImage}
            alt="main"
            className="max-w-full max-h-full object-contain transition-transform duration-300"
            style={{
            transform: isZooming ? "scale(1.6)" : "scale(1)",
            transformOrigin: `${position.x}% ${position.y}%`,
            }}
        />
        </div>

    </div>
  );
}
