import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "react-quill/dist/quill.snow.css"; // Chỉ cần CSS

export default function Shipping() {
  const { i18n } = useTranslation(); // Lấy language hiện tại
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const API = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchShipping = async () => {
      try {
        const lang = i18n.language || "vi"; // Lấy ngôn ngữ hiện tại
        const res = await fetch(`${API}/api/footer/shipping/${lang}`);
        if (!res.ok) throw new Error();
        const data = await res.json();

        // Nếu backend trả về { title: {vi,en}, content: {vi,en} }
        const titleText =
          typeof data.title === "object" ? data.title[lang] || "" : data.title || "";
        const contentText =
          typeof data.content === "object" ? data.content[lang] || "" : data.content || "";

        setTitle(titleText || "SHIPPING POLICY");
        setContent(contentText || "<p>Chưa có nội dung.</p>");
      } catch (err) {
        console.error(err);
        setTitle("Lỗi");
        setContent("<p>Không thể tải nội dung.</p>");
      }
    };
    fetchShipping();
  }, [API, i18n.language]); // Re-fetch khi ngôn ngữ thay đổi

  if (!content) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10 text-center text-gray-500">
        Đang tải...
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 font-futura text-gray-800">
      <h1 className="text-3xl font-bold mb-8">{title}</h1>

      <div className="ql-snow">
        <div
          className="ql-editor !p-0 prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </main>
  );
}
