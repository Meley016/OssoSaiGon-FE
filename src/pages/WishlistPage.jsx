import { ArrowBigLeft, Grid, LayoutGrid, Rows } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import AlertModal from "../components/common/AlertModal";
import ConfirmModal from "../components/common/ConfirmModal";
import EditModal from "../components/common/EditModal";
import WishlistProductCard from "../components/common/WishlistProductCard";

export default function WishlistPage() {
  const { t } = useTranslation();
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
        setAlert({ message: t("wishlist.error_loading"), type: "error" });
      } finally {
        setLoading(false);
      }
    };
    fetchLists();
  }, [backend, navigate, t]);

  // Tạo list mới
  const handleCreateList = async () => {
    if (!createValue.trim()) {
      setAlert({ message: t("wishlist.empty_list_name"), type: "error" });
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
        setAlert({ message: t("wishlist.create_success"), type: "success" });
      } else {
        setAlert({ message: data.message || t("wishlist.create_error"), type: "error" });
      }
    } catch {
      setAlert({ message: t("wishlist.network_error"), type: "error" });
    } finally {
      setCreateModal(false);
      setCreateValue("");
    }
  };

  // === LOADING & EMPTY STATE ===
  if (loading)
    return (
      <div className="w-full bg-gray-100 text-center py-16 text-gray-600 hardcode-text">
        {t("wishlist.loading")}
      </div>
    );

  if (!lists.length)
    return (
      <div className="w-full">
        <div className="w-[90%] mx-auto text-center pt-16 pb-24">
          <h1 className="text-4xl font-bold hardcode-text mb-6">{t("wishlist.my_wishlist")}</h1>
          <p className="text-gray-600 mb-10 api-text">{t("wishlist.no_lists_yet")}</p>
          <button
            onClick={() => setCreateModal(true)}
            className="px-10 py-3 bg-black text-white hardcode-text text-sm tracking-wide hover:bg-gray-900 transition"
          >
            {t("wishlist.create_list")}
          </button>

          {createModal && (
            <EditModal
              className="hardcode-text"
              title={t("wishlist.create_new_list")}
              placeholder={t("wishlist.enter_list_name")}
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
                <h1 className="text-2xl font-bold api-text">{selectedList.name}</h1>
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
                  className="border border-black px-3 py-1 text-sm tracking-wide focus:outline-none flex-1 hardcode-text"
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
                  <span className="text-lg font-bold">...</span>
                </button>

                {showOptions && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-black shadow-lg z-20">
                    <button
                      onClick={() => {
                        setRenameValue(selectedList.name);
                        setRenameModal(true);
                        setShowOptions(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hardcode-text"
                    >
                      {t("wishlist.rename")}
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
                            setAlert({ message: t("wishlist.copy_success"), type: "success" });
                          }
                        } catch {
                          setAlert({ message: t("wishlist.copy_error"), type: "error" });
                        }
                        setShowOptions(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 hardcode-text"
                    >
                      {t("wishlist.copy")}
                    </button>
                    <button
                      onClick={() => {
                        setConfirmDelete(true);
                        setShowOptions(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hardcode-text"
                    >
                      {t("wishlist.delete")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Back Button */}
          <button
            onClick={() => setSelectedList(null)}
            className="flex items-center text-gray-600 hover:text-black mb-6 text-sm tracking-wide hardcode-text"
          >
            <ArrowBigLeft className="mr-1" size={18} />
            {t("wishlist.back")}
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
                        setAlert({ message: t("wishlist.remove_success"), type: "success" });
                      } else {
                        setAlert({ message: t("wishlist.remove_error"), type: "error" });
                      }
                    } catch {
                      setAlert({ message: t("wishlist.network_error"), type: "error" });
                    }
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <h2 className="text-3xl font-bold hardcode-text mb-4">{t("wishlist.empty_list")}</h2>
              <p className="text-gray-600 mb-8 api-text">{t("wishlist.add_favorites_here")}</p>
              <button
                onClick={() => navigate("/")}
                className="px-10 py-3 bg-black text-white hardcode-text text-sm tracking-wide hover:bg-gray-900"
              >
                {t("wishlist.continue_shopping")}
              </button>
            </div>
          )}

          {/* MODALS */}
          {renameModal && (
            <EditModal
              title={t("wishlist.rename_list")}
              placeholder={t("wishlist.enter_new_name")}
              value={renameValue}
              onChange={setRenameValue}
              onCancel={() => setRenameModal(false)}
              onConfirm={async () => {
                if (!renameValue.trim()) {
                  setAlert({ message: t("wishlist.empty_name"), type: "error" });
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
                    setAlert({ message: t("wishlist.rename_success"), type: "success" });
                  } else {
                    setAlert({ message: data.message || t("wishlist.rename_error"), type: "error" });
                  }
                } catch {
                  setAlert({ message: t("wishlist.network_error"), type: "error" });
                } finally {
                  setRenameModal(false);
                }
              }}
            />
          )}

          {confirmDelete && (
            <ConfirmModal
              title={t("wishlist.delete_list")}
              message={t("wishlist.confirm_delete_message")}
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
                    setAlert({ message: t("wishlist.delete_success"), type: "success" });
                  } else {
                    setAlert({ message: t("wishlist.delete_error"), type: "error" });
                  }
                } catch {
                  setAlert({ message: t("wishlist.network_error"), type: "error" });
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
          <h1 className="text-4xl font-bold hardcode-text">{t("wishlist.my_wishlist")}</h1>
          <div className="flex items-center gap-3">
            {/* View Mode */}
            <div className="flex border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode(1)}
                className={`p-2 ${viewMode === 1 ? "bg-black text-white" : "hover:bg-gray-100"}`}
                title={t("wishlist.view_row")}
              >
                <Rows size={18} />
              </button>
              <button
                onClick={() => setViewMode(2)}
                className={`p-2 border-l border-gray-300 ${viewMode === 2 ? "bg-black text-white" : "hover:bg-gray-100"}`}
                title={t("wishlist.view_2col")}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode(4)}
                className={`p-2 border-l border-gray-300 ${viewMode === 4 ? "bg-black text-white" : "hover:bg-gray-100"}`}
                title={t("wishlist.view_grid")}
              >
                <Grid size={18} />
              </button>
            </div>
            <button
              onClick={() => setCreateModal(true)}
              className="px-6 py-2  bg-black text-white hardcode-text text-sm hover:bg-gray-900 transition"
            >
              + {t("wishlist.create_list")}
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
                  <h2 className="text-lg font-bold tracking-wide api-text">{list.name}</h2>
                  <span className="text-sm text-gray-600 api-text">
                    {list.items?.length || 0} {t("wishlist.items")}
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
                    <div className="col-span-full text-gray-400 italic text-sm text-center api-text">
                      {t("wishlist.no_products_yet")}
                    </div>
                  )}
                </div>

                <div className="text-sm underline tracking-wide font-medium hardcode-text">
                  {t("wishlist.view_list")}
                </div>
              </div>
            );
          })}
        </div>

        {/* Create Modal */}
        {createModal && (
          <EditModal
            title={t("wishlist.create_new_list")}
            placeholder={t("wishlist.enter_list_name")}
            value={createValue}
            onChange={setCreateValue}
            onCancel={() => setCreateModal(false)}
            onConfirm={handleCreateList}
          />
        )}

        {/* Alert */}
        <AlertModal
          className="hardcode-text"
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ message: "", type: "info" })}
        />
      </div>
    </div>
  );
}