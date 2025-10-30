export default function AlertModal({ message, onClose }) {
  if (!message) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg w-80 text-center shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-black mb-4">{message}</p>
        <button
          className="w-full bg-black text-white font-semibold py-2 rounded-md hover:bg-main hover:text-black transition"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
}
