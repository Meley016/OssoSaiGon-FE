import { useEffect, useState } from "react";
import "react-quill/dist/quill.snow.css"; // Chỉ cần CSS

export default function Shipping() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const API = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchShipping = async () => {
      try {
        const res = await fetch(`${API}/api/footer/shipping`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setTitle(data.title || "SHIPPING POLICY");
        setContent(data.content || "");
      } catch (err) {
        console.error(err);
        setTitle("Lỗi");
        setContent("<p>Không thể tải nội dung.</p>");
      }
    };
    fetchShipping();
  }, [API]);

  if (!content) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-10 text-center text-gray-500">
        Đang tải...
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10 font-futura text-gray-800">
      <h1 className="text-3xl font-bold mb-8 hardcode-text">{title}</h1>

      <div className=" ql-snow">
        <div
          className="ql-editor !p-0 prose max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </main>
  );
}