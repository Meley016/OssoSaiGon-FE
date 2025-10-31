import { useEffect, useState } from "react";

export default function AddWishlistModal({ product, variant, onClose, onConfirm }) {
  const variants = product.variants || [];

  const [selectedColor, setSelectedColor] = useState(
    variant?.color?._id || variants.find(v => v.color?._id)?._id
  );
  const [selectedSize, setSelectedSize] = useState(variant?.size?._id || null);
  const [lists, setLists] = useState([]);
  const [selectedLists, setSelectedLists] = useState([]);
  const [initialSelectedLists, setInitialSelectedLists] = useState([]); // ← MỚI
  const [creating, setCreating] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [toggleLoading, setToggleLoading] = useState({}); // ← MỚI

  // Lấy toàn bộ list và kiểm tra product có trong list nào
  useEffect(() => {
    (async () => {
      try {
        const [resLists, resCheck] = await Promise.all([
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/wishlist`, { credentials: "include" }),
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/wishlist/check`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ productId: product._id }),
          }),
        ]);

        const listsData = await resLists.json();
        const checkData = await resCheck.json();

        const allLists = listsData.lists || [];
        setLists(allLists);

        let listsWithProduct = [];
        if (checkData.isWishlisted) {
          listsWithProduct = allLists
            .filter(l => l.items?.some(i => i.product?._id === product._id))
            .map(l => l._id);
        }

        setSelectedLists(listsWithProduct);
        setInitialSelectedLists(listsWithProduct); // ← Lưu trạng thái ban đầu
      } catch (err) {
        console.error("Lỗi lấy wishlist:", err);
      }
    })();
  }, [product._id]);

  const colors = Array.from(new Map(variants.map(v => [v.color?._id, v])).values());
  const sizes = variants
    .filter(v => v.color?._id === selectedColor)
    .map(v => v.size);

  // Tạo list mới
  const handleCreateList = async () => {
    if (!newListName.trim()) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/wishlist/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newListName }),
      });
      const data = await res.json();
      if (data.list) {
        setLists(prev => [data.list, ...prev]);
        setNewListName("");
        setCreating(false);
      }
    } catch (err) {
      console.error("Lỗi tạo wishlist:", err);
    }
  };

  // Toggle sản phẩm trong list
  const toggleList = async listId => {
    setToggleLoading(prev => ({ ...prev, [listId]: true }));
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/wishlist/${listId}/toggle`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ productId: product._id }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setSelectedLists(prev =>
          data.action === "added"
            ? [...prev.filter(id => id !== listId), listId]
            : prev.filter(id => id !== listId)
        );

        if (data.list) {
          setLists(prev => prev.map(l => (l._id === listId ? data.list : l)));
        }
      } else {
        alert("Lỗi: " + (data.message || "Không thể cập nhật"));
      }
    } catch (err) {
      console.error("Lỗi toggle wishlist:", err);
      alert("Lỗi mạng!");
    } finally {
      setToggleLoading(prev => ({ ...prev, [listId]: false }));
    }
  };

  // Xác nhận và gửi cả selected + initial
  const handleConfirm = () => {
    onConfirm(selectedLists, initialSelectedLists);
  };

  const currentVariant =
    variants.find(v => v.color?._id === selectedColor && v.size?._id === selectedSize) ||
    variants.find(v => v.color?._id === selectedColor);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[96%] max-w-3xl shadow-xl p-8 rounded-2xl">
        <h2 className="text-3xl font-bold mb-6">Add to Wishlist</h2>

        {/* Product Preview */}
        <div className="flex gap-6 border-b pb-6 mb-6">
          <img
            src={currentVariant?.images?.[0] || product.coverImage}
            alt={product.name}
            className="w-32 h-32 object-cover border border-gray-300"
          />
          <div className="flex flex-col justify-center">
            <h3 className="font-semibold text-xl">{product.name}</h3>
            <p className="text-gray-500">{product.brand}</p>
            <p className="mt-2 text-sm">
              {currentVariant?.color?.name || "—"} / {currentVariant?.size?.name || "—"}
            </p>
            <p className="font-semibold text-lg mt-1">
              {currentVariant?.price?.toLocaleString("vi-VN")}₫
            </p>
          </div>
        </div>

        {/* Select Preferences */}
        <div className="mb-8">
          <p className="font-semibold mb-3 text-lg">Select Preferences</p>
          <div className="mb-4 flex gap-3 flex-wrap">
            {colors.map(c => (
              <div
                key={c.color._id}
                onClick={() => setSelectedColor(c.color._id)}
                className={`w-10 h-10 border cursor-pointer ${
                  selectedColor === c.color._id
                    ? "border-black scale-110"
                    : "border-gray-300"
                } transition-transform rounded-full`}
                style={{ backgroundColor: c.color.code }}
              />
            ))}
          </div>

          <div className="flex gap-2 flex-wrap">
            {sizes.map(s => (
              <button
                key={s._id}
                onClick={() => setSelectedSize(s._id)}
                className={`px-4 py-2 border text-sm rounded ${
                  selectedSize === s._id
                    ? "bg-black text-white border-black"
                    : "border-gray-300 hover:border-black"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Chọn Wishlist */}
        <p className="font-semibold mb-3 text-lg">
          Add this item to one or more lists
        </p>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {lists.map(l => (
            <button
              key={l._id}
              onClick={() => toggleList(l._id)}
              disabled={toggleLoading[l._id]}
              className={`border px-4 py-3 text-sm transition-all rounded relative ${
                selectedLists.includes(l._id)
                  ? "bg-black text-white border-black"
                  : "hover:border-black"
              } ${toggleLoading[l._id] ? "opacity-70" : ""}`}
            >
              {toggleLoading[l._id] ? "..." : l.name}
            </button>
          ))}
        </div>

        {/* Create new */}
        {creating ? (
          <div className="flex gap-3 mb-6">
            <input
              value={newListName}
              onChange={e => setNewListName(e.target.value)}
              placeholder="New list name"
              className="border px-3 py-2 text-sm flex-1 rounded"
            />
            <button
              onClick={handleCreateList}
              className="bg-black text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="text-sm underline mb-6 text-gray-600 hover:text-black"
          >
            + Create new list
          </button>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-400 text-gray-700 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedLists.length}
            className={`px-6 py-2 font-semibold rounded ${
              selectedLists.length
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}