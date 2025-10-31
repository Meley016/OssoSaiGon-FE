// src/components/common/ConfirmModal.jsx
export default function ConfirmModal({ title, message, onCancel, onConfirm }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white p-6 w-80 max-w-sm mx-4 text-center shadow-lg "
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-3 text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 border border-gray-400 text-gray-700 hover:bg-gray-100 transition "
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-black text-white hover:bg-[#ffe6e6] hover:text-black  transition  font-medium"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}