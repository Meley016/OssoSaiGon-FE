import { ArrowBigLeft, Grid, LayoutGrid, Rows } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AlertModal from "../components/common/AlertModal";
import ConfirmModal from "../components/common/ConfirmModal";
import EditModal from "../components/common/EditModal";
import WishlistProductCard from "../components/common/WishlistProductCard";

export default function WishlistPage() {
  const backend = import.meta.env.VITE_BACKEND_URL;
  const [lists, setLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState(2);
  const [showOptions, setShowOptions] = useState(false);

  // modal & alert states
  const [createModal, setCreateModal] = useState(false);
  const [createValue, setCreateValue] = useState("");
  const [renameModal, setRenameModal] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [alert, setAlert] = useState({ message: "", type: "info" });

  // Lấy danh sách wishlist
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const res = await fetch(`${backend}/api/wishlist`, {
          credentials: "include",
        });
        if (res.status === 401) return navigate("/login");
        const data = await res.json();
        if (!data.apiProtect) return navigate("/login");
        setLists(data.lists || []);
      } catch (err) {
        console.error("Lỗi lấy wishlist:", err);
        setAlert({ message: "Lỗi tải dữ liệu", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchLists();
  }, [backend, navigate]);

  // Tạo list mới
  const handleCreateList = async () => {
    if (!createValue.trim()) {
      setAlert({ message: "Vui lòng nhập tên danh sách.", type: "error" });
      return;
    }
    try {
      const res = await fetch(`${backend}/api/wishlist/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: createValue.trim() }),
      });
      const data = await res.json();
      if (data.list) {
        setLists(prev => [data.list, ...prev]);
        setAlert({ message: "Tạo danh sách thành công!", type: "success" });
      } else {
        setAlert({ message: data.message || "Lỗi tạo danh sách", type: "error" });
      }
    } catch {
      setAlert({ message: "Lỗi mạng", type: "error" });
    } finally {
      setCreateModal(false);
      setCreateValue("");
    }
  };

  // === LOADING & EMPTY STATE ===
  if (loading)
    return (
      <div className="w-full bg-gray-100 text-center py-16 text-gray-600">
        Đang tải...
      </div>
    );

  if (!lists.length)
    return (
      <div className="w-full bg-gray-100">
        <div className="w-[90%] mx-auto mt-28 text-center border-t border-black pt-16 pb-24">
          <h1 className="text-4xl font-bold uppercase mb-6">My Wishlist</h1>
          <p className="text-gray-600 mb-10">Bạn chưa tạo danh sách nào.</p>
          <button
            onClick={() => setCreateModal(true)}
            className="px-10 py-3 bg-black text-white uppercase tracking-wide text-sm hover:bg-gray-900 transition"
          >
            Tạo Danh Sách
          </button>

          {createModal && (
            <EditModal
              title="Tạo Danh Sách Mới"
              placeholder="Nhập tên danh sách"
              value={createValue}
              onChange={setCreateValue}
              onCancel={() => setCreateModal(false)}
              onConfirm={handleCreateList}
            />
          )}
        </div>
      </div>
    );

  // === CẤP 2: XEM CHI TIẾT LIST ===
  if (selectedList)
    return (
      <div className="w-full bg-gray-100">
        <div className="w-[90%] mx-auto pt-10 pb-20">
          {/* Header */}
          <div className="border-b pb-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 w-full max-w-md">
                <h1 className="text-2xl font-bold uppercase">{selectedList.name}</h1>
                {selectedList.items?.length > 0 && (
                  (() => {
                    const lastItem = selectedList.items[selectedList.items.length - 1].product;
                    const variant = lastItem.variants?.[0];
                    const imgSrc = variant?.coverImage || variant?.images?.[0] || "/no-image.jpg";
                    return (
                      <img
                        src={imgSrc}
                        alt="latest"
                        className="w-10 h-10 object-cover border border-black"
                      />
                    );
                  })()
                )}
                <select
                  value={selectedList._id}
                  onChange={e => {
                    const next = lists.find(l => l._id === e.target.value);
                    if (next) setSelectedList(next);
                  }}
                  className="border border-black px-3 py-1 text-sm uppercase tracking-wide focus:outline-none flex-1"
                >
                  {lists.map(list => (
                    <option key={list._id} value={list._id}>
                      {list.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Options */}
              <div className="relative">
                <button
                  onClick={() => setShowOptions(prev => !prev)}
                  className="p-2 hover:bg-gray-100 transition"
                >
                  <span className="text-lg font-bold">⋮</span>
                </button>

                {showOptions && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-black shadow-lg z-20">
                    <button
                      onClick={() => {
                        setRenameValue(selectedList.name);
                        setRenameModal(true);
                        setShowOptions(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Đổi Tên
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          const res = await fetch(`${backend}/api/wishlist/create`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({
                              name: `${selectedList.name} (Copy)`,
                              description: selectedList.description,
                            }),
                          });
                          const data = await res.json();
                          if (data.list) {
                            setLists(prev => [data.list, ...prev]);
                            setAlert({ message: "Sao chép thành công!", type: "success" });
                          }
                        } catch {
                          setAlert({ message: "Lỗi sao chép", type: "error" });
                        }
                        setShowOptions(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      Sao Chép
                    </button>
                    <button
                      onClick={() => {
                        setConfirmDelete(true);
                        setShowOptions(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={() => setSelectedList(null)}
            className="flex items-center text-gray-600 hover:text-black mb-6 text-sm uppercase tracking-wide"
          >
            <ArrowBigLeft className="mr-1" size={18} />
            Quay Lại
          </button>

          {/* Sản phẩm */}
          {selectedList.items?.length ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {selectedList.items.map(it => (
                <WishlistProductCard
                  key={it.product._id}
                  item={it.product}
                  onClick={() => navigate(`/product/${it.product._id}`)}
                  onRemove={async (productId) => {
                    try {
                      const res = await fetch(`${backend}/api/wishlist/remove`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ productId }),
                      });
                      if (res.ok) {
                        setSelectedList(prev => ({
                          ...prev,
                          items: prev.items.filter(i => i.product._id !== productId),
                        }));
                        setAlert({ message: "Đã xóa khỏi danh sách!", type: "success" });
                      } else {
                        setAlert({ message: "Lỗi xóa sản phẩm", type: "error" });
                      }
                    } catch {
                      setAlert({ message: "Lỗi mạng", type: "error" });
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-3xl font-bold uppercase mb-4">Danh Sách Trống</h2>
              <p className="text-gray-600 mb-8">Thêm sản phẩm yêu thích vào đây!</p>
              <button
                onClick={() => navigate("/")}
                className="px-10 py-3 bg-black text-white uppercase tracking-wide text-sm hover:bg-gray-900"
              >
                Tiếp Tục Mua Sắm
              </button>
            </div>
          )}

          {/* MODALS */}
          {renameModal && (
            <EditModal
              title="Đổi Tên Danh Sách"
              placeholder="Nhập tên mới"
              value={renameValue}
              onChange={setRenameValue}
              onCancel={() => setRenameModal(false)}
              onConfirm={async () => {
                if (!renameValue.trim()) {
                  setAlert({ message: "Tên không được để trống!", type: "error" });
                  return;
                }
                try {
                  const res = await fetch(`${backend}/api/wishlist/${selectedList._id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ name: renameValue.trim() }),
                  });
                  const data = await res.json();
                  if (data.success) {
                    setLists(prev =>
                      prev.map(l => (l._id === selectedList._id ? { ...l, name: renameValue } : l))
                    );
                    setSelectedList(prev => ({ ...prev, name: renameValue }));
                    setAlert({ message: "Đổi tên thành công!", type: "success" });
                  } else {
                    setAlert({ message: data.message || "Lỗi đổi tên", type: "error" });
                  }
                } catch {
                  setAlert({ message: "Lỗi mạng", type: "error" });
                } finally {
                  setRenameModal(false);
                }
              }}
            />
          )}

          {confirmDelete && (
            <ConfirmModal
              title="Xóa Danh Sách"
              message="Bạn có chắc chắn muốn xóa danh sách này? Hành động này không thể hoàn tác."
              onCancel={() => setConfirmDelete(false)}
              onConfirm={async () => {
                try {
                  const res = await fetch(`${backend}/api/wishlist/${selectedList._id}`, {
                    method: "DELETE",
                    credentials: "include",
                  });
                  if (res.ok) {
                    setLists(prev => prev.filter(l => l._id !== selectedList._id));
                    setSelectedList(null);
                    setAlert({ message: "Xóa thành công!", type: "success" });
                  } else {
                    setAlert({ message: "Lỗi xóa", type: "error" });
                  }
                } catch {
                  setAlert({ message: "Lỗi mạng", type: "error" });
                } finally {
                  setConfirmDelete(false);
                }
              }}
            />
          )}
        </div>
      </div>
    );

  // === CẤP 1: DANH SÁCH WISHLIST ===
  return (
    <div className="w-full bg-gray-100">
      <div className="w-[90%] mx-auto py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold uppercase">My Wishlist</h1>
          <div className="flex items-center gap-3">
            {/* View Mode */}
            <div className="flex border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode(1)}
                className={`p-2 ${viewMode === 1 ? "bg-black text-white" : "hover:bg-gray-100"}`}
              >
                <Rows size={18} />
              </button>
              <button
                onClick={() => setViewMode(2)}
                className={`p-2 border-l border-gray-300 ${viewMode === 2 ? "bg-black text-white" : "hover:bg-gray-100"}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode(4)}
                className={`p-2 border-l border-gray-300 ${viewMode === 4 ? "bg-black text-white" : "hover:bg-gray-100"}`}
              >
                <Grid size={18} />
              </button>
            </div>
            <button
              onClick={() => setCreateModal(true)}
              className="px-6 py-2 bg-black text-white uppercase text-sm hover:bg-gray-900 transition"
            >
              + Tạo Danh Sách
            </button>
          </div>
        </div>

        {/* Grid danh sách */}
        <div
          className={
            viewMode === 1
              ? "grid grid-cols-1 gap-6"
              : viewMode === 2
              ? "grid sm:grid-cols-2 gap-6"
              : "grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          }
        >
          {lists.map(list => {
            const recent = list.items?.slice(-3).reverse() || [];

            // DỰA VÀO viewMode ĐỂ XÁC ĐỊNH SỐ ẢNH + WIDTH
            const config = {
              1: { count: 3, width: "w-[31.5%]" },
              2: { count: 2, width: "w-[48%]" },
              4: { count: 1, width: "w-full" },
            }[viewMode];

            const displayItems = recent.slice(0, config.count);

            return (
              <div
                key={list._id}
                onClick={() => setSelectedList(list)}
                className="cursor-pointer h-[685px] border-2 border-black p-6 hover:bg-gray-50 transition-all duration-300 bg-white shadow-sm"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold uppercase tracking-wide">{list.name}</h2>
                  <span className="text-sm text-gray-600">
                    {list.items?.length || 0} sản phẩm
                  </span>
                </div>

                {/* ẢNH – THEO viewMode */}
                <div className="flex justify-between gap-2 mb-6">
                  {displayItems.length > 0 ? (
                    displayItems.map((it, i) => {
                      const variant = it.product.variants?.[0];
                      const img = variant?.coverImage || variant?.images?.[0] || "/no-image.jpg";
                      return (
                        <img
                          key={i}
                          src={img}
                          alt={it.product?.name}
                          className={`${config.width} max-h-[550px] object-cover border border-black rounded-sm`}
                          loading="lazy"
                        />
                      );
                    })
                  ) : (
                    <div className="col-span-full text-gray-400 italic text-sm text-center">
                      Chưa có sản phẩm
                    </div>
                  )}
                </div>

                <div className="text-sm uppercase underline tracking-wide font-medium">
                  Xem Danh Sách
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Modal */}
        {createModal && (
          <EditModal
            title="Tạo Danh Sách Mới"
            placeholder="Nhập tên danh sách"
            value={createValue}
            onChange={setCreateValue}
            onCancel={() => setCreateModal(false)}
            onConfirm={handleCreateList}
          />
        )}

        {/* Alert */}
        <AlertModal
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ message: "", type: "info" })}
        />
      </div>
    </div>
  );
}