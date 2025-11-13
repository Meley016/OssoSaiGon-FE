// src/pages/TermsConditions.jsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "react-quill/dist/quill.snow.css";

export default function TermsConditions() {
  const { i18n } = useTranslation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const API = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const lang = i18n.language || "vi";
        const res = await fetch(`${API}/api/footer/terms/${lang}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        const titleText =
          typeof data.title === "object" ? data.title[lang] || "" : data.title || "";
        const contentText =
          typeof data.content === "object" ? data.content[lang] || "" : data.content || "";
        setTitle(titleText || "TERMS & CONDITIONS");
        setContent(contentText || "<p>Chưa có nội dung.</p>");
      } catch (err) {
        console.error("Lỗi tải Terms:", err);
        setTitle("Lỗi");
        setContent("<p>Không thể tải nội dung.</p>");
      }
    };
    fetchContent();
  }, [API, i18n.language]);

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
