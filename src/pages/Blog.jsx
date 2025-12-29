import { useEffect, useRef, useState } from "react";
import "react-quill/dist/quill.snow.css";
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
            className={`flex-shrink-0  hover:shadow-lg transition-all duration-300 cursor-pointer ${
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

  useEffect(() => {
    fetch(`${backend}/api/blogs/interactions/${blog._id}`, {
      credentials: "include",
    })
      .then(r => r.json())
      .then(d => {
        setLikes(d.likes || []);
        setComments(d.comments || []);
      });
  }, [backend, blog._id]);

  const handleLike = async () => {
    if (!user) return alert("Vui lòng đăng nhập!");
    const res = await fetch(`${backend}/api/blogs/like/${blog._id}`, {
      method: "POST",
      credentials: "include",
    });
    const d = await res.json();
    setLikes(d.likes || []);
  };

  const handleComment = async () => {
    if (!user || !newComment.trim()) return;
    const res = await fetch(`${backend}/api/blogs/comment/${blog._id}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newComment }),
    });
    const d = await res.json();
    setComments(d.comments || []);
    setNewComment("");
  };
    useEffect(() => {
      const onEsc = (e) => e.key === "Escape" && onClose();
      window.addEventListener("keydown", onEsc);
      return () => window.removeEventListener("keydown", onEsc);
    }, []);
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex justify-center items-start overflow-y-auto py-12 px-4"
         onClick={onClose}
    >
      
      {/* MODAL */}
      <div
        className="
          bg-white
          w-full
          shadow-xl

          sm:max-w-[100%]
          lg:max-w-[60%]
        "
        onClick={(e) => e.stopPropagation()}
      >

      <div className="relative w-full overflow-hidden">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4
            z-10
            text-white text-3xl
            bg-black/40 hover:bg-black/70
            w-10 h-10
            flex items-center justify-center
            transition
          "
        >
          ✕
        </button>

        <img
          src={blog.images?.[0] || "/no-image.jpg"}
          alt={blog.title}
          className="w-full h-full object-cover"
        />
      </div>
        {/* CONTENT */}
        <div className="px-4 py-6 sm:px-8 sm:py-10 lg:px-12">
          {/* TITLE */}
        <h1 className="blog-title px-2 sm:px-4 lg:px-0 mb-6">
          {blog.title}
        </h1>


          {/* BODY */}
          <div className="ql-snow px-2 sm:px-6 lg:px-12">
            <div
              className="ql-editor !p-0"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </div>


          {/* LIKE */}
          <div className="mt-12 border-t pt-6 flex items-center gap-6">
            <button
              onClick={handleLike}
              className={`px-5 py-2 font-medium transition ${
                user && likes.includes(user._id)
                  ? "bg-[#ffe6e6] text-black"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              ❤️ {likes.length} lượt thích
            </button>
          </div>

          {/* COMMENTS */}
          <div className="mt-12">
            <h3 className="text-xl font-semibold mb-4 uppercase tracking-wide">
              Bình luận
            </h3>

            {user ? (
              <div className="mb-6">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận..."
                  className="w-full border p-3 focus:outline-none focus:ring"
                  rows="3"
                />
                <button
                  onClick={handleComment}
                  className="mt-3 bg-black text-white px-6 py-2 hover:bg-[#ffe6e6] hover:text-black transition"
                >
                  Gửi
                </button>
              </div>
            ) : (
              <p className="text-gray-500 text-sm mb-6">
                ⚠️ Đăng nhập để bình luận hoặc thích bài viết
              </p>
            )}

            <div className="flex flex-col gap-4">
              {comments.length === 0 && (
                <p className="text-gray-400 text-sm">Chưa có bình luận</p>
              )}
              {comments.map((c, i) => (
                <div key={i} className="border p-4 bg-gray-50">
                  <p className="font-semibold text-sm">
                    {c.user?.name || "Ẩn danh"}
                  </p>
                  <p className="text-gray-700 mt-1">{c.text}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(c.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

