import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "react-quill/dist/quill.snow.css";
import useAuth from "../hooks/useAuth";

export default function Blog() {
  const backend = import.meta.env.VITE_BACKEND_URL;
  const [blogs, setBlogs] = useState([]);
  const [selectedBlogId, setSelectedBlogId] = useState(null);
  const { user, loading } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef(null);
  const { i18n } = useTranslation();
  const lang = i18n.language || "vi";

  // 🟢 Kéo ngang
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    let isDown = false;
    let startX;
    let scrollLeft;

    const startDrag = (e) => {
      isDown = true;
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
    };
    const stopDrag = () => (isDown = false);
    const moveDrag = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 1.5;
      container.scrollLeft = scrollLeft - walk;
    };

    container.addEventListener("mousedown", startDrag);
    container.addEventListener("mouseleave", stopDrag);
    container.addEventListener("mouseup", stopDrag);
    container.addEventListener("mousemove", moveDrag);
    return () => {
      container.removeEventListener("mousedown", startDrag);
      container.removeEventListener("mouseleave", stopDrag);
      container.removeEventListener("mouseup", stopDrag);
      container.removeEventListener("mousemove", moveDrag);
    };
  }, []);

  // 🔹 FETCH BLOG LIST THEO LANG
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${backend}/api/blogs/lang/${lang}`);
        const data = await res.json();
        setBlogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Lỗi lấy blogs:", err);
      }
    };
    fetchBlogs();
  }, [backend, lang]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        Đang tải...
      </div>
    );

  if (!blogs.length)
    return (
      <p className="text-center text-gray-500 py-10">
        Chưa có bài viết nào.
      </p>
    );

  return (
    <div className="py-10 bg-white select-none">
      {/* LIST */}
      <div
        ref={scrollRef}
        className={`transition-all no-scrollbar duration-500 ${
          expanded
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "flex gap-5 overflow-x-auto pb-3 scroll-smooth cursor-grab active:cursor-grabbing"
        }`}
      >
        {blogs.map((b) => (
          <div
            key={b._id}
            onClick={() => setSelectedBlogId(b._id)}
            className={`flex-shrink-0 hover:shadow-lg transition-all duration-300 cursor-pointer ${
              expanded ? "w-full" : "w-72"
            }`}
          >
            <img
              src={b.images?.[0] || "/no-image.jpg"}
              className="w-full h-52 object-cover"
            />
            <div className="p-4">
              <h2 className="text-base font-semibold uppercase line-clamp-2">
                {b.title}
              </h2>
              <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                {b.content
                  ?.replace(/<[^>]+>/g, "")
                  .slice(0, 150)}
                ...
              </p>
              <p className="text-xs text-gray-400 mt-3">
                {new Date(b.createdAt).toLocaleDateString(
                  lang === "en" ? "en-US" : "vi-VN"
                )}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={() => setExpanded(!expanded)}
          className="border-b border-black text-sm font-semibold"
        >
          {expanded ? "Thu gọn ↑" : "Xem thêm →"}
        </button>
      </div>

      {/* MODAL */}
      {selectedBlogId && (
        <BlogModal
          blogId={selectedBlogId}
          onClose={() => setSelectedBlogId(null)}
          user={user}
          backend={backend}
          lang={lang}
        />
      )}
    </div>
  );
}

/* ================= MODAL ================= */

function BlogModal({ blogId, onClose, user, backend, lang }) {
  const [blog, setBlog] = useState(null);
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // 🔹 BLOG DETAIL
  useEffect(() => {
    fetch(`${backend}/api/blogs/${blogId}/${lang}`)
      .then((r) => r.json())
      .then(setBlog);
  }, [backend, blogId, lang]);

  // 🔹 INTERACTIONS
  useEffect(() => {
    fetch(`${backend}/api/blogs/interactions/${blogId}`, {
      credentials: "include",
    })
      .then((r) => r.json())
      .then((d) => {
        setLikes(d.likes || []);
        setComments(d.comments || []);
      });
  }, [backend, blogId]);

  if (!blog) return null;

  const handleLike = async () => {
    if (!user) return alert("Vui lòng đăng nhập!");
    const res = await fetch(`${backend}/api/blogs/like/${blogId}`, {
      method: "POST",
      credentials: "include",
    });
    const d = await res.json();
    setLikes(d.likes || []);
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    const res = await fetch(`${backend}/api/blogs/comment/${blogId}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newComment }),
    });
    const d = await res.json();
    setComments(d.comments || []);
    setNewComment("");
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex justify-center items-start overflow-y-auto py-12 px-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-[100%] lg:max-w-[60%]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={blog.images?.[0] || "/no-image.jpg"}
          className="w-full h-full object-cover"
        />

        <div className="px-4 py-6 sm:px-8 lg:px-12">
          <h1 className="blog-title mb-6">{blog.title}</h1>

          <div
            className="ql-editor !p-0"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />

          <div className="mt-6">
            <button onClick={handleLike}>
              ❤️ {likes.length} lượt thích
            </button>
          </div>

          <div className="mt-8">
            <h3 className="font-semibold mb-4">Bình luận</h3>

            {user && (
              <>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full border p-2"
                  rows={3}
                />
                <button
                  onClick={handleComment}
                  className="mt-2 border px-4 py-1"
                >
                  Gửi
                </button>
              </>
            )}

            {comments.map((c, i) => (
              <div key={i} className="border-t mt-3 pt-2">
                <div className="text-sm font-medium">{c.user}</div>
                <div className="text-sm">{c.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
