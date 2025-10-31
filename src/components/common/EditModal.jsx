// components/common/EditModal.jsx
export default function EditModal({ title, placeholder, value, onChange, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50" onClick={onCancel}>
      <div
        className="bg-white p-6 w-96 shadow-lg"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full border border-black px-3 py-2 mb-6 focus:outline-none"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-400 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-black text-white hover:bg-[#ffe6e6] hover:text-black  transition  font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
