import { Link } from "react-router-dom";

const Banner = ({ image, title, description, link }) => {
  return (
    <Link
      to={link}
      className="relative w-full block overflow-hidden group"
    >
      {/* Ảnh nền */}
      <img
        src={image}
        alt={title}
        className="w-full h-[400px] object-cover transition-transform duration-500 group-hover:scale-105"
      />

      {/* Lớp phủ đen nhẹ để làm nổi chữ */}
      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-all"></div>

      {/* Nội dung chữ */}
      <div className="absolute bottom-6 left-6 text-white">
        <h2 className="text-3xl md:text-4xl font-bold uppercase drop-shadow-lg">
          {title}
        </h2>
        <p className="text-sm md:text-base uppercase tracking-wider mt-2 opacity-90">
          {description}
        </p>
      </div>
    </Link>
  );
};

export default Banner;
