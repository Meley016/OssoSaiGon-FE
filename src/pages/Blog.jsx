import { useEffect, useRef, useState } from "react";
import useAuth from "../hooks/useAuth";

export default function Blog() {
  const backend = import.meta.env.VITE_BACKEND_URL;
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const { user, loading } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef(null);

  // 🟢 Kéo ngang (drag scroll)
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

  // 🟢 Lấy danh sách blog
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${backend}/api/blogs`);
        const data = await res.json();
        setBlogs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ Lỗi lấy blogs:", err);
      }
    };
    fetchBlogs();
  }, [backend]);

  if (loading)
    return (
      <div className="flex justify-center items-center h-40 text-gray-500">
        Đang tải...
      </div>
    );

  if (!blogs.length)
    return <p className="text-center text-gray-500 py-10">Chưa có bài viết nào.</p>;

  return (
    <div className="px-6 py-10  bg-white select-none">
      {/* Danh sách blog */}
      <div
        ref={scrollRef}
        className={`transition-all no-scrollbar  duration-500 ${
          expanded
            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "flex gap-5 overflow-x-auto pb-3 scroll-smooth cursor-grab active:cursor-grabbing"
        }`}
      >
        {blogs.map((b) => (
          <div
            key={b._id}
            onClick={() => setSelectedBlog(b)}
            className={`flex-shrink-0 border hover:shadow-lg transition-all duration-300 cursor-pointer ${
              expanded ? "w-full" : "w-72"
            }`}
          >
            <img
              src={b.images?.[0] || "/no-image.jpg"}
              alt={b.title}
              className="w-full h-52 object-cover"
            />
            <div className="p-4">
              <h2 className="text-base font-semibold uppercase line-clamp-2">
                {b.title}
              </h2>
              <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                {b.content.replace(/<[^>]+>/g, "").slice(0, 150)}...
              </p>
              <p className="text-xs text-gray-400 mt-3">
                {new Date(b.createdAt).toLocaleDateString("vi-VN")}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 🔘 Nút xem thêm / thu gọn */}
      <div className="flex justify-center mt-6">
        <button
          onClick={() => setExpanded(!expanded)}
          className="border-b border-black text-sm font-semibold hover:text-gray-600"
        >
          {expanded ? "Thu gọn ↑" : "Xem thêm →"}
        </button>
      </div>

      {/* 🟣 Modal chi tiết */}
      {selectedBlog && (
        <BlogModal
          blog={selectedBlog}
          onClose={() => setSelectedBlog(null)}
          user={user}
          backend={backend}
        />
      )}
    </div>
  );
}

/* 🟣 COMPONENT: BlogModal */
function BlogModal({ blog, onClose, user, backend }) {
  const [likes, setLikes] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // 🟢 Lấy tương tác bài viết
  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const res = await fetch(`${backend}/api/blogs/interactions/${blog._id}`, {
          credentials: "include",
        });
        const data = await res.json();
        setLikes(data.likes || []);
        setComments(data.comments || []);
      } catch (err) {
        console.error("❌ Lỗi lấy tương tác:", err);
      }
    };
    fetchInteractions();
  }, [backend, blog._id]);

  // 🟢 Like bài viết
  const handleLike = async () => {
    if (!user) return alert("Vui lòng đăng nhập để thích bài viết!");
    try {
      const res = await fetch(`${backend}/api/blogs/like/${blog._id}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      setLikes(data.likes || []);
    } catch (err) {
      console.error("❌ Like lỗi:", err);
    }
  };

  // 🟢 Gửi bình luận
  const handleComment = async () => {
    if (!user) return alert("Vui lòng đăng nhập để bình luận!");
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`${backend}/api/blogs/comment/${blog._id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newComment }),
      });
      const data = await res.json();
      setComments(data.comments || []);
      setNewComment("");
    } catch (err) {
      console.error("❌ Gửi bình luận lỗi:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-5 right-4 bg-black text-white hover:bg-[#ffe6e6] hover:text-black text-2xl px-2"
      >
        ✕
      </button>
      <div className="bg-white max-w-[100%] w-full max-h-[80vh] overflow-y-auto p-6 shadow-lg">
        <img
          src={blog.images?.[0] || "/no-image.jpg"}
          alt={blog.title}
          className="w-full h-80 object-cover mb-6"
        />
        <h2 className="text-2xl font-bold mb-3">{blog.title}</h2>
        <div
          className="prose max-w-none text-gray-800 mb-8"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleLike}
              className={`px-4 py-2 font-semibold transition ${
                user && likes.includes(user._id)
                  ? "bg-[#ffe6e6] text-black"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              ❤️ {likes.length} Lượt thích
            </button>
          </div>

          <h3 className="text-lg font-semibold mb-2">Bình luận</h3>

          {user ? (
            <div className="mb-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Viết bình luận..."
                className="border w-full p-2 focus:ring focus:ring-gray-200"
                rows="3"
              />
              <button
                onClick={handleComment}
                className="mt-2 bg-black text-white px-4 py-2 hover:bg-[#ffe6e6] hover:text-black"
              >
                Gửi
              </button>
            </div>
          ) : (
            <p className="text-gray-500 text-sm mb-3">
              ⚠️ Đăng nhập để bình luận hoặc thích bài viết.
            </p>
          )}

          <div className="flex flex-col gap-3">
            {comments.length === 0 && (
              <p className="text-gray-500 text-sm">Chưa có bình luận nào.</p>
            )}
            {comments.map((c, i) => (
              <div key={i} className="border p-3 bg-gray-50">
                <p className="font-semibold text-sm">{c.user?.name || "Ẩn danh"}</p>
                <p className="text-gray-700 text-sm mt-1">{c.text}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(c.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
