import { useEffect, useState } from "react";

export default function Blog() {
  const backend = import.meta.env.VITE_BACKEND_URL;
  const [blogs, setBlogs] = useState([]);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [user, setUser] = useState(null); // lưu user login (nếu có)

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

  // 🟢 Kiểm tra đăng nhập
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${backend}/api/auth/me`, {
          credentials: "include",
        });
        const data = await res.json();
        if (data && data._id) setUser(data);
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, [backend]);

  return (
    <div className="mt-20 px-6 py-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold uppercase text-center mb-10">Blog</h1>

      {blogs.length === 0 && (
        <p className="text-center text-gray-500">Chưa có bài viết nào.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((b) => (
          <div
            key={b._id}
            onClick={() => setSelectedBlog(b)}
            className="bg-white border hover:shadow-lg transition-all duration-300 cursor-pointer"
          >
            <img
              src={b.images?.[0] || "/no-image.jpg"}
              alt={b.title}
              className="w-full h-52 object-cover"
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold line-clamp-2">{b.title}</h2>
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

  // 🟢 Lấy likes + comments
  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const res = await fetch(`${backend}/api/blog-interactions/${blog._id}`, {
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
      const res = await fetch(`${backend}/api/blog-interactions/like/${blog._id}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      setLikes(data.likes || []);
    } catch (err) {
      console.error("❌ Like lỗi:", err);
    }
  };

  // 🟢 Gửi comment
  const handleComment = async () => {
    if (!user) return alert("Vui lòng đăng nhập để bình luận!");
    if (!newComment.trim()) return;

    try {
      const res = await fetch(`${backend}/api/blog-interactions/comment/${blog._id}`, {
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
      <div className="bg-white max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-xl shadow-lg relative p-6">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-2xl"
        >
          ✕
        </button>

        {/* Ảnh */}
        <img
          src={blog.images?.[0] || "/no-image.jpg"}
          alt={blog.title}
          className="w-full h-80 object-cover rounded-md mb-6"
        />

        {/* Tiêu đề + nội dung */}
        <h2 className="text-2xl font-bold mb-3">{blog.title}</h2>
        <div
          className="prose max-w-none text-gray-800 mb-8"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Like + Comment */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handleLike}
              className={`px-4 py-2 rounded-md font-semibold transition ${
                user && likes.includes(user._id)
                  ? "bg-red-600 text-white"
                  : "bg-gray-200 hover:bg-gray-300"
              }`}
            >
              ❤️ {likes.length} Lượt thích
            </button>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Bình luận</h3>

            {user ? (
              <div className="mb-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Viết bình luận..."
                  className="border w-full p-2 rounded-md focus:ring focus:ring-gray-200"
                  rows="3"
                />
                <button
                  onClick={handleComment}
                  className="mt-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
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
                <div key={i} className="border p-3 rounded-md bg-gray-50">
                  <p className="font-semibold text-sm">
                    {c.user?.name || "Ẩn danh"}
                  </p>
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
    </div>
  );
}
